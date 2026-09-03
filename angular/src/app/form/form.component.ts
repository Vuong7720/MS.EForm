import { Component, OnInit, ViewContainerRef } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DeleteComfirmComponent } from '../shared/delete-comfirm/delete-comfirm.component';
import { QrCodeModalComponent } from '../shared/qr-code-modal/qr-code-modal.component';
import { CreateFormComponent } from './create_form/create_form.component';
import { NzModalService } from 'ng-zorro-antd/modal';
import { EFormService } from '@proxy/controllers';
import { FormDto, FormPagingFilterDto } from '@proxy/form-models/forms';
import { NzTableQueryParams } from 'ng-zorro-antd/table';
import { PagedResultDto } from '@abp/ng.core';
import { ToasterService } from '@abp/ng.theme.shared';
import { getApiErrorMessage } from '../shared/services/http-error.util';

@Component({
  standalone: false,
  selector: 'app-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.scss'],
})
export class FormComponent implements OnInit {
  lstForm: FormDto[] = [];
  totalCount: number = 0;
  dataResultPaging: PagedResultDto<FormDto> = new PagedResultDto<FormDto>;
  pageCate = {
    pageIndex: 1,
    pageSize: 10,
    isTemplate: false
  }as FormPagingFilterDto;
  searchTitle:string = "";
  loading = false;
  
  constructor(
    private modalService: NgbModal,
    private nzModal: NzModalService,
    private viewContainerRef: ViewContainerRef,
    private service: EFormService,
    private toasterService: ToasterService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.getPagingCategory(this.pageCate);
  }
  
  getPagingCategory(page: FormPagingFilterDto) {
    this.service.getList(page).subscribe(res => {
      this.dataResultPaging = res;
      this.totalCount = res.totalCount;
      this.lstForm = res.items;
    });
}

onQueryParamsChange(params: NzTableQueryParams): void {
  const { pageSize, pageIndex, sort, filter } = params;
  const currentSort = sort.find(item => item.value !== null);
  this.pageCate.pageIndex = params.pageIndex;
  this.pageCate.pageSize = params.pageSize;
  this.getPagingCategory(this.pageCate);
}

  addForm(id: string) {
    const modalConfig = {
      nzTitle: '',
      nzContent: CreateFormComponent,
      nzViewContainerRef: this.viewContainerRef,
      nzBackdrop: false,
      nzFooter: null,
      nzCentered: true,
      nzClosable: true,
      nzKeyboard: false,
      nzData: { id },
      nzClassName: 'w90-modal-dialog',
    };
    const modalRef = this.nzModal.create(modalConfig);
    modalRef.afterClose.subscribe(res => {
      this.getPagingCategory(this.pageCate);
    });
  }

  viewRecords(id: string) {
    this.router.navigate(['/form-records'], { queryParams: { formId: id } });
  }

  copySubmitLink(id: string) {
    const url = `${window.location.origin}/submit-form/${id}`;
    navigator.clipboard?.writeText(url);
    this.toasterService.success('Đã sao chép đường dẫn nộp form');
  }

  // nhân bản toàn bộ form (nội dung + mọi field) thành 1 form mới - hữu ích khi cần 1 biến thể của form
  // đã có mà không muốn dựng lại từ đầu (khác "Sao chép field" - chỉ nhân bản 1 field trong lúc soạn thảo)
  duplicateForm(id: string) {
    this.service.duplicateForm(id, { skipHandleError: true }).subscribe({
      next: res => {
        this.toasterService.success(res.messages);
        this.getPagingCategory(this.pageCate);
      },
      error: err => this.toasterService.error(getApiErrorMessage(err)),
    });
  }

  // hiện mã QR trỏ thẳng vào trang nộp form - in kèm lên poster giấy, quét là vào thẳng, không cần gõ URL
  showQrCode(id: string, title: string) {
    const modalRef = this.modalService.open(QrCodeModalComponent, {
      size: 'sm',
      centered: true,
    });
    modalRef.componentInstance.url = `${window.location.origin}/submit-form/${id}`;
    modalRef.componentInstance.title = `Mã QR - ${title}`;
  }

  delete(id: string) {
    const modalRef = this.modalService.open(DeleteComfirmComponent, {
      size: 'confirm',
      backdrop: 'static',
      centered: true,
    });
    modalRef.componentInstance.id = id;
    modalRef.componentInstance.success.subscribe(res => {
      this.service.delete(id, { skipHandleError: true }).subscribe({
        next: res => {
          this.toasterService.success(res.messages);
          this.getPagingCategory(this.pageCate);
        },
        error: err => this.toasterService.error(getApiErrorMessage(err)),
      });
    });
  }



}
