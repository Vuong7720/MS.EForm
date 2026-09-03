import { mapEnumToOptions } from '@abp/ng.core';

export enum PageSectionType {
  Form = 1,
  Content = 2,
}

export const pageSectionTypeOptions = mapEnumToOptions(PageSectionType);
