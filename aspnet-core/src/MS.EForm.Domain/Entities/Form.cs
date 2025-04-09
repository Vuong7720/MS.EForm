using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Volo.Abp.Domain.Entities.Auditing;

namespace EForm.Entities
{
	public class Form : FullAuditedAggregateRoot<Guid>
	{
		public string Title { get; set; }
		public string? Content { get; set; }
		public string? Description { get; set; }
		public Guid? CategoryId { get; set; }
	}
}
