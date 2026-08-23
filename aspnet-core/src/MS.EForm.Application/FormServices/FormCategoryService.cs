using EForm.Entities;
using EForm.IFormServices;
using Microsoft.Extensions.Configuration;
using MS.EForm.FormModels.FormCategories;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Volo.Abp;
using Volo.Abp.Application.Dtos;
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

		// check trùng tên danh mục, ném UserFriendlyException nếu không hợp lệ
		private async Task CheckTitleMach(string? title, Guid? id)
		{
			if (string.IsNullOrEmpty(title))
			{
				throw new UserFriendlyException("Tên danh mục không được bỏ trống!");
			}
			var result = await _repository.FindAsync(a => a.Title == title && a.Id != id);
			if (result != null)
			{
				throw new UserFriendlyException("Tên danh mục đã có, vui lòng nhập tên khác!");
			}
		}

		// thêm mới danh mục form
		public async Task<MessageDto> CreateFormCategory(CreateUpdateFormCateDto model)
		{
			if (model == null)
			{
				throw new UserFriendlyException("Không có dữ liệu truyền vào");
			}
			await CheckTitleMach(model.Title, null);

			var result = new FormCategories
			{
				Title = model.Title,
				Description = model.Description,
				Index = model.Index
			};

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
			if (model == null)
			{
				throw new UserFriendlyException("Không có dữ liệu truyền vào");
			}
			await CheckTitleMach(model.Title, id);

			var categories = await _repository.FirstOrDefaultAsync(a => a.Id == id);
			if (categories == null)
			{
				throw new UserFriendlyException("Không có danh mục form này");
			}

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

		// xóa danh mục form theo id
		public async Task<MessageDto> DeleteFormCategory(Guid id)
		{
			var query = await _repository.FindAsync(id);
			if (query == null)
			{
				throw new UserFriendlyException("Không tồn tại danh mục này");
			}
			await _repository.DeleteAsync(query);
			return new MessageDto
			{
				Status = true,
				Messages = "Xóa danh mục thành công"
			};
		}

		// xóa danh mục form theo danh sách id
		public async Task<MessageDto> DeleteMultiFormCategory(List<Guid> ids)
		{
			if (ids == null || !ids.Any())
			{
				throw new UserFriendlyException("Danh sách ID không hợp lệ");
			}

			var query = await _repository.GetQueryableAsync();
			var categoriesToDelete = query.Where(a => ids.Contains(a.Id)).ToList();

			if (!categoriesToDelete.Any())
			{
				throw new UserFriendlyException("Không tìm thấy danh mục cần xóa");
			}

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
