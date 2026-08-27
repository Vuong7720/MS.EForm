import type { FullAuditedEntityDto } from '@abp/ng.core';
import type { TypeField } from '../../enums/type-field.enum';
import type { ApprovalStatus } from '../../enums/approval-status.enum';

export interface CreateUpdateFormRecordDto {
  title?: string;
  formId: string;
  data?: string;
}

// 1 field trong snapshot đóng băng của FormRecord - cùng cấu trúc FormFieldDto (thiếu id/formId vì không cần)
export interface FormRecordSnapshotFieldDto {
  code: string;
  title: string;
  type: TypeField;
  config?: string;
  options?: string;
  displayOrder: number;
}

export interface FormRecordDto extends FullAuditedEntityDto<string> {
  title?: string;
  data?: string;
  formId?: string;
  // chỉ có giá trị khi gọi get(id) (xem 1 bản ghi) - getList (phân trang) để trống tránh phình payload.
  // null/undefined = bản ghi tạo trước khi có tính năng snapshot, phải fallback lấy field hiện tại của form.
  snapshotContent?: string;
  snapshotFields?: FormRecordSnapshotFieldDto[];
  approvalStatus: ApprovalStatus;
  approvalNote?: string;
  approvedByUserId?: string;
  approvedAt?: string;
}

export interface FormRecordPagingFilterDto {
  formId?: string;
  title?: string;
  approvalStatus?: ApprovalStatus;
  pageSize: number;
  pageIndex: number;
}

export interface TopFormDto {
  formId: string;
  title: string;
  count: number;
}

export interface DashboardStatsDto {
  totalForms: number;
  totalRecords: number;
  topForms: TopFormDto[];
}

// kết quả upload 1 file đính kèm (field kiểu Upload file/ảnh) - xem UploadAttachmentResultDto ở backend
export interface UploadAttachmentResultDto {
  blob: string;
  name: string;
  size: number;
}
