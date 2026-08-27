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
		public bool IsTemplate { get; set; }
		public Guid? SourceTemplateId { get; set; }
		// bật thì bản ghi nộp vào form này phải qua duyệt (EForm.FormRecords.Approve) mới coi là Approved
		public bool RequireApproval { get; set; }
		// bật thì gửi email cho người tạo form (CreatorId) mỗi khi có bản ghi mới nộp vào form này
		public bool NotifyOnSubmit { get; set; }
	}
}
