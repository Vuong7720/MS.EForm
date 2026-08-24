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
	public class FormFieldServices : IFormField, ITransientDependency
	{
		IRepository<FormField, Guid> _repository;
		IRepository<Form, Guid> _formRepository;
		public FormFieldServices(
			ICurrentUser currentUser,
			IConfiguration staticConfiguration,
			IRepository<FormField, Guid> repository,
			IRepository<Form, Guid> formRepository
			)
		{
			_repository = repository;
			_formRepository = formRepository;
		}

		#region Check

		// check trùng tên thuộc tính trong cùng 1 form (2 form khác nhau được phép trùng tên field)
		private async Task CheckTitleMach(string title, Guid formId, Guid? id)
		{
			var result = await _repository.FirstOrDefaultAsync(a => a.Title == title && a.FormId == formId && a.Id != id);
			if (result != null)
			{
				throw new UserFriendlyException("Tên thuộc tính đã có trong form này, vui lòng nhập tên khác!");
			}
		}
		// check trùng mã code trong cùng 1 form
		private async Task CheckCodeMach(string code, Guid formId, Guid? id)
		{
			var result = await _repository.FirstOrDefaultAsync(a => a.Code == code && a.FormId == formId && a.Id != id);
			if (result != null)
			{
				throw new UserFriendlyException("Mã code đã tồn tại trong form này, vui lòng nhập mã khác!");
			}
		}
		// check tồn tại form
		private async Task CheckFormMach(Guid? formId)
		{
			if (formId == null)
			{
				throw new UserFriendlyException("Không tồn tại form này");
			}
			var result = await _formRepository.FindAsync(formId.Value);
			if (result == null)
			{
				throw new UserFriendlyException("Không tồn tại form này");
			}
		}

		#endregion

		// thêm mới thuộc tính
		public async Task<MessageDto> CreateFormField(CreateUpdateFormField model)
		{
			if (model == null) // ----> check dữ liệu đầu vào
			{
				throw new UserFriendlyException("Không có dữ liệu truyền vào");
			}
			if (model.FormId == null) // ----> bắt buộc phải thuộc về 1 form
			{
				throw new UserFriendlyException("Vui lòng chọn form cho thuộc tính này");
			}
			if (!string.IsNullOrEmpty(model.Title)) // ----> check trùng title trong cùng form
			{
				await CheckTitleMach(model.Title, model.FormId.Value, null);
			}
			if (!string.IsNullOrEmpty(model.Code)) // ----> check trùng code trong cùng form
			{
				await CheckCodeMach(model.Code, model.FormId.Value, null);
			}
			await CheckFormMach(model.FormId.Value); // ----> check có tồn tại form

			var result = new FormField
			{
				Title = model.Title,
				Code = model.Code,
				Type = model.Type,
				Config = model.Config,
				Options = model.Options,
				DisplayOrder = model.DisplayOrder,
				FormId = model.FormId.Value
			};

			await _repository.InsertAsync(result);
			return new MessageDto
			{
				Status = true,
				Messages = "Thêm mới thuộc tính thành công"
			};
		}

		//cập nhật thuộc tính
		public async Task<MessageDto> UpdateFormField(Guid id, CreateUpdateFormField model)
		{
			if (model == null) // ----> check dữ liệu đầu vào
			{
				throw new UserFriendlyException("Không có dữ liệu truyền vào");
			}

			var field = await _repository.FirstOrDefaultAsync(a => a.Id == id);
			if (field == null)
			{
				throw new UserFriendlyException("Không có thuộc tính này");
			}

			var formId = model.FormId ?? field.FormId; // giữ nguyên form hiện tại nếu model không gửi FormId

			if (!string.IsNullOrEmpty(model.Title)) // ----> check trùng title trong cùng form
			{
				await CheckTitleMach(model.Title, formId, id);
			}
			if (!string.IsNullOrEmpty(model.Code)) // ----> check trùng code trong cùng form
			{
				await CheckCodeMach(model.Code, formId, id);
			}
			if (model.FormId != null) // ----> check có tồn tại form
			{
				await CheckFormMach(model.FormId);
			}

			field.Title = model.Title;
			field.Code = model.Code;
			field.Type = model.Type;
			field.Config = model.Config;
			field.Options = model.Options;
			field.DisplayOrder = model.DisplayOrder;
			await _repository.UpdateAsync(field);
			return new MessageDto
			{
				Status = true,
				Messages = "Update thuộc tính thành công"
			};
		}
		// xóa thuộc tính theo id
		public async Task<MessageDto> DeleteFormField(Guid id)
		{
			var query = await _repository.FindAsync(id);
			if (query == null)
			{
				throw new UserFriendlyException("Không tồn tại thuộc tính này");
			}
			await _repository.DeleteAsync(query);
			return new MessageDto
			{
				Status = true,
				Messages = "Xóa thuộc tính thành công"
			};
		}

		// get all thuộc tính
		public async Task<List<FormFieldDto>> GetAllFormField()
		{
			var query = await _repository.GetQueryableAsync();
			var result = new List<FormFieldDto>();
			if (query.Any())
			{
				result = query
					.OrderBy(a => a.DisplayOrder)
					.Select(a => new FormFieldDto
					{
						Id = a.Id,
						Title = a.Title,
						Code = a.Code,
						Type = a.Type,
						Config = a.Config,
						Options = a.Options,
						DisplayOrder = a.DisplayOrder,
						FormId = a.FormId
					}).ToList();
			}
			return result;
		}

		// get thuộc tính by id
		public async Task<FormFieldDto> GetFormFieldById(Guid id)
		{
			var query = await _repository.FindAsync(id);
			var result = new FormFieldDto();
			if (query != null)
			{
				result = new FormFieldDto
				{
					Id = query.Id,
					Title = query.Title,
					Code = query.Code,
					Type = query.Type,
					Config = query.Config,
					Options = query.Options,
					DisplayOrder = query.DisplayOrder,
					FormId = query.FormId
				};
			}
			return result;
		}

		// get phân trang thuộc tính
		public async Task<PagedResultDto<FormFieldDto>> GetAllFormFieldPagedAsync(int pageNumber, int pageSize)
		{
			var query = await _repository.GetQueryableAsync();

			var totalCount = query.Count(); // Tổng số bản ghi

			var items = query
				.OrderBy(a => a.DisplayOrder)
				.Skip((pageNumber - 1) * pageSize)
				.Take(pageSize)
				.Select(a => new FormFieldDto
				{
					Id = a.Id,
					Title = a.Title,
					Code = a.Code,
					Type = a.Type,
					Config = a.Config,
					Options = a.Options,
					DisplayOrder = a.DisplayOrder,
					FormId = a.FormId
				})
				.ToList();

			return new PagedResultDto<FormFieldDto>(
				totalCount,  // Tổng số bản ghi
				items        // Danh sách sau khi phân trang
			);
		}

		// get field by formId
		public async Task<List<FormFieldDto>> GetFieldByFormId(Guid formId)
		{
			var field = await _repository.GetQueryableAsync();
			if (field.Any())
			{
				var query = field.Where(a => a.FormId == formId).ToList();
				if(query != null)
				{
					var result = query
						.OrderBy(a => a.DisplayOrder)
						.Select(a => new FormFieldDto {
							Id = a.Id,
							Title = a.Title,
							Code = a.Code,
							Type = a.Type,
							Config = a.Config,
							Options = a.Options,
							DisplayOrder = a.DisplayOrder,
							FormId = a.FormId
						}).ToList();

					return result;

				}
			}
			return new List<FormFieldDto>();
		}







	}
}
