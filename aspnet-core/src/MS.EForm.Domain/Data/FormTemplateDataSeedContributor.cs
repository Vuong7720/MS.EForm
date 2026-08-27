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
	// "Dùng mẫu này" thay vì phải tự thiết kế form từ đầu.
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
					Content = BuildContent(template.Fields),
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

		// dựng HTML content giống định dạng CKEditor sinh ra khi kéo-thả field (create_form.component.ts)
		// để FormRendererService (frontend) render đúng thành input/select/... thật
		private static string BuildContent(List<TemplateField> fields)
		{
			var sb = new System.Text.StringBuilder();
			foreach (var f in fields)
			{
				sb.Append("<p><strong>").Append(f.Title).Append(": </strong>");
				sb.Append("<span id=\"").Append(f.Code).Append('"')
				  .Append(" contenteditable=\"true\"")
				  .Append(" class=\"drag-field field-type-").Append((int)f.Type).Append('"')
				  .Append(" style=\"display: inline-block; text-align:center; resize: horizontal; overflow: auto; min-width: 100px; border: 1px dashed #ccc; padding: 2px 4px;\">")
				  .Append("..........<i>").Append(f.Title).Append("</i>..........")
				  .Append("</span></p>");
			}
			return sb.ToString();
		}

		private static string RequiredConfig(bool required = true)
			=> $"{{\"required\":{(required ? "true" : "false")}}}";

		private static string NumberConfig(decimal? min = null, bool required = true)
			=> $"{{\"required\":{(required ? "true" : "false")}{(min.HasValue ? $",\"min\":{min}" : "")}}}";

		private static string RatingConfig(int maxRating = 5, bool required = true)
			=> $"{{\"required\":{(required ? "true" : "false")},\"maxRating\":{maxRating}}}";

		private static string OptionsJson(params string[] options)
			=> System.Text.Json.JsonSerializer.Serialize(options);

		private static List<TemplateForm> BuildTemplates() => new()
		{
			new TemplateForm(
				"Đơn xin nghỉ phép",
				"Mẫu đơn xin nghỉ phép dùng cho nhân viên đăng ký ngày nghỉ với quản lý.",
				new List<TemplateField>
				{
					new("Họ và tên", "HVT", TypeField.Text, RequiredConfig()),
					new("Phòng ban", "PB", TypeField.Text, RequiredConfig()),
					new("Ngày bắt đầu nghỉ", "NBD", TypeField.DateTime, RequiredConfig()),
					new("Ngày kết thúc nghỉ", "NKT", TypeField.DateTime, RequiredConfig()),
					new("Lý do nghỉ phép", "LDNP", TypeField.AreaText, RequiredConfig()),
				}),
			new TemplateForm(
				"Khảo sát mức độ hài lòng",
				"Mẫu khảo sát nhanh mức độ hài lòng của khách hàng/nhân viên.",
				new List<TemplateField>
				{
					new("Họ và tên", "HVT", TypeField.Text, RequiredConfig(false)),
					new("Mức độ hài lòng", "MDHL", TypeField.Rating, RatingConfig()),
					new("Bạn có giới thiệu cho người khác không", "GTDV", TypeField.Radio, RequiredConfig(),
						OptionsJson("Có", "Không", "Chưa chắc chắn")),
					new("Góp ý thêm", "GYT", TypeField.AreaText, RequiredConfig(false)),
				}),
			new TemplateForm(
				"Đăng ký tham dự sự kiện",
				"Mẫu đăng ký dành cho người tham dự sự kiện/hội thảo.",
				new List<TemplateField>
				{
					new("Họ và tên", "HVT", TypeField.Text, RequiredConfig()),
					new("Email", "EM", TypeField.Text, RequiredConfig()),
					new("Số điện thoại", "SDT", TypeField.Text, RequiredConfig()),
					new("Số lượng người tham dự", "SLTD", TypeField.Number, NumberConfig(1)),
					new("Ghi chú", "GC", TypeField.AreaText, RequiredConfig(false)),
				}),
			new TemplateForm(
				"Phiếu yêu cầu mua hàng",
				"Mẫu phiếu đề nghị mua sắm vật tư/hàng hóa nội bộ.",
				new List<TemplateField>
				{
					new("Người yêu cầu", "NYC", TypeField.Text, RequiredConfig()),
					new("Phòng ban", "PB", TypeField.Text, RequiredConfig()),
					new("Tên hàng hóa/dịch vụ", "THH", TypeField.Text, RequiredConfig()),
					new("Số lượng", "SL", TypeField.Number, NumberConfig(1)),
					new("Lý do mua", "LDM", TypeField.AreaText, RequiredConfig()),
				}),
			new TemplateForm(
				"Đơn đăng ký thông tin liên hệ",
				"Mẫu thu thập thông tin liên hệ cơ bản (dùng cho landing page, sự kiện...).",
				new List<TemplateField>
				{
					new("Họ và tên", "HVT", TypeField.Text, RequiredConfig()),
					new("Email", "EM", TypeField.Text, RequiredConfig()),
					new("Số điện thoại", "SDT", TypeField.Text, RequiredConfig()),
					new("Nội dung liên hệ", "NDLH", TypeField.AreaText, RequiredConfig()),
				}),
		};

		private record TemplateForm(string Title, string Description, List<TemplateField> Fields);
		private record TemplateField(string Title, string Code, TypeField Type, string Config, string? Options = null);
	}
}
