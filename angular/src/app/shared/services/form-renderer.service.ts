import { Injectable } from '@angular/core';
import { FormFieldDto } from '@proxy/form-models/form-fields';
import { parseFieldConfig } from './field-config.util';

@Injectable({
  providedIn: 'root',
})
export class FormRendererService {
  // Chuyển content HTML (chứa các span.drag-field) thành DOM render input/select/... thật,
  // dùng chung cho preview (create_form) và trang nộp form/xem kết quả (form-submit, form-records).
  renderFieldsToElements(contentHtml: string, fields: FormFieldDto[]): HTMLElement {
    const container = document.createElement('div');
    container.innerHTML = contentHtml || '';

    container.querySelectorAll('span.drag-field').forEach(span => {
      const fieldType = parseInt(
        Array.from(span.classList)
          .find(c => c.startsWith('field-type-'))
          ?.replace('field-type-', '') || '1'
      );

      const code = span.id || '';
      const placeholder = span.textContent?.trim() || '..........';
      const field = fields.find(f => f.code === code);
      const options = this.parseOptions(field?.options);
      const fieldConfig = parseFieldConfig(field?.config);

      let replacementEl: HTMLElement;

      switch (fieldType) {
        case 2: {
          replacementEl = document.createElement('textarea');
          break;
        }
        case 3: {
          const select = document.createElement('select');
          select.appendChild(new Option('-- Chọn giá trị --', ''));
          options.forEach(opt => select.appendChild(new Option(opt, opt)));
          replacementEl = select;
          break;
        }
        case 4: {
          replacementEl = this.buildOptionGroup(code, options.length ? options : ['Có'], 'checkbox');
          break;
        }
        case 5: {
          replacementEl = this.buildOptionGroup(code, options.length ? options : ['Có', 'Không'], 'radio');
          break;
        }
        case 6: {
          replacementEl = document.createElement('input');
          (replacementEl as HTMLInputElement).type = 'datetime-local';
          break;
        }
        case 7: {
          replacementEl = document.createElement('input');
          (replacementEl as HTMLInputElement).type = 'number';
          break;
        }
        case 8: {
          const select = document.createElement('select');
          select.appendChild(new Option('-- Chọn --', ''));
          ['Có', 'Không'].forEach(text => select.appendChild(new Option(text, text)));
          replacementEl = select;
          break;
        }
        default: {
          replacementEl = document.createElement('input');
          (replacementEl as HTMLInputElement).type = 'text';
          break;
        }
      }

      if (fieldType !== 4 && fieldType !== 5) {
        replacementEl.setAttribute('name', code);
        (replacementEl as HTMLInputElement | HTMLTextAreaElement).placeholder = placeholder;
      }

      this.applyConfigConstraints(replacementEl, fieldType, fieldConfig);

      replacementEl.style.border = replacementEl.style.border || 'none';
      replacementEl.style.borderBottom = replacementEl.style.borderBottom || '1px solid #ccc';
      replacementEl.style.outline = 'none';
      replacementEl.style.minWidth = '100px';
      replacementEl.classList.add('form-renderer-field');

      span.replaceWith(replacementEl);
    });

    return container;
  }

  // Kích hoạt HTML5 constraint validation (required/minlength/pattern/...) trên từng input trong container,
  // trả về false nếu có input không hợp lệ (trình duyệt sẽ tự hiện tooltip lỗi tương ứng).
  checkClientValidity(container: HTMLElement): boolean {
    let isValid = true;
    container
      .querySelectorAll<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>('input, textarea, select')
      .forEach(el => {
        if (!el.reportValidity()) {
          isValid = false;
        }
      });
    return isValid;
  }

  // Đọc giá trị đã nhập trong container (theo tên input = code của field), trả object { code: value }
  collectFormData(container: HTMLElement): Record<string, string> {
    const data: Record<string, string> = {};

    container.querySelectorAll<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>('[name]').forEach(el => {
      const name = el.getAttribute('name');
      if (!name) return;

      if (el instanceof HTMLInputElement && el.type === 'checkbox') {
        if (el.checked) {
          data[name] = data[name] ? `${data[name]};${el.value}` : el.value;
        }
      } else if (el instanceof HTMLInputElement && el.type === 'radio') {
        if (el.checked) {
          data[name] = el.value;
        }
      } else {
        data[name] = el.value;
      }
    });

    return data;
  }

  // Điền lại giá trị đã nộp (readonly) vào DOM đã render, dùng cho trang xem kết quả
  fillFormData(container: HTMLElement, data: Record<string, string>, readonly: boolean = false): void {
    container.querySelectorAll<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>('[name]').forEach(el => {
      const name = el.getAttribute('name');
      if (!name || !(name in data)) return;
      const value = data[name];

      if (el instanceof HTMLInputElement && el.type === 'checkbox') {
        el.checked = value?.split(';').includes(el.value) ?? false;
      } else if (el instanceof HTMLInputElement && el.type === 'radio') {
        el.checked = el.value === value;
      } else {
        el.value = value ?? '';
      }

      if (readonly) {
        el.setAttribute('disabled', 'disabled');
      }
    });
  }

  // Áp thuộc tính ràng buộc HTML5 (required/minlength/maxlength/pattern/min/max) từ FieldConfig
  // để trình duyệt tự validate trước khi submit, song song với validate ở backend.
  private applyConfigConstraints(el: HTMLElement, fieldType: number, config: ReturnType<typeof parseFieldConfig>): void {
    if (config.required) {
      if (fieldType === 4 || fieldType === 5) {
        el.querySelectorAll('input').forEach(input => input.setAttribute('required', 'required'));
      } else {
        el.setAttribute('required', 'required');
      }
    }

    if (fieldType === 1 || fieldType === 2) {
      if (config.minLength != null) el.setAttribute('minlength', String(config.minLength));
      if (config.maxLength != null) el.setAttribute('maxlength', String(config.maxLength));
    }

    if (fieldType === 1 && config.pattern) {
      el.setAttribute('pattern', config.pattern);
    }

    if (fieldType === 7) {
      if (config.min != null) el.setAttribute('min', String(config.min));
      if (config.max != null) el.setAttribute('max', String(config.max));
    }
  }

  private buildOptionGroup(code: string, options: string[], type: 'checkbox' | 'radio'): HTMLElement {
    const wrapper = document.createElement('div');
    wrapper.className = 'form-renderer-option-group';
    options.forEach(opt => {
      const label = document.createElement('label');
      label.style.marginRight = '12px';
      const input = document.createElement('input');
      input.type = type;
      input.name = code;
      input.value = opt;
      label.appendChild(input);
      label.append(' ' + opt);
      wrapper.appendChild(label);
    });
    return wrapper;
  }

  private parseOptions(options?: string): string[] {
    if (!options) return [];
    try {
      const parsed = JSON.parse(options);
      return Array.isArray(parsed) ? parsed.map(String) : [];
    } catch {
      return [];
    }
  }
}
