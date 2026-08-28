import { ToasterService } from '@abp/ng.theme.shared';
import { Component, EventEmitter, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { EditorConfig } from 'ckeditor5';
import { NZ_MODAL_DATA, NzModalRef } from 'ng-zorro-antd/modal';
import { FormFieldDto, GroupChildField } from '@proxy/form-models/form-fields';
import { TypeField } from '@proxy/enums';
import { parseFieldConfig, serializeFieldConfig, generateFieldCode } from '../../shared/services/field-config.util';

// bản nháp 1 field con trong lúc đang sửa ở modal - tách khỏi GroupChildField (kiểu dùng để lưu) vì
// options/config ở đây là dạng dễ chỉnh sửa trên UI (text/boolean rời), chỉ gộp lại thành JSON lúc save()
interface GroupChildDraft {
  code: string;
  title: string;
  type: number;
  required: boolean;
  optionsText: string;
}

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
  // kiểu CheckBox/Radio hỗ trợ chọn hướng xếp các lựa chọn
  typesWithLayout = [4, 5];
  // kiểu DateTime hỗ trợ tùy chọn chỉ chọn ngày (không bắt chọn giờ)
  typesWithDateOnly = [6];
  // kiểu Group (danh sách/nhóm lặp)
  typesWithGroup = [12];
  // kiểu field mà giá trị điều kiện nên chọn từ danh sách lựa chọn có sẵn thay vì gõ tay
  typesWithOptionsForConditional = [3, 4, 5];

  // field con bên trong Group chỉ giới hạn các kiểu đơn giản (không File/Signature/Rating/Group lồng nhau)
  groupChildTypes = [
    { title: 'Text', value: 1 },
    { title: 'AreaText', value: 2 },
    { title: 'Select', value: 3 },
    { title: 'CheckBox', value: 4 },
    { title: 'Radio', value: 5 },
    { title: 'DateTime', value: 6 },
    { title: 'Number', value: 7 },
    { title: 'Boolean', value: 8 },
  ];
  groupChildTypesWithOptions = [3, 4, 5];
  groupChildren: GroupChildDraft[] = [];
  editingChildIndex: number | null = null;
  childDraft: GroupChildDraft = this.emptyChildDraft();

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
      layout: [fieldConfig.layout ?? 'horizontal'],
      dateOnly: [fieldConfig.dateOnly ?? false],
      showPreview: [fieldConfig.showPreview ?? false],
      textColor: [fieldConfig.textColor ?? null],
      minRows: [fieldConfig.minRows ?? 1],
      maxRows: [fieldConfig.maxRows ?? null],
      config: [null],
      options: [this.optionsText || null],
      conditionalEnabled: [!!fieldConfig.conditional],
      conditionalDependsOn: [fieldConfig.conditional?.dependsOnCode ?? null],
      conditionalOperator: [fieldConfig.conditional?.operator ?? 'equals'],
      conditionalValue: [fieldConfig.conditional?.value ?? null],
    });

    this.groupChildren = (fieldConfig.children || []).map(child => {
      const childConfig = parseFieldConfig(child.config);
      let optionsText = '';
      try {
        const opts = JSON.parse(child.options || '[]');
        if (Array.isArray(opts)) optionsText = opts.join(', ');
      } catch {
        optionsText = '';
      }
      return {
        code: child.code,
        title: child.title,
        type: child.type as number,
        required: !!childConfig.required,
        optionsText,
      };
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
      layout: this.typesWithLayout.includes(type) ? value.layout || 'horizontal' : null,
      dateOnly: this.typesWithDateOnly.includes(type) ? !!value.dateOnly : null,
      showPreview: this.typesWithFileUpload.includes(type) ? !!value.showPreview : null,
      textColor: value.textColor || null,
      minRows: this.typesWithGroup.includes(type) ? value.minRows ?? 0 : null,
      maxRows: this.typesWithGroup.includes(type) ? value.maxRows || null : null,
      children: this.typesWithGroup.includes(type)
        ? this.groupChildren.map(
            (child): GroupChildField => ({
              code: child.code,
              title: child.title,
              type: child.type as TypeField,
              config: serializeFieldConfig({ required: child.required }),
              options: this.groupChildTypesWithOptions.includes(child.type)
                ? JSON.stringify(
                    (child.optionsText || '')
                      .split(',')
                      .map(o => o.trim())
                      .filter(o => !!o)
                  )
                : null,
            })
          )
        : null,
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

      // loại trừ chính field đang sửa - nếu không, giữ nguyên tên cũ (hoặc gõ rồi sửa lại y hệt) khi
      // đang ở chế độ Sửa sẽ báo trùng với chính nó (lstAttribute vẫn còn field gốc chưa cập nhật)
      const isTitleDuplicate = this.lstAttribute.some(
        attr => attr.code !== this.attribute.code && attr.title?.trim().toLowerCase() === trimmedTitle
      );

      if (isTitleDuplicate) {
        titleControl?.setErrors({ duplicate: true });
      } else {
        titleControl?.setErrors(null);
      }

      const code = generateFieldCode(value);

      codeControl?.setValue(code);
      this.onCodeChange(code);
    } else {
      titleControl?.setErrors(null);
      codeControl?.setValue('');
      codeControl?.setErrors(null);
    }
  }

  // check trùng mã thuộc tính - chạy cả khi mã được tự sinh từ tên (onTitleChange) lẫn khi người dùng
  // tự tay sửa ô Mã, để đảm bảo mã luôn duy nhất trong form trước khi cho lưu (mỗi field chỉ 1 mã)
  onCodeChange(value: string) {
    const codeControl = this.form.get('code');
    if (!value) {
      codeControl?.setErrors(null);
      return;
    }

    const isCodeDuplicate = this.lstAttribute.some(attr => attr.code !== this.attribute.code && attr.code === value);
    codeControl?.setErrors(isCodeDuplicate ? { duplicate: true } : null);
  }

  onBack(): void {
    this.nzModalRef.destroy();
  }

  private emptyChildDraft(): GroupChildDraft {
    return { code: '', title: '', type: 1, required: false, optionsText: '' };
  }

  // thêm mới field con (hoặc lưu lại nếu đang sửa - editingChildIndex != null) vào danh sách groupChildren.
  // Mã được tự sinh lại từ tên mỗi lần lưu (giống cơ chế sinh mã cho field cấp 1), đảm bảo không trùng
  // với mã của field con khác đã có trong cùng nhóm.
  addGroupChild(): void {
    const title = this.childDraft.title?.trim();
    if (!title) {
      this.toasterService.error('Vui lòng nhập tên field con');
      return;
    }

    const baseCode = generateFieldCode(title) || 'FIELD';
    let code = baseCode;
    let suffix = 2;
    while (this.groupChildren.some((c, idx) => c.code === code && idx !== this.editingChildIndex)) {
      code = `${baseCode}${suffix++}`;
    }

    const draft: GroupChildDraft = {
      code,
      title,
      type: this.childDraft.type,
      required: this.childDraft.required,
      optionsText: this.childDraft.optionsText,
    };

    if (this.editingChildIndex != null) {
      const list = [...this.groupChildren];
      list.splice(this.editingChildIndex, 1, draft);
      this.groupChildren = list;
    } else {
      this.groupChildren = [...this.groupChildren, draft];
    }

    this.editingChildIndex = null;
    this.childDraft = this.emptyChildDraft();
  }

  editGroupChild(index: number): void {
    this.editingChildIndex = index;
    const child = this.groupChildren[index];
    this.childDraft = { ...child };
  }

  cancelEditGroupChild(): void {
    this.editingChildIndex = null;
    this.childDraft = this.emptyChildDraft();
  }

  removeGroupChild(index: number): void {
    this.groupChildren = this.groupChildren.filter((_, i) => i !== index);
    if (this.editingChildIndex === index) {
      this.cancelEditGroupChild();
    }
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
    { title: 'Danh sách (nhóm field lặp)', value: 12 },
  ];
}

export interface CategoryParams {
  id: string;
  isCreated: boolean;
  lstAttribute: FormFieldDto[];
  code: string;
}
