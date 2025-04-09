using MS.EForm.FormModels.FormFields;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MS.EForm.FormModels.Forms
{
	public class CreateUpdateForm
	{
		public string Title { get; set; }
		public string? Content { get; set; }
		public string? Description { get; set; }
		public Guid? CategoryId { get; set; }
		public List<CreateUpdateFormField>? FormFields { get; set; }
	}
}
