import type { TypeField } from '../../enums/type-field.enum';
import type { FullAuditedEntityDto } from '@abp/ng.core';

export interface CreateUpdateFormField {
  title?: string;
  code?: string;
  type?: TypeField;
  config?: string;
  formId?: string;
}

export interface FormFieldDto extends FullAuditedEntityDto<string> {
  title?: string;
  code?: string;
  type?: TypeField;
  config?: string;
  formId?: string;
}
