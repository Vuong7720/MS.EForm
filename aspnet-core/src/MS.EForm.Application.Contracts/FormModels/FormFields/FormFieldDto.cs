using MS.EForm.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Volo.Abp.Application.Dtos;

namespace MS.EForm.FormModels.FormFields
{
	public class FormFieldDto : FullAuditedEntityDto<Guid>
	{
		public string Title { get; set; }
		public string Code { get; set; }
		public TypeField Type { get; set; }
		public string? Config { get; set; }
		public Guid FormId { get; set; }
	}
}
