using System;
using System.Collections.Generic;

namespace MS.EForm.FormModels.FormRecords
{
	public class DashboardStatsDto
	{
		public int TotalForms { get; set; }
		public int TotalRecords { get; set; }
		public List<TopFormDto> TopForms { get; set; } = new List<TopFormDto>();
		// số lượt nộp mỗi ngày trong 14 ngày gần nhất (kể cả hôm nay) - dùng vẽ biểu đồ xu hướng ở dashboard
		public List<DailyCountDto> RecordsByDay { get; set; } = new List<DailyCountDto>();
		// chỉ tính bản ghi thuộc các form có bật "Cần phê duyệt" - form không bật approval thì
		// ApprovalStatus mặc định vẫn là Pending nhưng không có ý nghĩa thống kê nên không tính vào đây
		public ApprovalBreakdownDto ApprovalBreakdown { get; set; } = new ApprovalBreakdownDto();
	}

	public class TopFormDto
	{
		public Guid FormId { get; set; }
		public string Title { get; set; } = string.Empty;
		public int Count { get; set; }
	}

	public class DailyCountDto
	{
		public DateTime Date { get; set; }
		public int Count { get; set; }
	}

	public class ApprovalBreakdownDto
	{
		public int Pending { get; set; }
		public int Approved { get; set; }
		public int Rejected { get; set; }
	}
}
