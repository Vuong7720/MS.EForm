using System;
using MS.EForm.Enums;

namespace MS.EForm.FormModels.FormRecords
{
	public class FormRecordPagingFilterDto
	{
		public Guid? FormId { get; set; }
		public string? Title { get; set; }
		public ApprovalStatus? ApprovalStatus { get; set; }
		public int PageSize { get; set; } = 10;
		public int PageIndex { get; set; } = 1;
	}
}
