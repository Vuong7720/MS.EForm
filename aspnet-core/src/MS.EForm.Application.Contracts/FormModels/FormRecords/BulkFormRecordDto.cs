using System;
using System.Collections.Generic;

namespace MS.EForm.FormModels.FormRecords
{
	public class BulkFormRecordDto
	{
		public List<Guid> Ids { get; set; }
		public string? Note { get; set; }
	}
}
