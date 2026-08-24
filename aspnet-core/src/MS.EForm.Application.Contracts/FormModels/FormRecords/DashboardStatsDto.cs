using System;
using System.Collections.Generic;

namespace MS.EForm.FormModels.FormRecords
{
	public class DashboardStatsDto
	{
		public int TotalForms { get; set; }
		public int TotalRecords { get; set; }
		public List<TopFormDto> TopForms { get; set; } = new List<TopFormDto>();
	}

	public class TopFormDto
	{
		public Guid FormId { get; set; }
		public string Title { get; set; } = string.Empty;
		public int Count { get; set; }
	}
}
