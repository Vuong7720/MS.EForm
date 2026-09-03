import type { FullAuditedEntityDto } from '@abp/ng.core';
import type { PageSectionDto } from '../page-sections/models';

export interface PagePagingDto {
  title?: string;
  pageSize: number;
  pageIndex: number;
}

export interface CreateUpdatePageDto {
  title?: string;
  slug?: string;
  description?: string;
  isActive: boolean;
  primaryColor?: string;
  brandName?: string;
}

export interface PageDto extends FullAuditedEntityDto<string> {
  title?: string;
  slug?: string;
  description?: string;
  isActive: boolean;
  primaryColor?: string;
  brandName?: string;
}

export interface ShowcasePageDto {
  page?: PageDto;
  sections: PageSectionDto[];
}
