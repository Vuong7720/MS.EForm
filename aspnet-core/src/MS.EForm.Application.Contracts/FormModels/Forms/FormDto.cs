using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Volo.Abp.Application.Dtos;

namespace MS.EForm.FormModels.Forms
{
	public class FormDto : FullAuditedEntityDto<Guid>
	{
		public string? Title { get; set; }
		public string? Content { get; set; }
		public string? Description { get; set; }
		public Guid? CategoryId { get; set; }
	}
}
