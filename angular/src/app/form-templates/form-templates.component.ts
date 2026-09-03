import { Component, OnInit, ViewContainerRef } from '@angular/core';
import { EFormService } from '@proxy/controllers';
import { FormDto, FormPagingFilterDto } from '@proxy/form-models/forms';
import { FormFieldDto } from '@proxy/form-models/form-fields';
import { PagedResultDto } from '@abp/ng.core';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CreateFormComponent } from '../form/create_form/create_form.component';
import { FormRendererService } from '../shared/services/form-renderer.service';
import { DeleteComfirmComponent } from '../shared/delete-comfirm/delete-comfirm.component';
import { ToasterService } from '@abp/ng.theme.shared';
import { getApiErrorMessage } from '../shared/services/http-error.util';

@Component({
  standalone: false,
  selector: 'app-form-templates',
  templateUrl: './form-templates.component.html',
  styleUrls: ['./form-templates.component.scss'],
})
export class FormTemplatesComponent implements OnInit {
  lstTemplate: FormDto[] = [];
  dataResultPaging: PagedResultDto<FormDto> = new PagedResultDto<FormDto>();
  page = {
    pageIndex: 1,
    pageSize: 100,
    isTemplate: true,
  } as FormPagingFilterDto;
  loading = false;

  constructor(
    private service: EFormService,
    private nzModal: NzModalService,
    private modalService: NgbModal,
    private viewContainerRef: ViewContainerRef,
    private formRenderer: FormRendererService,
    private toasterService: ToasterService
  ) {}

  ngOnInit(): void {
    this.getTemplates();
  }

  getTemplates() {
    this.loading = true;
    this.service.getList(this.page).subscribe({
      next: res => {
        this.dataResultPaging = res;
        this.lstTemplate = res.items;
        this.loading = false;
      },
      error: () => (this.loading = false),
    });
  }

  // xem trước mẫu (chỉ render, không mở modal soạn thảo) để biết mẫu có phù hợp không trước khi dùng
  previewTemplate(templateId: string) {
    const template = this.lstTemplate.find(t => t.id === templateId);
    if (!template) return;
    this.service.getFieldByFormIdByFormId(templateId).subscribe(fields => {
      this.formRenderer.openPreviewPopup(template.content || '', fields);
    });
  }

  // điền sẵn tiêu đề/nội dung/field của mẫu vào modal soạn thảo - KHÔNG tạo form thật trên server.
  // Form chỉ thực sự được tạo khi người dùng bấm Lưu trong modal (tránh tạo rác nếu họ đóng modal mà không lưu)
  useTemplate(templateId: string) {
    const template = this.lstTemplate.find(t => t.id === templateId);
    if (!template) return;
    this.service.getFieldByFormIdByFormId(templateId).subscribe(fields => {
      this.openCreateForm({
        seedForm: { ...template, id: undefined, title: `${template.title} (Bản sao)`, isTemplate: false },
        seedFields: fields,
      });
    });
  }

  // tạo mẫu mới hoàn toàn để lần sau tái sử dụng
  addTemplate() {
    this.openCreateForm({ forceTemplate: true }, () => this.getTemplates());
  }

  // xóa mẫu rác không còn dùng tới - mẫu chỉ là 1 Form với isTemplate=true nên dùng chung API delete Form
  deleteTemplate(id: string) {
    const modalRef = this.modalService.open(DeleteComfirmComponent, {
      size: 'confirm',
      backdrop: 'static',
      centered: true,
    });
    modalRef.componentInstance.id = id;
    modalRef.componentInstance.success.subscribe(() => {
      this.service.delete(id, { skipHandleError: true }).subscribe({
        next: res => {
          this.toasterService.success(res.messages);
          this.getTemplates();
        },
        error: err => this.toasterService.error(getApiErrorMessage(err)),
      });
    });
  }

  private openCreateForm(nzData: { seedForm?: FormDto; seedFields?: FormFieldDto[]; forceTemplate?: boolean }, onClose?: () => void) {
    const modalConfig = {
      nzTitle: '',
      nzContent: CreateFormComponent,
      nzViewContainerRef: this.viewContainerRef,
      nzBackdrop: false,
      nzFooter: null,
      nzCentered: true,
      nzClosable: true,
      nzKeyboard: false,
      nzData,
      nzClassName: 'w90-modal-dialog',
    };
    const modalRef = this.nzModal.create(modalConfig);
    if (onClose) {
      modalRef.afterClose.subscribe(onClose);
    }
  }
}
