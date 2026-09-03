import type { FullAuditedEntityDto } from '@abp/ng.core';
import type { PageSectionType } from '../../enums/page-section-type.enum';

export interface PageSectionPagingDto {
  title?: string;
  // lọc theo 1 trang giới thiệu cụ thể - null/undefined = lấy section của mọi trang
  pageId?: string;
  pageSize: number;
  pageIndex: number;
}

export interface CreateUpdatePageSectionDto {
  title?: string;
  description?: string;
  sectionType: PageSectionType;
  formId?: string;
  content?: string;
  pageId?: string;
  displayOrder: number;
  isActive: boolean;
  // lịch hiển thị theo thời gian, null/undefined = không giới hạn phía đó - xem PageSection.cs
  startDate?: string;
  endDate?: string;
}

export interface PageSectionDto extends FullAuditedEntityDto<string> {
  title?: string;
  description?: string;
  sectionType: PageSectionType;
  formId?: string;
  content?: string;
  pageId?: string;
  displayOrder: number;
  isActive: boolean;
  startDate?: string;
  endDate?: string;
  formTitle?: string;
  submissionCount: number;
}
