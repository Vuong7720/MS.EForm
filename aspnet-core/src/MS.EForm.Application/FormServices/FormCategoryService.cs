using EForm.Entities;
using EForm.IFormServices;
using Microsoft.Extensions.Configuration;
using MS.EForm.FormModels.FormCategories;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;
using Volo.Abp.DependencyInjection;
using Volo.Abp.Domain.Repositories;
using Volo.Abp.Users;

namespace EForm.FormServices
{
	public class FormCategoryService : IFormCategory, ITransientDependency
	{
		IRepository<FormCategories, Guid> _repository;
		public FormCategoryService(
			ICurrentUser currentUser,
			IConfiguration staticConfiguration,
			IRepository<FormCategories, Guid> repository
			)
		{
			_repository = repository;
		}

		private async Task<bool> CheckTitleMach(string title, Guid? id)
		{
			var result = await _repository.FindAsync(a => a.Title.Contains(title) && a.Id != id);
			if(result != null)
			{
				return true;
			}
			return false;
		}

		// thêm mới anh mục form
		public async Task<MessageDto> CreateFormCategory(CreateUpdateFormCateDto model)
		{
			if(model == null)
			{
				return new MessageDto
				{
					Status = false,
					Messages = "Không có dữ liệu truyền vào"
				};
			}
			if(model.Title != null && model.Title != "")
			{
				var check = await CheckTitleMach(model.Title, null);
				if (check)
				{
					return new MessageDto
					{
						Status = false,
						Messages = "Tên danh mục đã có. vui lòng nhập tên khác!"
					};
				}
			}

			var result = new FormCategories();
			result.Title = model.Title; 
			result.Description = model.Description;
			result.Index = model.Index;

			await _repository.InsertAsync(result);
			return new MessageDto
			{
				Status = true,
				Messages = "Thêm mới danh mục thành công"
			};

		}

		//cập nhật danh mục form
		public async Task<MessageDto> UpdateFormCategory(Guid id, CreateUpdateFormCateDto model)
		{
			if (model.Title != null && model.Title != "")
			{
				var check = await CheckTitleMach(model.Title, id);
				if (check)
				{
					return new MessageDto
					{
						Status = false,
						Messages = "Tên danh mục đã có. vui lòng nhập tên khác!"
					};
				}
			}
			var categories = await _repository.FirstOrDefaultAsync(a => a.Id == id);
			if(categories != null)
			{
				categories.Title = model.Title;
				categories.Description = model.Description;
				categories.Index = model.Index;
				await _repository.UpdateAsync(categories);
				return new MessageDto
				{
					Status = true,
					Messages = "Update danh mục form thành công"
				};
			}
			return new MessageDto
			{
				Status = false,
				Messages = "Không có danh mục form này"
			};
		}
		// xóa danh mục form theo id
		public async Task<MessageDto> DeleteFormCategory(Guid id)
		{
			var query = await _repository.FindAsync(id);
			if(query != null)
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

		// get all danh mục form
		public async Task<List<FormCategoryDto>> GetAllFormCate()
		{
			var query = await _repository.GetQueryableAsync();
			var result = new List<FormCategoryDto>();
			if (query.Any())
			{
				result = query.Select(a => new FormCategoryDto
				{
					Title = a.Title,
					Description = a.Description,
					Id = a.Id,
					Index = a.Index
				}).ToList();
			}
			return result;
		}

		// get phân trang danh mục form
		public async Task<PagedResultDto<FormCategoryDto>> GetAllFormCatePagedAsync(int pageNumber, int pageSize)
		{
			var query = await _repository.GetQueryableAsync();

			var totalCount = query.Count(); // Tổng số bản ghi

			var items = query
				.OrderBy(c => c.Index)
				.Skip((pageNumber - 1) * pageSize)
				.Take(pageSize)
				.Select(a => new FormCategoryDto
				{
					Title = a.Title,
					Description = a.Description,
					Id = a.Id,
					Index = a.Index
				})
				.ToList();

			return new PagedResultDto<FormCategoryDto>(
				totalCount,  // Tổng số bản ghi
				items        // Danh sách sau khi phân trang
			);
		}

	}
}
