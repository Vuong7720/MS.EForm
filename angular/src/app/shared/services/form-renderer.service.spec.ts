import { FormRendererService } from './form-renderer.service';
import { FormFieldDto } from '@proxy/form-models/form-fields';

describe('FormRendererService', () => {
  let service: FormRendererService;

  beforeEach(() => {
    service = new FormRendererService();
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
});
