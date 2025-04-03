using MS.EForm.Enums;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Volo.Abp.Domain.Entities.Auditing;

namespace EForm.Entities
{
	public class FormField : FullAuditedAggregateRoot<Guid>
	{
		public string Title { get; set; }
		public string Code { get; set; }
		public TypeField Type { get; set; }
		public string? Config { get; set; }
		public Guid FormId { get; set; }
	}
}
