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

		private async Task<MessageDto> CheckTitleMach(string? title, Guid? id)
		{
			if (string.IsNullOrEmpty(title))
			{
				return new MessageDto
				{
					Status = false,
					Messages = "Tên danh mục không được bỏ trống !"
				};
			}
			var result = await _repository.FindAsync(a => a.Title.Contains(title) && a.Id != id);
			if (result != null)
			{
				return new MessageDto
				{
					Status = false,
					Messages = "Tên danh mục đã có. vui lòng nhập tên khác !"
				};
			}
			return new MessageDto
			{
				Status = true,
				Messages = "Hợp lệ"
			};
		}

		// thêm mới anh mục form
		public async Task<MessageDto> CreateFormCategory(CreateUpdateFormCateDto model)
		{
			if (model == null)
			{
				return new MessageDto
				{
					Status = false,
					Messages = "Không có dữ liệu truyền vào"
				};
			}
			var check = await CheckTitleMach(model.Title, null);
			if (!check.Status)
			{
				return check;
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

			var check = await CheckTitleMach(model.Title, id);
			if (!check.Status)
			{
				return check;
			}
			var categories = await _repository.FirstOrDefaultAsync(a => a.Id == id);
			if (categories != null)
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

		// xóa danh mục form theo danh sách id
		public async Task<MessageDto> DeleteMultiFormCategory(List<Guid> ids)
		{
			if (ids == null || !ids.Any())
			{
				return new MessageDto
				{
					Status = false,
					Messages = "Danh sách ID không hợp lệ"
				};
			}

			var query = await _repository.GetQueryableAsync();

			if (query == null)
			{
				return new MessageDto
				{
					Status = false,
					Messages = "Không thể truy vấn danh mục"
				};
			}

			// Lọc các danh mục có trong danh sách cần xóa
			var categoriesToDelete = query.Where(a => ids.Contains(a.Id)).ToList();

			if (!categoriesToDelete.Any())
			{
				return new MessageDto
				{
					Status = false,
					Messages = "Không tìm thấy danh mục cần xóa"
				};
			}

			// Xóa danh mục
			await _repository.DeleteManyAsync(categoriesToDelete);

			return new MessageDto
			{
				Status = true,
				Messages = $"Đã xóa {categoriesToDelete.Count} danh mục thành công"
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
		public async Task<PagedResultDto<FormCategoryDto>> GetAllFormCatePagedAsync(CatePagingDto page)
		{
			var query = await _repository.GetQueryableAsync();

			if (!string.IsNullOrEmpty(page.Title))
			{
				query = query.Where(a => a.Title.ToLower().Contains(page.Title.ToLower()));
			}
			var totalCount = query.Count(); // Tổng số bản ghi
			var items = query
				.OrderBy(c => c.Index)
				.Skip((page.PageIndex - 1) * page.PageSize)
				.Take(page.PageSize)
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

		public async Task<FormCategoryDto> GetCategoryById(Guid id)
		{
			var allCate = await _repository.FindAsync(id);
			if(allCate != null)
			{
				return new FormCategoryDto
				{
					Title = allCate.Title,
					Description= allCate.Description,
					Index = allCate.Index
				};
			}
			return new FormCategoryDto();
		}

	}
}
