import type { FullAuditedEntityDto } from '@abp/ng.core';

export interface CatePagingDto {
  title?: string;
  pageSize: number;
  pageIndex: number;
}

export interface CreateUpdateFormCateDto {
  title?: string;
  description?: string;
  index: number;
}

export interface FormCategoryDto extends FullAuditedEntityDto<string> {
  title?: string;
  description?: string;
  index: number;
}
