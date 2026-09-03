using EForm.Entities;
using EForm.IFormServices;
using Microsoft.Extensions.Configuration;
using MS.EForm.FormModels.PageSections;
using MS.EForm.FormModels.Pages;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using Volo.Abp;
using Volo.Abp.Application.Dtos;
using Volo.Abp.DependencyInjection;
using Volo.Abp.Domain.Repositories;
using Volo.Abp.Users;

namespace EForm.FormServices
{
	public class PageService : IPage, ITransientDependency
	{
		IRepository<Page, Guid> _repository;
		IRepository<PageSection, Guid> _pageSectionRepository;
		IRepository<Form, Guid> _formRepository;
		IRepository<FormRecord, Guid> _formRecordRepository;

		public PageService(
			ICurrentUser currentUser,
			IConfiguration staticConfiguration,
			IRepository<Page, Guid> repository,
			IRepository<PageSection, Guid> pageSectionRepository,
			IRepository<Form, Guid> formRepository,
			IRepository<FormRecord, Guid> formRecordRepository
			)
		{
			_repository = repository;
			_pageSectionRepository = pageSectionRepository;
			_formRepository = formRepository;
			_formRecordRepository = formRecordRepository;
		}

		// chỉ chấp nhận chữ thường/số/gạch ngang - khớp đúng ký tự hợp lệ trong URL /showcase/{slug}
		private static readonly Regex SlugPattern = new Regex("^[a-z0-9]+(-[a-z0-9]+)*$", RegexOptions.Compiled);
		// màu hex 6 ký tự - dùng làm màu chủ đạo tùy biến giao diện trang (vd theo màu thương hiệu khách hàng)
		private static readonly Regex HexColorPattern = new Regex("^#[0-9a-fA-F]{6}$", RegexOptions.Compiled);

		private async Task CheckSlugMach(string? slug, Guid? id)
		{
			if (string.IsNullOrWhiteSpace(slug) || !SlugPattern.IsMatch(slug))
			{
				throw new UserFriendlyException("Đường dẫn (slug) chỉ được chứa chữ thường, số và dấu gạch ngang");
			}
			var existed = await _repository.FirstOrDefaultAsync(a => a.Slug == slug && a.Id != id);
			if (existed != null)
			{
				throw new UserFriendlyException("Đường dẫn (slug) đã được dùng cho trang khác, vui lòng chọn đường dẫn khác");
			}
		}

		private static void CheckColorFormat(string? color)
		{
			if (!string.IsNullOrWhiteSpace(color) && !HexColorPattern.IsMatch(color))
			{
				throw new UserFriendlyException("Màu chủ đạo phải ở định dạng mã hex (vd #4F46E5)");
			}
		}

		public async Task<MessageDto> CreatePage(CreateUpdatePageDto model)
		{
			if (model == null || string.IsNullOrWhiteSpace(model.Title))
			{
				throw new UserFriendlyException("Vui lòng nhập tên trang");
			}
			await CheckSlugMach(model.Slug, null);
			CheckColorFormat(model.PrimaryColor);

			var result = new Page
			{
				Title = model.Title,
				Slug = model.Slug,
				Description = model.Description,
				IsActive = model.IsActive,
				PrimaryColor = model.PrimaryColor,
				BrandName = model.BrandName
			};

			await _repository.InsertAsync(result);
			return new MessageDto
			{
				Status = true,
				Messages = "Thêm mới trang giới thiệu thành công"
			};
		}

		public async Task<MessageDto> UpdatePage(Guid id, CreateUpdatePageDto model)
		{
			if (model == null || string.IsNullOrWhiteSpace(model.Title))
			{
				throw new UserFriendlyException("Vui lòng nhập tên trang");
			}
			await CheckSlugMach(model.Slug, id);
			CheckColorFormat(model.PrimaryColor);

			var page = await _repository.FindAsync(id);
			if (page == null)
			{
				throw new UserFriendlyException("Không tìm thấy trang giới thiệu này");
			}

			page.Title = model.Title;
			page.Slug = model.Slug;
			page.Description = model.Description;
			page.IsActive = model.IsActive;
			page.PrimaryColor = model.PrimaryColor;
			page.BrandName = model.BrandName;
			await _repository.UpdateAsync(page);

			return new MessageDto
			{
				Status = true,
				Messages = "Cập nhật trang giới thiệu thành công"
			};
		}

		public async Task<MessageDto> DeletePage(Guid id)
		{
			var page = await _repository.FindAsync(id);
			if (page == null)
			{
				throw new UserFriendlyException("Không tìm thấy trang giới thiệu này");
			}

			var allSections = await _pageSectionRepository.GetQueryableAsync();
			var sectionsOfPage = allSections.Where(a => a.PageId == id).ToList();
			if (sectionsOfPage.Any())
			{
				await _pageSectionRepository.DeleteManyAsync(sectionsOfPage);
			}

			await _repository.DeleteAsync(page);
			return new MessageDto
			{
				Status = true,
				Messages = "Xóa trang giới thiệu thành công"
			};
		}

		// nhân bản 1 trang giới thiệu CÙNG toàn bộ khu vực hiển thị của nó - hữu ích khi cần dựng nhanh 1
		// trang demo mới (vd cho khách hàng khác, hoặc sự kiện năm sau) dựa trên bố cục đã có sẵn thay vì
		// tạo lại từ đầu. Trang mới luôn tạo ở trạng thái TẮT (IsActive=false) để tránh 2 trang public trùng
		// nội dung cùng hiển thị ngay lập tức - admin chủ động bật sau khi đã chỉnh sửa xong.
		public async Task<MessageDto> DuplicateAsync(Guid id)
		{
			var source = await _repository.FindAsync(id);
			if (source == null)
			{
				throw new UserFriendlyException("Không tìm thấy trang giới thiệu này");
			}

			var newTitle = $"{source.Title} (Bản sao)";
			var titleSuffix = 2;
			while (await _repository.FirstOrDefaultAsync(a => a.Title == newTitle) != null)
			{
				newTitle = $"{source.Title} (Bản sao {titleSuffix++})";
			}

			var baseSlug = $"{source.Slug}-ban-sao";
			var newSlug = baseSlug;
			var slugSuffix = 2;
			while (await _repository.FirstOrDefaultAsync(a => a.Slug == newSlug) != null)
			{
				newSlug = $"{baseSlug}-{slugSuffix++}";
			}

			var newPage = new Page
			{
				Title = newTitle,
				Slug = newSlug,
				Description = source.Description,
				IsActive = false,
				PrimaryColor = source.PrimaryColor,
				BrandName = source.BrandName
			};
			var inserted = await _repository.InsertAsync(newPage);

			var allSections = await _pageSectionRepository.GetQueryableAsync();
			var sourceSections = allSections.Where(a => a.PageId == id).ToList();
			if (sourceSections.Any())
			{
				var newSections = sourceSections.Select(s => new PageSection
				{
					Title = s.Title,
					Description = s.Description,
					SectionType = s.SectionType,
					FormId = s.FormId,
					Content = s.Content,
					PageId = inserted.Id,
					DisplayOrder = s.DisplayOrder,
					IsActive = s.IsActive,
					StartDate = s.StartDate,
					EndDate = s.EndDate
				}).ToList();
				await _pageSectionRepository.InsertManyAsync(newSections);
			}

			return new MessageDto
			{
				Status = true,
				Messages = "Nhân bản trang giới thiệu thành công (trang mới đang ở trạng thái tắt)"
			};
		}

		public async Task<PagedResultDto<PageDto>> GetAllPagesPagedAsync(PagePagingDto page)
		{
			var query = await _repository.GetQueryableAsync();

			if (!string.IsNullOrEmpty(page.Title))
			{
				query = query.Where(a => a.Title.ToLower().Contains(page.Title.ToLower()));
			}

			var totalCount = query.Count();
			var items = query
				.OrderByDescending(a => a.CreationTime)
				.Skip((page.PageIndex - 1) * page.PageSize)
				.Take(page.PageSize)
				.Select(a => new PageDto
				{
					Id = a.Id,
					Title = a.Title,
					Slug = a.Slug,
					Description = a.Description,
					IsActive = a.IsActive,
					PrimaryColor = a.PrimaryColor,
					BrandName = a.BrandName
				})
				.ToList();

			return new PagedResultDto<PageDto>(totalCount, items);
		}

		public async Task<PageDto> GetPageById(Guid id)
		{
			var page = await _repository.FindAsync(id);
			if (page == null)
			{
				return new PageDto();
			}

			return new PageDto
			{
				Id = page.Id,
				Title = page.Title,
				Slug = page.Slug,
				Description = page.Description,
				IsActive = page.IsActive,
				PrimaryColor = page.PrimaryColor,
				BrandName = page.BrandName
			};
		}

		public async Task<List<PageDto>> GetAllPages()
		{
			var query = await _repository.GetQueryableAsync();
			return query
				.OrderByDescending(a => a.CreationTime)
				.Select(a => new PageDto
				{
					Id = a.Id,
					Title = a.Title,
					Slug = a.Slug,
					Description = a.Description,
					IsActive = a.IsActive,
					PrimaryColor = a.PrimaryColor,
					BrandName = a.BrandName
				})
				.ToList();
		}

		public async Task<ShowcasePageDto> GetShowcasePage(string? slug)
		{
			var allPages = await _repository.GetQueryableAsync();
			var activePages = allPages.Where(a => a.IsActive);

			// không truyền slug -> lấy trang giới thiệu ĐẦU TIÊN đang bật (mặc định), phục vụ link
			// /showcase cũ (không biết slug cụ thể) từ khi hệ thống chỉ có 1 trang duy nhất
			var page = string.IsNullOrWhiteSpace(slug)
				? activePages.OrderBy(a => a.CreationTime).FirstOrDefault()
				: activePages.FirstOrDefault(a => a.Slug == slug);

			if (page == null)
			{
				return new ShowcasePageDto();
			}

			var now = DateTime.Now;
			var allSections = await _pageSectionRepository.GetQueryableAsync();
			var sections = allSections
				.Where(a => a.PageId == page.Id && a.IsActive)
				// lịch hiển thị theo thời gian (StartDate/EndDate, null = không giới hạn phía đó) - vd
				// poster Trung Thu tự ẩn sau khi hết hạn mà không cần admin quay lại tắt tay
				.Where(a => (!a.StartDate.HasValue || a.StartDate.Value <= now) && (!a.EndDate.HasValue || a.EndDate.Value >= now))
				.OrderBy(a => a.DisplayOrder)
				.ToList();

			// chỉ section kiểu Form mới gắn với 1 FormId thật - section kiểu Content không có form nào cả
			var sectionFormIds = sections.Where(s => s.FormId.HasValue).Select(s => s.FormId!.Value).ToList();

			var allForms = await _formRepository.GetQueryableAsync();
			var formTitles = allForms
				.Where(f => sectionFormIds.Contains(f.Id))
				.ToDictionary(f => f.Id, f => f.Title);

			// đếm số lượt nộp của mỗi form được nhúng - hiện như minh chứng xã hội (social proof) ngay
			// trên trang giới thiệu, tăng độ tin cậy khi khách hàng xem demo ("đã có bao nhiêu người dùng")
			var allRecords = await _formRecordRepository.GetQueryableAsync();
			var submissionCounts = allRecords
				.Where(r => sectionFormIds.Contains(r.FormId))
				.GroupBy(r => r.FormId)
				.ToDictionary(g => g.Key, g => g.Count());

			return new ShowcasePageDto
			{
				Page = new PageDto
				{
					Id = page.Id,
					Title = page.Title,
					Slug = page.Slug,
					Description = page.Description,
					IsActive = page.IsActive,
					PrimaryColor = page.PrimaryColor,
					BrandName = page.BrandName
				},
				Sections = sections.Select(a => new PageSectionDto
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
					FormTitle = a.FormId.HasValue && formTitles.TryGetValue(a.FormId.Value, out var title) ? title : null,
					SubmissionCount = a.FormId.HasValue && submissionCounts.TryGetValue(a.FormId.Value, out var count) ? count : 0
				}).ToList()
			};
		}
	}
}
