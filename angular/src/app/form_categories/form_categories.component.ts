import { AuthService, PagedResultDto } from '@abp/ng.core';
import { Component, ElementRef, OnInit, ViewChild, ViewEncapsulation, inject } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CreateCategoryComponent } from './create_category/create_category.component';
import { DeleteComfirmComponent } from '../shared/delete-comfirm/delete-comfirm.component';
import { EFormService } from '@proxy/controllers';
import { CatePagingDto, FormCategoryDto } from '@proxy/form-models/form-categories';
import { ToasterService } from '@abp/ng.theme.shared';
import { NzTableQueryParams } from 'ng-zorro-antd/table';

@Component({
  standalone: false,
  selector: 'app-form_categories',
  templateUrl: './form_categories.component.html',
  styleUrls: ['./form_categories.component.scss'],
})
export class FormCategoryComponent implements OnInit {
  dataResultPaging: PagedResultDto<FormCategoryDto>;
  formCategory: FormCategoryDto[] = [];
  checked = false;
  loading = false;
  indeterminate = false;
  listOfCurrentPageData: readonly FormCategoryDto[] = [];
  setOfCheckedId = new Set<string>();
  lstId = [];
  totalCount: number
  pageCate = {
    pageIndex: 1,
    pageSize: 10
  }as CatePagingDto;
  searchTitle:string = "";

  constructor(
    private modalService: NgbModal,
    private service: EFormService,
    private toasterService: ToasterService
  ) {}

  ngOnInit(): void {
    this.getPagingCategory(this.pageCate);
  }

  getPagingCategory(pageCate: CatePagingDto) {
      this.service.getAllFormCatePaged(this.pageCate).subscribe(res => {
        this.dataResultPaging = res;
        this.totalCount = res.totalCount;
        this.formCategory = res.items;
      });
  }

  addCategory(id: string) {
    const modalRef = this.modalService.open(CreateCategoryComponent, {
      size: 'confirm',
      backdrop: 'static',
      centered: true,
    });
    modalRef.componentInstance.Id = id;
    modalRef.componentInstance.categoryUpdate.subscribe(res => {
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
      this.service.deleteFormCategoryById(id).subscribe(res => {
        if (res.status) {
          this.toasterService.success(res.messages);
          this.getPagingCategory(this.pageCate);
        } else {
          this.toasterService.error(res.messages);
        }
      });
    });
  }

  deleteMultiCate() {
    if (this.lstId) {
      const modalRef = this.modalService.open(DeleteComfirmComponent, {
        size: 'confirm',
        backdrop: 'static',
        centered: true,
      });
      // modalRef.componentInstance.id = id;
      modalRef.componentInstance.success.subscribe(res => {
        this.service.deleteMultiFormCategoryByIds(this.lstId).subscribe(res => {
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
  search(event){
    const inputValue = event.target.value;
    this.pageCate.title = inputValue;
    this.getPagingCategory(this.pageCate);
  }

  // phân trang
  onQueryParamsChange(params: NzTableQueryParams): void {
    const { pageSize, pageIndex, sort, filter } = params;
    const currentSort = sort.find(item => item.value !== null);
    this.pageCate.pageIndex = params.pageIndex;
    this.pageCate.pageSize = params.pageSize;
    this.getPagingCategory(this.pageCate);
  }


  updateCheckedSet(id: string, checked: boolean): void {
    if (checked) {
      this.setOfCheckedId.add(id);
    } else {
      this.setOfCheckedId.delete(id);
    }
    this.lstId = Array.from(this.setOfCheckedId);
  }

  onCurrentPageDataChange(listOfCurrentPageData: readonly FormCategoryDto[]): void {
    this.listOfCurrentPageData = listOfCurrentPageData;
    this.refreshCheckedStatus();
  }

  refreshCheckedStatus(): void {
    const listOfEnabledData = this.listOfCurrentPageData;
    this.checked = listOfEnabledData.every(({ id }) => this.setOfCheckedId.has(id));
    this.indeterminate =
      listOfEnabledData.some(({ id }) => this.setOfCheckedId.has(id)) && !this.checked;
  }

  onItemChecked(id: string, checked: boolean): void {
    this.updateCheckedSet(id, checked);
    this.refreshCheckedStatus();
  }

  onAllChecked(checked: boolean): void {
    this.listOfCurrentPageData.forEach(({ id }) => this.updateCheckedSet(id, checked));
    this.refreshCheckedStatus();
  }
}
