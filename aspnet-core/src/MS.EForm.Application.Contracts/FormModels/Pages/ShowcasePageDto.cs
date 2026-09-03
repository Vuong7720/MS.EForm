using System.Collections.Generic;
using MS.EForm.FormModels.PageSections;

namespace MS.EForm.FormModels.Pages
{
	// gói chung Page + danh sách section đang bật của nó - trang showcase public chỉ cần gọi 1 API duy
	// nhất thay vì 2 lượt round-trip (lấy Page rồi mới lấy section)
	public class ShowcasePageDto
	{
		public PageDto? Page { get; set; }
		public List<PageSectionDto> Sections { get; set; } = new();
	}
}
