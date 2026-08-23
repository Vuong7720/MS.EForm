using System;

namespace MS.EForm.FormModels.FormRecords
{
	public class FormRecordPagingFilterDto
	{
		public Guid? FormId { get; set; }
		public string? Title { get; set; }
		public int PageSize { get; set; } = 10;
		public int PageIndex { get; set; } = 1;
	}
}
