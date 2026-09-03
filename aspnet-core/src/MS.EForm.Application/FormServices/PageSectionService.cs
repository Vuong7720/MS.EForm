using EForm.Entities;
using EForm.IFormServices;
using Microsoft.Extensions.Configuration;
using MS.EForm.Enums;
using MS.EForm.FormModels.PageSections;
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
	public class PageSectionService : IPageSection, ITransientDependency
	{
		IRepository<PageSection, Guid> _repository;
		IRepository<Form, Guid> _formRepository;
		IRepository<Page, Guid> _pageRepository;

		public PageSectionService(
			ICurrentUser currentUser,
			IConfiguration staticConfiguration,
			IRepository<PageSection, Guid> repository,
			IRepository<Form, Guid> formRepository,
			IRepository<Page, Guid> pageRepository
			)
		{
			_repository = repository;
			_formRepository = formRepository;
			_pageRepository = pageRepository;
		}

		// check trang giới thiệu (Page) mà section này thuộc về có tồn tại không
		private async Task CheckPageMach(Guid pageId)
		{
			var page = await _pageRepository.FindAsync(pageId);
			if (page == null)
			{
				throw new UserFriendlyException("Không tồn tại trang giới thiệu này");
			}
		}

		// validate theo SectionType: kiểu Form bắt buộc chọn 1 form có thật, kiểu Content bắt buộc có nội dung
		private async Task CheckSectionContentAsync(CreateUpdatePageSectionDto model)
		{
			if (model.SectionType == PageSectionType.Form)
			{
				if (!model.FormId.HasValue)
				{
					throw new UserFriendlyException("Vui lòng chọn 1 biểu mẫu để nhúng");
				}
				var form = await _formRepository.FindAsync(model.FormId.Value);
				if (form == null)
				{
					throw new UserFriendlyException("Không tồn tại biểu mẫu này");
				}
			}
			else if (model.SectionType == PageSectionType.Content)
			{
				if (string.IsNullOrWhiteSpace(model.Content))
				{
					throw new UserFriendlyException("Vui lòng soạn nội dung cho khu vực này");
				}
			}

			if (model.StartDate.HasValue && model.EndDate.HasValue && model.EndDate.Value < model.StartDate.Value)
			{
				throw new UserFriendlyException("Ngày kết thúc hiển thị phải sau ngày bắt đầu");
			}
		}

		// section chỉ thật sự hiển thị công khai khi: IsActive=true VÀ đang trong khoảng lịch hiển thị
		// (StartDate/EndDate, null = không giới hạn phía đó) - dùng chung cho showcase page + embed đơn lẻ
		private static bool IsWithinSchedule(PageSection section)
		{
			var now = DateTime.Now;
			if (section.StartDate.HasValue && now < section.StartDate.Value) return false;
			if (section.EndDate.HasValue && now > section.EndDate.Value) return false;
			return true;
		}

		public async Task<MessageDto> CreatePageSection(CreateUpdatePageSectionDto model)
		{
			if (model == null || string.IsNullOrWhiteSpace(model.Title))
			{
				throw new UserFriendlyException("Vui lòng nhập tên khu vực hiển thị");
			}
			await CheckSectionContentAsync(model);
			await CheckPageMach(model.PageId);

			var result = new PageSection
			{
				Title = model.Title,
				Description = model.Description,
				SectionType = model.SectionType,
				FormId = model.SectionType == PageSectionType.Form ? model.FormId : null,
				Content = model.SectionType == PageSectionType.Content ? model.Content : null,
				PageId = model.PageId,
				DisplayOrder = model.DisplayOrder,
				IsActive = model.IsActive,
				StartDate = model.StartDate,
				EndDate = model.EndDate
			};

			await _repository.InsertAsync(result);
			return new MessageDto
			{
				Status = true,
				Messages = "Thêm mới khu vực hiển thị thành công"
			};
		}

		public async Task<MessageDto> UpdatePageSection(Guid id, CreateUpdatePageSectionDto model)
		{
			if (model == null || string.IsNullOrWhiteSpace(model.Title))
			{
				throw new UserFriendlyException("Vui lòng nhập tên khu vực hiển thị");
			}
			await CheckSectionContentAsync(model);
			await CheckPageMach(model.PageId);

			var section = await _repository.FindAsync(id);
			if (section == null)
			{
				throw new UserFriendlyException("Không tìm thấy khu vực hiển thị này");
			}

			section.Title = model.Title;
			section.Description = model.Description;
			section.SectionType = model.SectionType;
			section.FormId = model.SectionType == PageSectionType.Form ? model.FormId : null;
			section.Content = model.SectionType == PageSectionType.Content ? model.Content : null;
			section.PageId = model.PageId;
			section.DisplayOrder = model.DisplayOrder;
			section.IsActive = model.IsActive;
			section.StartDate = model.StartDate;
			section.EndDate = model.EndDate;
			await _repository.UpdateAsync(section);

			return new MessageDto
			{
				Status = true,
				Messages = "Cập nhật khu vực hiển thị thành công"
			};
		}

		public async Task<MessageDto> DeletePageSection(Guid id)
		{
			var section = await _repository.FindAsync(id);
			if (section == null)
			{
				throw new UserFriendlyException("Không tìm thấy khu vực hiển thị này");
			}
			await _repository.DeleteAsync(section);

			return new MessageDto
			{
				Status = true,
				Messages = "Xóa khu vực hiển thị thành công"
			};
		}

		// join tên form vào để hiển thị (danh sách quản trị) - không lưu, chỉ tính lúc đọc
		private async Task<Dictionary<Guid, string>> GetFormTitlesAsync(IEnumerable<Guid> formIds)
		{
			var allForms = await _formRepository.GetQueryableAsync();
			return allForms
				.Where(f => formIds.Contains(f.Id))
				.ToDictionary(f => f.Id, f => f.Title);
		}

		public async Task<PagedResultDto<PageSectionDto>> GetAllPageSectionsPagedAsync(PageSectionPagingDto page)
		{
			var query = await _repository.GetQueryableAsync();

			if (!string.IsNullOrEmpty(page.Title))
			{
				query = query.Where(a => a.Title.ToLower().Contains(page.Title.ToLower()));
			}
			if (page.PageId.HasValue)
			{
				query = query.Where(a => a.PageId == page.PageId.Value);
			}

			var totalCount = query.Count();
			var items = query
				.OrderBy(a => a.DisplayOrder)
				.Skip((page.PageIndex - 1) * page.PageSize)
				.Take(page.PageSize)
				.ToList();

			var formTitles = await GetFormTitlesAsync(items.Where(i => i.FormId.HasValue).Select(i => i.FormId!.Value));

			return new PagedResultDto<PageSectionDto>(
				totalCount,
				items.Select(a => new PageSectionDto
				{
					Id = a.Id,
					Title = a.Title,
					Description = a.Description,
					SectionType = a.SectionType,
					FormId = a.FormId,
					Content = a.Content,
					PageId = a.PageId,
					DisplayOrder = a.DisplayOrder,
					IsActive = a.IsActive,
					StartDate = a.StartDate,
					EndDate = a.EndDate,
					FormTitle = a.FormId.HasValue && formTitles.TryGetValue(a.FormId.Value, out var title) ? title : null
				}).ToList()
			);
		}

		// kéo thả sắp xếp lại thứ tự hiển thị ở trang quản trị - orderedIds là danh sách Id theo đúng
		// thứ tự mới (đầu danh sách = hiển thị đầu tiên), gán lại DisplayOrder theo chỉ số vị trí (0, 1, 2...)
		public async Task<MessageDto> ReorderPageSections(List<Guid> orderedIds)
		{
			if (orderedIds == null || orderedIds.Count == 0)
			{
				throw new UserFriendlyException("Danh sách khu vực cần sắp xếp trống");
			}

			for (var i = 0; i < orderedIds.Count; i++)
			{
				var section = await _repository.FindAsync(orderedIds[i]);
				if (section == null) continue;

				if (section.DisplayOrder != i)
				{
					section.DisplayOrder = i;
					await _repository.UpdateAsync(section);
				}
			}

			return new MessageDto
			{
				Status = true,
				Messages = "Cập nhật thứ tự hiển thị thành công"
			};
		}

		public async Task<PageSectionDto> GetPageSectionById(Guid id)
		{
			var section = await _repository.FindAsync(id);
			if (section == null)
			{
				return new PageSectionDto();
			}

			return new PageSectionDto
			{
				Id = section.Id,
				Title = section.Title,
				Description = section.Description,
				SectionType = section.SectionType,
				FormId = section.FormId,
				Content = section.Content,
				PageId = section.PageId,
				DisplayOrder = section.DisplayOrder,
				IsActive = section.IsActive,
				StartDate = section.StartDate,
				EndDate = section.EndDate
			};
		}

		// dùng cho trang nhúng độc lập (/embed/section/:id) - cho phép gắn 1 khu vực (form hoặc khối nội
		// dung) vào BẤT KỲ website nào khác qua <iframe>, không cần trình bày cả trang showcase - đúng với
		// nhu cầu gốc "đổi nội dung/poster ngay trên website hiện có mà không cần build lại trang". Public,
		// không Authorize - nhưng chỉ trả về khi section đang bật VÀ đang trong lịch hiển thị VÀ trang cha
		// (Page) cũng đang bật, để tránh lộ nội dung đã tắt/hết hạn ra ngoài qua đường link nhúng.
		public async Task<PageSectionDto?> GetEmbedSection(Guid id)
		{
			var section = await _repository.FindAsync(id);
			if (section == null || !section.IsActive || !IsWithinSchedule(section))
			{
				return null;
			}

			var page = await _pageRepository.FindAsync(section.PageId);
			if (page == null || !page.IsActive)
			{
				return null;
			}

			return new PageSectionDto
			{
				Id = section.Id,
				Title = section.Title,
				Description = section.Description,
				SectionType = section.SectionType,
				FormId = section.FormId,
				Content = section.Content,
				PageId = section.PageId,
				DisplayOrder = section.DisplayOrder,
				IsActive = section.IsActive
			};
		}
	}
}
