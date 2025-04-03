import { Component, OnInit, ViewContainerRef } from '@angular/core';
// import { FileBaseInfoDto, FileInfoDto } from '@proxy/CMSFilesService/cmsfiles/files/dtos';
// import { SlideType } from '@proxy/newServices/mstin-duc/news-service/commons/slide-type.enum';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
//import { TypeUploadFck } from 'src/app/pages/file-management/commons/uploadParams';
//import { FckEditorManagementComponent } from 'src/app/pages/file-management/fck-editor-management/fck-editor-management.component';
import { environment as env } from '../../../../../environments/environment';
import { ToasterService } from '@abp/ng.theme.shared';
// import { MessageChooseSlide } from 'src/app/shared/interfaces/message';
@Component({
  standalone:false,
  selector: 'app-choose-slides-editor',
  templateUrl: './choose-slides-editor.component.html',
  styleUrl: './choose-slides-editor.component.scss',
})
export class ChooseSlidesEditorComponent implements OnInit {
  ngOnInit(): void {
    // this.onLoadListSlides();
  }
  constructor(
    private nzModalRef: NzModalRef,
    private viewContainerRef: ViewContainerRef,
    private modalService: NzModalService,
    public toasterService: ToasterService
  ) {}
  isSpinning: boolean = false;
  listSlides: Array<{
    label: string;
    compare: boolean;
    imageThumbs: string;
    order: number;
    slideType: any;
  }> = [];
  valueSlide: {
    label: string;
    compare: boolean;
    imageThumbs: string;
    order: number;
    slideType: any;
  };
  apiUrl = env.apis.default.url;
  onChangSelectFileThumbRadio(event: {
    label: string;
    compare: boolean;
    imageThumbs: string;
    order: number;
    slideType: any;
  }): void {
    console.log(JSON.stringify(event));
  }
  onBack(): void {
    this.nzModalRef.destroy();
  }
  // onLoadListSlides(): void {
  //   this.listSlides.push({
  //     compare: true,
  //     imageThumbs: '/assets/tmps/imgs/compare.PNG',
  //     label: 'Image Comparison Slider',
  //     order: 1,
  //     slideType: SlideType.COMPARISON,
  //   });
  //   this.listSlides.push({
  //     compare: false,
  //     imageThumbs: '/assets/tmps/imgs/gallery.PNG',
  //     label: 'Slide Gallery',
  //     order: 2,
  //     slideType: SlideType.SLIDE_GALLERY,
  //   });
  //   this.listSlides.push({
  //     compare: false,
  //     imageThumbs: '/assets/tmps/imgs/mediapage.PNG',
  //     label: 'Slide MediaPage',
  //     order: 3,
  //     slideType: SlideType.SLIDE_MEDIAPAGE,
  //   });
  //   this.listSlides.push({
  //     compare: false,
  //     imageThumbs: '/assets/tmps/imgs/rightTabDask.PNG',
  //     label: 'Slide RightTabDask',
  //     order: 4,
  //     slideType: SlideType.SLIDE_RIGHTTABDASK,
  //   });
  //   this.listSlides.push({
  //     compare: false,
  //     imageThumbs: '/assets/tmps/imgs/carouselGallery.PNG',
  //     label: 'Caroural Gallery',
  //     order: 5,
  //     slideType: SlideType.CAROURAL_GALLERY,
  //   });
  //   this.listSlides.push({
  //     compare: false,
  //     imageThumbs: '/assets/tmps/imgs/list.PNG',
  //     label: 'Caroural List',
  //     order: 6,
  //     slideType: SlideType.CAROURAL_LIST,
  //   });
  //   this.listSlides.push({
  //     compare: false,
  //     imageThumbs: '/assets/tmps/imgs/box9.PNG',
  //     label: 'Gallery list image',
  //     order: 7,
  //     slideType: SlideType.GALLERY_LISTIMAGE,
  //   });
  // }
  //#region Chọn ảnh
  ImageInSlides: Array<{ lable?: string; order?: number; link?: string }> = [];
  // onChooseImages(): void {
  //   const modalConfig = {
  //     nzTitle: '',
  //     nzContent: FckEditorManagementComponent,
  //     nzViewContainerRef: this.viewContainerRef,
  //     nzBackdrop: false,
  //     nzWidth: '92%',
  //     nzFooter: null,
  //     nzCentered: true,
  //     nzClosable: true,
  //     nzKeyboard: false,
  //   };
  //   const modalRef = this.modalService.create(modalConfig);
  //   const instanceRef = modalRef.getContentComponent();
  //   instanceRef.manyFiles = true;
  //   instanceRef.typeUploadFck = TypeUploadFck.IMAGE;
  //   modalRef.afterClose.subscribe((data: FileInfoDto[]) => {
  //     if (data.length > 0) {
  //       data.forEach(file => {
  //         let findIndexExits = this.ImageInSlides.findIndex(a => a.link === file.fullPathServer);
  //         if (findIndexExits < 0) {
  //           this.ImageInSlides.push({
  //             lable: file.fileName,
  //             link: file.fullPathServer,
  //             order: this.ImageInSlides.length + 1,
  //           });
  //         }
  //       });
  //     }
  //   });
  // }
  //#endregion

  changTitle(newTitle: string, index: number) {
    this.ImageInSlides[index].lable = newTitle;
  }

  deleteItem(link: string): void {
    this.ImageInSlides.forEach((itm, index) => {
      if (itm.link === link) this.ImageInSlides.splice(index, 1);
    });
  }

  validateTitles(): boolean {
    let isValid = true;
    this.ImageInSlides.forEach((item, index) => {
      if (!item.lable) {
        isValid = false;
      } else if (item.lable.length > 500) {
        isValid = false;
      }
    });
    return isValid;
  }

  changOrder(event: any, index: number) {
    this.ImageInSlides[index].order = event;
  }

  //#region On complete
  // onComplete(): void {
  //   if (this.ImageInSlides?.length > 1) {
  //     let data: FileBaseInfoDto[] = [];
  //     this.ImageInSlides.sort((a, b) => a.order - b.order).forEach(file => {
  //       data.push({
  //         fileName: file.lable,
  //         fullPathServer: file.link,
  //       });
  //     });
  //     let results = {} as MessageChooseSlide;
  //     results.Data = data;
  //     results.Success = true;
  //     results.Type = this.valueSlide.slideType;
  //     this.nzModalRef.close(results);
  //   } else {
  //     this.toasterService.warn('Cần chọn ít nhất 2 ảnh để hiển thị dạng Slide');
  //     return;
  //   }
  // }
  //#endregion
}
