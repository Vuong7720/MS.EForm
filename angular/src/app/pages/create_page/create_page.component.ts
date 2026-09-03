import { ToasterService } from '@abp/ng.theme.shared';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { EFormService } from '@proxy/controllers';
import { PageDto } from '@proxy/form-models/pages';
import { getApiErrorMessage } from '../../shared/services/http-error.util';

// chuyển tên trang thành slug hợp lệ cho URL (/showcase/{slug}): chữ thường, bỏ dấu, chỉ giữ chữ/số,
// khoảng trắng/ký tự khác -> gạch ngang, gộp nhiều gạch ngang liền nhau, bỏ gạch ngang ở đầu/cuối
function slugify(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/gi, 'd')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

@Component({
  standalone: false,
  selector: 'app-create_page',
  templateUrl: './create_page.component.html',
  styleUrls: ['./create_page.component.scss'],
})
export class CreatePageComponent implements OnInit {
  form: FormGroup;
  @Input() Id: string;
  @Output() pageUpdate = new EventEmitter();
  pageModel: PageDto;

  constructor(
    public activeModal: NgbActiveModal,
    private fb: FormBuilder,
    private service: EFormService,
    private toasterService: ToasterService
  ) {}

  ngOnInit(): void {
    this.buildForm();
    if (this.Id) {
      this.getPageById(this.Id);
    }
  }

  getPageById(id: string) {
    this.service.getPageByIdById(id).subscribe(res => {
      this.pageModel = res;
      this.buildForm();
    });
  }

  buildForm() {
    this.form = this.fb.group({
      title: [this.pageModel?.title || null, [Validators.required, Validators.maxLength(255)]],
      slug: [this.pageModel?.slug || null, [Validators.required, Validators.pattern(/^[a-z0-9]+(-[a-z0-9]+)*$/)]],
      description: [this.pageModel?.description || null],
      isActive: [this.pageModel?.isActive ?? true],
      primaryColor: [this.pageModel?.primaryColor || '#4F46E5'],
      brandName: [this.pageModel?.brandName || null],
    });
  }

  // tự gợi ý slug từ tên trang khi tạo mới - khi sửa trang đã có, giữ nguyên slug cũ (không tự đổi
  // theo tên nữa) để tránh vô tình đổi mất đường dẫn đã chia sẻ/in ra ngoài
  onTitleChange(value: string) {
    if (this.Id) return;
    this.form.get('slug')?.setValue(slugify(value || ''));
  }

  save() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.toasterService.error('Dữ liệu nhập vào không hợp lệ');
      return;
    }

    this.Id
      ? this.service.updatePageByIdAndModel(this.Id, this.form.value, { skipHandleError: true }).subscribe({
          next: res => {
            this.toasterService.success(res.messages);
            this.pageUpdate.emit(res.messages);
            this.activeModal.close();
          },
          error: err => this.toasterService.error(getApiErrorMessage(err)),
        })
      : this.service.createPageByModel(this.form.value, { skipHandleError: true }).subscribe({
          next: res => {
            this.toasterService.success(res.messages);
            this.pageUpdate.emit(res.messages);
            this.activeModal.close();
          },
          error: err => this.toasterService.error(getApiErrorMessage(err)),
        });
  }
}
