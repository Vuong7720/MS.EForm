using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Volo.Abp.Domain.Entities.Auditing;

namespace EForm.Entities
{
	public class FormCategories : FullAuditedAggregateRoot<Guid>
	{
		public string Title { get; set; }
		public string? Description { get; set; }
		public int Index { get; set; }
	}
}
