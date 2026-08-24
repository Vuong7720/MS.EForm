using ClosedXML.Excel;
using EForm;
using EForm.Entities;
using EForm.FormModels;
using EForm.IFormServices;
using Microsoft.Extensions.Configuration;
using MS.EForm.Enums;
using MS.EForm.FormModels.FormRecords;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using Volo.Abp;
using Volo.Abp.Application.Dtos;
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

		public FormRecordService(
			ICurrentUser currentUser,
			IConfiguration staticConfiguration,
			IRepository<FormRecord, Guid> repository,
			IRepository<FormField, Guid> formFieldRepository,
			IRepository<Form, Guid> formRepository
			)
		{
			_repository = repository;
			_formFieldRepository = formFieldRepository;
			_formRepository = formRepository;
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

		// validate dữ liệu nộp lên theo danh sách field của form; ném UserFriendlyException nếu vi phạm
		private async Task ValidateData(Guid formId, string data)
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

			var allFields = await _formFieldRepository.GetQueryableAsync();
			var fields = allFields.Where(a => a.FormId == formId).ToList();

			foreach (var field in fields)
			{
				submitted.TryGetValue(field.Code, out var value);
				var config = ParseConfig(field.Config);

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

			var form = await _formRepository.FindAsync(model.FormId); // ----> check tồn tại form
			if (form == null)
			{
				throw new UserFriendlyException("Không tồn tại form này");
			}

			await ValidateData(model.FormId, model.Data); // ----> validate dữ liệu theo field

			var result = new FormRecord
			{
				Title = model.Title,
				Data = model.Data,
				FormId = model.FormId
			};

			await _repository.InsertAsync(result);

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

			await ValidateData(model.FormId, model.Data);

			result.Title = model.Title;
			result.Data = model.Data;
			result.FormId = model.FormId;
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
			await _repository.DeleteAsync(query);
			return new MessageDto
			{
				Status = true,
				Messages = "Xóa bản ghi thành công"
			};
		}

		// get bản ghi theo id
		public async Task<FormRecordDto> GetAsync(Guid id)
		{
			var query = await _repository.FindAsync(id);
			var result = new FormRecordDto();
			if (query != null)
			{
				result = new FormRecordDto
				{
					Id = query.Id,
					Title = query.Title,
					Data = query.Data,
					FormId = query.FormId,
					CreationTime = query.CreationTime
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
					CreationTime = a.CreationTime
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
					worksheet.Cell(row + 2, i + 2).Value = value ?? "";
				}

				worksheet.Cell(row + 2, fields.Count + 2).Value = record.CreationTime.ToString("dd/MM/yyyy HH:mm");
			}

			worksheet.Columns().AdjustToContents();

			using var stream = new MemoryStream();
			workbook.SaveAs(stream);
			return stream.ToArray();
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
