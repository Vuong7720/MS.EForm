using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using MS.EForm.Enums;
using Volo.Abp.Domain.Entities.Auditing;

namespace EForm.Entities
{
	public class FormRecord : FullAuditedAggregateRoot<Guid>
	{
		public string Title { get; set; }
		public string Data { get; set; }
		public Guid FormId { get; set; }
		// đóng băng nội dung + field của form tại thời điểm nộp (JSON), để sửa form sau này
		// không làm vỡ dữ liệu/validate của các bản ghi đã nộp trước đó. Null với bản ghi tạo trước khi có tính năng này.
		public string? FormSnapshot { get; set; }
		// mặc định Pending cho mọi bản ghi kể cả form không bật RequireApproval - vô hại, chỉ không được dùng tới
		public ApprovalStatus ApprovalStatus { get; set; } = ApprovalStatus.Pending;
		public string? ApprovalNote { get; set; }
		public Guid? ApprovedByUserId { get; set; }
		public DateTime? ApprovedAt { get; set; }
	}
}
