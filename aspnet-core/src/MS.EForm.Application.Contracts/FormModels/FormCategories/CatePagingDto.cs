using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MS.EForm.FormModels.FormCategories
{
	public class CatePagingDto
	{
		public string? Title { get; set; }
		public int PageSize { get; set; } = 10;
		public int PageIndex { get; set; } = 1;
	}
}
