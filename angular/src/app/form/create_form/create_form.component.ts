import { Component, Inject, OnInit, PLATFORM_ID, ViewChild, ViewContainerRef, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { EditorConfig } from 'ckeditor5';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CreateAttributeComponent } from '../create_attribute/create_attribute.component';
import { isPlatformBrowser } from '@angular/common';
import { EditorComponent } from 'src/app/shared/components/editor/editor.component';
import { EFormService } from '@proxy/controllers';
import { FormCategoryDto } from '@proxy/form-models/form-categories';
import { FormFieldDto } from '@proxy/form-models/form-fields';
import { NZ_MODAL_DATA, NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { ToasterService } from '@abp/ng.theme.shared';
import { FormDto } from '@proxy/form-models/forms';
@Component({
  standalone: false,
  selector: 'app-create_form',
  templateUrl: './create_form.component.html',
  styleUrls: ['./create_form.component.scss'],
  providers: [NgbActiveModal]
})
export class CreateFormComponent implements OnInit {
  form: FormGroup;
  @ViewChild('editor', { static: false }) editor: EditorComponent | undefined; // Sử dụng ViewChild để lấy editor instance
  editorValue = ''; // Dữ liệu đầu vào/ra của editor
  public config: EditorConfig | null = null;
  isBrowser: boolean;
  lstCate: FormCategoryDto[] = [];
  lstAttribuite: FormFieldDto[] = [];
  getParams: CategoryParams = inject(NZ_MODAL_DATA);
  formId: string;
  formDto: FormDto = {} as FormDto;

  constructor(
    public activeModal: NgbActiveModal,
    private fb: FormBuilder,
    private modalService: NgbModal,
    @Inject(PLATFORM_ID) private platformId: Object,
    private service: EFormService,
    private nzModal: NzModalService,
    private viewContainerRef: ViewContainerRef,
    private toasterService: ToasterService,
    private nzModalRef: NzModalRef
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

 
  ngOnInit(): void {
    this.buildForm();
    this.getAllCate()
    if (this.getParams.id) {
      this.formId = this.getParams.id
      this.getFieldByForm(this.formId)
      this.getFormDetail(this.formId)
    } 
  }
  buildForm() {
    this.form = this.fb.group({
      title: [this.formDto.title || null,[
        Validators.required,         // Bắt buộc nhập
        Validators.maxLength(255)    // Giới hạn 128 ký tự
      ]],
      content: [this.formDto.content || null],
      categoryId: [this.formDto.categoryId || null, [
        Validators.required
      ]],
      formFields:[null]
    });
  }

  save() {
    if(this.form.invalid){
      this.form.markAllAsTouched();
      this.toasterService.error('Giá trị khai báo không hợp lệ');
    }

    this.form.get('formFields')?.setValue(this.lstAttribuite);
    this.service.create(this.form.value).subscribe(res =>{
      if(res.status){
        this.toasterService.success(res.messages)
        this.nzModalRef.close({
          Success: true,
          Title: 'Thêm thuộc tính thành công',
        });
      }else{
        this.toasterService.error(res.messages)
      }
    })
  }

  onEditorChange(content: string) {
    this.form.get('content')?.setValue(content);
  }

  // lấy dữ liệu thuộc tính kéo thả
  onDragStart(event: DragEvent, item: any) {
    const data = {
      type: item.type,
      code: item.code,
      title: item.title,
    };
    event.dataTransfer?.setData('application/json', JSON.stringify(data));
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
  }

  // mở modal thêm mới thuộc tính
  addAttribute(id: string) {
    const modalConfig = {
      nzTitle: '',
      nzContent: CreateAttributeComponent,
      nzViewContainerRef: this.viewContainerRef,
      nzBackdrop: false,
      nzFooter: null,
      nzCentered: true,
      nzClosable: true,
      nzKeyboard: false,
      nzData: { id: this.formId, lstAttribute: this.lstAttribuite },
      nzClassName: 'w-modal-dialog',
    };
    const modalRef = this.nzModal.create(modalConfig);
    const instanceRef = modalRef.getContentComponent();
    instanceRef.onLoadData.subscribe(response => this.lstAttribuite = [...this.lstAttribuite, response]);
  }

  getAllCate(){
    this.service.getAllFormCate().subscribe(res => {
      this.lstCate = res;
    })
  }

  getFieldByForm(formId: string){
    this.service.getFieldByFormIdByFormId(formId).subscribe(res =>{
      this.lstAttribuite = res
    })
  }

  getFormDetail(id: string){
    this.service.get(id).subscribe(res =>{
      this.formDto = res
      this.buildForm();
    })
  }

  onBack(): void {
    this.nzModalRef.destroy();
  }

  editorConfig = {
    base_url: '/assets/tinymce',
    suffix: '.min',
    promotion: false,
    entity_encoding: 'raw',
    height: '60vh',
    toolbar_mode: 'wrap',
    menubar: true,
    menu: {
      edit: { title: 'Edit', items: 'undo, redo, selectall' },
    },
    plugins: [
      'code', 'anchor', 'autolink', 'charmap', 'codesample', 'emoticons',
      'image', 'link', 'lists', 'media', 'preview', 'searchreplace',
      'table', 'visualblocks', 'wordcount', 'fullscreen', 'advlist',
      'quickbars', 'insertdatetime', 'visualchars', 'help'
    ],
    toolbar:
      'Code | undo redo | blocks fontfamily fontsize | bold italic underline strikethrough | link image media table mergetags | addcomment showcomments | spellcheckdialog a11ycheck typography | align lineheight | checklist numlist bullist indent outdent | emoticons charmap | removeformat',
    valid_elements: '*[*]', // Cho phép tất cả các thẻ và thuộc tính
    extended_valid_elements: 'div[contenteditable|id|class|style]', // Thêm thẻ <div> với thuộc tính nhất định
    custom_elements: 'div, span', // Cho phép các thẻ tùy chỉnh như div, span
    content_style: `.tox-statusbar__branding { display: none !important; }`, // Ẩn branding
    setup: (editor: any) => {
      // Lắng nghe sự kiện drop
      editor.on('drop', (event: DragEvent) => {
        event.preventDefault();
        // Lấy dữ liệu kéo thả từ `application/json`
        const dataStr = event.dataTransfer?.getData('application/json');

        if (!dataStr) {
          console.warn('Không có dữ liệu JSON được thả vào!');
          return;
        }

        try {
          // Parse chuỗi JSON thành object
          const data = JSON.parse(dataStr);
          if (data.type && data.code && data.title) {
            const html = `<span 
            id="${data.code}" 
            contenteditable="false" 
            class="drag-field field-type-${data.type}" 
            style="display: inline-block; resize: horizontal; overflow: auto; min-width: 100px; border: 1px dashed #ccc; padding: 2px 4px;">
            ..........${data.title}..........
          </span>`;
            editor.insertContent(html);
          }
        } catch (error) {
          console.error('Lỗi khi parse JSON:', error);
        }
      });

      // Lắng nghe sự kiện dragover
      editor.on('dragover', (event: DragEvent) => {
        event.preventDefault();
      });

      editor.on('change', () => {
        const content = editor.getContent();
        this.form.get('content')?.setValue(content);
      });
    },
  };


}

export interface CategoryParams {
  id: string;
  isCreated: boolean;
}
