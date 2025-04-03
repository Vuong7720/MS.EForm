import { ToasterService } from '@abp/ng.theme.shared';
import { Component, OnInit, ViewContainerRef } from '@angular/core';
// import { TemplateNews } from '@proxy/newServices/mstin-duc/news-service/commons';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { environment as env } from '../../../../../environments/environment';
// import { MessageChooseTemplateNew } from 'src/app/shared/interfaces/message';
// import { NewLienquanComponent } from 'src/app/pages/new-management/new-manegement/new-lienquan/new-lienquan.component';
// import { NewRelateInfoDto } from '@proxy/newServices/mstin-duc/news-service/models/new';
@Component({
  standalone:false,
  selector: 'app-choose-temp-news',
  templateUrl: './choose-temp-news.component.html',
  styleUrl: './choose-temp-news.component.scss',
})
export class ChooseTempNewsComponent implements OnInit {
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
  titleBox: string = '';
  listSlides: Array<{
    label: string;
    compare: boolean;
    imageThumbs: string;
    order: number;
    slideType;
  }> = [];
  valueSlide: {
    label: string;
    compare: boolean;
    imageThumbs: string;
    order: number;
    slideType;
  };
  apiUrl = env.apis.default.url;
  templateNews = "TemplateNews";
  onChangSelectFileThumbRadio(event: {
    label: string;
    compare: boolean;
    imageThumbs: string;
    order: number;
    slideType;
  }): void {
    console.log(JSON.stringify(event));
  }
  onBack(): void {
    this.nzModalRef.destroy();
  }
  // onLoadListSlides(): void {
  //   this.listSlides.push({
  //     compare: true,
  //     imageThumbs: '/assets/tmps/imgs/box2.PNG',
  //     label: 'Image Comparison Slider',
  //     order: 1,
  //     slideType: "TemplateNews.TMPTITLE",
  //   });
  //   this.listSlides.push({
  //     compare: false,
  //     imageThumbs: '/assets/tmps/imgs/box3.PNG',
  //     label: 'Slide Gallery',
  //     order: 2,
  //     slideType: "TemplateNews.TMPTITLEDESCRIPTION",
  //   });
  //   this.listSlides.push({
  //     compare: false,
  //     imageThumbs: '/assets/tmps/imgs/box4.PNG',
  //     label: 'Slide MediaPage',
  //     order: 3,
  //     slideType: "TemplateNews.TMPTITLEDESCRIPTIONIMAGE",
  //   });
  //   this.listSlides.push({
  //     compare: false,
  //     imageThumbs: '/assets/tmps/imgs/box5.PNG',
  //     label: 'Box 04',
  //     order: 4,
  //     slideType: TemplateNews.TMPBOX5,
  //   });
  //   this.listSlides.push({
  //     compare: false,
  //     imageThumbs: '/assets/tmps/imgs/box6.PNG',
  //     label: 'Box 05',
  //     order: 5,
  //     slideType: TemplateNews.TMPBOX6,
  //   });
  //   this.listSlides.push({
  //     compare: false,
  //     imageThumbs: '/assets/tmps/imgs/box7.PNG',
  //     label: 'Box 06',
  //     order: 6,
  //     slideType: TemplateNews.TMPBOX7,
  //   });
  //   this.listSlides.push({
  //     compare: false,
  //     imageThumbs: '/assets/tmps/imgs/box8.PNG',
  //     label: 'Box 08',
  //     order: 6,
  //     slideType: TemplateNews.TMPBOX8,
  //   });
  // }
  //#region Chọn bài viết
  // onChooseBaiViets(): void {
  //   const modalConfig = {
  //     nzTitle: '',
  //     nzContent: NewLienquanComponent,
  //     nzViewContainerRef: this.viewContainerRef,
  //     nzBackdrop: false,
  //     nzFooter: null,
  //     nzCentered: true,
  //     nzClosable: true,
  //     nzKeyboard: false,
  //     nzClassName: 'w-modal-dialog-listnew',
  //   };
  //   const modalRef = this.modalService.create(modalConfig);
  //   const instanceRef = modalRef.getContentComponent();
  //   instanceRef.newRequests.newId = '';
  //   instanceRef.newsSelected = this.newRelateInfos ?? [];
  //   modalRef.afterClose.subscribe((result: NewRelateInfoDto[]) => {
  //     if (result !== undefined && result.length > 0) {
  //       this.newRelateInfos = result;
  //     }
  //   });
  // }
  newRelateInfos: any[] = [];
  //#endregion

  // changTitle(newTitle: string, index: number) {
  //   this.newRelateInfos[index].title = newTitle;
  // }

  // changDes(newDesc: string, index: number) {
  //   this.newRelateInfos[index].description = newDesc;
  // }

  // deleteItem(id: string): void {
  //   this.newRelateInfos.forEach((itm, index) => {
  //     if (itm.id === id) this.newRelateInfos.splice(index, 1);
  //   });
  // }

  // validateTitles(): boolean {
  //   let isValid = true;
  //   this.newRelateInfos.forEach((item, index) => {
  //     if (!item.title) {
  //       isValid = false;
  //     } else if (item.title.length > 500) {
  //       isValid = false;
  //     }
  //   });
  //   return isValid;
  // }

  // changOrder(event: any, index: number) {
  //   this.newRelateInfos[index].order = event;
  // }

  // //#region On complete
  // onComplete(): void {
  //   if (this.newRelateInfos?.length > 0) {
  //     let results = {} as MessageChooseTemplateNew;
  //     results.Data = this.newRelateInfos.sort((a, b) => a.order - b.order);
  //     results.Success = true;
  //     results.Type = this.valueSlide.slideType;
  //     results.TitleBox = this.titleBox;
  //     this.nzModalRef.close(results);
  //   } else {
  //     this.toasterService.warn('Cần chọn ít nhất 01 bài viết để hiển thị.');
  //     return;
  //   }
  // }

  GetImageUrl(path: string): string {
    if (path) {
      if (path.startsWith('http://') || path.startsWith('https://')) return path;
      return `${env}${path}`;
    } else {
      return '';
    }
  }
  //#endregion
}
