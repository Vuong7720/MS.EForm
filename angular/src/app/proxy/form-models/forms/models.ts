import type { FullAuditedEntityDto } from '@abp/ng.core';

export interface CreateUpdateForm {
  title?: string;
  content?: string;
  categoryId?: string;
}

export interface FormDto extends FullAuditedEntityDto<string> {
  title?: string;
  content?: string;
  categoryId?: string;
}
