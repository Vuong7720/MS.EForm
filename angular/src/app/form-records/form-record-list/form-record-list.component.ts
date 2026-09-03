import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { PagedResultDto } from '@abp/ng.core';
import { ToasterService } from '@abp/ng.theme.shared';
import { EFormService } from '@proxy/controllers';
import { MessageDto } from '@proxy/eform/models';
import { FormRecordDto, FormRecordPagingFilterDto } from '@proxy/form-models/form-records';
import { ApprovalStatus } from '@proxy/enums';
import { NzTableQueryParams } from 'ng-zorro-antd/table';
import { DeleteComfirmComponent } from '../../shared/delete-comfirm/delete-comfirm.component';
import { getApiErrorMessage } from '../../shared/services/http-error.util';

@Component({
  standalone: false,
  selector: 'app-form-record-list',
  templateUrl: './form-record-list.component.html',
  styleUrls: ['./form-record-list.component.scss'],
})
export class FormRecordListComponent implements OnInit {
  lstRecord: FormRecordDto[] = [];
  totalCount = 0;
  dataResultPaging: PagedResultDto<FormRecordDto> = new PagedResultDto<FormRecordDto>();
  page = {
    pageIndex: 1,
    pageSize: 10,
  } as FormRecordPagingFilterDto;
  loading = false;
  // form đang lọc theo (page.formId) có bật "Cần phê duyệt" không - chỉ hiện cột/hành động duyệt khi có,
  // tránh hiện tag "Chờ duyệt" vô nghĩa cho form không cần duyệt
  currentFormRequireApproval = false;
  ApprovalStatus = ApprovalStatus;
  onlyPendingApproval = false;

  // chọn nhiều dòng để duyệt/từ chối/xóa hàng loạt - giữ nguyên lựa chọn khi chuyển trang (Set không phụ
  // thuộc trang hiện tại đang hiển thị những id nào), chỉ xóa khi đổi bộ lọc/form hoặc sau khi thao tác xong
  selectedIds = new Set<string>();
  bulkProcessing = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private service: EFormService,
    private toasterService: ToasterService,
    private modalService: NgbModal
  ) {}

  ngOnInit(): void {
    this.page.formId = this.route.snapshot.queryParamMap.get('formId') || undefined;
    const pageIndex = Number(this.route.snapshot.queryParamMap.get('pageIndex'));
    const pageSize = Number(this.route.snapshot.queryParamMap.get('pageSize'));
    if (pageIndex > 0) this.page.pageIndex = pageIndex;
    if (pageSize > 0) this.page.pageSize = pageSize;
    this.loadCurrentFormRequireApproval();
    this.getPaging(this.page);
  }

  private loadCurrentFormRequireApproval(): void {
    if (!this.page.formId) {
      this.currentFormRequireApproval = false;
      return;
    }
    this.service.get(this.page.formId).subscribe(form => {
      this.currentFormRequireApproval = !!form?.requireApproval;
    });
  }

  toggleOnlyPendingApproval(): void {
    this.page.approvalStatus = this.onlyPendingApproval ? this.ApprovalStatus.Pending : undefined;
    this.page.pageIndex = 1;
    this.selectedIds.clear();
    this.getPaging(this.page);
  }

  get allCheckedOnPage(): boolean {
    return this.lstRecord.length > 0 && this.lstRecord.every(r => this.selectedIds.has(r.id));
  }

  get indeterminateOnPage(): boolean {
    return this.lstRecord.some(r => this.selectedIds.has(r.id)) && !this.allCheckedOnPage;
  }

  onAllCheckedChange(checked: boolean): void {
    this.lstRecord.forEach(r => (checked ? this.selectedIds.add(r.id) : this.selectedIds.delete(r.id)));
  }

  onItemCheckedChange(id: string, checked: boolean): void {
    checked ? this.selectedIds.add(id) : this.selectedIds.delete(id);
  }

  // tìm theo nội dung đã nhập (bất kỳ field nào), khác tìm theo tiêu đề bản ghi - hữu ích khi không nhớ
  // tiêu đề bản ghi nhưng nhớ 1 giá trị đã điền (vd tên người, số CCCD...)
  searchKeyword(event: Event) {
    this.page.keyword = (event.target as HTMLInputElement).value || undefined;
    this.page.pageIndex = 1;
    this.getPaging(this.page);
  }

  getPaging(page: FormRecordPagingFilterDto) {
    this.loading = true;
    this.service.getPagingFormRecord(page).subscribe(res => {
      this.dataResultPaging = res;
      this.totalCount = res.totalCount;
      this.lstRecord = res.items;
      this.loading = false;
    });
  }

  onQueryParamsChange(params: NzTableQueryParams): void {
    this.page.pageIndex = params.pageIndex;
    this.page.pageSize = params.pageSize;
    this.getPaging(this.page);
  }

  view(id: string) {
    this.router.navigate(['/form-records/view', id], {
      queryParams: { formId: this.page.formId, pageIndex: this.page.pageIndex, pageSize: this.page.pageSize },
    });
  }

  delete(id: string) {
    const modalRef = this.modalService.open(DeleteComfirmComponent, {
      size: 'confirm',
      backdrop: 'static',
      centered: true,
    });
    modalRef.componentInstance.id = id;
    modalRef.componentInstance.success.subscribe(() => {
      this.service.deleteFormRecordById(id, { skipHandleError: true }).subscribe({
        next: res => {
          this.toasterService.success(res.messages);
          this.getPaging(this.page);
        },
        error: err => this.toasterService.error(getApiErrorMessage(err)),
      });
    });
  }

  clearFilter() {
    this.page.formId = undefined;
    this.currentFormRequireApproval = false;
    this.selectedIds.clear();
    this.router.navigate(['/form-records']);
    this.getPaging(this.page);
  }

  private runBulkAction(action$: Observable<MessageDto>): void {
    this.bulkProcessing = true;
    action$.subscribe({
      next: res => {
        this.toasterService.success(res.messages);
        this.selectedIds.clear();
        this.bulkProcessing = false;
        this.getPaging(this.page);
      },
      error: err => {
        this.toasterService.error(getApiErrorMessage(err));
        this.bulkProcessing = false;
      },
    });
  }

  bulkApprove(): void {
    this.runBulkAction(this.service.bulkApproveFormRecord({ ids: Array.from(this.selectedIds) }, { skipHandleError: true }));
  }

  bulkReject(): void {
    this.runBulkAction(this.service.bulkRejectFormRecord({ ids: Array.from(this.selectedIds) }, { skipHandleError: true }));
  }

  bulkDelete(): void {
    const modalRef = this.modalService.open(DeleteComfirmComponent, {
      size: 'confirm',
      backdrop: 'static',
      centered: true,
    });
    modalRef.componentInstance.success.subscribe(() => {
      this.runBulkAction(this.service.bulkDeleteFormRecord(Array.from(this.selectedIds), { skipHandleError: true }));
    });
  }

  exportExcel() {
    if (!this.page.formId) return;

    this.service.exportExcelFormRecord(this.page.formId, { skipHandleError: true }).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `ket-qua-nop-form.xlsx`;
        link.click();
        window.URL.revokeObjectURL(url);
      },
      error: err => this.toasterService.error(getApiErrorMessage(err)),
    });
  }
}
