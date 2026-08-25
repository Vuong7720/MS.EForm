import { Injectable } from '@angular/core';
import { EFormService } from '@proxy/controllers';
import { FormFieldDto } from '@proxy/form-models/form-fields';
import { parseFieldConfig } from './field-config.util';

interface AttachmentEntry {
  name: string;
  blob: string;
  size: number;
}

interface AttachmentFieldHandle {
  setReadonly: (readonly: boolean) => void;
}

@Injectable({
  providedIn: 'root',
})
export class FormRendererService {
  constructor(private eformService: EFormService) {}

  // Chuyển content HTML (chứa các span.drag-field) thành DOM render input/select/... thật,
  // dùng chung cho preview (create_form) và trang nộp form/xem kết quả (form-submit, form-records).
  // formId cần cho field kiểu Upload file/ảnh để gọi API upload đúng thuộc tính của đúng form.
  renderFieldsToElements(contentHtml: string, fields: FormFieldDto[], formId: string = ''): HTMLElement {
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
        case 9: {
          replacementEl = this.buildFileUploadField(code, formId, fieldConfig);
          break;
        }
        case 10: {
          replacementEl = this.buildSignatureField(code, formId, fieldConfig);
          break;
        }
        default: {
          replacementEl = document.createElement('input');
          (replacementEl as HTMLInputElement).type = 'text';
          break;
        }
      }

      if (fieldType !== 4 && fieldType !== 5 && fieldType !== 9 && fieldType !== 10) {
        replacementEl.setAttribute('name', code);
        (replacementEl as HTMLInputElement | HTMLTextAreaElement).placeholder = placeholder;
      }

      this.applyConfigConstraints(replacementEl, fieldType, fieldConfig);

      replacementEl.style.border = replacementEl.style.border || 'none';
      replacementEl.style.borderBottom = replacementEl.style.borderBottom || '1px solid #ccc';
      replacementEl.style.outline = 'none';
      replacementEl.style.minWidth = '100px';
      // Input/textarea/select don't inherit color/font from the surrounding text by
      // default (unlike the <span> they replace), so without this they always render
      // in the browser's default black/system font regardless of the document's styling.
      replacementEl.style.color = 'inherit';
      replacementEl.style.fontFamily = 'inherit';
      replacementEl.style.fontSize = 'inherit';
      replacementEl.style.background = 'transparent';
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
        const kind = el.getAttribute('data-render-kind');
        if (kind === 'file' || kind === 'signature') {
          // input hidden không hiển thị được tooltip reportValidity() của trình duyệt -> tự báo lỗi inline
          const wrapper = el.closest('.form-renderer-file-field, .form-renderer-signature-field');
          const errorEl = wrapper?.querySelector<HTMLElement>('.form-renderer-attachment-error');
          const entries = this.parseAttachmentEntries(el.value);
          if (el.hasAttribute('required') && entries.length === 0) {
            isValid = false;
            if (errorEl) {
              errorEl.textContent = 'Trường này là bắt buộc';
              errorEl.style.display = 'block';
            }
          }
          return;
        }
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
        // input hidden của field kiểu File cũng rơi vào nhánh này: value của nó đã là
        // chuỗi JSON mảng [{name,blob,size}] do buildFileUploadField duy trì
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

      const kind = el.getAttribute('data-render-kind');
      if (kind === 'file' || kind === 'signature') {
        el.value = value || '[]';
        const wrapper = el.closest('.form-renderer-file-field, .form-renderer-signature-field') as
          | (HTMLElement & { __attachmentField?: AttachmentFieldHandle })
          | null;
        wrapper?.__attachmentField?.setReadonly(readonly);
        return;
      }

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

  // Bật/tắt chỉnh sửa cho toàn bộ input trong container, dùng để chuyển trang xem kết quả
  // từ chế độ readonly sang chế độ sửa và ngược lại mà không cần render lại DOM.
  setEnabled(container: HTMLElement, enabled: boolean): void {
    container.querySelectorAll<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>('[name]').forEach(el => {
      el.disabled = !enabled;
      const kind = el.getAttribute('data-render-kind');
      if (kind === 'file' || kind === 'signature') {
        const wrapper = el.closest('.form-renderer-file-field, .form-renderer-signature-field') as
          | (HTMLElement & { __attachmentField?: AttachmentFieldHandle })
          | null;
        wrapper?.__attachmentField?.setReadonly(!enabled);
      }
    });
  }

  // Áp thuộc tính ràng buộc HTML5 (required/minlength/maxlength/pattern/min/max) từ FieldConfig
  // để trình duyệt tự validate trước khi submit, song song với validate ở backend.
  private applyConfigConstraints(el: HTMLElement, fieldType: number, config: ReturnType<typeof parseFieldConfig>): void {
    if (config.required) {
      if (fieldType === 4 || fieldType === 5) {
        el.querySelectorAll('input').forEach(input => input.setAttribute('required', 'required'));
      } else if (fieldType !== 9 && fieldType !== 10) {
        // field kiểu File/Signature tự set required lên input hidden bên trong hàm dựng riêng của nó
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

  // Field kiểu "Upload file/ảnh": <input type=file> chọn file (không có name, không tham gia
  // collectFormData), danh sách chip file đã tải lên, và 1 input hidden name={code} giữ chuỗi
  // JSON mảng [{name,blob,size}] - đây mới là giá trị thật sự được thu thập/lưu vào FormRecord.Data.
  private buildFileUploadField(code: string, formId: string, config: ReturnType<typeof parseFieldConfig>): HTMLElement {
    const wrapper = document.createElement('div');
    wrapper.classList.add('form-renderer-file-field');

    const maxCount = config.maxFileCount ?? 1;
    const allowedExtensions = config.allowedExtensions?.length
      ? config.allowedExtensions.map(e => e.toLowerCase().replace(/^\./, ''))
      : null;
    const maxSizeBytes = config.maxFileSizeMb ? config.maxFileSizeMb * 1024 * 1024 : null;

    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    if (maxCount > 1) fileInput.multiple = true;
    if (allowedExtensions) fileInput.accept = allowedExtensions.map(e => '.' + e).join(',');

    const listEl = document.createElement('div');
    listEl.className = 'form-renderer-file-list';

    const errorEl = document.createElement('div');
    errorEl.className = 'form-renderer-attachment-error';
    errorEl.style.cssText = 'color:#dc3545; font-size:12px; display:none; margin-top:2px;';

    const hidden = document.createElement('input');
    hidden.type = 'hidden';
    hidden.name = code;
    hidden.setAttribute('data-render-kind', 'file');
    hidden.value = '[]';
    if (config.required) hidden.setAttribute('required', 'required');

    const state = { readonly: false };

    const renderList = () => {
      listEl.innerHTML = '';
      this.parseAttachmentEntries(hidden.value).forEach((entry, index) => {
        const chip = document.createElement('span');
        chip.className = 'form-renderer-file-chip';
        chip.style.cssText =
          'display:inline-flex; align-items:center; gap:4px; border:1px solid #ccc; border-radius:4px; padding:2px 6px; margin:2px 4px 2px 0; font-size:13px;';

        if (state.readonly) {
          // Chỉ cho tải về khi đang xem 1 bản ghi đã nộp (đã đăng nhập, đủ quyền gọi API download);
          // lúc đang chọn file mới (chưa nộp) thì không cần tải lại chính file vừa chọn.
          const link = document.createElement('a');
          link.href = 'javascript:void(0)';
          link.textContent = entry.name;
          link.addEventListener('click', () => this.downloadAttachment(entry.blob, entry.name));
          chip.appendChild(link);
        } else {
          chip.appendChild(document.createTextNode(entry.name));

          const removeBtn = document.createElement('span');
          removeBtn.textContent = ' ✕';
          removeBtn.style.cssText = 'cursor:pointer; color:#dc3545; margin-left:4px;';
          removeBtn.addEventListener('click', () => {
            const entries = this.parseAttachmentEntries(hidden.value);
            entries.splice(index, 1);
            hidden.value = JSON.stringify(entries);
            renderList();
          });
          chip.appendChild(removeBtn);
        }

        listEl.appendChild(chip);
      });
    };

    fileInput.addEventListener('change', () => {
      errorEl.style.display = 'none';
      const files = Array.from(fileInput.files || []);
      fileInput.value = '';

      files.forEach(file => {
        const entries = this.parseAttachmentEntries(hidden.value);
        if (entries.length >= maxCount) {
          errorEl.textContent = `Chỉ được đính kèm tối đa ${maxCount} file`;
          errorEl.style.display = 'block';
          return;
        }

        const ext = (file.name.split('.').pop() || '').toLowerCase();
        if (allowedExtensions && !allowedExtensions.includes(ext)) {
          errorEl.textContent = `Định dạng .${ext} không được phép (chỉ chấp nhận: ${allowedExtensions.join(', ')})`;
          errorEl.style.display = 'block';
          return;
        }

        if (maxSizeBytes && file.size > maxSizeBytes) {
          errorEl.textContent = `File "${file.name}" vượt quá ${config.maxFileSizeMb}MB`;
          errorEl.style.display = 'block';
          return;
        }

        this.eformService.uploadFormAttachment(formId, code, file, { skipHandleError: true }).subscribe({
          next: result => {
            const current = this.parseAttachmentEntries(hidden.value);
            current.push({ name: result.name, blob: result.blob, size: result.size });
            hidden.value = JSON.stringify(current);
            renderList();
          },
          error: () => {
            errorEl.textContent = `Tải lên "${file.name}" thất bại`;
            errorEl.style.display = 'block';
          },
        });
      });
    });

    wrapper.appendChild(fileInput);
    wrapper.appendChild(listEl);
    wrapper.appendChild(errorEl);
    wrapper.appendChild(hidden);

    const handle: AttachmentFieldHandle = {
      setReadonly: readonly => {
        state.readonly = readonly;
        fileInput.style.display = readonly ? 'none' : '';
        renderList();
      },
    };
    (wrapper as HTMLElement & { __attachmentField?: AttachmentFieldHandle }).__attachmentField = handle;

    return wrapper;
  }

  // Field kiểu "Chữ ký điện tử": <canvas> ký tay bằng chuột/cảm ứng (Pointer Events), xuất PNG rồi
  // upload qua cùng endpoint với field File (backend chấp nhận cả 2 loại). Giá trị lưu cùng khuôn
  // dạng JSON mảng [{name,blob,size}] (0 hoặc 1 phần tử) để tái dùng validate/cleanup phía backend.
  private buildSignatureField(code: string, formId: string, config: ReturnType<typeof parseFieldConfig>): HTMLElement {
    const wrapper = document.createElement('div');
    wrapper.classList.add('form-renderer-signature-field');

    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 150;
    canvas.style.cssText =
      'border:1px solid #ccc; border-radius:4px; touch-action:none; cursor:crosshair; background:#fff; display:block; max-width:100%;';

    const img = document.createElement('img');
    img.style.cssText = 'display:none; max-width:400px; max-height:150px; border:1px solid #ccc; border-radius:4px;';

    const clearBtn = document.createElement('button');
    clearBtn.type = 'button';
    clearBtn.textContent = 'Xóa chữ ký';
    clearBtn.style.cssText = 'font-size:12px; padding:2px 8px; margin-top:4px; cursor:pointer;';

    const errorEl = document.createElement('div');
    errorEl.className = 'form-renderer-attachment-error';
    errorEl.style.cssText = 'color:#dc3545; font-size:12px; display:none; margin-top:2px;';

    const hidden = document.createElement('input');
    hidden.type = 'hidden';
    hidden.name = code;
    hidden.setAttribute('data-render-kind', 'signature');
    hidden.value = '[]';
    if (config.required) hidden.setAttribute('required', 'required');

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.strokeStyle = '#000';
    }

    const state = { readonly: false };
    let drawing = false;
    let hasStroke = false;
    let uploadTimer: ReturnType<typeof setTimeout> | null = null;

    const getPos = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };

    const uploadSignature = () => {
      if (!ctx) return;
      canvas.toBlob(blob => {
        if (!blob) return;
        const file = new File([blob], 'signature.png', { type: 'image/png' });
        this.eformService.uploadFormAttachment(formId, code, file, { skipHandleError: true }).subscribe({
          next: result => {
            hidden.value = JSON.stringify([{ name: result.name, blob: result.blob, size: result.size }]);
            errorEl.style.display = 'none';
          },
          error: () => {
            errorEl.textContent = 'Lưu chữ ký thất bại, vui lòng ký lại';
            errorEl.style.display = 'block';
          },
        });
      }, 'image/png');
    };

    const scheduleUpload = () => {
      if (uploadTimer) clearTimeout(uploadTimer);
      uploadTimer = setTimeout(uploadSignature, 600);
    };

    canvas.addEventListener('pointerdown', e => {
      if (!ctx) return;
      drawing = true;
      hasStroke = true;
      const { x, y } = getPos(e);
      ctx.beginPath();
      ctx.moveTo(x, y);
      try {
        canvas.setPointerCapture(e.pointerId);
      } catch {
        // một số trình duyệt/pointerId không hỗ trợ capture (vd. sự kiện dựng tay để test) - bỏ qua, không ảnh hưởng việc vẽ
      }
    });
    canvas.addEventListener('pointermove', e => {
      if (!drawing || !ctx) return;
      const { x, y } = getPos(e);
      ctx.lineTo(x, y);
      ctx.stroke();
    });
    const endStroke = () => {
      if (!drawing) return;
      drawing = false;
      scheduleUpload();
    };
    canvas.addEventListener('pointerup', endStroke);
    canvas.addEventListener('pointerleave', endStroke);

    clearBtn.addEventListener('click', () => {
      if (uploadTimer) clearTimeout(uploadTimer);
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
      hasStroke = false;
      hidden.value = '[]';
      errorEl.style.display = 'none';
    });

    const render = () => {
      if (state.readonly) {
        canvas.style.display = 'none';
        clearBtn.style.display = 'none';
        const entries = this.parseAttachmentEntries(hidden.value);
        if (entries.length) {
          this.eformService.downloadFormAttachment(entries[0].blob, entries[0].name, { skipHandleError: true }).subscribe(blob => {
            img.src = URL.createObjectURL(blob);
            img.style.display = 'block';
          });
        } else {
          img.style.display = 'none';
        }
        return;
      }

      img.style.display = 'none';
      canvas.style.display = 'block';
      clearBtn.style.display = '';

      // Đang sửa bản ghi đã có chữ ký từ trước (chưa vẽ gì mới trong lần render này) -> vẽ ảnh cũ
      // lên canvas làm nền để người dùng thấy chữ ký hiện tại, có thể ký đè hoặc xoá để ký lại.
      const entries = this.parseAttachmentEntries(hidden.value);
      if (entries.length && !hasStroke && ctx) {
        this.eformService.downloadFormAttachment(entries[0].blob, entries[0].name, { skipHandleError: true }).subscribe(blob => {
          const url = URL.createObjectURL(blob);
          const preload = new Image();
          preload.onload = () => {
            ctx.drawImage(preload, 0, 0, canvas.width, canvas.height);
            URL.revokeObjectURL(url);
          };
          preload.src = url;
        });
      }
    };

    wrapper.appendChild(canvas);
    wrapper.appendChild(img);
    wrapper.appendChild(document.createElement('br'));
    wrapper.appendChild(clearBtn);
    wrapper.appendChild(errorEl);
    wrapper.appendChild(hidden);

    const handle: AttachmentFieldHandle = {
      setReadonly: readonly => {
        state.readonly = readonly;
        render();
      },
    };
    (wrapper as HTMLElement & { __attachmentField?: AttachmentFieldHandle }).__attachmentField = handle;

    return wrapper;
  }

  private downloadAttachment(blobName: string, fileName: string): void {
    this.eformService.downloadFormAttachment(blobName, fileName, { skipHandleError: true }).subscribe(blob => {
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      link.click();
      window.URL.revokeObjectURL(url);
    });
  }

  private parseAttachmentEntries(value?: string): AttachmentEntry[] {
    if (!value) return [];
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
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
