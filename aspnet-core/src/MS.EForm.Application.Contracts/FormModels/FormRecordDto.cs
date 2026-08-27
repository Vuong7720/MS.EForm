using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using MS.EForm.Enums;
using MS.EForm.FormModels.FormRecords;
using Volo.Abp.Application.Dtos;

namespace EForm.FormModels
{
	public class FormRecordDto : FullAuditedEntityDto<Guid>
	{
		public string Title { get; set; }
		public string Data { get; set; }
		public Guid FormId { get; set; }
		// chỉ GetAsync (xem 1 bản ghi) mới điền 2 field này - GetListAsync (phân trang) để trống tránh phình payload
		public string? SnapshotContent { get; set; }
		public List<FormRecordSnapshotFieldDto>? SnapshotFields { get; set; }
		public ApprovalStatus ApprovalStatus { get; set; }
		public string? ApprovalNote { get; set; }
		public Guid? ApprovedByUserId { get; set; }
		public DateTime? ApprovedAt { get; set; }
	}
}
