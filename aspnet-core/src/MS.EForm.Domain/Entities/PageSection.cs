using System;
using MS.EForm.Enums;
using Volo.Abp.Domain.Entities.Auditing;

namespace EForm.Entities
{
	// 1 "khu vực" trên trang giới thiệu (showcase) public - mỗi khu vực HOẶC nhúng 1 Form có sẵn (SectionType
	// = Form), HOẶC là 1 khối nội dung tự soạn không cần Form (SectionType = Content, vd poster/thông báo/
	// nội dung tùy chỉnh bất kỳ - không phải mọi thứ trình bày trên trang đều cần đến field/nhập liệu).
	// Admin sắp xếp thứ tự hiển thị qua DisplayOrder, không cần code lại khi muốn đổi bố cục trang.
	public class PageSection : FullAuditedAggregateRoot<Guid>
	{
		public string Title { get; set; }
		public string? Description { get; set; }
		public PageSectionType SectionType { get; set; } = PageSectionType.Form;
		// chỉ có giá trị khi SectionType = Form
		public Guid? FormId { get; set; }
		// chỉ có giá trị khi SectionType = Content - HTML tự soạn (TinyMCE), hiển thị thẳng, không có field/nhập liệu
		public string? Content { get; set; }
		// trang giới thiệu (Page) mà section này thuộc về - 1 Page có nhiều PageSection theo DisplayOrder riêng
		public Guid PageId { get; set; }
		public int DisplayOrder { get; set; }
		public bool IsActive { get; set; }
		// lịch hiển thị theo thời gian (vd poster Trung Thu chỉ cần hiện trong tháng 9) - null = không giới
		// hạn phía đó. Khi ngoài khoảng [StartDate, EndDate], section vẫn IsActive=true trong DB nhưng KHÔNG
		// hiển thị trên trang public (xem PageService.GetShowcasePage / PageSectionService IsWithinSchedule)
		// - tách biệt với IsActive để admin bật/tắt tay không bị mất cấu hình lịch đã đặt.
		public DateTime? StartDate { get; set; }
		public DateTime? EndDate { get; set; }
	}
}
