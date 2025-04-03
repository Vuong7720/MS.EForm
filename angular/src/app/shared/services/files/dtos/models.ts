import type {
  EntityDto,
  ExtensibleAuditedEntityDto,
  ExtensibleFullAuditedEntityDto,
  ExtensibleObject,
  ListResultDto,
  PagedAndSortedResultRequestDto,
} from '@abp/ng.core';
import type { FileType } from '../file-type.enum';
// import type { IFormFile } from '../../../microsoft/asp-net-core/http/models';
import type { FileExtention } from '../file-extention.enum';
import type { FileDownloadInfoModel } from '../models';
// import type { IRemoteStreamContent } from '../../../volo/abp/content/models';
import { NzUploadFile } from 'ng-zorro-antd/upload';

export interface CreateFileActionInput extends ExtensibleObject {
  fileContainerName: string;
  fileType: FileType;
  parentId?: string;
  ownerUserId?: string;
  //file: IFormFile;
  generateUniqueFileName: boolean;
  fileExtention: FileExtention;
}

export interface CreateFileInput extends CreateFileInputBase {
  fileName: string;
  mimeType?: string;
  fileType: FileType;
  content: number[];
  fileExtention: FileExtention;
  treeParentIds?: string;
}

export interface CreateFileInputBase extends ExtensibleObject {
  fileContainerName: string;
  parentId?: string;
  ownerUserId?: string;
  fileExtention: FileExtention;
  treeParentIds?: string;
  fileContainerNamePublic: string;
}

export interface CreateFileOutput extends ExtensibleObject {
  fileInfo: FileInfoDto;
  downloadInfo: FileDownloadInfoModel;
}

export interface CreateFileWithStreamInput extends CreateFileInputBase {
  //content: IRemoteStreamContent;
  generateUniqueFileName: boolean;
}

export interface CreateManyFileActionInput extends ExtensibleObject {
  fileContainerName: string;
  fileType: FileType;
  parentId?: string;
  ownerUserId?: string;
  //files: IFormFile[];
  files: File[];
  generateUniqueFileName: boolean;
  fileExtention: FileExtention;
}

export interface CreateManyFileInput extends ExtensibleObject {
  fileInfos: CreateFileInput[];
}

export interface CreateManyFileOutput extends ListResultDto<CreateFileOutput> {}

export interface CreateManyFileWithStreamInput extends CreateFileInputBase {
  fileContents: File[];
  generateUniqueFileName: boolean;
}

export interface FileDownloadOutput extends ExtensibleObject {
  fileName?: string;
  mimeType?: string;
  content: number[];
}

export interface FileInfoDto extends ExtensibleAuditedEntityDto<string> {
  parentId?: string;
  fileContainerName?: string;
  fileName?: string;
  mimeType?: string;
  fileType: FileType;
  byteSize: number;
  hash?: string;
  ownerUserId?: string;
  fullPathServer?: string;
  fileExtention: FileExtention;
  parentIdThumb?: string;
  sizeThumb?: string;
  fullPathServerThumb?: string;
  shared?: boolean;
  sharedPermissionAccessFull?: boolean;
  subFilesQuantity: number;
  subFoldersQuantity: number;
  totalFoldersQuantity: number;
  totalFilesQuantity: number;
  treeParentIds?: string;
  detailFolderRoot?: string;
  createdBy?: string;
  updatedBy?: string;
  deletedBy?: string;
  deletionTime?: string;
}
export interface FilesRequest {
  Field?: string;
  FieldOption: boolean;
  pageNumber: number;
  PageSize: number;
  sortKey?: string;
  sortOrder?: string;
  SearchInField: any;
  Keyword: string;
  ParentId?: string;
  deleteTimeFrom?: string;
  deleteTimeTo?: string;
}
export interface FolderInfoDto extends EntityDto<string> {
  parentId?: string;
  fileType?: FileType;
  type?: FileExtention;
  name?: string;
  level: number;
  tenantId?: string;
  children: FolderInfoDto[];
}

export interface GetFileListInput extends PagedAndSortedResultRequestDto {
  parentId?: string;
  fileContainerName: string;
  ownerUserId?: string;
  directoryOnly?: boolean;
  keyword?: string;
  fromCreationTime?: string;
  toCreationTime?: string;
  tenantId?: string;
  fileExtention?: FileExtention;
  byteSizeFrom?: string;
  byteSizeTo?: string;
  mimeType?: string;
  typeSearch?: string;
  valueSeach?: number;
  typeShared?: number; //=> dung cho kho files cá nhân. mặc định là list danh sách owner chia sẻ. Giá trị = 2: danh sách thư mục chia sẻ theo ownerId. Giá trị = 3 thông tin các file, folder được chia sẻ
  ownerUserIdSelected?: string;
  isDetailInUser?: boolean;
  createdBy?: string;
}

export interface MoveFileInput extends ExtensibleObject {
  newParentId?: string;
  newFileName: string;
}

export interface UpdateFileActionInput extends ExtensibleObject {
  fileName: string;
  //file: IFormFile;
}

export interface UpdateFileBase extends ExtensibleObject {
  fileExtention: FileExtention;
}

export interface UpdateFileInfoInput extends ExtensibleObject {
  fileName: string;
  fileType: FileType;
}

export interface UpdateFileInput extends UpdateFileBase {
  fileName: string;
  mimeType?: string;
  content: number[];
}

export interface UpdateFileWithStreamInput extends UpdateFileBase {
  //content: IRemoteStreamContent;
}
export interface BreadcrumbFileItem {
  id?: string;
  name?: string;
  parentId?: string;
}

export interface GoogleDriveFilesItem {
  id?: string;
  name?: string;
  size?: number;
  createdTime?: string;
  mimeType?: string;
  fileExtension?: string;
  owners?: any[];
  modifiedTimeRaw?: string;
  iconLink?: string;
  webViewLink?: string;
  thumbnailLink?: string;
}
export interface GoogleDriveFilesRequest {
  name?: string;
  listMimeType?: number[];
}

export interface ReNameFifoInput {
  newName: string;
  treeParentIds?: string;
  fileContainerName?: string;
}

export interface FileTreeDto {
  key?: string;
  parentId?: string;
  title?: string;
  order?: number;
  children: FileTreeDto[];
  disabled?: boolean;
  isLeaf?: boolean;
}

export interface TreeFolderCacheDto {
  key?: string;
  parentId?: string;
  title?: string;
  order?: number;
  children: TreeFolderCacheDto[];
  disabled?: boolean;
  isLeaf?: boolean;
  icon?: string;
  expanded?: boolean;
  shared?: boolean;
}

export interface FolderRemoveDto {
  parentId?: string;
  idMove?: string;
  folderSort: FolderByParentIdDto[];
  fileContainerName?: string;
}

export interface FolderByParentIdDto {
  id?: string;
  title?: string;
  order?: number;
}

export interface IdentityUserInFileDto {
  id?: string;
  userName?: string;
}

export interface AddFileByLinksDto extends ExtensibleObject {
  fileName: string;
  link: string;
  mimeType?: string;
}

export interface AddFileByLinksModel extends ExtensibleObject {
  fileInfos: AddFileByLinksDto[];
  parentId?: string;
  fileContainerName: string;
}

export interface FileBaseInfoDto {
  fileName?: string;
  fullPathServer?: string;
}

export interface getDataFileInfo {
  datas?: FileInfoDto[];
}
