import { ToasterService } from '@abp/ng.theme.shared';
import { Component, EventEmitter, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { EditorConfig } from 'ckeditor5';
import { NZ_MODAL_DATA, NzModalRef } from 'ng-zorro-antd/modal';
import { FormFieldDto } from '@proxy/form-models/form-fields';
import { parseFieldConfig, serializeFieldConfig } from '../../shared/services/field-config.util';

@Component({
  standalone: false,
  selector: 'app-create_attribute',
  templateUrl: './create_attribute.component.html',
  styleUrls: ['./create_attribute.component.scss']
})
export class CreateAttributeComponent implements OnInit {
  form: FormGroup;
  onLoadData: EventEmitter<any> = new EventEmitter();
  public config: EditorConfig | null = null;
  getParams: CategoryParams = inject(NZ_MODAL_DATA);
  formId: string;
  lstAttribute: FormFieldDto[] = [];
  code: string;
  attribute: FormFieldDto = {} as FormFieldDto;
  optionsText = '';

  // các kiểu field cần khai báo danh sách lựa chọn (Select/CheckBox/Radio)
  typesWithOptions = [3, 4, 5];
  // các kiểu field hỗ trợ giới hạn độ dài + định dạng (Text/AreaText)
  typesWithLength = [1, 2];
  typesWithPattern = [1];
  // kiểu Number hỗ trợ giới hạn giá trị min/max
  typesWithMinMax = [7];
  // kiểu Upload file/ảnh hỗ trợ giới hạn định dạng/dung lượng/số lượng file
  typesWithFileUpload = [9];
  // kiểu Đánh giá/Rating hỗ trợ cấu hình số sao tối đa
  typesWithRating = [11];
  // kiểu field mà giá trị điều kiện nên chọn từ danh sách lựa chọn có sẵn thay vì gõ tay
  typesWithOptionsForConditional = [3, 4, 5];

  operatorOptions = [
    { label: 'Bằng', value: 'equals' },
    { label: 'Khác', value: 'notEquals' },
    { label: 'Chứa (dùng cho CheckBox)', value: 'contains' },
    { label: 'Bỏ trống', value: 'isEmpty' },
    { label: 'Đã nhập', value: 'isNotEmpty' },
  ];

  constructor(
    public activeModal: NgbActiveModal,
    private fb: FormBuilder,
    private nzModalRef: NzModalRef,
    private toasterService: ToasterService
  ) {}

  ngOnInit(): void {
    this.formId = this.getParams.id;
    this.lstAttribute = this.getParams.lstAttribute;
    this.getDetail(this.getParams.code);
    this.buildForm();
  }

  getDetail(code: string) {
    if (!code) return;

    this.attribute = this.lstAttribute.find(a => a.code === code);
    if (!this.attribute) return;

    if (this.attribute.options) {
      try {
        const options = JSON.parse(this.attribute.options);
        if (Array.isArray(options)) {
          this.optionsText = options.join(', ');
        }
      } catch {
        this.optionsText = '';
      }
    }
  }

  buildForm() {
    const fieldConfig = parseFieldConfig(this.attribute.config);

    this.form = this.fb.group({
      title: [this.attribute.title || null, [Validators.required, Validators.maxLength(128)]],
      code: [this.attribute.code || null, [Validators.required, Validators.maxLength(128)]],
      type: [this.attribute.type || 1],
      formId: [this.formId || null],
      displayOrder: [this.attribute.displayOrder ?? this.lstAttribute.length, [Validators.required]],
      required: [fieldConfig.required || false],
      minLength: [fieldConfig.minLength ?? null],
      maxLength: [fieldConfig.maxLength ?? null],
      min: [fieldConfig.min ?? null],
      max: [fieldConfig.max ?? null],
      pattern: [fieldConfig.pattern ?? null],
      allowedExtensions: [(fieldConfig.allowedExtensions || []).join(', ') || null],
      maxFileSizeMb: [fieldConfig.maxFileSizeMb ?? null],
      maxFileCount: [fieldConfig.maxFileCount ?? 1],
      maxRating: [fieldConfig.maxRating ?? 5],
      config: [null],
      options: [this.optionsText || null],
      conditionalEnabled: [!!fieldConfig.conditional],
      conditionalDependsOn: [fieldConfig.conditional?.dependsOnCode ?? null],
      conditionalOperator: [fieldConfig.conditional?.operator ?? 'equals'],
      conditionalValue: [fieldConfig.conditional?.value ?? null],
    });
  }

  // field khác (không tính chính nó) để chọn làm điều kiện phụ thuộc
  get dependsOnFieldChoices(): FormFieldDto[] {
    return this.lstAttribute.filter(a => a.code !== this.attribute.code);
  }

  // field đang được chọn làm điều kiện phụ thuộc - dùng để quyết định ô giá trị là dropdown hay text
  get dependsOnField(): FormFieldDto | undefined {
    const code = this.form?.get('conditionalDependsOn')?.value;
    return this.lstAttribute.find(a => a.code === code);
  }

  // danh sách lựa chọn cho ô giá trị điều kiện, nếu field phụ thuộc là Select/CheckBox/Radio/Boolean;
  // null nghĩa là field phụ thuộc thuộc kiểu tự do (Text/Number/...) -> ô giá trị là text nhập tay
  get dependsOnValueChoices(): string[] | null {
    const field = this.dependsOnField;
    if (!field) return null;
    if (field.type === 8) return ['Có', 'Không']; // Boolean: renderer hardcode 2 lựa chọn này
    if (this.typesWithOptionsForConditional.includes(field.type as number)) {
      try {
        const options = JSON.parse(field.options || '[]');
        return Array.isArray(options) ? options : null;
      } catch {
        return null;
      }
    }
    return null;
  }

  save() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.toasterService.error('Giá trị khai báo không hợp lệ');
      return;
    }

    const value = this.form.value;
    const type = value.type;

    const allowedExtensions = (value.allowedExtensions || '')
      .split(',')
      .map((e: string) => e.trim().replace(/^\./, ''))
      .filter((e: string) => !!e);

    const fieldConfig = {
      required: !!value.required,
      minLength: this.typesWithLength.includes(type) ? value.minLength : null,
      maxLength: this.typesWithLength.includes(type) ? value.maxLength : null,
      min: this.typesWithMinMax.includes(type) ? value.min : null,
      max: this.typesWithMinMax.includes(type) ? value.max : null,
      pattern: this.typesWithPattern.includes(type) ? value.pattern || null : null,
      allowedExtensions: this.typesWithFileUpload.includes(type) && allowedExtensions.length ? allowedExtensions : null,
      maxFileSizeMb: this.typesWithFileUpload.includes(type) ? value.maxFileSizeMb || null : null,
      maxFileCount: this.typesWithFileUpload.includes(type) ? value.maxFileCount || 1 : null,
      maxRating: this.typesWithRating.includes(type) ? value.maxRating || 5 : null,
      conditional:
        value.conditionalEnabled && value.conditionalDependsOn
          ? {
              dependsOnCode: value.conditionalDependsOn,
              operator: value.conditionalOperator || 'equals',
              value: value.conditionalValue || '',
            }
          : null,
    };
    this.form.get('config')?.setValue(serializeFieldConfig(fieldConfig));

    if (this.typesWithOptions.includes(type)) {
      const options = (value.options || '')
        .split(',')
        .map((o: string) => o.trim())
        .filter((o: string) => !!o);
      this.form.get('options')?.setValue(options.length ? JSON.stringify(options) : null);
    } else {
      this.form.get('options')?.setValue(null);
    }

    this.onLoadData.emit(this.form.value);

    this.nzModalRef.close({
      Success: true,
      Title: 'Thêm thuộc tính thành công',
    });
  }

  onTitleChange(value: string) {
    const titleControl = this.form.get('title');
    const codeControl = this.form.get('code');

    if (value) {
      const trimmedTitle = value.trim().toLowerCase();

      const isTitleDuplicate = this.lstAttribute.some(attr => attr.title?.trim().toLowerCase() === trimmedTitle);

      if (isTitleDuplicate) {
        titleControl?.setErrors({ duplicate: true });
      } else {
        titleControl?.setErrors(null);
      }

      const cleanedValue = value
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .replace(/[^\w\s]|_/g, '')
        .replace(/\s+/g, ' ');

      const code = cleanedValue
        .trim()
        .split(/\s+/)
        .map(word => word[0]?.toUpperCase() || '')
        .join('');

      const isCodeDuplicate = this.lstAttribute.some(attr => attr.code === code);

      codeControl?.setValue(code);

      if (isCodeDuplicate) {
        codeControl?.setErrors({ duplicate: true });
      } else {
        codeControl?.setErrors(null);
      }
    } else {
      titleControl?.setErrors(null);
      codeControl?.setValue('');
      codeControl?.setErrors(null);
    }
  }

  onBack(): void {
    this.nzModalRef.destroy();
  }

  lstDataType = [
    { title: 'text', value: 1 },
    { title: 'AreaText', value: 2 },
    { title: 'Select', value: 3 },
    { title: 'CheckBox', value: 4 },
    { title: 'Radio', value: 5 },
    { title: 'DateTime', value: 6 },
    { title: 'Number', value: 7 },
    { title: 'Boolean', value: 8 },
    { title: 'Upload file/ảnh', value: 9 },
    { title: 'Chữ ký điện tử', value: 10 },
    { title: 'Đánh giá (Rating)', value: 11 },
  ];
}

export interface CategoryParams {
  id: string;
  isCreated: boolean;
  lstAttribute: FormFieldDto[];
  code: string;
}
