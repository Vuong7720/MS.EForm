import { ToasterService } from '@abp/ng.theme.shared';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { EditorConfig } from 'ckeditor5';
import { EFormService } from '@proxy/controllers';
import { PageSectionDto } from '@proxy/form-models/page-sections';
import { PageSectionType } from '@proxy/enums';
import { FormDto } from '@proxy/form-models/forms';
import { PageDto } from '@proxy/form-models/pages';
import { getApiErrorMessage } from '../../shared/services/http-error.util';

@Component({
  standalone: false,
  selector: 'app-create_section',
  templateUrl: './create_section.component.html',
  styleUrls: ['./create_section.component.scss'],
})
export class CreateSectionComponent implements OnInit {
  form: FormGroup;
  @Input() Id: string;
  // trang giới thiệu đang chọn ở màn hình danh sách - dùng làm giá trị mặc định khi tạo section mới
  @Input() defaultPageId: string | null = null;
  @Output() sectionUpdate = new EventEmitter();
  sectionModel: PageSectionDto;
  lstForm: FormDto[] = [];
  lstPage: PageDto[] = [];
  PageSectionType = PageSectionType;

  constructor(
    public activeModal: NgbActiveModal,
    private fb: FormBuilder,
    private service: EFormService,
    private toasterService: ToasterService
  ) {}

  ngOnInit(): void {
    this.service.getAllForm().subscribe(res => {
      this.lstForm = res;
    });
    this.service.getAllPages().subscribe(res => {
      this.lstPage = res;
    });

    this.buildForm();
    if (this.Id) {
      this.getSectionById(this.Id);
    }
  }

  getSectionById(id: string) {
    this.service.getPageSectionByIdById(id).subscribe(res => {
      this.sectionModel = res;
      this.buildForm();
    });
  }

  buildForm() {
    this.form = this.fb.group({
      title: [this.sectionModel?.title || null, [Validators.required, Validators.maxLength(255)]],
      description: [this.sectionModel?.description || null],
      sectionType: [this.sectionModel?.sectionType || PageSectionType.Form],
      formId: [this.sectionModel?.formId || null],
      content: [this.sectionModel?.content || null],
      pageId: [this.sectionModel?.pageId || this.defaultPageId || null, [Validators.required]],
      displayOrder: [this.sectionModel?.displayOrder ?? 0, [Validators.required]],
      isActive: [this.sectionModel?.isActive ?? true],
      startDate: [this.sectionModel?.startDate ? new Date(this.sectionModel.startDate) : null],
      endDate: [this.sectionModel?.endDate ? new Date(this.sectionModel.endDate) : null],
    });

    this.onSectionTypeChange(this.form.get('sectionType')?.value);
  }

  // "Form được nhúng" chỉ bắt buộc khi loại khu vực là Form, "Nội dung" chỉ bắt buộc khi loại là Content -
  // đổi validator động theo loại đang chọn thay vì bắt buộc cả 2 lúc nào cũng phải nhập
  onSectionTypeChange(type: PageSectionType): void {
    const formIdControl = this.form.get('formId');
    const contentControl = this.form.get('content');

    if (type === PageSectionType.Form) {
      formIdControl?.setValidators([Validators.required]);
      contentControl?.clearValidators();
    } else {
      contentControl?.setValidators([Validators.required]);
      formIdControl?.clearValidators();
    }
    formIdControl?.updateValueAndValidity();
    contentControl?.updateValueAndValidity();
  }

  save() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.toasterService.error('Dữ liệu nhập vào không hợp lệ');
      return;
    }

    this.Id
      ? this.service.updatePageSectionByIdAndModel(this.Id, this.form.value, { skipHandleError: true }).subscribe({
          next: res => {
            this.toasterService.success(res.messages);
            this.sectionUpdate.emit(res.messages);
            this.activeModal.close();
          },
          error: err => this.toasterService.error(getApiErrorMessage(err)),
        })
      : this.service.createPageSectionByModel(this.form.value, { skipHandleError: true }).subscribe({
          next: res => {
            this.toasterService.success(res.messages);
            this.sectionUpdate.emit(res.messages);
            this.activeModal.close();
          },
          error: err => this.toasterService.error(getApiErrorMessage(err)),
        });
  }

  editorConfig: EditorConfig = {
    base_url: '/assets/tinymce',
    suffix: '.min',
    promotion: false,
    entity_encoding: 'raw',
    height: '40vh',
    toolbar_mode: 'wrap',
    menubar: false,
    plugins: ['anchor', 'autolink', 'charmap', 'image', 'link', 'lists', 'media', 'table', 'wordcount', 'fullscreen'],
    toolbar: 'undo redo | blocks fontfamily fontsize | bold italic underline | link image media table | align lineheight | numlist bullist | removeformat | fullscreen',
    valid_elements: '*[*]',
    content_style: `.tox-statusbar__branding { display: none !important; }`,
  } as any;
}
