using ClosedXML.Excel;
using EForm;
using EForm.Entities;
using EForm.FormModels;
using EForm.IFormServices;
using Microsoft.Extensions.Configuration;
using MS.EForm.BackgroundJobs;
using MS.EForm.Enums;
using MS.EForm;
using MS.EForm.FormModels.FormRecords;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using Volo.Abp;
using Volo.Abp.Application.Dtos;
using Volo.Abp.BackgroundJobs;
using Volo.Abp.BlobStoring;
using Volo.Abp.DependencyInjection;
using Volo.Abp.Domain.Repositories;
using Volo.Abp.Users;

namespace MS.EForm.FormServices
{
	public class FormRecordService : IFormRecord, ITransientDependency
	{
		IRepository<FormRecord, Guid> _repository;
		IRepository<FormField, Guid> _formFieldRepository;
		IRepository<Form, Guid> _formRepository;
		IBlobContainer<FormAttachmentContainer> _attachmentContainer;
		ICurrentUser _currentUser;
		IBackgroundJobManager _backgroundJobManager;
		ICaptchaVerifier _captchaVerifier;

		public FormRecordService(
			ICurrentUser currentUser,
			IConfiguration staticConfiguration,
			IRepository<FormRecord, Guid> repository,
			IRepository<FormField, Guid> formFieldRepository,
			IRepository<Form, Guid> formRepository,
			IBlobContainer<FormAttachmentContainer> attachmentContainer,
			IBackgroundJobManager backgroundJobManager,
			ICaptchaVerifier captchaVerifier
			)
		{
			_currentUser = currentUser;
			_repository = repository;
			_formFieldRepository = formFieldRepository;
			_formRepository = formRepository;
			_attachmentContainer = attachmentContainer;
			_backgroundJobManager = backgroundJobManager;
			_captchaVerifier = captchaVerifier;
		}

		#region Check

		// đọc Config: hỗ trợ JSON {"required":true,"minLength":0,...} (chuẩn mới) và
		// chuỗi "required:true" (định dạng cũ, để tương thích dữ liệu đã tồn tại)
		private FieldConfig ParseConfig(string? config)
		{
			if (string.IsNullOrEmpty(config)) return new FieldConfig();

			try
			{
				var parsed = JsonSerializer.Deserialize<FieldConfig>(config, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
				if (parsed != null) return parsed;
			}
			catch
			{
				// không phải JSON -> thử định dạng cũ bên dưới
			}

			var result = new FieldConfig();
			foreach (var part in config.Split(','))
			{
				var kv = part.Split(':');
				if (kv.Length == 2 && kv[0].Trim().Equals("required", StringComparison.OrdinalIgnoreCase))
				{
					result.Required = kv[1].Trim().Equals("true", StringComparison.OrdinalIgnoreCase);
				}
			}
			return result;
		}

		private class FieldConfig
		{
			public bool Required { get; set; }
			public int? MinLength { get; set; }
			public int? MaxLength { get; set; }
			public decimal? Min { get; set; }
			public decimal? Max { get; set; }
			public string? Pattern { get; set; }
			public List<string>? AllowedExtensions { get; set; }
			public decimal? MaxFileSizeMb { get; set; }
			public int? MaxFileCount { get; set; }
			public int? MaxRating { get; set; }
			public ConditionalRule? Conditional { get; set; }
		}

		// field chỉ hiện/được validate khi field DependsOnCode thỏa điều kiện này - xem EvaluateCondition
		private class ConditionalRule
		{
			public string? DependsOnCode { get; set; }
			public string? Operator { get; set; }
			public string? Value { get; set; }
		}

		// so khớp giá trị đã nộp của field phụ thuộc (actual) với điều kiện cấu hình (operator/expected).
		// Phải khớp CHÍNH XÁC logic với evaluateConditionRule() phía frontend (form-renderer.service.ts)
		// vì đây là lớp phòng vệ độc lập ở server, không tin tưởng frontend đã ẩn field đúng.
		private static bool EvaluateCondition(string? actual, string? op, string? expected)
		{
			switch (op)
			{
				case "isEmpty":
					return string.IsNullOrWhiteSpace(actual);
				case "isNotEmpty":
					return !string.IsNullOrWhiteSpace(actual);
				case "notEquals":
					return !string.Equals(actual?.Trim(), expected?.Trim(), StringComparison.OrdinalIgnoreCase);
				case "contains":
					return !string.IsNullOrEmpty(actual)
						&& actual.Split(';').Select(v => v.Trim()).Contains(expected?.Trim(), StringComparer.OrdinalIgnoreCase);
				case "equals":
				default:
					return string.Equals(actual?.Trim(), expected?.Trim(), StringComparison.OrdinalIgnoreCase);
			}
		}

		// 1 field trong snapshot đóng băng - đủ thông tin để validate/render, không cần Id/FormId
		private class SnapshotField
		{
			public string Code { get; set; } = "";
			public string Title { get; set; } = "";
			public TypeField Type { get; set; }
			public string? Config { get; set; }
			public string? Options { get; set; }
			public int DisplayOrder { get; set; }
		}

		// nội dung đầy đủ được đóng băng vào FormRecord.FormSnapshot lúc nộp form
		private class FormSnapshotData
		{
			public string? Content { get; set; }
			public List<SnapshotField> Fields { get; set; } = new();
		}

		private static List<SnapshotField> ToSnapshotFields(List<FormField> fields) => fields
			.Select(f => new SnapshotField
			{
				Code = f.Code,
				Title = f.Title,
				Type = f.Type,
				Config = f.Config,
				Options = f.Options,
				DisplayOrder = f.DisplayOrder
			})
			.ToList();

		private static string BuildSnapshotJson(string? content, List<SnapshotField> fields)
		{
			return JsonSerializer.Serialize(new FormSnapshotData { Content = content, Fields = fields });
		}

		private static FormSnapshotData? TryParseSnapshot(string? json)
		{
			if (string.IsNullOrWhiteSpace(json)) return null;
			try
			{
				return JsonSerializer.Deserialize<FormSnapshotData>(json, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
			}
			catch
			{
				return null;
			}
		}

		// field dùng để validate/dọn file đính kèm cho 1 bản ghi: ưu tiên snapshot đã đóng băng của chính bản ghi đó
		// (không bị ảnh hưởng nếu form gốc bị sửa sau này); bản ghi cũ chưa có snapshot thì fallback field hiện tại của form
		private async Task<List<SnapshotField>> ResolveValidationFieldsAsync(FormRecord record)
		{
			var snapshot = TryParseSnapshot(record.FormSnapshot);
			if (snapshot != null) return snapshot.Fields;

			var allFields = await _formFieldRepository.GetQueryableAsync();
			var liveFields = allFields.Where(a => a.FormId == record.FormId).ToList();
			return ToSnapshotFields(liveFields);
		}

		// một file đính kèm đã upload, lưu bên trong FormRecord.Data[code] dạng chuỗi JSON mảng
		private class AttachmentEntry
		{
			public string? Name { get; set; }
			public string? Blob { get; set; }
			public long Size { get; set; }
		}

		private List<AttachmentEntry> ParseAttachments(string? value)
		{
			if (string.IsNullOrWhiteSpace(value)) return new List<AttachmentEntry>();
			try
			{
				return JsonSerializer.Deserialize<List<AttachmentEntry>>(value, new JsonSerializerOptions { PropertyNameCaseInsensitive = true }) ?? new List<AttachmentEntry>();
			}
			catch
			{
				return new List<AttachmentEntry>();
			}
		}

		private List<string> ParseOptions(string? options)
		{
			if (string.IsNullOrEmpty(options)) return new List<string>();
			try
			{
				return JsonSerializer.Deserialize<List<string>>(options) ?? new List<string>();
			}
			catch
			{
				return new List<string>();
			}
		}

		// validate dữ liệu nộp lên theo danh sách field truyền vào (field hiện tại của form khi nộp mới,
		// hoặc field đóng băng trong snapshot của chính bản ghi khi sửa bản ghi cũ); ném UserFriendlyException nếu vi phạm
		private async Task ValidateData(string data, List<SnapshotField> fields)
		{
			Dictionary<string, string> submitted;
			try
			{
				submitted = JsonSerializer.Deserialize<Dictionary<string, string>>(data ?? "{}") ?? new Dictionary<string, string>();
			}
			catch
			{
				throw new UserFriendlyException("Dữ liệu nộp không đúng định dạng");
			}

			foreach (var field in fields)
			{
				submitted.TryGetValue(field.Code, out var value);
				var config = ParseConfig(field.Config);

				// field có điều kiện phụ thuộc field khác nhưng điều kiện không thỏa theo dữ liệu nộp lên
				// -> coi như field đang bị ẩn, bỏ qua toàn bộ validate (kể cả required) cho field này
				if (config.Conditional != null && !string.IsNullOrWhiteSpace(config.Conditional.DependsOnCode))
				{
					submitted.TryGetValue(config.Conditional.DependsOnCode, out var dependsOnValue);
					if (!EvaluateCondition(dependsOnValue, config.Conditional.Operator, config.Conditional.Value))
					{
						continue;
					}
				}

				if (config.Required && string.IsNullOrWhiteSpace(value))
				{
					throw new UserFriendlyException($"Trường \"{field.Title}\" là bắt buộc");
				}

				if (string.IsNullOrWhiteSpace(value))
				{
					continue;
				}

				if (field.Type == TypeField.Select || field.Type == TypeField.Radio || field.Type == TypeField.CheckBox)
				{
					var options = ParseOptions(field.Options);
					if (options.Any())
					{
						var selectedValues = field.Type == TypeField.CheckBox
							? value.Split(';').Select(v => v.Trim()).ToList()
							: new List<string> { value };

						if (selectedValues.Any(v => !options.Contains(v)))
						{
							throw new UserFriendlyException($"Giá trị nộp cho trường \"{field.Title}\" không hợp lệ");
						}
					}
				}

				if (field.Type == TypeField.Text || field.Type == TypeField.AreaText)
				{
					if (config.MinLength.HasValue && value.Length < config.MinLength.Value)
					{
						throw new UserFriendlyException($"Trường \"{field.Title}\" phải có ít nhất {config.MinLength.Value} ký tự");
					}
					if (config.MaxLength.HasValue && value.Length > config.MaxLength.Value)
					{
						throw new UserFriendlyException($"Trường \"{field.Title}\" không được vượt quá {config.MaxLength.Value} ký tự");
					}
					if (!string.IsNullOrEmpty(config.Pattern) && !System.Text.RegularExpressions.Regex.IsMatch(value, config.Pattern))
					{
						throw new UserFriendlyException($"Trường \"{field.Title}\" không đúng định dạng");
					}
				}

				if (field.Type == TypeField.Number && decimal.TryParse(value, out var numberValue))
				{
					if (config.Min.HasValue && numberValue < config.Min.Value)
					{
						throw new UserFriendlyException($"Trường \"{field.Title}\" phải lớn hơn hoặc bằng {config.Min.Value}");
					}
					if (config.Max.HasValue && numberValue > config.Max.Value)
					{
						throw new UserFriendlyException($"Trường \"{field.Title}\" phải nhỏ hơn hoặc bằng {config.Max.Value}");
					}
				}

				if (field.Type == TypeField.Rating && decimal.TryParse(value, out var ratingValue))
				{
					var max = config.MaxRating ?? 5;
					if (ratingValue < 1 || ratingValue > max)
					{
						throw new UserFriendlyException($"Trường \"{field.Title}\" phải có giá trị từ 1 đến {max}");
					}
				}

				if (field.Type == TypeField.File || field.Type == TypeField.Signature)
				{
					var attachments = ParseAttachments(value);

					// "rỗng" với field File/Signature là mảng JSON "[]", không phải whitespace nên
					// check required chung ở đầu hàm (dòng ~145) không bắt được - bắt riêng ở đây.
					if (config.Required && attachments.Count == 0)
					{
						throw new UserFriendlyException($"Trường \"{field.Title}\" là bắt buộc");
					}

					if (config.MaxFileCount.HasValue && attachments.Count > config.MaxFileCount.Value)
					{
						throw new UserFriendlyException($"Trường \"{field.Title}\" chỉ được đính kèm tối đa {config.MaxFileCount.Value} file");
					}

					foreach (var attachment in attachments)
					{
						// file phải đã được upload thật (qua endpoint upload-form-attachment) trước khi nộp form,
						// tránh trường hợp record trỏ tới blob giả mạo/không tồn tại
						if (string.IsNullOrWhiteSpace(attachment.Blob) || !await _attachmentContainer.ExistsAsync(attachment.Blob))
						{
							throw new UserFriendlyException($"File đính kèm cho trường \"{field.Title}\" không hợp lệ hoặc đã bị xoá, vui lòng tải lên lại");
						}
					}
				}
			}
		}

		// tìm mã (code) của các field có đính kèm blob (Upload file/ảnh hoặc Chữ ký điện tử) trong 1 danh sách field
		private static HashSet<string> GetAttachmentFieldCodes(List<SnapshotField> fields)
		{
			return fields.Where(f => f.Type == TypeField.File || f.Type == TypeField.Signature)
				.Select(f => f.Code)
				.ToHashSet();
		}

		// gom tên blob của mọi file đính kèm (theo các field kiểu File/Signature) có trong một bản Data đã nộp
		private HashSet<string> ExtractBlobNames(string? data, HashSet<string> fileFieldCodes)
		{
			var blobs = new HashSet<string>();
			if (fileFieldCodes.Count == 0 || string.IsNullOrWhiteSpace(data)) return blobs;

			Dictionary<string, string> submitted;
			try
			{
				submitted = JsonSerializer.Deserialize<Dictionary<string, string>>(data) ?? new Dictionary<string, string>();
			}
			catch
			{
				return blobs;
			}

			foreach (var code in fileFieldCodes)
			{
				if (!submitted.TryGetValue(code, out var value)) continue;
				foreach (var attachment in ParseAttachments(value))
				{
					if (!string.IsNullOrWhiteSpace(attachment.Blob))
					{
						blobs.Add(attachment.Blob!);
					}
				}
			}

			return blobs;
		}

		// xoá file vật lý của các đính kèm không còn được tham chiếu nữa (record bị xoá, hoặc file bị gỡ khi sửa)
		private async Task DeleteOrphanedAttachmentsAsync(List<SnapshotField> fields, string? oldData, string? newData = null)
		{
			var fileFieldCodes = GetAttachmentFieldCodes(fields);
			if (fileFieldCodes.Count == 0) return;

			var oldBlobs = ExtractBlobNames(oldData, fileFieldCodes);
			var keepBlobs = newData != null ? ExtractBlobNames(newData, fileFieldCodes) : new HashSet<string>();

			foreach (var blob in oldBlobs)
			{
				if (!keepBlobs.Contains(blob))
				{
					await _attachmentContainer.DeleteAsync(blob);
				}
			}
		}

		#endregion

		// nộp form
		public async Task<MessageDto> SubmitAsync(CreateUpdateFormRecordDto model)
		{
			if (model == null) // ----> check dữ liệu đầu vào
			{
				throw new UserFriendlyException("Không có dữ liệu đầu vào");
			}

			// chống spam - check trước tiên, trước khi tốn công query/validate gì cho request rác
			if (!await _captchaVerifier.VerifyAsync(model.CaptchaToken))
			{
				throw new UserFriendlyException("Xác thực chống spam không hợp lệ, vui lòng thử lại");
			}

			var form = await _formRepository.FindAsync(model.FormId); // ----> check tồn tại form
			if (form == null)
			{
				throw new UserFriendlyException("Không tồn tại form này");
			}

			var allFields = await _formFieldRepository.GetQueryableAsync();
			var snapshotFields = ToSnapshotFields(allFields.Where(a => a.FormId == model.FormId).ToList());

			await ValidateData(model.Data, snapshotFields); // ----> validate dữ liệu theo field hiện tại của form

			var result = new FormRecord
			{
				Title = model.Title,
				Data = model.Data,
				FormId = model.FormId,
				// đóng băng nội dung + field ngay lúc nộp, để sau này sửa form không ảnh hưởng ngược bản ghi này
				FormSnapshot = BuildSnapshotJson(form.Content, snapshotFields)
			};

			await _repository.InsertAsync(result);

			if (form.NotifyOnSubmit)
			{
				// enqueue nền, không gửi đồng bộ - endpoint này public/rate-limited, không được chậm/lỗi vì SMTP
				await _backgroundJobManager.EnqueueAsync<SubmissionNotificationArgs>(new SubmissionNotificationArgs
				{
					FormRecordId = result.Id
				});
			}

			return new MessageDto
			{
				Status = true,
				Messages = "Nộp form thành công"
			};
		}

		// cập nhật bản ghi đã nộp
		public async Task<MessageDto> UpdateAsync(Guid id, CreateUpdateFormRecordDto model)
		{
			if (model == null)
			{
				throw new UserFriendlyException("Không có dữ liệu đầu vào");
			}

			var result = await _repository.FindAsync(id);
			if (result == null)
			{
				throw new UserFriendlyException("Không tìm thấy bản ghi này");
			}

			// dùng field đóng băng trong snapshot của chính bản ghi này (nếu có) để validate/dọn file -
			// không lấy field hiện tại của form, tránh sửa form sau này làm sửa bản ghi cũ bị chặn oan
			var fields = await ResolveValidationFieldsAsync(result);

			await ValidateData(model.Data, fields);

			// xoá file đính kèm đã bị gỡ khỏi bản ghi (so với dữ liệu cũ) để không tồn rác trên đĩa
			await DeleteOrphanedAttachmentsAsync(fields, result.Data, model.Data);

			result.Title = model.Title;
			result.Data = model.Data;
			result.FormId = model.FormId;
			// KHÔNG cập nhật FormSnapshot ở đây - giữ nguyên cấu trúc đã đóng băng lúc nộp, chỉ Data (giá trị) được đổi
			await _repository.UpdateAsync(result);

			return new MessageDto
			{
				Status = true,
				Messages = "Cập nhật bản ghi thành công"
			};
		}

		// xóa bản ghi
		public async Task<MessageDto> DeleteAsync(Guid id)
		{
			var query = await _repository.FindAsync(id);
			if (query == null)
			{
				throw new UserFriendlyException("Không tìm thấy bản ghi này");
			}
			var fields = await ResolveValidationFieldsAsync(query);
			await DeleteOrphanedAttachmentsAsync(fields, query.Data);
			await _repository.DeleteAsync(query);
			return new MessageDto
			{
				Status = true,
				Messages = "Xóa bản ghi thành công"
			};
		}

		// duyệt/từ chối 1 bản ghi - chỉ áp dụng cho form có bật RequireApproval; cho phép đổi quyết định
		// nhiều lần (không dựng state machine chặn duyệt lại) để đơn giản
		private async Task<MessageDto> SetApprovalStatusAsync(Guid id, string? note, ApprovalStatus status)
		{
			var record = await _repository.FindAsync(id);
			if (record == null)
			{
				throw new UserFriendlyException("Không tìm thấy bản ghi này");
			}

			var form = await _formRepository.FindAsync(record.FormId);
			if (form == null || !form.RequireApproval)
			{
				throw new UserFriendlyException("Form này không yêu cầu phê duyệt");
			}

			record.ApprovalStatus = status;
			record.ApprovalNote = note;
			record.ApprovedByUserId = _currentUser.Id;
			record.ApprovedAt = DateTime.Now;
			await _repository.UpdateAsync(record);

			return new MessageDto
			{
				Status = true,
				Messages = status == ApprovalStatus.Approved ? "Đã duyệt bản ghi" : "Đã từ chối bản ghi"
			};
		}

		public async Task<MessageDto> ApproveAsync(Guid id, string? note) => await SetApprovalStatusAsync(id, note, ApprovalStatus.Approved);

		public async Task<MessageDto> RejectAsync(Guid id, string? note) => await SetApprovalStatusAsync(id, note, ApprovalStatus.Rejected);

		// get bản ghi theo id
		public async Task<FormRecordDto> GetAsync(Guid id)
		{
			var query = await _repository.FindAsync(id);
			var result = new FormRecordDto();
			if (query != null)
			{
				var snapshot = TryParseSnapshot(query.FormSnapshot);
				result = new FormRecordDto
				{
					Id = query.Id,
					Title = query.Title,
					Data = query.Data,
					FormId = query.FormId,
					CreationTime = query.CreationTime,
					SnapshotContent = snapshot?.Content,
					SnapshotFields = snapshot?.Fields.Select(f => new FormRecordSnapshotFieldDto
					{
						Code = f.Code,
						Title = f.Title,
						Type = f.Type,
						Config = f.Config,
						Options = f.Options,
						DisplayOrder = f.DisplayOrder
					}).ToList(),
					ApprovalStatus = query.ApprovalStatus,
					ApprovalNote = query.ApprovalNote,
					ApprovedByUserId = query.ApprovedByUserId,
					ApprovedAt = query.ApprovedAt
				};
			}
			return result;
		}

		// get phân trang bản ghi
		public async Task<PagedResultDto<FormRecordDto>> GetListAsync(FormRecordPagingFilterDto page)
		{
			var query = await _repository.GetQueryableAsync();

			if (page.FormId != null)
			{
				query = query.Where(a => a.FormId == page.FormId);
			}
			if (!string.IsNullOrEmpty(page.Title))
			{
				query = query.Where(a => a.Title.ToLower().Contains(page.Title.ToLower()));
			}
			if (page.ApprovalStatus.HasValue)
			{
				query = query.Where(a => a.ApprovalStatus == page.ApprovalStatus.Value);
			}

			var totalCount = query.Count(); // Tổng số bản ghi
			var items = query
				.OrderByDescending(c => c.CreationTime)
				.Skip((page.PageIndex - 1) * page.PageSize)
				.Take(page.PageSize)
				.Select(a => new FormRecordDto
				{
					Id = a.Id,
					Title = a.Title,
					Data = a.Data,
					FormId = a.FormId,
					CreationTime = a.CreationTime,
					ApprovalStatus = a.ApprovalStatus,
					ApprovalNote = a.ApprovalNote,
					ApprovedByUserId = a.ApprovedByUserId,
					ApprovedAt = a.ApprovedAt
				})
				.ToList();

			return new PagedResultDto<FormRecordDto>(
				totalCount,  // Tổng số bản ghi
				items        // Danh sách sau khi phân trang
			);
		}

		// xuất kết quả nộp form ra Excel
		public async Task<byte[]> ExportExcelAsync(Guid formId)
		{
			var form = await _formRepository.FindAsync(formId);
			if (form == null)
			{
				throw new UserFriendlyException("Không tồn tại form này");
			}

			var allFields = await _formFieldRepository.GetQueryableAsync();
			var fields = allFields.Where(a => a.FormId == formId).OrderBy(a => a.DisplayOrder).ToList();

			var allRecords = await _repository.GetQueryableAsync();
			var records = allRecords.Where(a => a.FormId == formId).OrderByDescending(a => a.CreationTime).ToList();

			using var workbook = new XLWorkbook();
			var worksheet = workbook.Worksheets.Add("Ket qua");

			worksheet.Cell(1, 1).Value = "Tiêu đề bản ghi";
			for (var i = 0; i < fields.Count; i++)
			{
				worksheet.Cell(1, i + 2).Value = fields[i].Title;
			}
			worksheet.Cell(1, fields.Count + 2).Value = "Thời gian nộp";
			worksheet.Row(1).Style.Font.Bold = true;

			for (var row = 0; row < records.Count; row++)
			{
				var record = records[row];
				worksheet.Cell(row + 2, 1).Value = record.Title;

				Dictionary<string, string> data;
				try
				{
					data = JsonSerializer.Deserialize<Dictionary<string, string>>(record.Data) ?? new Dictionary<string, string>();
				}
				catch
				{
					data = new Dictionary<string, string>();
				}

				for (var i = 0; i < fields.Count; i++)
				{
					data.TryGetValue(fields[i].Code, out var value);

					if (fields[i].Type == TypeField.File)
					{
						var names = ParseAttachments(value).Select(a => a.Name).Where(n => !string.IsNullOrWhiteSpace(n));
						worksheet.Cell(row + 2, i + 2).Value = string.Join("; ", names);
					}
					else if (fields[i].Type == TypeField.Signature)
					{
						worksheet.Cell(row + 2, i + 2).Value = ParseAttachments(value).Any() ? "Có chữ ký" : "";
					}
					else
					{
						worksheet.Cell(row + 2, i + 2).Value = value ?? "";
					}
				}

				worksheet.Cell(row + 2, fields.Count + 2).Value = record.CreationTime.ToString("dd/MM/yyyy HH:mm");
			}

			worksheet.Columns().AdjustToContents();

			using var stream = new MemoryStream();
			workbook.SaveAs(stream);
			return stream.ToArray();
		}

		// định dạng bị chặn tuyệt đối bất kể field cấu hình cho phép gì (phòng vệ chiều sâu)
		private static readonly HashSet<string> DangerousExtensions = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
		{
			".exe", ".dll", ".bat", ".cmd", ".sh", ".js", ".vbs", ".ps1", ".php", ".asp", ".aspx", ".jar", ".msi", ".com", ".scr", ".htm", ".html"
		};

		// trần cứng cho mọi field kiểu File, độc lập với maxFileSizeMb cấu hình riêng của từng field
		private const long GlobalMaxFileSizeBytes = 20 * 1024 * 1024;

		// upload 1 file đính kèm cho field kiểu "Upload file/ảnh"; kiểm tra theo cấu hình riêng của field
		// (allowedExtensions/maxFileSizeMb) cộng với danh sách chặn cứng + trần dung lượng toàn cục
		public async Task<UploadAttachmentResultDto> UploadAttachmentAsync(Guid formId, string fieldCode, string fileName, long fileSize, Stream fileStream)
		{
			if (string.IsNullOrWhiteSpace(fileName))
			{
				throw new UserFriendlyException("Thiếu tên file");
			}

			var extension = Path.GetExtension(fileName);
			if (string.IsNullOrWhiteSpace(extension) || DangerousExtensions.Contains(extension))
			{
				throw new UserFriendlyException($"Định dạng file \"{extension}\" không được phép");
			}

			if (fileSize <= 0 || fileSize > GlobalMaxFileSizeBytes)
			{
				throw new UserFriendlyException($"Dung lượng file vượt quá giới hạn cho phép ({GlobalMaxFileSizeBytes / 1024 / 1024}MB)");
			}

			var allFields = await _formFieldRepository.GetQueryableAsync();
			var field = allFields.FirstOrDefault(f => f.FormId == formId && f.Code == fieldCode && (f.Type == TypeField.File || f.Type == TypeField.Signature));
			if (field == null)
			{
				throw new UserFriendlyException("Không tìm thấy thuộc tính đính kèm tương ứng");
			}

			var config = ParseConfig(field.Config);
			if (config.AllowedExtensions != null && config.AllowedExtensions.Count > 0
				&& !config.AllowedExtensions.Any(e => e.Trim().TrimStart('.').Equals(extension.TrimStart('.'), StringComparison.OrdinalIgnoreCase)))
			{
				throw new UserFriendlyException($"Trường \"{field.Title}\" chỉ chấp nhận định dạng: {string.Join(", ", config.AllowedExtensions)}");
			}

			if (config.MaxFileSizeMb.HasValue && fileSize > (long)(config.MaxFileSizeMb.Value * 1024 * 1024))
			{
				throw new UserFriendlyException($"Trường \"{field.Title}\" chỉ cho phép file tối đa {config.MaxFileSizeMb.Value}MB");
			}

			// tên blob do server sinh (không dùng tên client gửi lên) để tránh path traversal / đoán tên file
			var blobName = $"{Guid.NewGuid():N}{extension}";
			await _attachmentContainer.SaveAsync(blobName, fileStream);

			return new UploadAttachmentResultDto
			{
				Blob = blobName,
				Name = fileName,
				Size = fileSize
			};
		}

		public async Task<Stream> DownloadAttachmentAsync(string blobName)
		{
			if (string.IsNullOrWhiteSpace(blobName) || !await _attachmentContainer.ExistsAsync(blobName))
			{
				throw new UserFriendlyException("Không tìm thấy file đính kèm");
			}
			return await _attachmentContainer.GetAsync(blobName);
		}

		// thống kê tổng quan cho dashboard
		public async Task<DashboardStatsDto> GetDashboardStatsAsync()
		{
			var forms = await _formRepository.GetQueryableAsync();
			var records = await _repository.GetQueryableAsync();

			var totalForms = forms.Count();
			var totalRecords = records.Count();

			var topFormCounts = records
				.GroupBy(a => a.FormId)
				.Select(g => new { FormId = g.Key, Count = g.Count() })
				.OrderByDescending(g => g.Count)
				.Take(5)
				.ToList();

			var topFormIds = topFormCounts.Select(t => t.FormId).ToList();
			var formTitles = forms
				.Where(f => topFormIds.Contains(f.Id))
				.ToDictionary(f => f.Id, f => f.Title);

			return new DashboardStatsDto
			{
				TotalForms = totalForms,
				TotalRecords = totalRecords,
				TopForms = topFormCounts.Select(t => new TopFormDto
				{
					FormId = t.FormId,
					Title = formTitles.TryGetValue(t.FormId, out var title) ? title : "",
					Count = t.Count
				}).ToList()
			};
		}
	}
}
