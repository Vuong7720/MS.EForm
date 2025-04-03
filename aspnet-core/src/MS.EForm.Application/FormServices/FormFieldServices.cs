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

		// check trùng tên thuộc tính
		private async Task<MessageDto> CheckTitleMach(string title, Guid? id)
		{
			var result = await _repository.FirstOrDefaultAsync(a => a.Title.Contains(title) && a.Id != id);
			if (result != null)
			{
				return new MessageDto
				{
					Status = false,
					Messages = "Tên thuộc tính đã có. vui lòng nhập tên khác!"
				};
			}
			return new MessageDto
			{
				Status = true,
				Messages = ""
			};
		}
		// check trùng mã code
		private async Task<MessageDto> CheckCodeMach(string code, Guid? id)
		{
			var result = await _repository.FirstOrDefaultAsync(a => a.Code.Contains(code) && a.Id != id);
			if (result != null)
			{
				return new MessageDto
				{
					Status = false,
					Messages = "Mã code đã tồn tại. vui lòng nhập mã khác!"
				};
			}
			return new MessageDto
			{
				Status = true,
				Messages = ""
			};
		}
		// check null form
		private async Task<MessageDto> CheckFormMach(Guid formId)
		{
			var result = await _formRepository.FindAsync(formId);
			if (result == null)
			{
				return new MessageDto
				{
					Status = false,
					Messages = "Không tồn tại form này"
				};
			}
			return new MessageDto
			{
				Status = true,
				Messages = ""
			};
		}

		// messages err
		private async Task<MessageDto> MessagesErr(string err)
		{
			return new MessageDto
			{
				Status = false,
				Messages = err
			};
		}

		#endregion

		// thêm mới thuộc tính
		public async Task<MessageDto> CreateFormField(CreateUpdateFormField model)
		{
			try
			{ 
				if (model == null) // ----> check dữ liệu đầu vào
				{
					return new MessageDto
					{
						Status = false,
						Messages = "Không có dữ liệu truyền vào"
					};
				}
				if (model.Title != null && model.Title != "") // ----> check trùng title
				{
					var check = await CheckTitleMach(model.Title, null);
					if (!check.Status)
					{
						return check;
					}
				}
				if (model.Code != null && model.Code != "") // ----> check trùng code
				{
					var check = await CheckCodeMach(model.Code, null);
					if (!check.Status)
					{
						return check;
					}
				}
				if (model.FormId != null) // ----> check có tồn tại form
				{
					var check = await CheckFormMach(model.FormId);
					if (!check.Status)
					{
						return check;
					}
				}

				var result = new FormField();
				result.Title = model.Title;
				result.Code = model.Code;
				result.Type = model.Type;
				result.FormId = model.FormId;

				await _repository.InsertAsync(result);
				return new MessageDto
				{
					Status = true,
					Messages = "Thêm mới thuộc tính thành công"
				};
			}
			catch (Exception ex) {
				return await MessagesErr(ex.Message);
			}
			
		}

		//cập nhật danh mục form
		public async Task<MessageDto> UpdateFormField(Guid id, CreateUpdateFormField model)
		{
			try
			{
				if (model == null) // ----> check dữ liệu đầu vào
				{
					return new MessageDto
					{
						Status = false,
						Messages = "Không có dữ liệu truyền vào"
					};
				}

				if (model.Title != null && model.Title != "") // ----> check trùng title
				{
					var check = await CheckTitleMach(model.Title, id);
					if (!check.Status)
					{
						return check;
					}
				}
				if (model.Code != null && model.Code != "") // ----> check trùng code
				{
					var check = await CheckCodeMach(model.Code, id);
					if (!check.Status)
					{
						return check;
					}
				}
				if (model.FormId != null) // ----> check có tồn tại form
				{
					var check = await CheckFormMach(model.FormId);
					if (!check.Status)
					{
						return check;
					}
				}

				var categories = await _repository.FirstOrDefaultAsync(a => a.Id == id);
				if (categories != null)
				{
					categories.Title = model.Title;
					categories.Code = model.Code;
					categories.Type = model.Type;
					await _repository.UpdateAsync(categories);
					return new MessageDto
					{
						Status = true,
						Messages = "Update thuộc tính thành công"
					};
				}
				return new MessageDto
				{
					Status = false,
					Messages = "Không có thuộc tính này"
				};
			}
			catch (Exception ex)
			{
				return await MessagesErr(ex.Message);
			}
			
		}
		// xóa thuộc theo id
		public async Task<MessageDto> DeleteFormField(Guid id)
		{
			try
			{
				var query = await _repository.FindAsync(id);
				if (query != null)
				{
					await _repository.DeleteAsync(query);
					return new MessageDto
					{
						Status = true,
						Messages = "Xóa danh mục thành công"
					};
				}
				return new MessageDto
				{
					Status = false,
					Messages = "Không tồn tại danh mục này"
				};
			}
			catch (Exception ex) { 
			 return await MessagesErr(ex.Message);
			}
			
		}

		// get all thuộc tính
		public async Task<List<FormFieldDto>> GetAllFormField()
		{
			var query = await _repository.GetQueryableAsync();
			var result = new List<FormFieldDto>();
			if (query.Any())
			{
				result = query.Select(a => new FormFieldDto
				{
					Title = a.Title,
					Code = a.Code,
					Id = a.Id,
					Type = a.Type,
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
					Title = query.Title,
					Code = query.Code,
					Id = query.Id,
					Type = query.Type,
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
				.Skip((pageNumber - 1) * pageSize)
				.Take(pageSize)
				.Select(a => new FormFieldDto
				{
					Title = a.Title,
					Code = a.Code,
					Id = a.Id,
					Type = a.Type,
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
					var result = query.Select(a => new FormFieldDto {
						Title = a.Title,
						Code = a.Code,
						Type = a.Type,
						Config = a.Config,
						FormId = a.FormId
					}).ToList();

					return result;

				}
			}
			return new List<FormFieldDto>();
		}







	}
}
