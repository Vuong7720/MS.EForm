using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MS.EForm.FormModels.FormCategories
{
	public class CreateUpdateFormCateDto
	{
		public string Title { get; set; }
		public string? Description { get; set; }
		public int Index { get; set; }
	}
}
