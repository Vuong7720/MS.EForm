using EForm.Entities;
using MS.EForm.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Volo.Abp.Data;
using Volo.Abp.DependencyInjection;
using Volo.Abp.Domain.Repositories;

namespace MS.EForm.Data
{
	// Seed sẵn vài mẫu form thông dụng (IsTemplate=true) để người dùng mới có thể
	// "Dùng mẫu này" thay vì phải tự thiết kế form từ đầu. Mỗi mẫu có Content HTML riêng
	// (không dùng chung 1 layout generic) để trông giống văn bản thật (quốc hiệu tiêu ngữ,
	// bố cục theo mẫu hành chính/pháp lý, hoặc thẻ đăng ký sự kiện hiện đại) thay vì chỉ là
	// danh sách "Nhãn: ô trống" xếp dọc đơn điệu.
	// Đặt ở tầng Domain (không phải Application) vì MS.EForm.DbMigrator chỉ DependsOn
	// EFormDomainModule (qua EntityFrameworkCore module) chứ không nạp assembly Application -
	// đặt ở Application thì IDataSeedContributor này sẽ không được DI phát hiện khi chạy DbMigrator.
	// Tự động chạy mỗi lần MS.EForm.DbMigrator khởi động (EFormDbMigrationService.SeedDataAsync).
	public class FormTemplateDataSeedContributor : IDataSeedContributor, ITransientDependency
	{
		private readonly IRepository<Form, Guid> _formRepository;
		private readonly IRepository<FormField, Guid> _formFieldRepository;

		public FormTemplateDataSeedContributor(
			IRepository<Form, Guid> formRepository,
			IRepository<FormField, Guid> formFieldRepository)
		{
			_formRepository = formRepository;
			_formFieldRepository = formFieldRepository;
		}

		public async Task SeedAsync(DataSeedContext context)
		{
			// tránh seed trùng lặp nếu DbMigrator chạy lại nhiều lần
			var existedTemplate = await _formRepository.FirstOrDefaultAsync(f => f.IsTemplate);
			if (existedTemplate != null)
			{
				return;
			}

			foreach (var template in BuildTemplates())
			{
				var form = await _formRepository.InsertAsync(new Form
				{
					Title = template.Title,
					Description = template.Description,
					Content = template.Content,
					IsTemplate = true
				});

				var order = 0;
				var fields = template.Fields.Select(f => new FormField
				{
					Title = f.Title,
					Code = f.Code,
					Type = f.Type,
					Config = f.Config,
					Options = f.Options,
					DisplayOrder = order++,
					FormId = form.Id
				}).ToList();

				await _formFieldRepository.InsertManyAsync(fields);
			}
		}

		#region Field config helpers

		private static string RequiredConfig(bool required = true)
			=> $"{{\"required\":{(required ? "true" : "false")}}}";

		private static string NumberConfig(decimal? min = null, bool required = true)
			=> $"{{\"required\":{(required ? "true" : "false")}{(min.HasValue ? $",\"min\":{min}" : "")}}}";

		private static string OptionsJson(params string[] options)
			=> System.Text.Json.JsonSerializer.Serialize(options);

		#endregion

		#region HTML content builders (dùng chung giữa các mẫu)

		// ô điền giá trị (thay bằng input/select/... thật khi render) - class/id đúng quy ước
		// FormRendererService.renderFieldsToElements (frontend) mong đợi: span.drag-field.field-type-{N}#code
		private static string Field(string code, TypeField type, string minWidth = "200px")
			=> $@"<span id=""{code}"" class=""drag-field field-type-{(int)type}"" style=""display:inline-block;min-width:{minWidth};border-bottom:1px dashed #999;padding:0 4px;"">..........</span>";

		// ----- văn phong hành chính/pháp lý (giấy khai sinh, đơn khởi kiện, ủy quyền, sơ yếu lý lịch) -----

		private const string QuocHieu =
			@"<div style=""text-align:center;margin-bottom:6px;"">" +
			@"<strong style=""font-size:14px;"">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</strong><br/>" +
			@"<strong style=""font-size:14px;"">Độc lập - Tự do - Hạnh phúc</strong>" +
			@"<div style=""width:160px;border-bottom:2px solid #1a1a1a;margin:6px auto 22px;""></div>" +
			"</div>";

		private static string OfficialTitle(string title, string subtitle)
			=> $@"<h2 style=""text-align:center;font-size:19px;letter-spacing:.5px;margin:0 0 4px;text-transform:uppercase;"">{title}</h2>" +
			   $@"<p style=""text-align:center;font-style:italic;color:#555;margin:0 0 24px;font-size:13px;"">{subtitle}</p>";

		private static string Section(string title)
			=> $@"<p style=""font-weight:bold;background:#f2f2f2;padding:6px 10px;margin:22px 0 10px;border-left:3px solid #333;text-transform:uppercase;font-size:13px;letter-spacing:.3px;"">{title}</p>";

		private static string Row(string label, string fieldHtml)
			=> $@"<p style=""margin:8px 0;"">{label}: {fieldHtml}</p>";

		private static string Row2(string labelA, string fieldA, string labelB, string fieldB)
			=> $@"<table style=""width:100%;border-collapse:collapse;margin:8px 0;""><tr>" +
			   $@"<td style=""width:50%;padding:2px 12px 2px 0;vertical-align:top;"">{labelA}: {fieldA}</td>" +
			   $@"<td style=""width:50%;padding:2px 0 2px 12px;vertical-align:top;"">{labelB}: {fieldB}</td>" +
			   "</tr></table>";

		private static string SignatureBlock(string label, string code)
			=> @"<table style=""width:100%;margin-top:28px;""><tr>" +
			   @"<td style=""width:50%;""></td>" +
			   @"<td style=""width:50%;text-align:center;"">" +
			   @"<p style=""font-style:italic;margin:0 0 4px;font-size:13px;"">......., ngày ...... tháng ...... năm ......</p>" +
			   $@"<p style=""font-weight:bold;margin:0 0 70px;"">{label}</p>" +
			   $"<div>{Field(code, TypeField.Signature, "180px")}</div>" +
			   "</td></tr></table>";

		// 2 chữ ký song song (Bên A / Bên B) - dùng cho Giấy ủy quyền
		private static string SignatureBlock2(string labelA, string codeA, string labelB, string codeB)
			=> @"<table style=""width:100%;margin-top:28px;""><tr>" +
			   @"<td style=""width:50%;text-align:center;"">" +
			   $@"<p style=""font-weight:bold;margin:0 0 70px;"">{labelA}</p>" +
			   $"<div>{Field(codeA, TypeField.Signature, "180px")}</div>" +
			   "</td>" +
			   @"<td style=""width:50%;text-align:center;"">" +
			   $@"<p style=""font-weight:bold;margin:0 0 70px;"">{labelB}</p>" +
			   $"<div>{Field(codeB, TypeField.Signature, "180px")}</div>" +
			   "</td></tr></table>";

		private static string OfficialWrap(string innerHtml)
			=> $@"<div style=""max-width:800px;margin:0 auto;padding:30px 40px;font-family:'Times New Roman',Times,serif;color:#1a1a1a;line-height:1.7;background:#fff;"">{innerHtml}</div>";

		// ----- văn phong hiện đại (đơn nghỉ phép nội bộ, phiếu đăng ký sự kiện) -----

		private static string ModernWrap(string innerHtml)
			=> $@"<div style=""max-width:800px;margin:0 auto;padding:0 0 36px;font-family:Arial,Helvetica,sans-serif;color:#1f2937;line-height:1.6;background:#fff;"">{innerHtml}</div>";

		private static string BusinessHeader(string title, string subtitle)
			=> $@"<div style=""border-top:6px solid #4f46e5;padding:30px 40px 22px;margin-bottom:6px;"">" +
			   $@"<h1 style=""margin:0 0 6px;font-size:24px;font-weight:800;color:#1f2937;"">{title}</h1>" +
			   $@"<p style=""margin:0;color:#6b7280;font-size:14px;"">{subtitle}</p>" +
			   "</div>";

		private static string GradientHeader(string title, string subtitle)
			=> $@"<div style=""background:linear-gradient(135deg,#4f46e5,#8b5cf6);color:#fff;padding:40px 40px 34px;border-radius:0 0 28px 28px;margin-bottom:26px;text-align:center;"">" +
			   $@"<h1 style=""margin:0 0 8px;font-size:27px;font-weight:800;"">{title}</h1>" +
			   $@"<p style=""margin:0;font-size:15px;opacity:.92;"">{subtitle}</p>" +
			   "</div>";

		private static string ModernSection(string title)
			=> $@"<p style=""font-weight:700;font-size:13px;letter-spacing:.4px;text-transform:uppercase;color:#4f46e5;border-bottom:2px solid #4f46e5;padding-bottom:6px;margin:26px 40px 14px;"">{title}</p>";

		private static string ModernRow(string label, string fieldHtml)
			=> $@"<p style=""margin:10px 40px;"">{label}: {fieldHtml}</p>";

		private static string ModernRow2(string labelA, string fieldA, string labelB, string fieldB)
			=> $@"<table style=""width:calc(100% - 80px);border-collapse:collapse;margin:10px 40px;""><tr>" +
			   $@"<td style=""width:50%;padding:2px 12px 2px 0;vertical-align:top;"">{labelA}: {fieldA}</td>" +
			   $@"<td style=""width:50%;padding:2px 0 2px 12px;vertical-align:top;"">{labelB}: {fieldB}</td>" +
			   "</tr></table>";

		private static string ModernSignatureBlock(string label, string code)
			=> @"<table style=""width:calc(100% - 80px);margin:26px 40px 0;""><tr>" +
			   @"<td style=""width:50%;""></td>" +
			   @"<td style=""width:50%;text-align:center;"">" +
			   $@"<p style=""font-weight:700;margin:0 0 60px;color:#1f2937;"">{label}</p>" +
			   $"<div>{Field(code, TypeField.Signature, "180px")}</div>" +
			   "</td></tr></table>";

		private static string ModernSignatureBlock2(string labelA, string codeA, string labelB, string codeB)
			=> @"<table style=""width:calc(100% - 80px);margin:26px 40px 0;""><tr>" +
			   @"<td style=""width:50%;text-align:center;"">" +
			   $@"<p style=""font-weight:700;margin:0 0 60px;color:#1f2937;"">{labelA}</p>" +
			   $"<div>{Field(codeA, TypeField.Signature, "180px")}</div>" +
			   "</td>" +
			   @"<td style=""width:50%;text-align:center;"">" +
			   $@"<p style=""font-weight:700;margin:0 0 60px;color:#1f2937;"">{labelB}</p>" +
			   $"<div>{Field(codeB, TypeField.Signature, "180px")}</div>" +
			   "</td></tr></table>";

		#endregion

		#region Templates

		private static TemplateForm BuildBirthDeclaration()
		{
			var fields = new List<TemplateField>
			{
				new("Kính gửi UBND xã/phường/thị trấn", "NOI_DANGKY", TypeField.Text, RequiredConfig()),
				new("Họ và tên trẻ em", "HOTEN_TRE", TypeField.Text, RequiredConfig()),
				new("Giới tính", "GIOITINH_TRE", TypeField.Radio, RequiredConfig(), OptionsJson("Nam", "Nữ")),
				new("Ngày, tháng, năm sinh", "NGAYSINH_TRE", TypeField.DateTime, RequiredConfig()),
				new("Nơi sinh", "NOISINH", TypeField.Text, RequiredConfig()),
				new("Dân tộc", "DANTOC_TRE", TypeField.Text, RequiredConfig()),
				new("Quốc tịch", "QUOCTICH_TRE", TypeField.Text, RequiredConfig()),
				new("Họ và tên cha", "HOTEN_CHA", TypeField.Text, RequiredConfig(false)),
				new("Năm sinh cha", "NAMSINH_CHA", TypeField.Number, NumberConfig(1900, false)),
				new("Dân tộc cha", "DANTOC_CHA", TypeField.Text, RequiredConfig(false)),
				new("Quốc tịch cha", "QUOCTICH_CHA", TypeField.Text, RequiredConfig(false)),
				new("Họ và tên mẹ", "HOTEN_ME", TypeField.Text, RequiredConfig(false)),
				new("Năm sinh mẹ", "NAMSINH_ME", TypeField.Number, NumberConfig(1900, false)),
				new("Dân tộc mẹ", "DANTOC_ME", TypeField.Text, RequiredConfig(false)),
				new("Quốc tịch mẹ", "QUOCTICH_ME", TypeField.Text, RequiredConfig(false)),
				new("Nơi cư trú của cha, mẹ/người giám hộ", "NOICUTRU", TypeField.AreaText, RequiredConfig()),
				new("Họ và tên người đi khai sinh", "HOTEN_NGUOIKHAI", TypeField.Text, RequiredConfig()),
				new("Quan hệ với trẻ em", "QUANHE_NGUOIKHAI", TypeField.Select, RequiredConfig(),
					OptionsJson("Cha", "Mẹ", "Ông", "Bà", "Người giám hộ", "Khác")),
				new("Số CCCD/CMND người đi khai sinh", "CCCD_NGUOIKHAI", TypeField.Text, RequiredConfig()),
				new("Chữ ký người đi khai sinh", "CHUKY_NGUOIKHAI", TypeField.Signature, RequiredConfig()),
			};

			var content = OfficialWrap(
				QuocHieu +
				OfficialTitle("Tờ khai đăng ký khai sinh", "(Áp dụng theo mẫu quy định của Bộ Tư pháp)") +
				Row("Kính gửi: UBND xã/phường/thị trấn", Field("NOI_DANGKY", TypeField.Text, "260px")) +
				Section("I. Thông tin của người được đăng ký khai sinh") +
				Row("Họ và tên", Field("HOTEN_TRE", TypeField.Text, "260px")) +
				Row2("Giới tính", Field("GIOITINH_TRE", TypeField.Radio), "Ngày, tháng, năm sinh", Field("NGAYSINH_TRE", TypeField.DateTime)) +
				Row2("Nơi sinh", Field("NOISINH", TypeField.Text), "Dân tộc", Field("DANTOC_TRE", TypeField.Text)) +
				Row("Quốc tịch", Field("QUOCTICH_TRE", TypeField.Text, "200px")) +
				Section("II. Thông tin của cha") +
				Row("Họ và tên cha", Field("HOTEN_CHA", TypeField.Text, "260px")) +
				Row2("Năm sinh", Field("NAMSINH_CHA", TypeField.Number), "Dân tộc", Field("DANTOC_CHA", TypeField.Text)) +
				Row("Quốc tịch", Field("QUOCTICH_CHA", TypeField.Text, "200px")) +
				Section("III. Thông tin của mẹ") +
				Row("Họ và tên mẹ", Field("HOTEN_ME", TypeField.Text, "260px")) +
				Row2("Năm sinh", Field("NAMSINH_ME", TypeField.Number), "Dân tộc", Field("DANTOC_ME", TypeField.Text)) +
				Row("Quốc tịch", Field("QUOCTICH_ME", TypeField.Text, "200px")) +
				Section("IV. Thông tin người đi khai sinh") +
				Row("Nơi cư trú của cha, mẹ/người giám hộ", Field("NOICUTRU", TypeField.AreaText, "100%")) +
				Row2("Họ và tên người đi khai sinh", Field("HOTEN_NGUOIKHAI", TypeField.Text), "Quan hệ với trẻ em", Field("QUANHE_NGUOIKHAI", TypeField.Select)) +
				Row("Số CCCD/CMND", Field("CCCD_NGUOIKHAI", TypeField.Text, "200px")) +
				@"<p style=""margin-top:20px;"">Tôi cam đoan những nội dung khai trên đây là đúng sự thật và xin chịu trách nhiệm trước pháp luật về nội dung đã khai.</p>" +
				SignatureBlock("Người đi khai sinh", "CHUKY_NGUOIKHAI")
			);

			return new TemplateForm("Tờ khai đăng ký khai sinh", "Mẫu tờ khai đăng ký khai sinh theo đúng bố cục hành chính (quốc hiệu, thông tin trẻ em/cha/mẹ/người khai).", content, fields);
		}

		private static TemplateForm BuildLawsuitPetition()
		{
			var fields = new List<TemplateField>
			{
				new("Kính gửi Tòa án nhân dân", "TOAAN", TypeField.Text, RequiredConfig()),
				new("Họ tên người khởi kiện", "HOTEN_NGUYENDON", TypeField.Text, RequiredConfig()),
				new("Ngày sinh", "NGAYSINH_NGUYENDON", TypeField.DateTime, RequiredConfig(false)),
				new("Số CCCD/CMND", "CCCD_NGUYENDON", TypeField.Text, RequiredConfig()),
				new("Địa chỉ", "DIACHI_NGUYENDON", TypeField.AreaText, RequiredConfig()),
				new("Số điện thoại", "SDT_NGUYENDON", TypeField.Text, RequiredConfig(false)),
				new("Email", "EMAIL_NGUYENDON", TypeField.Text, RequiredConfig(false)),
				new("Họ tên người bị kiện", "HOTEN_BIDON", TypeField.Text, RequiredConfig()),
				new("Địa chỉ người bị kiện", "DIACHI_BIDON", TypeField.AreaText, RequiredConfig()),
				new("Quyền, lợi ích hợp pháp bị xâm phạm", "QUYENLOI", TypeField.AreaText, RequiredConfig()),
				new("Nội dung khởi kiện", "NOIDUNGKIEN", TypeField.AreaText, RequiredConfig()),
				new("Yêu cầu Tòa án giải quyết", "YEUCAU", TypeField.AreaText, RequiredConfig()),
				new("Danh mục tài liệu, chứng cứ kèm theo", "TAILIEU_KEMTHEO", TypeField.AreaText, RequiredConfig(false)),
				new("Chữ ký người khởi kiện", "CHUKY_NGUYENDON", TypeField.Signature, RequiredConfig()),
			};

			var content = OfficialWrap(
				QuocHieu +
				OfficialTitle("Đơn khởi kiện", "(Theo mẫu tham khảo dùng trong tố tụng dân sự)") +
				Row("Kính gửi: Tòa án nhân dân", Field("TOAAN", TypeField.Text, "300px")) +
				Section("I. Người khởi kiện") +
				Row("Họ và tên", Field("HOTEN_NGUYENDON", TypeField.Text, "260px")) +
				Row2("Ngày sinh", Field("NGAYSINH_NGUYENDON", TypeField.DateTime), "Số CCCD/CMND", Field("CCCD_NGUYENDON", TypeField.Text)) +
				Row("Địa chỉ", Field("DIACHI_NGUYENDON", TypeField.AreaText, "100%")) +
				Row2("Số điện thoại", Field("SDT_NGUYENDON", TypeField.Text), "Email", Field("EMAIL_NGUYENDON", TypeField.Text)) +
				Section("II. Người bị kiện") +
				Row("Họ và tên", Field("HOTEN_BIDON", TypeField.Text, "260px")) +
				Row("Địa chỉ", Field("DIACHI_BIDON", TypeField.AreaText, "100%")) +
				Section("III. Nội dung khởi kiện") +
				Row("Quyền, lợi ích hợp pháp bị xâm phạm", Field("QUYENLOI", TypeField.AreaText, "100%")) +
				Row("Trình bày sự việc", Field("NOIDUNGKIEN", TypeField.AreaText, "100%")) +
				Section("IV. Yêu cầu Tòa án giải quyết vụ án") +
				Row("Yêu cầu cụ thể", Field("YEUCAU", TypeField.AreaText, "100%")) +
				Section("V. Danh mục tài liệu, chứng cứ kèm theo") +
				Row("Tài liệu kèm theo", Field("TAILIEU_KEMTHEO", TypeField.AreaText, "100%")) +
				@"<p style=""margin-top:20px;"">Tôi cam kết những nội dung trình bày trên đây là hoàn toàn đúng sự thật và xin chịu trách nhiệm trước pháp luật.</p>" +
				SignatureBlock("Người khởi kiện", "CHUKY_NGUYENDON")
			);

			return new TemplateForm("Đơn khởi kiện", "Mẫu đơn khởi kiện theo bố cục hành chính/pháp lý: người khởi kiện, người bị kiện, nội dung, yêu cầu và tài liệu kèm theo.", content, fields);
		}

		private static TemplateForm BuildPowerOfAttorney()
		{
			var fields = new List<TemplateField>
			{
				new("Họ và tên bên ủy quyền", "HOTEN_BENA", TypeField.Text, RequiredConfig()),
				new("Ngày sinh bên ủy quyền", "NGAYSINH_BENA", TypeField.DateTime, RequiredConfig(false)),
				new("Số CCCD/CMND bên ủy quyền", "CCCD_BENA", TypeField.Text, RequiredConfig()),
				new("Địa chỉ thường trú bên ủy quyền", "DIACHI_BENA", TypeField.AreaText, RequiredConfig()),
				new("Họ và tên bên được ủy quyền", "HOTEN_BENB", TypeField.Text, RequiredConfig()),
				new("Ngày sinh bên được ủy quyền", "NGAYSINH_BENB", TypeField.DateTime, RequiredConfig(false)),
				new("Số CCCD/CMND bên được ủy quyền", "CCCD_BENB", TypeField.Text, RequiredConfig()),
				new("Địa chỉ thường trú bên được ủy quyền", "DIACHI_BENB", TypeField.AreaText, RequiredConfig()),
				new("Nội dung ủy quyền", "NOIDUNG_UQ", TypeField.AreaText, RequiredConfig()),
				new("Thời hạn ủy quyền", "THOIHAN_UQ", TypeField.Text, RequiredConfig()),
				new("Chữ ký bên ủy quyền", "CHUKY_BENA", TypeField.Signature, RequiredConfig()),
				new("Chữ ký bên được ủy quyền", "CHUKY_BENB", TypeField.Signature, RequiredConfig()),
			};

			var content = OfficialWrap(
				QuocHieu +
				OfficialTitle("Giấy ủy quyền", "(Theo mẫu tham khảo thông dụng)") +
				Section("Bên ủy quyền (Bên A)") +
				Row("Họ và tên", Field("HOTEN_BENA", TypeField.Text, "260px")) +
				Row2("Ngày sinh", Field("NGAYSINH_BENA", TypeField.DateTime), "Số CCCD/CMND", Field("CCCD_BENA", TypeField.Text)) +
				Row("Địa chỉ thường trú", Field("DIACHI_BENA", TypeField.AreaText, "100%")) +
				Section("Bên được ủy quyền (Bên B)") +
				Row("Họ và tên", Field("HOTEN_BENB", TypeField.Text, "260px")) +
				Row2("Ngày sinh", Field("NGAYSINH_BENB", TypeField.DateTime), "Số CCCD/CMND", Field("CCCD_BENB", TypeField.Text)) +
				Row("Địa chỉ thường trú", Field("DIACHI_BENB", TypeField.AreaText, "100%")) +
				Section("Nội dung ủy quyền") +
				Row("Nội dung", Field("NOIDUNG_UQ", TypeField.AreaText, "100%")) +
				Row("Thời hạn ủy quyền", Field("THOIHAN_UQ", TypeField.Text, "260px")) +
				@"<p style=""margin-top:20px;"">Hai bên cam kết thực hiện đúng nội dung ủy quyền nêu trên và chịu trách nhiệm trước pháp luật về nội dung đã cam kết.</p>" +
				SignatureBlock2("Bên ủy quyền", "CHUKY_BENA", "Bên được ủy quyền", "CHUKY_BENB")
			);

			return new TemplateForm("Giấy ủy quyền", "Mẫu giấy ủy quyền giữa hai bên: thông tin bên ủy quyền, bên được ủy quyền, nội dung và thời hạn ủy quyền.", content, fields);
		}

		private static TemplateForm BuildPersonalDeclaration()
		{
			var fields = new List<TemplateField>
			{
				new("Họ và tên", "HOTEN", TypeField.Text, RequiredConfig()),
				new("Ngày sinh", "NGAYSINH", TypeField.DateTime, RequiredConfig()),
				new("Giới tính", "GIOITINH", TypeField.Radio, RequiredConfig(), OptionsJson("Nam", "Nữ")),
				new("Quê quán", "QUEQUAN", TypeField.Text, RequiredConfig()),
				new("Nơi ở hiện tại", "NOIODANG", TypeField.AreaText, RequiredConfig()),
				new("Dân tộc", "DANTOC", TypeField.Text, RequiredConfig(false)),
				new("Tôn giáo", "TONGIAO", TypeField.Text, RequiredConfig(false)),
				new("Số CCCD/CMND", "CCCD", TypeField.Text, RequiredConfig()),
				new("Số điện thoại", "SDT", TypeField.Text, RequiredConfig()),
				new("Email", "EMAIL", TypeField.Text, RequiredConfig(false)),
				new("Trình độ văn hóa/chuyên môn", "TRINHDO", TypeField.Text, RequiredConfig(false)),
				new("Quá trình học tập", "QUATRINH_HOCTAP", TypeField.AreaText, RequiredConfig(false)),
				new("Quá trình công tác", "QUATRINH_CONGTAC", TypeField.AreaText, RequiredConfig(false)),
				new("Ảnh chân dung (4x6)", "ANH_CHANDUNG", TypeField.File, RequiredConfig(false)),
				new("Chữ ký", "CHUKY", TypeField.Signature, RequiredConfig()),
			};

			var content = OfficialWrap(
				QuocHieu +
				OfficialTitle("Sơ yếu lý lịch tự thuật", "(Ảnh 4x6 đính kèm ở mục cuối)") +
				Section("I. Thông tin cá nhân") +
				Row("Họ và tên", Field("HOTEN", TypeField.Text, "260px")) +
				Row2("Ngày sinh", Field("NGAYSINH", TypeField.DateTime), "Giới tính", Field("GIOITINH", TypeField.Radio)) +
				Row2("Quê quán", Field("QUEQUAN", TypeField.Text), "Dân tộc", Field("DANTOC", TypeField.Text)) +
				Row("Nơi ở hiện tại", Field("NOIODANG", TypeField.AreaText, "100%")) +
				Row2("Tôn giáo", Field("TONGIAO", TypeField.Text), "Số CCCD/CMND", Field("CCCD", TypeField.Text)) +
				Row2("Số điện thoại", Field("SDT", TypeField.Text), "Email", Field("EMAIL", TypeField.Text)) +
				Row("Trình độ văn hóa/chuyên môn", Field("TRINHDO", TypeField.Text, "300px")) +
				Section("II. Quá trình học tập") +
				Row("Quá trình học tập", Field("QUATRINH_HOCTAP", TypeField.AreaText, "100%")) +
				Section("III. Quá trình công tác") +
				Row("Quá trình công tác", Field("QUATRINH_CONGTAC", TypeField.AreaText, "100%")) +
				Row("Ảnh chân dung (4x6)", Field("ANH_CHANDUNG", TypeField.File, "260px")) +
				@"<p style=""margin-top:20px;"">Tôi xin cam đoan những lời khai trên đây là đúng sự thật, nếu có gì sai tôi xin chịu hoàn toàn trách nhiệm.</p>" +
				SignatureBlock("Người khai", "CHUKY")
			);

			return new TemplateForm("Sơ yếu lý lịch tự thuật", "Mẫu sơ yếu lý lịch cá nhân: thông tin cơ bản, quá trình học tập và công tác.", content, fields);
		}

		private static TemplateForm BuildLeaveRequest()
		{
			var fields = new List<TemplateField>
			{
				new("Họ và tên", "HOTEN", TypeField.Text, RequiredConfig()),
				new("Phòng ban/Bộ phận", "PHONGBAN", TypeField.Text, RequiredConfig()),
				new("Chức vụ", "CHUCVU", TypeField.Text, RequiredConfig(false)),
				new("Từ ngày", "TUNGAY", TypeField.DateTime, RequiredConfig()),
				new("Đến ngày", "DENNGAY", TypeField.DateTime, RequiredConfig()),
				new("Số ngày nghỉ", "SONGAYNGHI", TypeField.Number, NumberConfig(0.5m)),
				new("Lý do nghỉ phép", "LYDO", TypeField.AreaText, RequiredConfig()),
				new("Người phụ trách công việc thay thế", "NGUOI_THAY_THE", TypeField.Text, RequiredConfig(false)),
				new("Chữ ký người xin nghỉ", "CHUKY_NGUOIXIN", TypeField.Signature, RequiredConfig()),
			};

			var content = ModernWrap(
				BusinessHeader("Đơn xin nghỉ phép", "Kính gửi: Ban Giám đốc / Phòng Nhân sự") +
				ModernSection("Thông tin người xin nghỉ") +
				ModernRow("Họ và tên", Field("HOTEN", TypeField.Text, "260px")) +
				ModernRow2("Phòng ban/Bộ phận", Field("PHONGBAN", TypeField.Text), "Chức vụ", Field("CHUCVU", TypeField.Text)) +
				ModernSection("Thời gian nghỉ") +
				ModernRow2("Từ ngày", Field("TUNGAY", TypeField.DateTime), "Đến ngày", Field("DENNGAY", TypeField.DateTime)) +
				ModernRow("Số ngày nghỉ", Field("SONGAYNGHI", TypeField.Number, "160px")) +
				ModernRow("Lý do nghỉ phép", Field("LYDO", TypeField.AreaText, "100%")) +
				ModernRow("Người phụ trách công việc thay thế (nếu có)", Field("NGUOI_THAY_THE", TypeField.Text, "260px")) +
				@"<p style=""margin:20px 40px 0;color:#374151;"">Tôi cam kết sắp xếp bàn giao công việc đầy đủ trước khi nghỉ và sẽ quay lại làm việc đúng thời hạn đã đăng ký.</p>" +
				ModernSignatureBlock("Người xin nghỉ", "CHUKY_NGUOIXIN")
			);

			return new TemplateForm("Đơn xin nghỉ phép", "Mẫu đơn xin nghỉ phép nội bộ dùng cho nhân viên đăng ký ngày nghỉ với quản lý.", content, fields);
		}

		private static TemplateForm BuildEventRegistration()
		{
			var fields = new List<TemplateField>
			{
				new("Họ và tên", "HOTEN", TypeField.Text, RequiredConfig()),
				new("Email", "EMAIL", TypeField.Text, RequiredConfig()),
				new("Số điện thoại", "SDT", TypeField.Text, RequiredConfig()),
				new("Đơn vị/Công ty", "DONVI", TypeField.Text, RequiredConfig(false)),
				new("Số lượng người tham dự", "SOLUONG", TypeField.Number, NumberConfig(1)),
				new("Hình thức tham dự", "HINHTHUC", TypeField.Radio, RequiredConfig(), OptionsJson("Trực tiếp", "Trực tuyến")),
				new("Ghi chú/Yêu cầu đặc biệt", "GHICHU", TypeField.AreaText, RequiredConfig(false)),
			};

			var content = ModernWrap(
				GradientHeader("Phiếu đăng ký tham dự sự kiện", "Vui lòng điền đầy đủ thông tin bên dưới để hoàn tất đăng ký") +
				ModernSection("Thông tin người đăng ký") +
				ModernRow("Họ và tên", Field("HOTEN", TypeField.Text, "260px")) +
				ModernRow2("Email", Field("EMAIL", TypeField.Text), "Số điện thoại", Field("SDT", TypeField.Text)) +
				ModernRow2("Đơn vị/Công ty", Field("DONVI", TypeField.Text), "Số lượng người tham dự", Field("SOLUONG", TypeField.Number)) +
				ModernRow("Hình thức tham dự", Field("HINHTHUC", TypeField.Radio)) +
				ModernRow("Ghi chú/Yêu cầu đặc biệt", Field("GHICHU", TypeField.AreaText, "100%")) +
				@"<p style=""margin:24px 40px 0;padding:14px 18px;background:#eef2ff;border-radius:12px;color:#4338ca;font-size:13.5px;"">Sau khi đăng ký, ban tổ chức sẽ liên hệ xác nhận qua email hoặc số điện thoại bạn đã cung cấp.</p>"
			);

			return new TemplateForm("Phiếu đăng ký tham dự sự kiện", "Mẫu đăng ký hiện đại, nhiều màu sắc dành cho người tham dự sự kiện/hội thảo.", content, fields);
		}

		private static List<TemplateForm> BuildTemplates() => new()
		{
			BuildBirthDeclaration(),
			BuildLawsuitPetition(),
			BuildPowerOfAttorney(),
			BuildPersonalDeclaration(),
			BuildLeaveRequest(),
			BuildEventRegistration(),
		};

		#endregion

		private record TemplateForm(string Title, string Description, string Content, List<TemplateField> Fields);
		private record TemplateField(string Title, string Code, TypeField Type, string Config, string? Options = null);
	}
}
