import type { TypeField } from '../../enums/type-field.enum';
import type { FullAuditedEntityDto } from '@abp/ng.core';

export interface CreateUpdateFormField {
  title?: string;
  code?: string;
  type?: TypeField;
  config?: string;
  options?: string;
  displayOrder: number;
  formId?: string;
}

export interface FormFieldDto extends FullAuditedEntityDto<string> {
  title?: string;
  code?: string;
  type?: TypeField;
  config?: string;
  options?: string;
  displayOrder: number;
  formId?: string;
}

// Cấu trúc JSON của trường `config` (thay cho định dạng cũ "required:true")
export interface FieldConfig {
  required?: boolean;
  minLength?: number | null;
  maxLength?: number | null;
  min?: number | null;
  max?: number | null;
  pattern?: string | null;
  // riêng cho field kiểu Upload file/ảnh (TypeField.File)
  allowedExtensions?: string[] | null;
  maxFileSizeMb?: number | null;
  maxFileCount?: number | null;
  // riêng cho field kiểu Đánh giá/Rating (TypeField.Rating)
  maxRating?: number | null;
  // chỉ hiện/bắt buộc field này khi field có code = dependsOnCode thỏa operator so với value
  conditional?: ConditionalRule | null;
}

export type ConditionalOperator = 'equals' | 'notEquals' | 'contains' | 'isEmpty' | 'isNotEmpty';

export interface ConditionalRule {
  dependsOnCode?: string;
  operator?: ConditionalOperator;
  value?: string;
}
