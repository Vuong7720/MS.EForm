import type { FullAuditedEntityDto } from '@abp/ng.core';

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
