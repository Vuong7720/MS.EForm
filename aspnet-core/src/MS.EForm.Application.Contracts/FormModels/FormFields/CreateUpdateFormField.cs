using MS.EForm.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MS.EForm.FormModels.FormFields
{
	public class CreateUpdateFormField
	{
		public string Title { get; set; }
		public string Code { get; set; }
		public TypeField Type { get; set; }
		public string? Config { get; set; }
		public Guid? FormId { get; set; }
	}
}
