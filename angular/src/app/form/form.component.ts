import { Component, OnInit, ViewContainerRef } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DeleteComfirmComponent } from '../shared/delete-comfirm/delete-comfirm.component';
import { CreateFormComponent } from './create_form/create_form.component';
import { NzModalService } from 'ng-zorro-antd/modal';
import { EFormService } from '@proxy/controllers';
import { FormDto, FormPagingFilterDto } from '@proxy/form-models/forms';
import { NzTableQueryParams } from 'ng-zorro-antd/table';
import { PagedResultDto } from '@abp/ng.core';
import { ToasterService } from '@abp/ng.theme.shared';

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
    pageSize: 10
  }as FormPagingFilterDto;
  searchTitle:string = "";
  loading = false;
  
  constructor(
    private modalService: NgbModal,
    private nzModal: NzModalService,
    private viewContainerRef: ViewContainerRef,
    private service: EFormService,
    private toasterService: ToasterService
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

  delete(id: string) {
    const modalRef = this.modalService.open(DeleteComfirmComponent, {
      size: 'confirm',
      backdrop: 'static',
      centered: true,
    });
    modalRef.componentInstance.id = id;
    modalRef.componentInstance.success.subscribe(res => {
      this.service.delete(id).subscribe(res => {
        if (res.status) {
          this.toasterService.success(res.messages);
          this.getPagingCategory(this.pageCate);
        } else {
          this.toasterService.error(res.messages);
        }
      });
    });
  }



}
