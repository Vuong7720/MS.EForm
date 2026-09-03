using System;
using MS.EForm.Enums;

namespace MS.EForm.FormModels.FormRecords
{
	public class FormRecordPagingFilterDto
	{
		public Guid? FormId { get; set; }
		public string? Title { get; set; }
		// tìm theo nội dung đã nhập (khớp bất kỳ đâu trong dữ liệu JSON đã nộp), khác Title chỉ tìm theo tiêu đề bản ghi
		public string? Keyword { get; set; }
		public ApprovalStatus? ApprovalStatus { get; set; }
		public int PageSize { get; set; } = 10;
		public int PageIndex { get; set; } = 1;
	}
}
