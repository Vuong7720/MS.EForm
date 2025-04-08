import { RestService, Rest } from '@abp/ng.core';
import type { PagedResultDto } from '@abp/ng.core';
import { Injectable } from '@angular/core';
import type { MessageDto } from '../eform/models';
import type { CatePagingDto, CreateUpdateFormCateDto, FormCategoryDto } from '../form-models/form-categories/models';
import type { CreateUpdateFormField, FormFieldDto } from '../form-models/form-fields/models';
import type { CreateUpdateForm, FormDto, FormPagingFilterDto } from '../form-models/forms/models';

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
      params: { title: page.title, pageSize: page.pageSize, pageIndex: page.pageIndex },
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

  constructor(private restService: RestService) {}
}
