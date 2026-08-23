using System;

namespace MS.EForm.FormModels.FormRecords
{
	public class CreateUpdateFormRecordDto
	{
		public string Title { get; set; }
		public Guid FormId { get; set; }
		public string Data { get; set; }
	}
}
