import { of } from 'rxjs';
import { FormRendererService } from './form-renderer.service';
import { FormFieldDto } from '@proxy/form-models/form-fields';

describe('FormRendererService', () => {
  let service: FormRendererService;
  let eformServiceSpy: any;

  beforeEach(() => {
    eformServiceSpy = {
      uploadFormAttachment: jasmine
        .createSpy('uploadFormAttachment')
        .and.returnValue(of({ blob: 'blob-1.pdf', name: 'cv.pdf', size: 1234 })),
      downloadFormAttachment: jasmine.createSpy('downloadFormAttachment').and.returnValue(of(new Blob())),
    };
    service = new FormRendererService(eformServiceSpy);
  });

  function field(partial: Partial<FormFieldDto>): FormFieldDto {
    return { code: '', title: '', ...partial } as FormFieldDto;
  }

  it('should render a text field as an input[type=text]', () => {
    const html = `<span id="HOTEN" class="drag-field field-type-1">..........<i>Họ tên</i>..........</span>`;
    const container = service.renderFieldsToElements(html, [field({ code: 'HOTEN', type: 1 as any })]);

    const input = container.querySelector('input[name="HOTEN"]') as HTMLInputElement;
    expect(input).toBeTruthy();
    expect(input.type).toBe('text');
  });

  it('should render a select field with real options from field.options', () => {
    const html = `<span id="GIOITINH" class="drag-field field-type-3">..........<i>Giới tính</i>..........</span>`;
    const container = service.renderFieldsToElements(html, [
      field({ code: 'GIOITINH', type: 3 as any, options: '["Nam","Nữ","Khác"]' }),
    ]);

    const select = container.querySelector('select[name="GIOITINH"]') as HTMLSelectElement;
    expect(select).toBeTruthy();
    // +1 cho option mặc định "-- Chọn giá trị --"
    expect(select.options.length).toBe(4);
    expect(Array.from(select.options).map(o => o.value)).toContain('Nam');
  });

  it('should render a radio group with one input per option, sharing the same name', () => {
    const html = `<span id="THICH" class="drag-field field-type-5">..........<i>Sở thích</i>..........</span>`;
    const container = service.renderFieldsToElements(html, [
      field({ code: 'THICH', type: 5 as any, options: '["A","B","C"]' }),
    ]);

    const radios = container.querySelectorAll('input[type="radio"][name="THICH"]');
    expect(radios.length).toBe(3);
  });

  it('should render as many form controls as there are drag-field spans', () => {
    const html = `
      <p><span id="A" class="drag-field field-type-1">a</span></p>
      <p><span id="B" class="drag-field field-type-2">b</span></p>
      <p><span id="C" class="drag-field field-type-7">c</span></p>
    `;
    const container = service.renderFieldsToElements(html, [
      field({ code: 'A', type: 1 as any }),
      field({ code: 'B', type: 2 as any }),
      field({ code: 'C', type: 7 as any }),
    ]);

    expect(container.querySelectorAll('.form-renderer-field').length).toBe(3);
    expect(container.querySelector('input[name="A"]')).toBeTruthy();
    expect(container.querySelector('textarea[name="B"]')).toBeTruthy();
    expect((container.querySelector('input[name="C"]') as HTMLInputElement).type).toBe('number');
  });

  it('should apply required/minlength/maxlength/pattern from field.config as real HTML attributes', () => {
    const html = `<span id="EMAIL" class="drag-field field-type-1">email</span>`;
    const container = service.renderFieldsToElements(html, [
      field({
        code: 'EMAIL',
        type: 1 as any,
        config: JSON.stringify({ required: true, minLength: 5, maxLength: 50, pattern: '^[^@]+@[^@]+$' }),
      }),
    ]);

    const input = container.querySelector('input[name="EMAIL"]') as HTMLInputElement;
    expect(input.required).toBeTrue();
    expect(input.getAttribute('minlength')).toBe('5');
    expect(input.getAttribute('maxlength')).toBe('50');
    expect(input.getAttribute('pattern')).toBe('^[^@]+@[^@]+$');
  });

  it('should apply min/max from field.config on number inputs', () => {
    const html = `<span id="TUOI" class="drag-field field-type-7">tuoi</span>`;
    const container = service.renderFieldsToElements(html, [
      field({ code: 'TUOI', type: 7 as any, config: JSON.stringify({ min: 18, max: 60 }) }),
    ]);

    const input = container.querySelector('input[name="TUOI"]') as HTMLInputElement;
    expect(input.getAttribute('min')).toBe('18');
    expect(input.getAttribute('max')).toBe('60');
  });

  it('should collect entered values keyed by field code', () => {
    const html = `
      <span id="HOTEN" class="drag-field field-type-1">ho ten</span>
      <span id="GHICHU" class="drag-field field-type-2">ghi chu</span>
    `;
    const container = service.renderFieldsToElements(html, [
      field({ code: 'HOTEN', type: 1 as any }),
      field({ code: 'GHICHU', type: 2 as any }),
    ]);

    (container.querySelector('input[name="HOTEN"]') as HTMLInputElement).value = 'Nguyễn Văn A';
    (container.querySelector('textarea[name="GHICHU"]') as HTMLTextAreaElement).value = 'test';

    const data = service.collectFormData(container);
    expect(data['HOTEN']).toBe('Nguyễn Văn A');
    expect(data['GHICHU']).toBe('test');
  });

  it('should collect multiple checked checkbox values joined by semicolon', () => {
    const html = `<span id="MONAN" class="drag-field field-type-4">mon an</span>`;
    const container = service.renderFieldsToElements(html, [
      field({ code: 'MONAN', type: 4 as any, options: '["Phở","Bún","Cơm"]' }),
    ]);

    const checkboxes = container.querySelectorAll<HTMLInputElement>('input[name="MONAN"]');
    checkboxes[0].checked = true;
    checkboxes[2].checked = true;

    const data = service.collectFormData(container);
    expect(data['MONAN']).toBe('Phở;Cơm');
  });

  it('should fill and disable fields in readonly mode', () => {
    const html = `<span id="HOTEN" class="drag-field field-type-1">ho ten</span>`;
    const container = service.renderFieldsToElements(html, [field({ code: 'HOTEN', type: 1 as any })]);

    service.fillFormData(container, { HOTEN: 'Trần Thị B' }, true);

    const input = container.querySelector('input[name="HOTEN"]') as HTMLInputElement;
    expect(input.value).toBe('Trần Thị B');
    expect(input.disabled).toBeTrue();
  });

  describe('field-type-9 (Upload file/ảnh)', () => {
    const html = `<span id="MINHCHUNG" class="drag-field field-type-9">..........<i>Minh chứng</i>..........</span>`;

    function selectFile(fileInput: HTMLInputElement, file: File): void {
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      Object.defineProperty(fileInput, 'files', { value: dataTransfer.files, configurable: true });
      fileInput.dispatchEvent(new Event('change'));
    }

    it('should render a file input plus a hidden input holding the attachment JSON', () => {
      const container = service.renderFieldsToElements(html, [field({ code: 'MINHCHUNG', type: 9 as any })], 'form-1');

      const fileInput = container.querySelector('.form-renderer-file-field input[type="file"]') as HTMLInputElement;
      const hidden = container.querySelector('input[name="MINHCHUNG"][data-render-kind="file"]') as HTMLInputElement;

      expect(fileInput).toBeTruthy();
      expect(hidden).toBeTruthy();
      expect(hidden.value).toBe('[]');
    });

    it('should upload a selected file and collect the result as JSON keyed by field code', () => {
      const container = service.renderFieldsToElements(html, [field({ code: 'MINHCHUNG', type: 9 as any })], 'form-1');
      const fileInput = container.querySelector('.form-renderer-file-field input[type="file"]') as HTMLInputElement;

      selectFile(fileInput, new File(['hello'], 'cv.pdf', { type: 'application/pdf' }));

      expect(eformServiceSpy.uploadFormAttachment).toHaveBeenCalledWith(
        'form-1',
        'MINHCHUNG',
        jasmine.any(File),
        jasmine.any(Object)
      );

      const entries = JSON.parse(service.collectFormData(container)['MINHCHUNG']);
      expect(entries.length).toBe(1);
      expect(entries[0]).toEqual({ name: 'cv.pdf', blob: 'blob-1.pdf', size: 1234 });
    });

    it('should render previously submitted files as download links in readonly mode', () => {
      const container = service.renderFieldsToElements(html, [field({ code: 'MINHCHUNG', type: 9 as any })], 'form-1');

      service.fillFormData(
        container,
        { MINHCHUNG: JSON.stringify([{ name: 'cv.pdf', blob: 'blob-1.pdf', size: 100 }]) },
        true
      );

      const fileInput = container.querySelector('.form-renderer-file-field input[type="file"]') as HTMLInputElement;
      expect(fileInput.style.display).toBe('none');

      const link = container.querySelector('.form-renderer-file-list a') as HTMLAnchorElement;
      expect(link.textContent).toBe('cv.pdf');

      link.click();
      expect(eformServiceSpy.downloadFormAttachment).toHaveBeenCalledWith('blob-1.pdf', 'cv.pdf', jasmine.any(Object));
    });

    it('should fail checkClientValidity when required and no file was attached', () => {
      const container = service.renderFieldsToElements(
        html,
        [field({ code: 'MINHCHUNG', type: 9 as any, config: JSON.stringify({ required: true }) })],
        'form-1'
      );

      expect(service.checkClientValidity(container)).toBeFalse();
      const errorEl = container.querySelector('.form-renderer-attachment-error') as HTMLElement;
      expect(errorEl.style.display).toBe('block');
    });
  });

  describe('field-type-10 (Chữ ký điện tử)', () => {
    const html = `<span id="CHUKY" class="drag-field field-type-10">..........<i>Chữ ký</i>..........</span>`;
    let container: HTMLElement | null = null;

    afterEach(() => {
      if (container?.isConnected) document.body.removeChild(container);
      container = null;
    });

    function draw(canvas: HTMLCanvasElement): void {
      const rect = canvas.getBoundingClientRect();
      canvas.dispatchEvent(new PointerEvent('pointerdown', { clientX: rect.left + 5, clientY: rect.top + 5, pointerId: 1 }));
      canvas.dispatchEvent(new PointerEvent('pointermove', { clientX: rect.left + 40, clientY: rect.top + 30, pointerId: 1 }));
      canvas.dispatchEvent(new PointerEvent('pointerup', { clientX: rect.left + 40, clientY: rect.top + 30, pointerId: 1 }));
    }

    it('should render a canvas plus a hidden input holding the attachment JSON', () => {
      container = service.renderFieldsToElements(html, [field({ code: 'CHUKY', type: 10 as any })], 'form-1');

      const canvas = container.querySelector('.form-renderer-signature-field canvas');
      const hidden = container.querySelector('input[name="CHUKY"][data-render-kind="signature"]') as HTMLInputElement;

      expect(canvas).toBeTruthy();
      expect(hidden).toBeTruthy();
      expect(hidden.value).toBe('[]');
    });

    it('should upload the drawn signature after the debounce and collect it as JSON', async () => {
      container = service.renderFieldsToElements(html, [field({ code: 'CHUKY', type: 10 as any })], 'form-1');
      document.body.appendChild(container);
      const canvas = container.querySelector('.form-renderer-signature-field canvas') as HTMLCanvasElement;

      jasmine.clock().install();
      draw(canvas);
      jasmine.clock().tick(600);
      jasmine.clock().uninstall();

      // canvas.toBlob() là API bất đồng bộ thật của trình duyệt, không bị jasmine.clock() giả lập -> chờ thật
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(eformServiceSpy.uploadFormAttachment).toHaveBeenCalledWith('form-1', 'CHUKY', jasmine.any(File), jasmine.any(Object));
      const entries = JSON.parse(service.collectFormData(container)['CHUKY']);
      expect(entries.length).toBe(1);
      expect(entries[0]).toEqual({ name: 'cv.pdf', blob: 'blob-1.pdf', size: 1234 });
    });

    it('should clear the signature and reset the hidden input when "Xóa chữ ký" is clicked', async () => {
      container = service.renderFieldsToElements(html, [field({ code: 'CHUKY', type: 10 as any })], 'form-1');
      document.body.appendChild(container);
      const canvas = container.querySelector('.form-renderer-signature-field canvas') as HTMLCanvasElement;

      jasmine.clock().install();
      draw(canvas);
      jasmine.clock().tick(600);
      jasmine.clock().uninstall();
      await new Promise(resolve => setTimeout(resolve, 100));

      const clearBtn = Array.from(container.querySelectorAll('button')).find(b => b.textContent === 'Xóa chữ ký') as HTMLButtonElement;
      clearBtn.click();

      const hidden = container.querySelector('input[name="CHUKY"][data-render-kind="signature"]') as HTMLInputElement;
      expect(hidden.value).toBe('[]');
    });

    it('should render the saved signature as an <img> in readonly mode', () => {
      container = service.renderFieldsToElements(html, [field({ code: 'CHUKY', type: 10 as any })], 'form-1');

      service.fillFormData(container, { CHUKY: JSON.stringify([{ name: 'signature.png', blob: 'sig-blob.png', size: 500 }]) }, true);

      const canvas = container.querySelector('.form-renderer-signature-field canvas') as HTMLCanvasElement;
      const img = container.querySelector('.form-renderer-signature-field img') as HTMLImageElement;
      expect(canvas.style.display).toBe('none');
      expect(img.style.display).toBe('block');
      expect(eformServiceSpy.downloadFormAttachment).toHaveBeenCalledWith('sig-blob.png', 'signature.png', jasmine.any(Object));
    });

    it('should fail checkClientValidity when required and nothing was signed', () => {
      container = service.renderFieldsToElements(
        html,
        [field({ code: 'CHUKY', type: 10 as any, config: JSON.stringify({ required: true }) })],
        'form-1'
      );

      expect(service.checkClientValidity(container)).toBeFalse();
      const errorEl = container.querySelector('.form-renderer-attachment-error') as HTMLElement;
      expect(errorEl.style.display).toBe('block');
    });
  });
});
