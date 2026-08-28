import { ConditionalOperator, FieldConfig } from '@proxy/form-models/form-fields';

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

// sinh mã (code) gợi ý từ tên field: lấy chữ cái đầu mỗi từ, bỏ dấu - dùng chung cho field cấp 1
// (create_attribute) và field con trong Group (cùng 1 quy tắc đặt mã)
export function generateFieldCode(title: string): string {
  const cleanedValue = title
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^\w\s]|_/g, '')
    .replace(/\s+/g, ' ');

  return cleanedValue
    .trim()
    .split(/\s+/)
    .map(word => word[0]?.toUpperCase() || '')
    .join('');
}

// So khớp giá trị hiện tại của field phụ thuộc (actual) với điều kiện cấu hình (operator/expected).
// PHẢI khớp chính xác logic với EvaluateCondition() phía backend (FormRecordService.cs) - đây chỉ là
// bản để ẩn/hiện UI ngay lập tức, quyết định cuối cùng (có chặn submit hay không) vẫn do backend validate.
export function evaluateConditionRule(actual: string | undefined, op: ConditionalOperator | undefined, expected: string | undefined): boolean {
  switch (op) {
    case 'isEmpty':
      return !actual || !actual.trim();
    case 'isNotEmpty':
      return !!actual && !!actual.trim();
    case 'notEquals':
      return (actual?.trim() ?? '').toLowerCase() !== (expected?.trim() ?? '').toLowerCase();
    case 'contains':
      return !!actual && actual.split(';').map(v => v.trim().toLowerCase()).includes((expected?.trim() ?? '').toLowerCase());
    case 'equals':
    default:
      return (actual?.trim() ?? '').toLowerCase() === (expected?.trim() ?? '').toLowerCase();
  }
}

// bản JS thuần (chuỗi) của evaluateConditionRule ở trên, dùng để chèn vào popup xem trước (document.write) -
// popup là 1 window/document riêng ngoài Angular nên không import được hàm TS trực tiếp.
// LƯU Ý: sửa evaluateConditionRule() ở trên thì phải sửa cả đoạn JS này cho khớp.
export const EVALUATE_CONDITION_RULE_JS = `
  function evaluateConditionRule(actual, op, expected) {
    actual = (actual || '').trim();
    expected = (expected || '').trim();
    switch (op) {
      case 'isEmpty': return !actual;
      case 'isNotEmpty': return !!actual;
      case 'notEquals': return actual.toLowerCase() !== expected.toLowerCase();
      case 'contains': return !!actual && actual.split(';').map(v => v.trim().toLowerCase()).indexOf(expected.toLowerCase()) !== -1;
      default: return actual.toLowerCase() === expected.toLowerCase();
    }
  }
`;
