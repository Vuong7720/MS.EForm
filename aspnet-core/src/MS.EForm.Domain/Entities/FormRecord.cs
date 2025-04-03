using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Volo.Abp.Domain.Entities.Auditing;

namespace EForm.Entities
{
	public class FormRecord : FullAuditedAggregateRoot<Guid>
	{
		public string Title { get; set; }
		public string Data { get; set; }
		public Guid FormId { get; set; }
	}
}
