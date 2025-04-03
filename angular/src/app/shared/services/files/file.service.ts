// import type {
//   CreateFileActionInput,
//   CreateFileInput,
//   CreateFileOutput,
//   CreateFileWithStreamInput,
//   CreateManyFileActionInput,
//   CreateManyFileInput,
//   CreateManyFileOutput,
//   CreateManyFileWithStreamInput,
//   FileDownloadOutput,
//   FileInfoDto,
//   TreeFolderCacheDto,
//   FilesRequest,
//   FolderInfoDto,
//   GetFileListInput,
//   GoogleDriveFilesItem,
//   GoogleDriveFilesRequest,
//   MoveFileInput,
//   ReNameFifoInput,
//   UpdateFileActionInput,
//   UpdateFileInfoInput,
//   UpdateFileInput,
//   UpdateFileWithStreamInput,
//   FolderRemoveDto,
//   IdentityUserInFileDto,
//   AddFileByLinksModel,
// } from './dtos/models';
// import type { FileDownloadInfoModel } from './models';
// import { RestService, Rest } from '@abp/ng.core';
// import type { PagedResultDto } from '@abp/ng.core';
// import { Injectable } from '@angular/core';
// import type { PublicFileContainerConfiguration } from '../containers/models';
// import type { IActionResult } from '../../microsoft/asp-net-core/mvc/models';
// import {
//   FileRemoveToFolderRequest,
//   SharePrivateRequest,
// } from '@proxy/CMSFilesService/file-management/files/request';
// import {
//   MoveToFolderResponse,
//   ReadTextByFileHtmlResponse,
//   RemoveFolderResponse,
// } from '@proxy/CMSFilesService/file-management/files/response';
// import { InforUserSharedDto } from '../infor-user-shared/dtos';

// @Injectable({
//   providedIn: 'root',
// })
// export class FileService {
//   apiName = 'CMSFilesService';
//   folderTrees: FolderInfoDto[] = [];

//   actionCreate = (input: CreateFileActionInput, config?: Partial<Rest.Config>) =>
//     this.restService.request<any, CreateFileOutput>(
//       {
//         method: 'POST',
//         url: '/api/cms-files/file',
//         body: input.file,
//       },
//       { apiName: this.apiName, ...config }
//     );
//   private generateFormData(files: File[], key: string) {
//     const formData = new FormData();
//     files.forEach(file => {
//       formData.append(key, file, file.name);
//     });
//     return formData;
//   }

//   actionCreateMany = (input: CreateManyFileActionInput, config?: Partial<Rest.Config>) =>
//     this.restService.request<any, CreateManyFileOutput>(
//       {
//         method: 'POST',
//         url: '/api/cms-files/file/many',
//         body: this.generateFormData(input.files, 'files'),
//         params: {
//           generateUniqueFileName: input.generateUniqueFileName,
//           fileContainerName: input.fileContainerName,
//           parentId: input.parentId,
//           ownerUserId: input.ownerUserId,
//           fileExtention: input.fileExtention,
//           extraProperties: input.extraProperties,
//         },
//       },
//       { apiName: this.apiName, ...config }
//     );

//   actionDownload = (id: string, token: string, config?: Partial<Rest.Config>) =>
//     this.restService.request<any, IActionResult>(
//       {
//         method: 'GET',
//         url: `/api/cms-files/file/${id}/download`,
//         params: { token },
//       },
//       { apiName: this.apiName, ...config }
//     );

//   actionUpdate = (id: string, input: UpdateFileActionInput, config?: Partial<Rest.Config>) =>
//     this.restService.request<any, FileInfoDto>(
//       {
//         method: 'PUT',
//         url: `/api/cms-files/file/${id}`,
//         body: input.file,
//       },
//       { apiName: this.apiName, ...config }
//     );

//   create = (input: CreateFileInput, config?: Partial<Rest.Config>) =>
//     this.restService.request<any, CreateFileOutput>(
//       {
//         method: 'POST',
//         url: '/api/cms-files/file/with-bytes',
//         body: input,
//       },
//       { apiName: this.apiName, ...config }
//     );

//   createMany = (input: CreateManyFileInput, config?: Partial<Rest.Config>) =>
//     this.restService.request<any, CreateManyFileOutput>(
//       {
//         method: 'POST',
//         url: '/api/cms-files/file/many/with-bytes',
//         body: input,
//       },
//       { apiName: this.apiName, ...config }
//     );

//   createManyWithStream = (input: CreateManyFileWithStreamInput, config?: Partial<Rest.Config>) =>
//     this.restService.request<any, CreateManyFileOutput>(
//       {
//         method: 'POST',
//         url: '/api/cms-files/file/many/with-stream',
//         params: {
//           generateUniqueFileName: input.generateUniqueFileName,
//           fileContainerName: input.fileContainerName,
//           parentId: input.parentId,
//           ownerUserId: input.ownerUserId,
//           fileExtention: input.fileExtention,
//           extraProperties: input.extraProperties,
//           treeParentIds: input.treeParentIds,
//           fileContainerNamePublic: input.fileContainerNamePublic,
//         },
//         body: this.generateFormData(input.fileContents, 'fileContents'),
//       },
//       { apiName: this.apiName, ...config }
//     );

//   createWithStream = (input: CreateFileWithStreamInput, config?: Partial<Rest.Config>) =>
//     this.restService.request<any, CreateFileOutput>(
//       {
//         method: 'POST',
//         url: '/api/cms-files/file/with-stream',
//         params: {
//           generateUniqueFileName: input.generateUniqueFileName,
//           fileContainerName: input.fileContainerName,
//           parentId: input.parentId,
//           ownerUserId: input.ownerUserId,
//           fileExtention: input.fileExtention,
//           extraProperties: input.extraProperties,
//         },
//         body: input.content,
//       },
//       { apiName: this.apiName, ...config }
//     );

//   download = (id: string, token: string, config?: Partial<Rest.Config>) =>
//     this.restService.request<any, FileDownloadOutput>(
//       {
//         method: 'GET',
//         url: `/api/cms-files/file/${id}/download/with-bytes`,
//         params: { token },
//       },
//       { apiName: this.apiName, ...config }
//     );

//   downloadWithStream = (id: string, token: string, config?: Partial<Rest.Config>) =>
//     this.restService.request<any, Blob>(
//       {
//         method: 'GET',
//         responseType: 'blob',
//         url: `/api/cms-files/file/${id}/download/with-stream`,
//         params: { token },
//       },
//       { apiName: this.apiName, ...config }
//     );

//   get = (id: string, config?: Partial<Rest.Config>) =>
//     this.restService.request<any, FileInfoDto>(
//       {
//         method: 'GET',
//         url: `/api/cms-files/file/${id}`,
//       },
//       { apiName: this.apiName, ...config }
//     );

//   getAllFolderByFileContainerName = (
//     fileContainerName: string,
//     tenantId?: string,
//     config?: Partial<Rest.Config>
//   ) =>
//     this.restService.request<any, FolderInfoDto[]>(
//       {
//         method: 'GET',
//         url: '/api/cms-files/file/get-all-folder',
//         params: { fileContainerName, tenantId },
//       },
//       { apiName: this.apiName, ...config }
//     );

//   getConfiguration = (
//     fileContainerName: string,
//     ownerUserId: string,
//     config?: Partial<Rest.Config>
//   ) =>
//     this.restService.request<any, PublicFileContainerConfiguration>(
//       {
//         method: 'GET',
//         url: '/api/cms-files/file/configuration',
//         params: { fileContainerName, ownerUserId },
//       },
//       { apiName: this.apiName, ...config }
//     );

//   getDownloadInfo = (id: string, tenantId?: string, config?: Partial<Rest.Config>) =>
//     this.restService.request<any, FileDownloadInfoModel>(
//       {
//         method: 'GET',
//         url: `/api/cms-files/file/${id}/download-info`,
//         params: { tenantId },
//       },
//       { apiName: this.apiName, ...config }
//     );

//   getList = (input: GetFileListInput, config?: Partial<Rest.Config>) =>
//     this.restService.request<any, PagedResultDto<FileInfoDto>>(
//       {
//         method: 'GET',
//         url: '/api/cms-files/file',
//         params: {
//           parentId: input.parentId,
//           fileContainerName: input.fileContainerName,
//           ownerUserId: input.ownerUserId,
//           directoryOnly: input.directoryOnly,
//           keyword: input.keyword,
//           fromCreationTime: input.fromCreationTime,
//           toCreationTime: input.toCreationTime,
//           sorting: input.sorting,
//           skipCount: input.skipCount,
//           maxResultCount: input.maxResultCount,
//           tenantId: input.tenantId,
//           fileExtention: input.fileExtention,
//           byteSizeFrom: input.byteSizeFrom,
//           byteSizeTo: input.byteSizeTo,
//           mimeType: input.mimeType,
//         },
//       },
//       { apiName: this.apiName, ...config }
//     );

//   move = (id: string, input: MoveFileInput, config?: Partial<Rest.Config>) =>
//     this.restService.request<any, FileInfoDto>(
//       {
//         method: 'PUT',
//         url: `/api/cms-files/file/${id}/move`,
//         body: input,
//       },
//       { apiName: this.apiName, ...config }
//     );

//   update = (id: string, input: UpdateFileInput, config?: Partial<Rest.Config>) =>
//     this.restService.request<any, FileInfoDto>(
//       {
//         method: 'PUT',
//         url: `/api/cms-files/file/${id}/with-bytes`,
//         body: input,
//       },
//       { apiName: this.apiName, ...config }
//     );

//   updateInfo = (id: string, input: UpdateFileInfoInput, config?: Partial<Rest.Config>) =>
//     this.restService.request<any, FileInfoDto>(
//       {
//         method: 'PUT',
//         url: `/api/cms-files/file/${id}/info`,
//         body: input,
//       },
//       { apiName: this.apiName, ...config }
//     );

//   updateWithStream = (
//     id: string,
//     input: UpdateFileWithStreamInput,
//     config?: Partial<Rest.Config>
//   ) =>
//     this.restService.request<any, FileInfoDto>(
//       {
//         method: 'PUT',
//         url: `/api/cms-files/file/${id}/with-stream`,
//         params: { fileExtention: input.fileExtention, extraProperties: input.extraProperties },
//         body: input.content,
//       },
//       { apiName: this.apiName, ...config }
//     );
//   getPagingDtoByRequest = (request: FilesRequest, config?: Partial<Rest.Config>) =>
//     this.restService.request<any, PagedResultDto<FileInfoDto>>(
//       {
//         method: 'POST',
//         url: '/api/cms-files/file/get-paging-dto',
//         body: request,
//       },
//       { apiName: this.apiName, ...config }
//     );
//   getFilesGoogleDrive = (request: GoogleDriveFilesRequest, config?: Partial<Rest.Config>) =>
//     this.restService.request<any, GoogleDriveFilesItem[]>(
//       {
//         method: 'GET',
//         url: '/api/cms-files/file/get-files-googledrive',
//         params: {
//           name: request.name,
//           listMimeType: request.listMimeType,
//         },
//       },
//       { apiName: this.apiName, ...config }
//     );

//   reName = (id: string, input: ReNameFifoInput, config?: Partial<Rest.Config>) =>
//     this.restService.request<any, boolean>(
//       {
//         method: 'PUT',
//         url: `/api/cms-files/file/${id}/reName`,
//         body: input,
//       },
//       { apiName: this.apiName, ...config }
//     );

//   createFolder = (input: CreateFileInput, config?: Partial<Rest.Config>) =>
//     this.restService.request<any, CreateFileOutput>(
//       {
//         method: 'POST',
//         url: '/api/cms-files/file/create-folder',
//         body: input,
//       },
//       { apiName: this.apiName, ...config }
//     );

//   getAllTreeFolderByCacheByFileContainerNameAndIdOption = (
//     fileContainerName: string,
//     oWnerUserId: string,
//     idOption: string,
//     config?: Partial<Rest.Config>
//   ) =>
//     this.restService.request<any, TreeFolderCacheDto[]>(
//       {
//         method: 'GET',
//         url: `/api/cms-files/file/${fileContainerName}/${oWnerUserId}/get-all-file-tree`,
//         params: { idOption },
//       },
//       { apiName: this.apiName, ...config }
//     );

//   //#region Các hàm dùng cho biên tập Fck public
//   moveToFolderByRequest = (request: FileRemoveToFolderRequest, config?: Partial<Rest.Config>) =>
//     this.restService.request<any, MoveToFolderResponse>(
//       {
//         method: 'PUT',
//         url: '/api/cms-files/file/move-to-folder',
//         body: request,
//       },
//       { apiName: this.apiName, ...config }
//     );

//   delete = (id: string, config?: Partial<Rest.Config>) =>
//     this.restService.request<any, void>(
//       {
//         method: 'DELETE',
//         url: `/api/cms-files/file/${id}`,
//       },
//       { apiName: this.apiName, ...config }
//     );

//   deletes = (ids: string[], config?: Partial<Rest.Config>) =>
//     this.restService.request<any, void>(
//       {
//         method: 'DELETE',
//         url: '/api/cms-files/file/delete-many',
//         params: { ids },
//       },
//       { apiName: this.apiName, ...config }
//     );

//   CreateManyWithStreamFckAsync = (
//     input: CreateManyFileWithStreamInput,
//     config?: Partial<Rest.Config>
//   ) =>
//     this.restService.request<any, CreateManyFileOutput>(
//       {
//         method: 'POST',
//         url: '/api/cms-files/file/many/with-stream-fck',
//         params: {
//           generateUniqueFileName: input.generateUniqueFileName,
//           fileContainerName: input.fileContainerName,
//           parentId: input.parentId,
//           ownerUserId: input.ownerUserId,
//           fileExtention: input.fileExtention,
//           extraProperties: input.extraProperties,
//           treeParentIds: input.treeParentIds,
//           fileContainerNamePublic: input.fileContainerNamePublic,
//         },
//         body: this.generateFormData(input.fileContents, 'fileContents'),
//       },
//       { apiName: this.apiName, ...config }
//     );

//   removeFolderByRequest = (request: FolderRemoveDto, config?: Partial<Rest.Config>) =>
//     this.restService.request<any, RemoveFolderResponse>(
//       {
//         method: 'PUT',
//         url: '/api/cms-files/file/remove-folder',
//         body: request,
//       },
//       { apiName: this.apiName, ...config }
//     );
//   //#endregion

//   //#region Các hàm dùng cho file cá nhân
//   moveToFolderPrivate = (request: FileRemoveToFolderRequest, config?: Partial<Rest.Config>) =>
//     this.restService.request<any, MoveToFolderResponse>(
//       {
//         method: 'PUT',
//         url: '/api/cms-files/file/move-to-folder-private',
//         body: request,
//       },
//       { apiName: this.apiName, ...config }
//     );

//   deletePrivate = (id: string, config?: Partial<Rest.Config>) =>
//     this.restService.request<any, void>(
//       {
//         method: 'DELETE',
//         url: `/api/cms-files/file/${id}/delete-private`,
//       },
//       { apiName: this.apiName, ...config }
//     );

//   deleteManyPrivate = (ids: string[], config?: Partial<Rest.Config>) =>
//     this.restService.request<any, void>(
//       {
//         method: 'DELETE',
//         url: '/api/cms-files/file/delete-many-private',
//         params: { ids },
//       },
//       { apiName: this.apiName, ...config }
//     );

//   removeFolderPrivate = (request: FolderRemoveDto, config?: Partial<Rest.Config>) =>
//     this.restService.request<any, RemoveFolderResponse>(
//       {
//         method: 'PUT',
//         url: '/api/cms-files/file/remove-folder-private',
//         body: request,
//       },
//       { apiName: this.apiName, ...config }
//     );

//   getAllTreeFolderPrivateByCacheByFileContainerNameAndOWnerUserIdAndIdOption = (
//     fileContainerName: string,
//     oWnerUserId: string,
//     idOption: string,
//     config?: Partial<Rest.Config>
//   ) =>
//     this.restService.request<any, TreeFolderCacheDto[]>(
//       {
//         method: 'GET',
//         url: `/api/cms-files/file/${fileContainerName}/${oWnerUserId}/get-all-file-tree-private`,
//         params: { idOption },
//       },
//       { apiName: this.apiName, ...config }
//     );

//   getListPrivate = (input: GetFileListInput, config?: Partial<Rest.Config>) =>
//     this.restService.request<any, PagedResultDto<FileInfoDto>>(
//       {
//         method: 'GET',
//         url: '/api/cms-files/file/private',
//         params: {
//           parentId: input.parentId,
//           fileContainerName: input.fileContainerName,
//           ownerUserId: input.ownerUserId,
//           directoryOnly: input.directoryOnly,
//           keyword: input.keyword,
//           fromCreationTime: input.fromCreationTime,
//           toCreationTime: input.toCreationTime,
//           tenantId: input.tenantId,
//           fileExtention: input.fileExtention,
//           byteSizeFrom: input.byteSizeFrom,
//           byteSizeTo: input.byteSizeTo,
//           mimeType: input.mimeType,
//           sorting: input.sorting,
//           skipCount: input.skipCount,
//           maxResultCount: input.maxResultCount,
//         },
//       },
//       { apiName: this.apiName, ...config }
//     );

//   createFolderPrivate = (input: CreateFileInput, config?: Partial<Rest.Config>) =>
//     this.restService.request<any, CreateFileOutput>(
//       {
//         method: 'POST',
//         url: '/api/cms-files/file/create-folder-private',
//         body: input,
//       },
//       { apiName: this.apiName, ...config }
//     );

//   reNamePrivateFileByIdAndInput = (
//     id: string,
//     input: ReNameFifoInput,
//     config?: Partial<Rest.Config>
//   ) =>
//     this.restService.request<any, boolean>(
//       {
//         method: 'PUT',
//         url: `/api/cms-files/file/${id}/rename-private`,
//         body: input,
//       },
//       { apiName: this.apiName, ...config }
//     );

//   getAllOwners = (config?: Partial<Rest.Config>) =>
//     this.restService.request<any, IdentityUserInFileDto[]>(
//       {
//         method: 'GET',
//         url: '/api/cms-files/file/get-all-owner',
//       },
//       { apiName: this.apiName, ...config }
//     );

//   sharePrivateByRequest = (request: SharePrivateRequest, config?: Partial<Rest.Config>) =>
//     this.restService.request<any, boolean>(
//       {
//         method: 'PUT',
//         url: '/api/cms-files/file/share-private',
//         body: request,
//       },
//       { apiName: this.apiName, ...config }
//     );

//   getAllInforUserSharedByCache = (keyword: string, config?: Partial<Rest.Config>) =>
//     this.restService.request<any, InforUserSharedDto[]>(
//       {
//         method: 'GET',
//         url: '/api/cms-files/file/Get-All-Infor-User-Shared-By-Cache',
//         params: { keyword },
//       },
//       { apiName: this.apiName, ...config }
//     );
//   //#endregion

//   //#region Dung cho kho files chia se
//   getListInforByShared = (input: GetFileListInput, config?: Partial<Rest.Config>) =>
//     this.restService.request<any, PagedResultDto<FileInfoDto>>(
//       {
//         method: 'GET',
//         url: '/api/cms-files/file/get-list-infor-by-shared',
//         params: {
//           parentId: input.parentId,
//           fileContainerName: input.fileContainerName,
//           ownerUserId: input.ownerUserId,
//           directoryOnly: input.directoryOnly,
//           keyword: input.keyword,
//           fromCreationTime: input.fromCreationTime,
//           toCreationTime: input.toCreationTime,
//           tenantId: input.tenantId,
//           fileExtention: input.fileExtention,
//           byteSizeFrom: input.byteSizeFrom,
//           byteSizeTo: input.byteSizeTo,
//           mimeType: input.mimeType,
//           sorting: input.sorting,
//           skipCount: input.skipCount,
//           maxResultCount: input.maxResultCount,
//         },
//       },
//       { apiName: this.apiName, ...config }
//     );
//   //#endregion

//   downloadWithIdStream = (id: string, config?: Partial<Rest.Config>) =>
//     this.restService.request<any, Blob>(
//       {
//         method: 'GET',
//         responseType: 'blob',
//         url: `/api/cms-files/file/${id}/download/with-stream-by-id`,
//         params: {},
//       },
//       { apiName: this.apiName, ...config }
//     );

//   refreshCacheData = (fileContainerName: string, config?: Partial<Rest.Config>) =>
//     this.restService.request<any, void>(
//       {
//         method: 'GET',
//         url: `/api/cms-files/file/${fileContainerName}/refresh-cache-data`,
//       },
//       { apiName: this.apiName, ...config }
//     );

//   addFromByLinksByInput = (input: AddFileByLinksModel, config?: Partial<Rest.Config>) =>
//     this.restService.request<any, boolean>(
//       {
//         method: 'POST',
//         url: '/api/cms-files/file/add-from-links',
//         body: input,
//       },
//       { apiName: this.apiName, ...config }
//     );

//   createFileHTMLByFileDocByInput = (
//     input: CreateManyFileWithStreamInput,
//     config?: Partial<Rest.Config>
//   ) =>
//     this.restService.request<any, ReadTextByFileHtmlResponse>(
//       {
//         method: 'POST',
//         responseType: 'json',
//         url: '/api/cms-files/file/many/Create-File-HTML-By-File-Doc',
//         params: {
//           generateUniqueFileName: input.generateUniqueFileName,
//           fileContainerName: input.fileContainerName,
//           parentId: input.parentId,
//           ownerUserId: input.ownerUserId,
//           fileExtention: input.fileExtention,
//           treeParentIds: input.treeParentIds,
//           fileContainerNamePublic: input.fileContainerNamePublic,
//           extraProperties: input.extraProperties,
//         },
//         body: this.generateFormData(input.fileContents, 'fileContents'),
//       },
//       { apiName: this.apiName, ...config }
//     );

//   //#region get File by FullPathServer
//   GetDownloadInfoByFullPathServerAsync = (fullPathServer: string, config?: Partial<Rest.Config>) =>
//     this.restService.request<any, FileDownloadInfoModel>(
//       {
//         method: 'GET',
//         url: `/api/cms-files/file/Get-Download-Info-ByFullPathServer-Async`,
//         params: { fullPathServer },
//       },
//       { apiName: this.apiName, ...config }
//     );
//   //#endregion

//   restoreArticlesByIds = (ids: string[], config?: Partial<Rest.Config>) =>
//     this.restService.request<any, IActionResult>(
//       {
//         method: 'POST',
//         url: '/api/cms-files/file/Restore-Articles-By-Ids',
//         body: ids,
//       },
//       { apiName: this.apiName, ...config }
//     );

//   //#region Xóa hoặc khôi phục File, Folder
//   getDeletedArticle = (request: FilesRequest, config?: Partial<Rest.Config>) =>
//     this.restService.request<any, PagedResultDto<FileInfoDto>>(
//       {
//         method: 'GET',
//         url: '/api/cms-files/file/get-deleted-Article',
//         params: {
//           field: request.Field,
//           fieldOption: request.FieldOption,
//           pageSize: request.PageSize,
//           pageNumber: request.pageNumber,
//           keyword: request.Keyword,
//           searchInField: request.SearchInField,
//           parentId: request.ParentId,
//           deleteTimeFrom: request.deleteTimeFrom,
//           deleteTimeTo: request.deleteTimeTo,
//         },
//       },
//       { apiName: this.apiName, ...config }
//     );

//   getAllDeletedArticles = (config?: Partial<Rest.Config>) =>
//     this.restService.request<any, FileInfoDto[]>(
//       {
//         method: 'GET',
//         url: '/api/cms-files/file/get-All-Deleted-Articles',
//       },
//       { apiName: this.apiName, ...config }
//     );

//   deleteDirectArticlesByIds = (ids: string[], config?: Partial<Rest.Config>) =>
//     this.restService.request<any, IActionResult>(
//       {
//         method: 'DELETE',
//         url: '/api/cms-files/file/Delete-Direct-Articles-By-Ids',
//         params: { ids },
//       },
//       { apiName: this.apiName, ...config }
//     );
//   //#endregion
//   constructor(private restService: RestService) {}
// }
