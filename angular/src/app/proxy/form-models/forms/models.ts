import type { CreateUpdateFormField } from '../form-fields/models';
import type { FullAuditedEntityDto } from '@abp/ng.core';

export interface CreateUpdateForm {
  title?: string;
  content?: string;
  categoryId?: string;
  description?: string;
  isTemplate?: boolean;
  requireApproval?: boolean;
  notifyOnSubmit?: boolean;
  formFields?: CreateUpdateFormField[];
}

export interface FormDto extends FullAuditedEntityDto<string> {
  title?: string;
  content?: string;
  categoryId?: string;
  description?: string;
  isTemplate?: boolean;
  sourceTemplateId?: string;
  requireApproval?: boolean;
  notifyOnSubmit?: boolean;
}

export interface FormPagingFilterDto {
  title?: string;
  isTemplate?: boolean;
  pageSize: number;
  pageIndex: number;
}
