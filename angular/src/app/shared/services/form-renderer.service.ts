import { Injectable } from '@angular/core';
import { EFormService } from '@proxy/controllers';
import { TypeField } from '@proxy/enums';
import { EVALUATE_CONDITION_RULE_JS, evaluateConditionRule, parseFieldConfig } from './field-config.util';

interface AttachmentEntry {
  name: string;
  blob: string;
  size: number;
}

// Thông tin field tối thiểu để render/validate 1 form - cả FormFieldDto (field hiện tại của form)
// lẫn FormRecordSnapshotFieldDto (field đóng băng trong 1 bản ghi cũ) đều khớp cấu trúc này,
// nên renderFieldsToElements/openPreviewPopup dùng được cho cả 2 nguồn mà không cần ép kiểu.
export interface RenderableField {
  code?: string;
  title?: string;
  type?: TypeField;
  config?: string;
  options?: string;
  displayOrder: number;
}

interface AttachmentFieldHandle {
  setReadonly: (readonly: boolean) => void;
}

@Injectable({
  providedIn: 'root',
})
export class FormRendererService {
  constructor(private eformService: EFormService) {}

  // mở popup xem trước biểu mẫu (render content + field thật, không cho nhập/lưu gì)
  // dùng chung cho nút preview trong trình soạn thảo (create_form) và nút "Xem trước" trên thẻ mẫu (form-templates)
  openPreviewPopup(contentHtml: string, fields: RenderableField[], formId: string = ''): void {
    const temp = this.renderFieldsToElements(contentHtml, fields, formId);

    const previewWindow = window.open('', 'previewWindow', 'width=800,height=600');
    if (!previewWindow) {
      alert('Trình duyệt đã chặn popup xem trước!');
      return;
    }

    const resizeScript = `
      <script>
        function autoResizeInput(input) {
          let ghostSpan = document.getElementById('ghostSpan');
          if (!ghostSpan) {
            ghostSpan = document.createElement('span');
            ghostSpan.id = 'ghostSpan';
            ghostSpan.style.visibility = 'hidden';
            ghostSpan.style.position = 'absolute';
            ghostSpan.style.whiteSpace = 'pre';
            ghostSpan.style.fontSize = input.style.fontSize || '16px';
            ghostSpan.style.fontFamily = input.style.fontFamily || 'inherit';
            document.body.appendChild(ghostSpan);
          }

          ghostSpan.textContent = input.value || input.placeholder || '';
          input.style.width = (ghostSpan.offsetWidth + 10) + 'px';
        }

        window.addEventListener('DOMContentLoaded', () => {
          const inputs = document.querySelectorAll('input[type="text"]');
          inputs.forEach(input => {
            input.addEventListener('input', () => autoResizeInput(input));
            autoResizeInput(input);
          });
        });
      </script>
    `;

    // popup là 1 window/document riêng ngoài Angular (dựng bằng document.write) nên không gọi được
    // applyConditionalVisibility() (TypeScript) trực tiếp - chèn bản JS thuần tương đương để field có
    // điều kiện vẫn ẩn/hiện đúng trong preview. Chỉ ẩn/hiện hiển thị (không cần gỡ/gắn required vì
    // popup chỉ để xem trước, không có nút submit thật).
    const conditionalScript = `
      <script>
        ${EVALUATE_CONDITION_RULE_JS}
        function collectDataSimple() {
          var data = {};
          document.querySelectorAll('[name]').forEach(function (el) {
            var name = el.getAttribute('name');
            if (!name) return;
            if (el.type === 'checkbox') {
              if (el.checked) data[name] = data[name] ? data[name] + ';' + el.value : el.value;
            } else if (el.type === 'radio') {
              if (el.checked) data[name] = el.value;
            } else {
              data[name] = el.value;
            }
          });
          return data;
        }
        function evaluateConditionals() {
          var data = collectDataSimple();
          document.querySelectorAll('[data-conditional]').forEach(function (el) {
            var rule;
            try { rule = JSON.parse(el.getAttribute('data-conditional')); } catch (e) { return; }
            if (!rule.dependsOnCode) return;
            el.style.display = evaluateConditionRule(data[rule.dependsOnCode], rule.operator, rule.value) ? '' : 'none';
          });
        }
        window.addEventListener('DOMContentLoaded', function () {
          document.body.addEventListener('input', evaluateConditionals);
          document.body.addEventListener('change', evaluateConditionals);
          evaluateConditionals();
        });
      </script>
    `;

    previewWindow.document.write(`
      <html>
        <head>
          <title>Xem trước biểu mẫu</title>
          <style>body { font-family: 'Times New Roman'; padding: 20px; }</style>
        </head>
        <body>
          ${temp.innerHTML}
          ${resizeScript}
          ${conditionalScript}
        </body>
      </html>
    `);
    previewWindow.document.close();
  }

  // Chuyển content HTML (chứa các span.drag-field) thành DOM render input/select/... thật,
  // dùng chung cho preview (create_form) và trang nộp form/xem kết quả (form-submit, form-records).
  // formId cần cho field kiểu Upload file/ảnh để gọi API upload đúng thuộc tính của đúng form.
  renderFieldsToElements(contentHtml: string, fields: RenderableField[], formId: string = ''): HTMLElement {
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
        case 11: {
          replacementEl = this.buildRatingField(code, fieldConfig);
          break;
        }
        default: {
          replacementEl = document.createElement('input');
          (replacementEl as HTMLInputElement).type = 'text';
          break;
        }
      }

      if (fieldType !== 4 && fieldType !== 5 && fieldType !== 9 && fieldType !== 10 && fieldType !== 11) {
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
      // đánh dấu field nào nằm ở đâu trong DOM - cần cho pass 2 bên dưới (conditional) tìm khối cần ẩn/hiện
      replacementEl.setAttribute('data-field-code', code);

      span.replaceWith(replacementEl);
    });

    // pass 2: với field có điều kiện phụ thuộc field khác, gắn data-conditional lên khối cần ẩn/hiện
    // (không phải lên chính input, vì nhãn field thường nằm ngoài input trong HTML tự do - xem findHideTarget)
    fields.forEach(field => {
      const conditional = parseFieldConfig(field.config).conditional;
      if (!conditional?.dependsOnCode) return;

      const fieldEl = container.querySelector<HTMLElement>(`[data-field-code="${field.code}"]`);
      if (!fieldEl) return;

      const hideTarget = this.findHideTarget(fieldEl, container);
      hideTarget.setAttribute('data-conditional', JSON.stringify(conditional));
    });

    return container;
  }

  // leo từ phần tử của 1 field lên tổ tiên gần nhất mà KHÔNG chứa field nào khác - để ẩn/hiện cả nhãn
  // (thường đứng ngoài input trong HTML tự do soạn bởi CKEditor, VD <p><strong>Nhãn:</strong><span/></p>)
  // cùng lúc với input, thay vì chỉ ẩn trơ input. Dừng lại ngay khi 1 khối chứa từ 2 field trở lên, để
  // không lỡ ẩn nhầm field khác đứng chung khối (VD nhiều field trong cùng 1 ô bảng).
  private findHideTarget(fieldEl: HTMLElement, container: HTMLElement): HTMLElement {
    let current = fieldEl;
    let parent = current.parentElement;
    while (parent && parent !== container) {
      if (parent.querySelectorAll('[data-field-code]').length > 1) break;
      current = parent;
      parent = parent.parentElement;
    }
    return current;
  }

  // Gắn listener để tự ẩn/hiện các field có điều kiện (đã đánh dấu data-conditional ở renderFieldsToElements)
  // theo giá trị hiện tại của field chúng phụ thuộc, và tự gỡ/gắn lại required khi ẩn/hiện để trình duyệt
  // không chặn submit oan với field đang bị ẩn. Gọi 1 lần ngay để có trạng thái đúng ngay khi render xong.
  //
  // Thứ tự gọi quan trọng: với bản ghi đã có dữ liệu (xem/sửa kết quả), phải gọi SAU fillFormData để
  // tính đúng theo dữ liệu đã lưu, không phải theo form rỗng.
  applyConditionalVisibility(container: HTMLElement): void {
    const conditionalEls = Array.from(container.querySelectorAll<HTMLElement>('[data-conditional]'));
    if (conditionalEls.length === 0) return;

    const evaluate = () => {
      const data = this.collectFormData(container);
      conditionalEls.forEach(el => {
        const raw = el.getAttribute('data-conditional');
        if (!raw) return;
        let rule: { dependsOnCode?: string; operator?: any; value?: string };
        try {
          rule = JSON.parse(raw);
        } catch {
          return;
        }
        if (!rule.dependsOnCode) return;

        const visible = evaluateConditionRule(data[rule.dependsOnCode], rule.operator, rule.value);
        el.style.display = visible ? '' : 'none';

        // el chính là input/select (không có ancestor riêng để leo lên, VD input đứng trực tiếp trong
        // container) hoặc là khối cha bọc ngoài input (trường hợp thường gặp) - querySelectorAll chỉ
        // tìm MÔ TẢ, không tính chính el, nên phải gộp thêm el nếu bản thân nó cũng là 1 input.
        const inputs = Array.from(el.querySelectorAll<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>('input, textarea, select'));
        if (el.matches('input, textarea, select')) {
          inputs.push(el as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement);
        }
        inputs.forEach(input => {
          if (!visible && input.hasAttribute('required')) {
            input.setAttribute('data-was-required', 'true');
            input.removeAttribute('required');
          } else if (visible && input.hasAttribute('data-was-required')) {
            input.setAttribute('required', 'required');
            input.removeAttribute('data-was-required');
          }
        });
      });
    };

    container.addEventListener('input', evaluate);
    container.addEventListener('change', evaluate);
    evaluate();
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
      if (fieldType === 4 || fieldType === 5 || fieldType === 11) {
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

  // Field kiểu "Đánh giá/Rating": dựng bằng các <input type=radio name={code}> ẩn (mỗi mức sao 1 radio)
  // + <label for=...> hiển thị ★ - tái dùng nguyên vẹn collectFormData/fillFormData/checkClientValidity/
  // setEnabled đã có sẵn cho Radio (đều xử lý qua el.type === 'radio' một cách chung).
  //
  // Trạng thái tô sao (đã chọn/hover) dùng THUẦN CSS (label[for] + input:checked ~ label), không dùng JS
  // để "sơn" lại từng lần - vì fillFormData set el.checked bằng gán thuộc tính trực tiếp (không bắn sự
  // kiện change), nên một cách vẽ lại bằng JS gắn theo sự kiện click/hover sẽ không đồng bộ được khi giá
  // trị được điền lại từ dữ liệu đã nộp (vd ở trang xem kết quả). CSS :checked luôn phản ánh đúng state
  // DOM hiện tại bất kể state đó được set bằng cách nào.
  private buildRatingField(code: string, config: ReturnType<typeof parseFieldConfig>): HTMLElement {
    const wrapper = document.createElement('div');
    wrapper.className = 'form-renderer-rating-field';
    // dựng theo thứ tự số sao giảm dần rồi lật ngược bằng row-reverse, để input:checked ~ label
    // (chọn các sibling ĐỨNG SAU trong DOM) tương ứng đúng các sao đứng TRƯỚC về mặt hiển thị
    wrapper.style.cssText = 'display:inline-flex; flex-direction:row-reverse; justify-content:flex-end;';

    const style = document.createElement('style');
    style.textContent = `
      .form-renderer-rating-field label { color:#ccc; cursor:pointer; font-size:24px; line-height:1; user-select:none; }
      .form-renderer-rating-field input:checked ~ label,
      .form-renderer-rating-field label:hover,
      .form-renderer-rating-field label:hover ~ label {
        color:#f5a623;
      }
    `;
    wrapper.appendChild(style);

    const max = config.maxRating && config.maxRating > 0 ? config.maxRating : 5;
    for (let i = max; i >= 1; i--) {
      const id = `rating-${code}-${i}-${Math.random().toString(36).slice(2, 8)}`;

      const input = document.createElement('input');
      input.type = 'radio';
      input.name = code;
      input.value = String(i);
      input.id = id;
      input.style.cssText = 'position:absolute; opacity:0; width:0; height:0;';

      const label = document.createElement('label');
      label.setAttribute('for', id);
      label.textContent = '★';

      wrapper.appendChild(input);
      wrapper.appendChild(label);
    }

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
