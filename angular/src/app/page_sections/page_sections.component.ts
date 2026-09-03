import { PagedResultDto } from '@abp/ng.core';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CreateSectionComponent } from './create_section/create_section.component';
import { DeleteComfirmComponent } from '../shared/delete-comfirm/delete-comfirm.component';
import { EFormService } from '@proxy/controllers';
import { PageSectionDto, PageSectionPagingDto } from '@proxy/form-models/page-sections';
import { PageDto } from '@proxy/form-models/pages';
import { PageSectionType } from '@proxy/enums';
import { ToasterService } from '@abp/ng.theme.shared';
import { NzTableQueryParams } from 'ng-zorro-antd/table';
import { getApiErrorMessage } from '../shared/services/http-error.util';

@Component({
  standalone: false,
  selector: 'app-page_sections',
  templateUrl: './page_sections.component.html',
  styleUrls: ['./page_sections.component.scss'],
})
export class PageSectionsComponent implements OnInit {
  PageSectionType = PageSectionType;
  dataResultPaging: PagedResultDto<PageSectionDto> = new PagedResultDto<PageSectionDto>();
  sections: PageSectionDto[] = [];
  lstPage: PageDto[] = [];
  selectedPageId: string | null = null;
  loading = false;
  totalCount: number;
  pageFilter = {
    pageIndex: 1,
    pageSize: 10,
  } as PageSectionPagingDto;
  searchTitle = '';

  constructor(
    private modalService: NgbModal,
    private service: EFormService,
    private toasterService: ToasterService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // vào từ nút "Quản lý khu vực hiển thị" ở trang /pages sẽ có sẵn pageId trên URL - nếu không có,
    // mặc định chọn trang đầu tiên (đa số trường hợp chỉ có 1 trang giới thiệu)
    const pageIdFromUrl = this.route.snapshot.queryParamMap.get('pageId');

    this.service.getAllPages().subscribe(pages => {
      this.lstPage = pages;
      this.selectedPageId = pageIdFromUrl || pages[0]?.id || null;
      this.onPageChange();
    });
  }

  get selectedPageSlug(): string | null {
    return this.lstPage.find(p => p.id === this.selectedPageId)?.slug || null;
  }

  onPageChange(): void {
    this.pageFilter.pageId = this.selectedPageId || undefined;
    this.pageFilter.pageIndex = 1;
    this.getPaging(this.pageFilter);
  }

  getPaging(page: PageSectionPagingDto) {
    this.loading = true;
    this.service.getAllPageSectionsPaged(page).subscribe(res => {
      this.dataResultPaging = res;
      this.totalCount = res.totalCount;
      this.sections = res.items;
      this.loading = false;
    });
  }

  addSection(id: string) {
    if (!this.selectedPageId) {
      this.toasterService.error('Vui lòng tạo 1 trang giới thiệu trước (mục Trang giới thiệu)');
      return;
    }
    const modalRef = this.modalService.open(CreateSectionComponent, {
      size: 'lg',
      backdrop: 'static',
      centered: true,
    });
    modalRef.componentInstance.Id = id;
    modalRef.componentInstance.defaultPageId = this.selectedPageId;
    modalRef.componentInstance.sectionUpdate.subscribe(() => {
      this.getPaging(this.pageFilter);
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
      this.service.deletePageSectionById(id, { skipHandleError: true }).subscribe({
        next: res => {
          this.toasterService.success(res.messages);
          this.getPaging(this.pageFilter);
        },
        error: err => this.toasterService.error(getApiErrorMessage(err)),
      });
    });
  }

  // chỉ cho kéo thả sắp xếp khi toàn bộ danh sách nằm gọn trên 1 trang - kéo thả xuyên trang sẽ làm
  // Thứ tự hiển thị giữa các trang chồng lấn nhau (mỗi lần kéo chỉ gán lại DisplayOrder cho các mục
  // đang hiển thị), nên với danh sách dài hơn 1 trang, người dùng cần sửa Thứ tự hiển thị thủ công thay vì kéo thả.
  get canReorder(): boolean {
    return this.totalCount > 0 && this.totalCount === this.dataResultPaging.items.length;
  }

  drop(event: CdkDragDrop<PageSectionDto[]>): void {
    if (event.previousIndex === event.currentIndex) return;

    moveItemInArray(this.dataResultPaging.items, event.previousIndex, event.currentIndex);
    const orderedIds = this.dataResultPaging.items.map(s => s.id);

    this.service.reorderPageSections(orderedIds, { skipHandleError: true }).subscribe({
      next: () => this.toasterService.success('Cập nhật thứ tự hiển thị thành công'),
      error: err => {
        this.toasterService.error(getApiErrorMessage(err));
        this.getPaging(this.pageFilter);
      },
    });
  }

  // "Đã tắt" ưu tiên hơn lịch hiển thị (tắt tay luôn thắng); ngược lại so ngày hiện tại với StartDate/
  // EndDate để biết section đang thật sự hiển thị công khai hay đang chờ tới hạn/đã quá hạn - xem cùng
  // logic ở PageSectionService.IsWithinSchedule (backend) để 2 bên luôn nhất quán
  scheduleStatus(data: PageSectionDto): 'not-started' | 'expired' | null {
    if (!data.isActive) return null;
    const now = new Date();
    if (data.startDate && new Date(data.startDate) > now) return 'not-started';
    if (data.endDate && new Date(data.endDate) < now) return 'expired';
    return null;
  }

  copyEmbedCode(id: string): void {
    const url = `${window.location.origin}/showcase/embed/${id}`;
    const snippet = `<iframe src="${url}" style="width:100%;height:600px;border:0;" loading="lazy"></iframe>`;
    navigator.clipboard?.writeText(snippet);
    this.toasterService.success('Đã sao chép mã nhúng (iframe) - dán vào website khác, có thể chỉnh lại "height" cho vừa nội dung');
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
