import { ConfigStateService } from '@abp/ng.core';
import { ToasterService } from '@abp/ng.theme.shared';
import { Component } from '@angular/core';
// import { FileExtention, FileService } from '@proxy/CMSFilesService/cmsfiles/files';
// import { CreateManyFileWithStreamInput } from '@proxy/CMSFilesService/cmsfiles/files/dtos';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { finalize, Observable, Observer } from 'rxjs';
// import { TypeUploadFck } from 'src/app/pages/file-management/commons/uploadParams';
@Component({
  standalone:false,
  selector: 'app-read-content-from-file-doc',
  templateUrl: './read-content-from-file-doc.component.html',
  styleUrl: './read-content-from-file-doc.component.scss',
})
export class ReadContentFromFileDocComponent {
  isSpinning: boolean = false;
  files: File[] = [];
  typeUploadFck = "TypeUploadFck";
  nzAccept: string = '.doc, .docx';
  nzLimit: number = 1;
  nzSize: number = 30 * 1024;
  constructor(
    private nzModalRef: NzModalRef,
    // private fileService: FileService,
    private toasterService: ToasterService,
    private configStateService: ConfigStateService
  ) {}

  OnBeforeUpload = (file: File, _fileList: File[]): Observable<boolean> =>
    new Observable((observer: Observer<boolean>) => {
      let ext = file.name.substring(file.name.lastIndexOf('.'));
      let arr = this.nzAccept.replace(new RegExp(' ', 'g'), '').split(',');
      let find = arr.filter(a => a.toLowerCase() === ext.toLowerCase());
      const isJpgOrPng = find.length > 0;
      if (!isJpgOrPng) {
        this.toasterService.error('Định dạng file không hỗ trợ.');
        observer.complete();
        return;
      }

      const isLt2M = file.size! / 1024 / 1024 < this.nzSize;
      if (!isLt2M) {
        this.toasterService.error(`Dung lượng 1 file không vượt quá ${this.nzSize} Mb`);
        observer.complete();
        return;
      }

      if (this.files.length > 0) {
        if (this.files.findIndex(a => a.name === file.name) >= 0) {
          this.toasterService.error('Tên file đã tồn tại. Vui lòng kiểm tra lại.');
          observer.complete();
          return;
        }

        if (this.files.length === 1) {
          this.toasterService.error(
            `Số lượng mỗi lần tải chỉ tối đa 01 file. Vui lòng kiểm tra lại.`
          );
          observer.complete();
          return;
        }
      }

      this.files.push(file);
      observer.next(isJpgOrPng && isLt2M);
      observer.complete();
    });

  handleUpload(): void {
    // this.isSpinning = true;
    // let fileExtention = FileExtention.File;
    // const request: CreateManyFileWithStreamInput = {
    //   fileContainerName: 'env.fileContainerNamePublic',
    //   fileContents: this.files,
    //   fileExtention: fileExtention,
    //   generateUniqueFileName: false,
    //   ownerUserId: this.configStateService.getOne('currentUser').id,
    //   parentId: null,
    //   treeParentIds: '',
    //   fileContainerNamePublic: 'env.fileContainerNamePublic',
    // };
    // this.fileService
    //   .createFileHTMLByFileDocByInput(request)
    //   .pipe(
    //     finalize(() => {
    //       this.isSpinning = false;
    //     })
    //   )
    //   .subscribe({
    //     next: response => {
    //       if (response !== null) {
    //         this.nzModalRef.close({
    //           Success: true,
    //           Title: '',
    //           Obj: response,
    //         });
    //       } else {
    //         this.toasterService.error('Có lỗi upload file.');
    //       }
    //     },
    //     error: err => {
    //       console.log(JSON.stringify(err));
    //     },
    //     complete: () => {},
    //   });
  }

  OnRemove = (file: File): Observable<boolean> =>
    new Observable((observer: Observer<boolean>) => {
      this.files.forEach((itm, index) => {
        if (itm.name.toLocaleLowerCase() === file.name.toLocaleLowerCase()) {
          this.files.splice(index, 1);
        }
      });
      observer.next(true);
      observer.complete();
    });

  OnClose(): void {
    this.nzModalRef.destroy();
  }
}
