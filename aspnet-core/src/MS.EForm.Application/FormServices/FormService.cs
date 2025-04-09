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
	public class FormService : IFormService, ITransientDependency
	{
		IRepository<Form, Guid> _repository;
		IRepository<FormField, Guid> _formFieldRepository;
		IRepository<FormCategories, Guid> _formCategoryRepository;
		public FormService(
			ICurrentUser currentUser,
			IConfiguration staticConfiguration,
			IRepository<Form, Guid> repository,
			IRepository<FormField, Guid> formFieldRepository,
			IRepository<FormCategories, Guid> formCategoryRepository
			)
		{
			_repository = repository;
			_formFieldRepository = formFieldRepository;
			_formCategoryRepository = formCategoryRepository;
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
					Messages = "Tên form đã có. vui lòng nhập tên khác!"
				};
			}
			return new MessageDto
			{
				Status = true,
				Messages = ""
			};
		}
		// check null formCategory
		private async Task<MessageDto> CheckFormCateMach(Guid formCateId)
		{
			var result = await _formCategoryRepository.FindAsync(formCateId);
			if (result == null)
			{
				return new MessageDto
				{
					Status = false,
					Messages = "Không tồn tại danh mục form này"
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

		// thêm mới form 
		public async Task<MessageDto> CreateAsync(CreateUpdateForm model)
		{
			try
			{
				var result = new Form();
				if (model == null) // ----> check dữ liệu đầu vào
				{
					return new MessageDto
					{
						Status = false,
						Messages = "Không có dữ liệu đầu vào"
					};
				}

				var check = await CheckTitleMach(model.Title, null); // ----> check trùng tên form
				if (!check.Status)
				{
					return check;
				}
				if(model.CategoryId != null) //-----> check tồn tại danh mục
				{
					var checkCate = await CheckFormCateMach(model.CategoryId.Value);
					if (!checkCate.Status)
					{
						return checkCate;
					}
				}

				result.Title = model.Title;
				result.Content = model.Content;
				result.CategoryId = model.CategoryId;
				result.Description = model.Description;

				var insert = await _repository.InsertAsync(result);

				if (model.FormFields!= null && model.FormFields.Any())
				{
					var lstField = model.FormFields
					.Select(a => new FormField
					{
						Title = a.Title,
						Code = a.Code,
						Type = a.Type,
						Config = a.Config,
						FormId = insert.Id
					})
					.ToList();
					if (lstField.Any())
					{
						await _formFieldRepository.InsertManyAsync(lstField);
					}
				}

				return new MessageDto
				{
					Status = true,
					Messages = "Thêm mới form thành công"
				};
			}
			catch (Exception ex)
			{
				return await MessagesErr(ex.Message);
			}

		}

		// Update form
		public async Task<MessageDto> UpdateAsync(Guid id, CreateUpdateForm model)
		{
			try
			{
				if (model == null) // ----> check dữ liệu đầu vào
				{
					return new MessageDto
					{
						Status = false,
						Messages = "Không có dữ liệu đầu vào"
					};
				}
				var check = await CheckTitleMach(model.Title, id); // ----> check trùng tên form
				if (!check.Status)
				{
					return check;
				}

				var result = await _repository.FindAsync(id);
				if(result != null)
				{
					result.Title = model.Title;
					result.Content = model.Content;
					result.CategoryId = model.CategoryId;
					result.Description = model.Description;
					await _repository.UpdateAsync(result);

					if (model.FormFields != null && model.FormFields.Any())
					{
						var allField = await _formFieldRepository.GetQueryableAsync();
						var lstOldField = allField.Where(a => a.FormId == id).ToList();
						if (lstOldField.Any())
						{
							foreach(var item in lstOldField)
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
							FormId = id
						})
						.ToList();
						if (lstField.Any())
						{
							await _formFieldRepository.InsertManyAsync(lstField);
						}
					}


					return new MessageDto
					{
						Status = true,
						Messages = "Thêm mới form thành công"
					};
				}
				else
				{
					return new MessageDto
					{
						Status = false,
						Messages = "Không tìm thấy form này"
					};
				}

			}
			catch (Exception ex)
			{
				return await MessagesErr(ex.Message);
			}
		}

		// Xóa form theo id
		public async Task<MessageDto> DeleteAsync(Guid id)
		{
			try
			{
				var allField = await _formFieldRepository.GetQueryableAsync();
				var fieldByForm = allField.Where(a => a.FormId == id).ToList();
				if (fieldByForm.Any())
				{
					await _formFieldRepository.DeleteManyAsync(fieldByForm);
				}

				var query = await _repository.FindAsync(id);
				if (query != null)
				{
					await _repository.DeleteAsync(query);
					return new MessageDto
					{
						Status = true,
						Messages = "Xóa form thành công"
					};
				}
				return new MessageDto
				{
					Status = false,
					Messages = "Không tìm thấy form này"
				};
			}
			catch (Exception ex)
			{
				return await MessagesErr(ex.Message);
			}
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
					Id = a.Id
				})
				.ToList();

			return new PagedResultDto<FormDto>(
				totalCount,  // Tổng số bản ghi
				items        // Danh sách sau khi phân trang
			);
		}


	}
}
