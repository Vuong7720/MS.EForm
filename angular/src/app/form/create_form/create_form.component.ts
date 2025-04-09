import {
  Component,
  Inject,
  OnInit,
  PLATFORM_ID,
  ViewChild,
  ViewContainerRef,
  inject,
} from '@angular/core';
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
import { DeleteComfirmComponent } from 'src/app/shared/delete-comfirm/delete-comfirm.component';
@Component({
  standalone: false,
  selector: 'app-create_form',
  templateUrl: './create_form.component.html',
  styleUrls: ['./create_form.component.scss'],
  providers: [NgbActiveModal],
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
    this.getAllCate();
    if (this.getParams.id) {
      this.formId = this.getParams.id;
      this.getFieldByForm(this.formId);
      this.getFormDetail(this.formId);
    }
  }
  buildForm() {
    this.form = this.fb.group({
      title: [
        this.formDto.title || null,
        [
          Validators.required, // Bắt buộc nhập
          Validators.maxLength(255), // Giới hạn 128 ký tự
        ],
      ],
      content: [this.formDto.content || null],
      description: [this.formDto.description || null],
      categoryId: [this.formDto.categoryId || null, [Validators.required]],
      formFields: [null],
    });
  }

  save() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.toasterService.error('Giá trị khai báo không hợp lệ');
    }

    this.form.get('formFields')?.setValue(this.lstAttribuite);
    this.formId
      ? this.service.update(this.formId, this.form.value).subscribe(res => {
          if (res.status) {
            this.toasterService.success(res.messages);
            this.nzModalRef.close({
              Success: true,
              Title: 'Sửa biểu mẫu thành công',
            });
          } else {
            this.toasterService.error(res.messages);
          }
        })
      : this.service.create(this.form.value).subscribe(res => {
          if (res.status) {
            this.toasterService.success(res.messages);
            this.nzModalRef.close({
              Success: true,
              Title: 'Thêm biểu mẫu thành công',
            });
          } else {
            this.toasterService.error(res.messages);
          }
        });
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
  addAttribute(code: string) {
    const modalConfig = {
      nzTitle: '',
      nzContent: CreateAttributeComponent,
      nzViewContainerRef: this.viewContainerRef,
      nzBackdrop: false,
      nzFooter: null,
      nzCentered: true,
      nzClosable: true,
      nzKeyboard: false,
      nzData: { id: this.formId, lstAttribute: this.lstAttribuite, code: code },
      nzClassName: 'w-modal-dialog',
    };
    const modalRef = this.nzModal.create(modalConfig);
    const instanceRef = modalRef.getContentComponent();
    instanceRef.onLoadData.subscribe(response => {
      if (code) {
        var index = this.lstAttribuite.findIndex(a => a.code === code);
        if (index !== -1) {
          const clone = [...this.lstAttribuite];
          clone.splice(index, 1, response); // xoá 1 phần tử tại vị trí index, chèn response vào
          this.lstAttribuite = clone;
        }
      } else {
        this.lstAttribuite = [response, ...this.lstAttribuite];
      }
    });
  }

  getAllCate() {
    this.service.getAllFormCate().subscribe(res => {
      this.lstCate = res;
    });
  }

  getFieldByForm(formId: string) {
    this.service.getFieldByFormIdByFormId(formId).subscribe(res => {
      this.lstAttribuite = res;
    });
  }

  getFormDetail(id: string) {
    this.service.get(id).subscribe(res => {
      this.formDto = res;
      this.buildForm();
    });
  }

  onBack(): void {
    this.nzModalRef.destroy();
  }

  delete(code: string) {
    const modalRef = this.modalService.open(DeleteComfirmComponent, {
      size: 'confirm',
      backdrop: 'static',
      centered: true,
    });
    modalRef.componentInstance.success.subscribe(res => {
      this.lstAttribuite = this.lstAttribuite.filter(a => a.code !== code);
    });
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
    tabfocus_elements: ':prev,:next', // giữ lại khả năng di chuyển focus nếu cần
    tab_spaces: 8,
    plugins: [
      'code',
      'anchor',
      'autolink',
      'charmap',
      'codesample',
      'emoticons',
      'image',
      'link',
      'lists',
      'media',
      'preview',
      'searchreplace',
      'table',
      'visualblocks',
      'wordcount',
      'fullscreen',
      'advlist',
      'quickbars',
      'insertdatetime',
      'visualchars',
      'help',
    ],
    toolbar:
      'customPreview | Code | undo redo | blocks fontfamily fontsize | bold italic underline strikethrough | link image media table mergetags | addcomment showcomments | spellcheckdialog a11ycheck typography | align lineheight | checklist numlist bullist indent outdent | emoticons charmap | removeformat',
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
            contenteditable="true"
            class="drag-field field-type-${data.type}"
            style="display: inline-block; text-align:center; resize: horizontal; overflow: auto; min-width: 100px; border: 1px dashed #ccc; padding: 2px 4px;">
            ..........<i>${data.title}</i>..........
          </span>`;
            editor.insertContent(html);
          }
        } catch (error) {
          console.error('Lỗi khi parse JSON:', error);
        }
      });

      // Lắng nghe sự kiện dragover
      editor.on('dragover', (event: DragEvent) => {
        // event.preventDefault();
      });

      // sự kiện khi thao tác bằng phím tab
      editor.on('keydown', function (e) {
        if (e.key === 'Tab') {
          e.preventDefault();

          // Chèn khoảng trắng thay vì tab thật
          editor.execCommand('mceInsertContent', false, '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;');
        }
      });
      // thay đổi preview:
      editor.ui.registry.addButton('customPreview', {
        text: '',
        icon: 'preview',
        onAction: () => {
          const originalContent = editor.getContent();
          const temp = document.createElement('div');
          temp.innerHTML = originalContent;

          temp.querySelectorAll('span.drag-field').forEach(span => {
            const fieldType = parseInt(
              Array.from(span.classList)
                .find(c => c.startsWith('field-type-'))
                ?.replace('field-type-', '') || '1'
            );

            const name = span.id || '';
            const placeholder = span.textContent?.trim() || '..........';

            let replacementEl;

            switch (fieldType) {
              case 2: replacementEl = document.createElement('textarea'); break;
              case 3:
                replacementEl = document.createElement('select');
                replacementEl.appendChild(new Option('-- Chọn giá trị --'));
                break;
              case 4: replacementEl = document.createElement('input'); replacementEl.type = 'checkbox'; break;
              case 5: replacementEl = document.createElement('input'); replacementEl.type = 'radio'; break;
              case 6: replacementEl = document.createElement('input'); replacementEl.type = 'datetime-local'; break;
              case 7: replacementEl = document.createElement('input'); replacementEl.type = 'number'; break;
              case 8:
                replacementEl = document.createElement('select');
                ['-- Chọn --', 'Có', 'Không'].forEach(text => {
                  const opt = document.createElement('option');
                  opt.text = text;
                  replacementEl.appendChild(opt);
                });
                break;
              default: replacementEl = document.createElement('input'); replacementEl.type = 'text';
            }

            replacementEl.placeholder = placeholder;
            replacementEl.name = name;
            replacementEl.style.border = 'none';
            replacementEl.style.borderBottom = '1px solid #ccc';
            replacementEl.style.outline = 'none';
            replacementEl.style.minWidth = '100px';

            span.replaceWith(replacementEl);
          });

          // Hiển thị bản xem trước trong popup
          const previewWindow = window.open('', 'previewWindow', 'width=800,height=600');
          if (previewWindow) {
            previewWindow.document.write(`
              <html>
                <head><title>Xem trước biểu mẫu</title></head>
                <body style="font-family: Times New Roman; padding: 20px;">
                  ${temp.innerHTML}
                </body>
              </html>
            `);
            previewWindow.document.close();
          } else {
            alert('Trình duyệt đã chặn popup xem trước!');
          }
        },
      });
    },
  };

  
}


export interface CategoryParams {
  id: string;
  isCreated: boolean;
}
