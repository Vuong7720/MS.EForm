using System;

namespace MS.EForm.FormModels.PageSections
{
	public class PageSectionPagingDto
	{
		public string? Title { get; set; }
		// lọc theo 1 trang giới thiệu cụ thể - null = lấy section của mọi trang (dùng khi chưa chọn trang nào)
		public Guid? PageId { get; set; }
		public int PageSize { get; set; } = 10;
		public int PageIndex { get; set; } = 1;
	}
}
