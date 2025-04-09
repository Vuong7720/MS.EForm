import { ToasterService } from '@abp/ng.theme.shared';
import { Component, ElementRef, EventEmitter, OnInit, ViewChild, inject } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ClassicEditor, EditorConfig } from 'ckeditor5';
import { NZ_MODAL_DATA, NzModalRef } from 'ng-zorro-antd/modal';
import { Validators } from '@angular/forms';
import { FormFieldDto } from '@proxy/form-models/form-fields';

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
  checked = true;
  code: string
  attribute: FormFieldDto = {} as FormFieldDto;
  required = false;

  constructor( 
    public activeModal: NgbActiveModal,
    private fb: FormBuilder,
    private nzModalRef: NzModalRef,
    private toasterService: ToasterService
  ){

  }
  ngOnInit(): void {
    this.formId = this.getParams.id;
    this.lstAttribute = this.getParams.lstAttribute
    this.getDetail(this.getParams.code)
    this.buildForm();
  }

  getDetail(code: string){
    if(code){
      this.attribute = this.lstAttribute.find(a => a.code === code);
      console.log(this.attribute)
      if(this.attribute.config !== null && this.attribute.config.length > 0){
        var config = this.attribute.config.split(',').reduce((acc, item) => {
          const [key, rawValue] = item.split(':').map(part => part.trim());
        
          let value: any;
          if (rawValue === 'true') value = true;
          else if (rawValue === 'false') value = false;
          else if (!isNaN(Number(rawValue))) value = Number(rawValue);
          else value = rawValue;
        
          acc[key] = value;
          return acc;
        }, {} as Record<string, any>);
        
          this.required = config.required

      }
    }
  }

  buildForm(){
    this.form = this.fb.group({
      title:[this.attribute.title || null, [
        Validators.required,         // Bắt buộc nhập
        Validators.maxLength(128)    // Giới hạn 128 ký tự
      ]],
      code:[this.attribute.code || null, [
        Validators.required,         // Bắt buộc nhập
        Validators.maxLength(128)    // Giới hạn 128 ký tự
      ]],
      type:[this.attribute.type || 1 || null],
      formId:[this.formId || null],
      required:[this.required || false],
      config:[null]
    })
  }
  
  save() {
    if (this.form.invalid) {
      // Đánh dấu tất cả các control là "touched" để hiển thị lỗi
      this.form.markAllAsTouched();
  
      this.toasterService.error('Giá trị khai báo không hợp lệ');
      return;
    }
    this.form.get('config')?.setValue("required:"+this.form.value.required)
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
      // Chuẩn hóa title để kiểm tra trùng
      const trimmedTitle = value.trim().toLowerCase();
  
      // Kiểm tra title trùng trong danh sách
      const isTitleDuplicate = this.lstAttribute.some(attr =>
        attr.title?.trim().toLowerCase() === trimmedTitle
      );
  
      if (isTitleDuplicate) {
        titleControl?.setErrors({ duplicate: true });
      } else {
        titleControl?.setErrors(null);
      }
  
      // Tạo mã code từ title: bỏ dấu, loại ký tự đặc biệt
      const cleanedValue = value
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // Bỏ dấu
        .replace(/[^\w\s]|_/g, "")       // Bỏ ký tự đặc biệt
        .replace(/\s+/g, " ");           // Chuẩn hóa khoảng trắng
  
      const code = cleanedValue
        .trim()
        .split(/\s+/)
        .map(word => word[0]?.toUpperCase() || '')
        .join('');
  
      // Kiểm tra code trùng
      const isCodeDuplicate = this.lstAttribute.some(attr =>
        attr.code === code
      );
  
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
    {
      title:'text',
      value:1
    },
    {
      title:'AreaText',
      value:2
    },
    {
      title:'Select',
      value:3
    },
    {
      title:'CheckBox',
      value:4
    },
    {
      title:'Radio',
      value:5
    },
    {
      title:'DateTime',
      value:6
    },
    {
      title:'Number',
      value:7
    },
    {
      title:'Boolean',
      value:8
    },
  ]

}

export interface CategoryParams {
  id: string;
  isCreated: boolean;
  lstAttribute: FormFieldDto[];
  code: string;
}
