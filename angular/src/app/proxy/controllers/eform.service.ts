import { RestService, Rest } from '@abp/ng.core';
import type { PagedResultDto } from '@abp/ng.core';
import { Injectable } from '@angular/core';
import type { MessageDto } from '../eform/models';
import type { CatePagingDto, CreateUpdateFormCateDto, FormCategoryDto } from '../form-models/form-categories/models';
import type { CreateUpdateFormField, FormFieldDto } from '../form-models/form-fields/models';
import type { BulkFormRecordDto, CreateUpdateFormRecordDto, DashboardStatsDto, FormRecordDto, FormRecordPagingFilterDto, UploadAttachmentResultDto } from '../form-models/form-records/models';
import type { CreateUpdateForm, FormDto, FormPagingFilterDto } from '../form-models/forms/models';
import type { CreateUpdatePageSectionDto, PageSectionDto, PageSectionPagingDto } from '../form-models/page-sections/models';
import type { CreateUpdatePageDto, PageDto, PagePagingDto, ShowcasePageDto } from '../form-models/pages/models';

@Injectable({
  providedIn: 'root',
})
export class EFormService {
  apiName = 'EFormService';
  

  create = (model: CreateUpdateForm, config?: Partial<Rest.Config>) =>
    this.restService.request<any, MessageDto>({
      method: 'POST',
      url: '/api/eform/create-form',
      body: model,
    },
    { apiName: this.apiName,...config });
  

  createFormCategoryByModel = (model: CreateUpdateFormCateDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, MessageDto>({
      method: 'POST',
      url: '/api/eform/create-form-category',
      body: model,
    },
    { apiName: this.apiName,...config });
  

  createFormFieldByModel = (model: CreateUpdateFormField, config?: Partial<Rest.Config>) =>
    this.restService.request<any, MessageDto>({
      method: 'POST',
      url: '/api/eform/create-form-field',
      body: model,
    },
    { apiName: this.apiName,...config });
  

  delete = (id: string, config?: Partial<Rest.Config>) =>
    this.restService.request<any, MessageDto>({
      method: 'DELETE',
      url: '/api/eform/delete-form',
      params: { id },
    },
    { apiName: this.apiName,...config });
  

  deleteFormCategoryById = (id: string, config?: Partial<Rest.Config>) =>
    this.restService.request<any, MessageDto>({
      method: 'DELETE',
      url: '/api/eform/delete-form-category',
      params: { id },
    },
    { apiName: this.apiName,...config });
  

  deleteFormFieldById = (id: string, config?: Partial<Rest.Config>) =>
    this.restService.request<any, MessageDto>({
      method: 'DELETE',
      url: '/api/eform/delete-form-field',
      params: { id },
    },
    { apiName: this.apiName,...config });
  

  deleteMultiFormCategoryByIds = (ids: string[], config?: Partial<Rest.Config>) =>
    this.restService.request<any, MessageDto>({
      method: 'DELETE',
      url: '/api/eform/delete-multi-form-category',
      params: { ids },
    },
    { apiName: this.apiName,...config });
  

  get = (id: string, config?: Partial<Rest.Config>) =>
    this.restService.request<any, FormDto>({
      method: 'GET',
      url: '/api/eform/get-form-by-id',
      params: { id },
    },
    { apiName: this.apiName,...config });
  

  getAllForm = (config?: Partial<Rest.Config>) =>
    this.restService.request<any, FormDto[]>({
      method: 'GET',
      url: '/api/eform/get-all-form',
    },
    { apiName: this.apiName,...config });
  

  getAllFormCate = (config?: Partial<Rest.Config>) =>
    this.restService.request<any, FormCategoryDto[]>({
      method: 'GET',
      url: '/api/eform/get-all-form-category',
    },
    { apiName: this.apiName,...config });
  

  getAllFormCatePaged = (page: CatePagingDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, PagedResultDto<FormCategoryDto>>({
      method: 'GET',
      url: '/api/eform/get-paging-form-category',
      params: { title: page.title, pageSize: page.pageSize, pageIndex: page.pageIndex },
    },
    { apiName: this.apiName,...config });
  

  getAllFormField = (config?: Partial<Rest.Config>) =>
    this.restService.request<any, FormFieldDto[]>({
      method: 'GET',
      url: '/api/eform/get-all-form-field',
    },
    { apiName: this.apiName,...config });
  

  getAllFormFieldPaged = (pageNumber: number = 1, pageSize: number = 10, config?: Partial<Rest.Config>) =>
    this.restService.request<any, PagedResultDto<FormFieldDto>>({
      method: 'GET',
      url: '/api/eform/get-paging-form-field',
      params: { pageNumber, pageSize },
    },
    { apiName: this.apiName,...config });
  

  getCategoryByIdById = (id: string, config?: Partial<Rest.Config>) =>
    this.restService.request<any, FormCategoryDto>({
      method: 'GET',
      url: '/api/eform/get-category-by-id',
      params: { id },
    },
    { apiName: this.apiName,...config });
  

  getFieldByFormIdByFormId = (formId: string, config?: Partial<Rest.Config>) =>
    this.restService.request<any, FormFieldDto[]>({
      method: 'GET',
      url: '/api/eform/get-form-field-by-formid',
      params: { formId },
    },
    { apiName: this.apiName,...config });
  

  getFormFieldByIdById = (id: string, config?: Partial<Rest.Config>) =>
    this.restService.request<any, FormFieldDto>({
      method: 'GET',
      url: '/api/eform/get-form-field-by-id',
      params: { id },
    },
    { apiName: this.apiName,...config });
  

  getList = (page: FormPagingFilterDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, PagedResultDto<FormDto>>({
      method: 'GET',
      url: '/api/eform/get-paging-form',
      params: { title: page.title, isTemplate: page.isTemplate, pageSize: page.pageSize, pageIndex: page.pageIndex },
    },
    { apiName: this.apiName,...config });


  update = (id: string, model: CreateUpdateForm, config?: Partial<Rest.Config>) =>
    this.restService.request<any, MessageDto>({
      method: 'PUT',
      url: '/api/eform/edit-form',
      params: { id },
      body: model,
    },
    { apiName: this.apiName,...config });


  duplicateForm = (id: string, config?: Partial<Rest.Config>) =>
    this.restService.request<any, MessageDto>({
      method: 'POST',
      url: '/api/eform/duplicate-form',
      params: { id },
    },
    { apiName: this.apiName,...config });


  updateFormCategoryByIdAndModel = (id: string, model: CreateUpdateFormCateDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, MessageDto>({
      method: 'PUT',
      url: '/api/eform/edit-form-category',
      params: { id },
      body: model,
    },
    { apiName: this.apiName,...config });
  

  updateFormFieldByIdAndModel = (id: string, model: CreateUpdateFormField, config?: Partial<Rest.Config>) =>
    this.restService.request<any, MessageDto>({
      method: 'PUT',
      url: '/api/eform/edit-form-field',
      params: { id },
      body: model,
    },
    { apiName: this.apiName,...config });


  submitFormRecord = (model: CreateUpdateFormRecordDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, MessageDto>({
      method: 'POST',
      url: '/api/eform/submit-form-record',
      body: model,
    },
    { apiName: this.apiName,...config });


  updateFormRecordByIdAndModel = (id: string, model: CreateUpdateFormRecordDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, MessageDto>({
      method: 'PUT',
      url: '/api/eform/edit-form-record',
      params: { id },
      body: model,
    },
    { apiName: this.apiName,...config });


  deleteFormRecordById = (id: string, config?: Partial<Rest.Config>) =>
    this.restService.request<any, MessageDto>({
      method: 'DELETE',
      url: '/api/eform/delete-form-record',
      params: { id },
    },
    { apiName: this.apiName,...config });


  getFormRecordByIdById = (id: string, config?: Partial<Rest.Config>) =>
    this.restService.request<any, FormRecordDto>({
      method: 'GET',
      url: '/api/eform/get-form-record-by-id',
      params: { id },
    },
    { apiName: this.apiName,...config });


  getPagingFormRecord = (page: FormRecordPagingFilterDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, PagedResultDto<FormRecordDto>>({
      method: 'GET',
      url: '/api/eform/get-paging-form-record',
      params: { formId: page.formId, title: page.title, keyword: page.keyword, approvalStatus: page.approvalStatus, pageSize: page.pageSize, pageIndex: page.pageIndex },
    },
    { apiName: this.apiName,...config });


  approveFormRecord = (id: string, note: string | null, config?: Partial<Rest.Config>) =>
    this.restService.request<any, MessageDto>({
      method: 'POST',
      url: '/api/eform/approve-form-record',
      params: { id, note },
    },
    { apiName: this.apiName,...config });


  rejectFormRecord = (id: string, note: string | null, config?: Partial<Rest.Config>) =>
    this.restService.request<any, MessageDto>({
      method: 'POST',
      url: '/api/eform/reject-form-record',
      params: { id, note },
    },
    { apiName: this.apiName,...config });


  bulkDeleteFormRecord = (ids: string[], config?: Partial<Rest.Config>) =>
    this.restService.request<any, MessageDto>({
      method: 'POST',
      url: '/api/eform/bulk-delete-form-record',
      body: ids,
    },
    { apiName: this.apiName,...config });


  bulkApproveFormRecord = (model: BulkFormRecordDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, MessageDto>({
      method: 'POST',
      url: '/api/eform/bulk-approve-form-record',
      body: model,
    },
    { apiName: this.apiName,...config });


  bulkRejectFormRecord = (model: BulkFormRecordDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, MessageDto>({
      method: 'POST',
      url: '/api/eform/bulk-reject-form-record',
      body: model,
    },
    { apiName: this.apiName,...config });


  exportExcelFormRecord = (formId: string, config?: Partial<Rest.Config>) =>
    this.restService.request<any, Blob>({
      method: 'GET',
      url: '/api/eform/export-excel-form-record',
      params: { formId },
      responseType: 'blob',
    } as any,
    { apiName: this.apiName,...config });


  getDashboardStats = (config?: Partial<Rest.Config>) =>
    this.restService.request<any, DashboardStatsDto>({
      method: 'GET',
      url: '/api/eform/get-dashboard-stats',
    },
    { apiName: this.apiName,...config });

  uploadFormAttachment = (formId: string, fieldCode: string, file: File, config?: Partial<Rest.Config>) => {
    const formData = new FormData();
    formData.append('formId', formId);
    formData.append('fieldCode', fieldCode);
    formData.append('file', file);
    return this.restService.request<any, UploadAttachmentResultDto>({
      method: 'POST',
      url: '/api/eform/upload-form-attachment',
      body: formData,
    } as any,
    { apiName: this.apiName,...config });
  };


  downloadFormAttachment = (blobName: string, fileName: string, config?: Partial<Rest.Config>) =>
    this.restService.request<any, Blob>({
      method: 'GET',
      url: '/api/eform/download-form-attachment',
      params: { blobName, fileName },
      responseType: 'blob',
    } as any,
    { apiName: this.apiName,...config });


  createPageSectionByModel = (model: CreateUpdatePageSectionDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, MessageDto>({
      method: 'POST',
      url: '/api/eform/create-page-section',
      body: model,
    },
    { apiName: this.apiName,...config });


  updatePageSectionByIdAndModel = (id: string, model: CreateUpdatePageSectionDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, MessageDto>({
      method: 'PUT',
      url: '/api/eform/edit-page-section',
      params: { id },
      body: model,
    },
    { apiName: this.apiName,...config });


  deletePageSectionById = (id: string, config?: Partial<Rest.Config>) =>
    this.restService.request<any, MessageDto>({
      method: 'DELETE',
      url: '/api/eform/delete-page-section',
      params: { id },
    },
    { apiName: this.apiName,...config });


  getAllPageSectionsPaged = (page: PageSectionPagingDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, PagedResultDto<PageSectionDto>>({
      method: 'GET',
      url: '/api/eform/get-paging-page-section',
      params: { title: page.title, pageId: page.pageId, pageSize: page.pageSize, pageIndex: page.pageIndex },
    },
    { apiName: this.apiName,...config });


  getPageSectionByIdById = (id: string, config?: Partial<Rest.Config>) =>
    this.restService.request<any, PageSectionDto>({
      method: 'GET',
      url: '/api/eform/get-page-section-by-id',
      params: { id },
    },
    { apiName: this.apiName,...config });


  reorderPageSections = (orderedIds: string[], config?: Partial<Rest.Config>) =>
    this.restService.request<any, MessageDto>({
      method: 'POST',
      url: '/api/eform/reorder-page-section',
      body: orderedIds,
    },
    { apiName: this.apiName,...config });


  getEmbedSection = (id: string, config?: Partial<Rest.Config>) =>
    this.restService.request<any, PageSectionDto>({
      method: 'GET',
      url: '/api/eform/get-embed-section',
      params: { id },
    },
    { apiName: this.apiName,...config });


  createPageByModel = (model: CreateUpdatePageDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, MessageDto>({
      method: 'POST',
      url: '/api/eform/create-page',
      body: model,
    },
    { apiName: this.apiName,...config });


  updatePageByIdAndModel = (id: string, model: CreateUpdatePageDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, MessageDto>({
      method: 'PUT',
      url: '/api/eform/edit-page',
      params: { id },
      body: model,
    },
    { apiName: this.apiName,...config });


  deletePageById = (id: string, config?: Partial<Rest.Config>) =>
    this.restService.request<any, MessageDto>({
      method: 'DELETE',
      url: '/api/eform/delete-page',
      params: { id },
    },
    { apiName: this.apiName,...config });


  duplicatePage = (id: string, config?: Partial<Rest.Config>) =>
    this.restService.request<any, MessageDto>({
      method: 'POST',
      url: '/api/eform/duplicate-page',
      params: { id },
    },
    { apiName: this.apiName,...config });


  getAllPagesPaged = (page: PagePagingDto, config?: Partial<Rest.Config>) =>
    this.restService.request<any, PagedResultDto<PageDto>>({
      method: 'GET',
      url: '/api/eform/get-paging-page',
      params: { title: page.title, pageSize: page.pageSize, pageIndex: page.pageIndex },
    },
    { apiName: this.apiName,...config });


  getPageByIdById = (id: string, config?: Partial<Rest.Config>) =>
    this.restService.request<any, PageDto>({
      method: 'GET',
      url: '/api/eform/get-page-by-id',
      params: { id },
    },
    { apiName: this.apiName,...config });


  getAllPages = (config?: Partial<Rest.Config>) =>
    this.restService.request<any, PageDto[]>({
      method: 'GET',
      url: '/api/eform/get-all-page',
    },
    { apiName: this.apiName,...config });


  getShowcasePage = (slug?: string | null, config?: Partial<Rest.Config>) =>
    this.restService.request<any, ShowcasePageDto>({
      method: 'GET',
      url: '/api/eform/get-showcase-page',
      params: { slug },
    },
    { apiName: this.apiName,...config });

  constructor(private restService: RestService) {}
}
