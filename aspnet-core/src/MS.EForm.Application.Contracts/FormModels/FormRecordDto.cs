using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Volo.Abp.Application.Dtos;

namespace EForm.FormModels
{
	public class FormRecordDto : FullAuditedEntityDto<Guid>
	{
		public string Title { get; set; }
		public string Data { get; set; }
		public Guid FormId { get; set; }
	}
}
