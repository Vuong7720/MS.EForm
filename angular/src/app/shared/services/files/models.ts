import type { ExtensibleObject } from '@abp/ng.core';

export interface FileDownloadInfoModel extends ExtensibleObject {
  downloadMethod?: string;
  downloadUrl?: string;
  expectedFileName?: string;
  token?: string;
  id?: string;
  parentId?: string;
  treeParentIds?: string;
}
