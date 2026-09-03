using System;
using MS.EForm.Enums;
using Volo.Abp.Application.Dtos;

namespace MS.EForm.FormModels.PageSections
{
	public class PageSectionDto : FullAuditedEntityDto<Guid>
	{
		public string Title { get; set; }
		public string? Description { get; set; }
		public PageSectionType SectionType { get; set; }
		public Guid? FormId { get; set; }
		public string? Content { get; set; }
		public Guid PageId { get; set; }
		public int DisplayOrder { get; set; }
		public bool IsActive { get; set; }
		public DateTime? StartDate { get; set; }
		public DateTime? EndDate { get; set; }
		// tên form gán cho section - chỉ để hiển thị (trang quản trị + trang showcase), không dùng để lưu
		public string? FormTitle { get; set; }
		// tổng số lượt đã nộp của form này - chỉ tính lúc trả về trang showcase (GetShowcasePage), không lưu
		public int SubmissionCount { get; set; }
	}
}
