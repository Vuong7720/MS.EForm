import type { CreateUpdateFormField } from '../form-fields/models';
import type { FullAuditedEntityDto } from '@abp/ng.core';

export interface CreateUpdateForm {
  title?: string;
  content?: string;
  categoryId?: string;
  description?: string;
  formFields?: CreateUpdateFormField[];
}

export interface FormDto extends FullAuditedEntityDto<string> {
  title?: string;
  content?: string;
  categoryId?: string;
  description?: string;
}

export interface FormPagingFilterDto {
  title?: string;
  pageSize: number;
  pageIndex: number;
}
