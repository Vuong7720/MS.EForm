import { PagedResultDto } from '@abp/ng.core';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CreatePageComponent } from './create_page/create_page.component';
import { DeleteComfirmComponent } from '../shared/delete-comfirm/delete-comfirm.component';
import { QrCodeModalComponent } from '../shared/qr-code-modal/qr-code-modal.component';
import { EFormService } from '@proxy/controllers';
import { PageDto, PagePagingDto } from '@proxy/form-models/pages';
import { ToasterService } from '@abp/ng.theme.shared';
import { NzTableQueryParams } from 'ng-zorro-antd/table';
import { getApiErrorMessage } from '../shared/services/http-error.util';

@Component({
  standalone: false,
  selector: 'app-pages',
  templateUrl: './pages.component.html',
  styleUrls: ['./pages.component.scss'],
})
export class PagesComponent implements OnInit {
  dataResultPaging: PagedResultDto<PageDto> = new PagedResultDto<PageDto>();
  pages: PageDto[] = [];
  loading = false;
  totalCount: number;
  pageFilter = {
    pageIndex: 1,
    pageSize: 10,
  } as PagePagingDto;
  searchTitle = '';

  constructor(
    private modalService: NgbModal,
    private service: EFormService,
    private toasterService: ToasterService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.getPaging(this.pageFilter);
  }

  getPaging(page: PagePagingDto) {
    this.loading = true;
    this.service.getAllPagesPaged(page).subscribe(res => {
      this.dataResultPaging = res;
      this.totalCount = res.totalCount;
      this.pages = res.items;
      this.loading = false;
    });
  }

  addPage(id: string) {
    const modalRef = this.modalService.open(CreatePageComponent, {
      size: 'lg',
      backdrop: 'static',
      centered: true,
    });
    modalRef.componentInstance.Id = id;
    modalRef.componentInstance.pageUpdate.subscribe(() => {
      this.getPaging(this.pageFilter);
    });
  }

  manageSections(id: string) {
    this.router.navigate(['/page-sections'], { queryParams: { pageId: id } });
  }

  copyShowcaseLink(slug: string) {
    const url = `${window.location.origin}/showcase/${slug}`;
    navigator.clipboard?.writeText(url);
    this.toasterService.success('Đã sao chép đường dẫn trang giới thiệu');
  }

  showQrCode(slug: string, title: string) {
    const modalRef = this.modalService.open(QrCodeModalComponent, {
      size: 'sm',
      centered: true,
    });
    modalRef.componentInstance.url = `${window.location.origin}/showcase/${slug}`;
    modalRef.componentInstance.title = `Mã QR - ${title}`;
  }

  // nhân bản toàn bộ trang (kèm mọi khu vực hiển thị của nó) - hữu ích khi cần dựng nhanh 1 trang demo
  // mới dựa trên bố cục đã có sẵn (vd chào hàng khách khác, hoặc sự kiện năm sau). Trang mới luôn tạo ở
  // trạng thái tắt (xem PageService.DuplicateAsync) nên không cần lo trùng nội dung public ngay lập tức.
  duplicatePage(id: string) {
    this.service.duplicatePage(id, { skipHandleError: true }).subscribe({
      next: res => {
        this.toasterService.success(res.messages);
        this.getPaging(this.pageFilter);
      },
      error: err => this.toasterService.error(getApiErrorMessage(err)),
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
      this.service.deletePageById(id, { skipHandleError: true }).subscribe({
        next: res => {
          this.toasterService.success(res.messages);
          this.getPaging(this.pageFilter);
        },
        error: err => this.toasterService.error(getApiErrorMessage(err)),
      });
    });
  }

  search(event: Event) {
    const inputValue = (event.target as HTMLInputElement).value;
    this.pageFilter.title = inputValue;
    this.getPaging(this.pageFilter);
  }

  onQueryParamsChange(params: NzTableQueryParams): void {
    this.pageFilter.pageIndex = params.pageIndex;
    this.pageFilter.pageSize = params.pageSize;
    this.getPaging(this.pageFilter);
  }
}
