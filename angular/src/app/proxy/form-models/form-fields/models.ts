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
  // ĐỊNH DẠNG CŨ - chỉ 1 điều kiện đơn, giữ lại để đọc được field đã lưu từ trước, không dùng khi lưu mới
  // (xem resolveConditionalGroup trong field-config.util.ts - luôn ưu tiên conditionalGroup nếu có)
  conditional?: ConditionalRule | null;
  // chỉ hiện/bắt buộc field này khi các điều kiện dưới đây thỏa theo combinator (and: tất cả đúng,
  // or: ít nhất 1 đúng) - thay thế "conditional" (chỉ 1 điều kiện đơn) ở trên
  conditionalGroup?: ConditionalGroup | null;
  // riêng cho field kiểu Radio/CheckBox: hướng xếp các lựa chọn
  layout?: 'horizontal' | 'vertical' | null;
  // riêng cho field kiểu DateTime: true = chỉ chọn ngày, không bắt chọn giờ
  dateOnly?: boolean | null;
  // riêng cho field kiểu Upload file/ảnh: hiện ảnh xem trước ngay trên form
  showPreview?: boolean | null;
  // áp dụng cho mọi kiểu field: màu chữ tùy chỉnh khi hiển thị (mặc định kế thừa màu văn bản xung quanh)
  textColor?: string | null;
  // riêng cho field kiểu Group (danh sách/nhóm lặp): số dòng lặp tối thiểu/tối đa + định nghĩa field con.
  // required=true tương đương minRows tối thiểu là 1 (xem ValidateGroupField phía backend)
  minRows?: number | null;
  maxRows?: number | null;
  children?: GroupChildField[] | null;
}

// 1 field con bên trong field kiểu Group - cấu trúc tối giản, KHÔNG hỗ trợ Upload file/Chữ ký/Rating/Group
// lồng nhau (giữ đơn giản vì đính kèm file/chữ ký theo từng dòng lặp sẽ rất phức tạp để quản lý mồ côi)
export interface GroupChildField {
  code: string;
  title: string;
  type: TypeField;
  // JSON của 1 FieldConfig con - chỉ dùng required/options-related, không hỗ trợ minLength/pattern/... để đơn giản
  config?: string | null;
  // JSON mảng lựa chọn - áp dụng khi type là Select/CheckBox/Radio
  options?: string | null;
}

export type ConditionalOperator = 'equals' | 'notEquals' | 'contains' | 'isEmpty' | 'isNotEmpty';
export type ConditionalCombinator = 'and' | 'or';

export interface ConditionalRule {
  dependsOnCode?: string;
  operator?: ConditionalOperator;
  value?: string;
}

export interface ConditionalGroup {
  combinator?: ConditionalCombinator;
  rules: ConditionalRule[];
}
