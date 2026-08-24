import type { FullAuditedEntityDto } from '@abp/ng.core';

export interface CreateUpdateFormRecordDto {
  title?: string;
  formId: string;
  data?: string;
}

export interface FormRecordDto extends FullAuditedEntityDto<string> {
  title?: string;
  data?: string;
  formId?: string;
}

export interface FormRecordPagingFilterDto {
  formId?: string;
  title?: string;
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
