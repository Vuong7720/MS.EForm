import { ConditionalCombinator, ConditionalGroup, ConditionalOperator, ConditionalRule, FieldConfig } from '@proxy/form-models/form-fields';

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

// chuẩn hóa cấu hình điều kiện của 1 field về 1 dạng duy nhất {combinator, rules[]} để mọi nơi đánh giá
// (renderer, backend) chỉ cần xử lý 1 hình dạng - value tại field trên form là để tương thích với field
// đã lưu từ TRƯỚC KHI có nhiều điều kiện (chỉ 1 "conditional" đơn); field lưu MỚI dùng conditionalGroup.
// PHẢI khớp chính xác logic với ResolveConditionalGroup() phía backend (FormRecordService.cs).
export function resolveConditionalGroup(config: FieldConfig): ConditionalGroup | null {
  if (config.conditionalGroup?.rules?.length) {
    return config.conditionalGroup;
  }
  if (config.conditional?.dependsOnCode) {
    return { combinator: 'and', rules: [config.conditional] };
  }
  return null;
}

// Đánh giá 1 nhóm điều kiện theo combinator: 'and' = mọi rule phải đúng, 'or' = chỉ cần 1 rule đúng.
// data: giá trị hiện tại của các field khác trên form (key = code field phụ thuộc).
export function evaluateConditionalGroup(data: Record<string, string | undefined>, group: ConditionalGroup | null | undefined): boolean {
  if (!group || !group.rules?.length) return true;

  const results = group.rules
    .filter(r => r.dependsOnCode)
    .map(r => evaluateConditionRule(data[r.dependsOnCode!], r.operator, r.value));

  if (results.length === 0) return true;
  return group.combinator === 'or' ? results.some(Boolean) : results.every(Boolean);
}

// bản JS thuần (chuỗi) của evaluateConditionRule/evaluateConditionalGroup ở trên, dùng để chèn vào popup
// xem trước (document.write) - popup là 1 window/document riêng ngoài Angular nên không import được hàm
// TS trực tiếp. LƯU Ý: sửa 2 hàm TS ở trên thì phải sửa cả đoạn JS này cho khớp.
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
  function evaluateConditionalGroup(data, group) {
    if (!group || !group.rules || !group.rules.length) return true;
    var results = group.rules
      .filter(function (r) { return r.dependsOnCode; })
      .map(function (r) { return evaluateConditionRule(data[r.dependsOnCode], r.operator, r.value); });
    if (!results.length) return true;
    return group.combinator === 'or' ? results.some(function (v) { return v; }) : results.every(function (v) { return v; });
  }
`;
