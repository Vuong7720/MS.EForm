using MS.EForm.FormModels.Pages;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Volo.Abp.Application.Dtos;

namespace EForm.IFormServices
{
	public interface IPage
	{
		Task<MessageDto> CreatePage(CreateUpdatePageDto model);
		Task<MessageDto> UpdatePage(Guid id, CreateUpdatePageDto model);
		Task<MessageDto> DeletePage(Guid id);
		Task<MessageDto> DuplicateAsync(Guid id);
		Task<PagedResultDto<PageDto>> GetAllPagesPagedAsync(PagePagingDto page);
		Task<PageDto> GetPageById(Guid id);
		Task<List<PageDto>> GetAllPages();

		// public, không cần đăng nhập - trang showcase gọi để lấy Page + section đang bật của nó theo slug.
		// slug rỗng/null -> trả về trang giới thiệu ĐẦU TIÊN đang bật (mặc định), phục vụ link /showcase cũ
		// không cần biết slug cụ thể khi hệ thống mới chỉ có 1 trang.
		Task<ShowcasePageDto> GetShowcasePage(string? slug);
	}
}
