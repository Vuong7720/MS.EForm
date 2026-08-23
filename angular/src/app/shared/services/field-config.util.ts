import { FieldConfig } from '@proxy/form-models/form-fields';

// Đọc config: hỗ trợ JSON {"required":true,"minLength":0,...} (chuẩn mới) và
// chuỗi "required:true" (định dạng cũ, để tương thích dữ liệu đã tồn tại)
export function parseFieldConfig(config?: string): FieldConfig {
  if (!config) return {};

  try {
    const parsed = JSON.parse(config);
    if (parsed && typeof parsed === 'object') {
      return parsed as FieldConfig;
    }
  } catch {
    // không phải JSON -> thử định dạng cũ bên dưới
  }

  const result: FieldConfig = {};
  config.split(',').forEach(part => {
    const [key, rawValue] = part.split(':').map(p => p?.trim());
    if (key?.toLowerCase() === 'required') {
      result.required = rawValue?.toLowerCase() === 'true';
    }
  });
  return result;
}

export function serializeFieldConfig(config: FieldConfig): string {
  return JSON.stringify(config);
}
