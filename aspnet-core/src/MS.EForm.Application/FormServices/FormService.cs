using EForm;
using EForm.Entities;
using EForm.IFormServices;
using Microsoft.Extensions.Configuration;
using MS.EForm.FormModels.FormCategories;
using MS.EForm.FormModels.FormFields;
using MS.EForm.FormModels.Forms;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Volo.Abp;
using Volo.Abp.Application.Dtos;
using Volo.Abp.DependencyInjection;
using Volo.Abp.Domain.Repositories;
using Volo.Abp.Users;

namespace MS.EForm.FormServices
{
	public class FormService : IFormService, ITransientDependency
	{
		IRepository<Form, Guid> _repository;
		IRepository<FormField, Guid> _formFieldRepository;
		IRepository<FormCategories, Guid> _formCategoryRepository;
		IRepository<FormRecord, Guid> _formRecordRepository;
		public FormService(
			ICurrentUser currentUser,
			IConfiguration staticConfiguration,
			IRepository<Form, Guid> repository,
			IRepository<FormField, Guid> formFieldRepository,
			IRepository<FormCategories, Guid> formCategoryRepository,
			IRepository<FormRecord, Guid> formRecordRepository
			)
		{
			_repository = repository;
			_formFieldRepository = formFieldRepository;
			_formCategoryRepository = formCategoryRepository;
			_formRecordRepository = formRecordRepository;
		}

		#region Check

		// check trùng tên form
		private async Task CheckTitleMach(string title, Guid? id)
		{
			var result = await _repository.FirstOrDefaultAsync(a => a.Title == title && a.Id != id);
			if (result != null)
			{
				throw new UserFriendlyException("Tên form đã có, vui lòng nhập tên khác!");
			}
		}
		// check tồn tại danh mục
		private async Task CheckFormCateMach(Guid formCateId)
		{
			var result = await _formCategoryRepository.FindAsync(formCateId);
			if (result == null)
			{
				throw new UserFriendlyException("Không tồn tại danh mục form này");
			}
		}

		#endregion

		// thêm mới form
		public async Task<MessageDto> CreateAsync(CreateUpdateForm model)
		{
			if (model == null) // ----> check dữ liệu đầu vào
			{
				throw new UserFriendlyException("Không có dữ liệu đầu vào");
			}

			await CheckTitleMach(model.Title, null); // ----> check trùng tên form
			if (model.CategoryId != null) //-----> check tồn tại danh mục
			{
				await CheckFormCateMach(model.CategoryId.Value);
			}

			var result = new Form
			{
				Title = model.Title,
				Content = model.Content,
				CategoryId = model.CategoryId,
				Description = model.Description,
				IsTemplate = model.IsTemplate,
				RequireApproval = model.RequireApproval,
				NotifyOnSubmit = model.NotifyOnSubmit
			};

			var insert = await _repository.InsertAsync(result);

			if (model.FormFields != null && model.FormFields.Any())
			{
				var lstField = model.FormFields
				.Select(a => new FormField
				{
					Title = a.Title,
					Code = a.Code,
					Type = a.Type,
					Config = a.Config,
					Options = a.Options,
					DisplayOrder = a.DisplayOrder,
					FormId = insert.Id
				})
				.ToList();
				await _formFieldRepository.InsertManyAsync(lstField);
			}

			return new MessageDto
			{
				Status = true,
				Messages = "Thêm mới form thành công"
			};
		}

		// Update form
		public async Task<MessageDto> UpdateAsync(Guid id, CreateUpdateForm model)
		{
			if (model == null) // ----> check dữ liệu đầu vào
			{
				throw new UserFriendlyException("Không có dữ liệu đầu vào");
			}
			await CheckTitleMach(model.Title, id); // ----> check trùng tên form

			var result = await _repository.FindAsync(id);
			if (result == null)
			{
				throw new UserFriendlyException("Không tìm thấy form này");
			}

			result.Title = model.Title;
			result.Content = model.Content;
			result.CategoryId = model.CategoryId;
			result.Description = model.Description;
			result.IsTemplate = model.IsTemplate;
			result.RequireApproval = model.RequireApproval;
			result.NotifyOnSubmit = model.NotifyOnSubmit;
			await _repository.UpdateAsync(result);

			if (model.FormFields != null && model.FormFields.Any())
			{
				var allField = await _formFieldRepository.GetQueryableAsync();
				var lstOldField = allField.Where(a => a.FormId == id).ToList();
				if (lstOldField.Any())
				{
					foreach (var item in lstOldField)
					{
						await _formFieldRepository.HardDeleteAsync(item);
					}
				}
				var lstField = model.FormFields
				.Select(a => new FormField
				{
					Title = a.Title,
					Code = a.Code,
					Type = a.Type,
					Config = a.Config,
					Options = a.Options,
					DisplayOrder = a.DisplayOrder,
					FormId = id
				})
				.ToList();
				await _formFieldRepository.InsertManyAsync(lstField);
			}

			return new MessageDto
			{
				Status = true,
				Messages = "Cập nhật form thành công"
			};
		}

		// Xóa form theo id
		public async Task<MessageDto> DeleteAsync(Guid id)
		{
			var query = await _repository.FindAsync(id);
			if (query == null)
			{
				throw new UserFriendlyException("Không tìm thấy form này");
			}

			var allField = await _formFieldRepository.GetQueryableAsync();
			var fieldByForm = allField.Where(a => a.FormId == id).ToList();
			if (fieldByForm.Any())
			{
				await _formFieldRepository.DeleteManyAsync(fieldByForm);
			}

			var allRecords = await _formRecordRepository.GetQueryableAsync();
			var recordsByForm = allRecords.Where(a => a.FormId == id).ToList();
			if (recordsByForm.Any())
			{
				await _formRecordRepository.DeleteManyAsync(recordsByForm);
			}

			await _repository.DeleteAsync(query);
			return new MessageDto
			{
				Status = true,
				Messages = "Xóa form thành công"
			};
		}

		// Get toàn bộ form
		public async Task<List<FormDto>> GetAllForm()
		{
			var query = await _repository.GetQueryableAsync();
			var result = new List<FormDto>();
			if (query.Any())
			{
				result = query.Select(a => new FormDto
				{
					Title = a.Title,
					Content = a.Content,
					Id = a.Id,
					Description = a.Description,
					CategoryId = a.CategoryId,
					IsTemplate = a.IsTemplate,
					SourceTemplateId = a.SourceTemplateId,
					RequireApproval = a.RequireApproval,
					NotifyOnSubmit = a.NotifyOnSubmit,
				}).ToList();
			}
			return result;
		}

		// get form by id
		public async Task<FormDto> GetAsync(Guid id)
		{
			var query = await _repository.FindAsync(id);
			var result = new FormDto();
			if (query != null)
			{
				result = new FormDto
				{
					Title = query.Title,
					Content = query.Content,
					Id = query.Id,
					Description = query.Description,
					CategoryId = query.CategoryId,
					IsTemplate = query.IsTemplate,
					SourceTemplateId = query.SourceTemplateId,
					RequireApproval = query.RequireApproval,
					NotifyOnSubmit = query.NotifyOnSubmit,
				};
			}
			return result;
		}

		// get phân trang form
		public async Task<PagedResultDto<FormDto>> GetListAsync(FormPagingFilterDto page)
		{
			var query = await _repository.GetQueryableAsync();

			if (!string.IsNullOrEmpty(page.Title))
			{
				query = query.Where(a => a.Title.ToLower().Contains(page.Title.ToLower()));
			}
			if (page.IsTemplate.HasValue)
			{
				query = query.Where(a => a.IsTemplate == page.IsTemplate.Value);
			}
			var totalCount = query.Count(); // Tổng số bản ghi
			var items = query
				.OrderByDescending(c => c.CreationTime)
				.Skip((page.PageIndex - 1) * page.PageSize)
				.Take(page.PageSize)
				.Select(a => new FormDto
				{
					Title = a.Title,
					Content = a.Content,
					CategoryId = a.CategoryId,
					Description=a.Description,
					Id = a.Id,
					IsTemplate = a.IsTemplate,
					SourceTemplateId = a.SourceTemplateId,
					RequireApproval = a.RequireApproval,
					NotifyOnSubmit = a.NotifyOnSubmit,
				})
				.ToList();

			return new PagedResultDto<FormDto>(
				totalCount,  // Tổng số bản ghi
				items        // Danh sách sau khi phân trang
			);
		}

	}
}
