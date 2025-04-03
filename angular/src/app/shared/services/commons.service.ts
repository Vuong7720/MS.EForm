import { Injectable, NgModule } from '@angular/core';
import { AbpLocalStorageService, LocalizationService } from '@abp/ng.core';
import { environment as env } from '../../../environments/environment';
// import { constDate } from '../enums/regexException';
// import { POST, PUT, DELETE } from '../enums/methodConst';
// import { jwtDecode } from 'jwt-decode';
// import { OrganizationUnitDto } from '../interfaces/organizationUnitDto';
// import { UserInfoToken } from '../interfaces/userInfoToken';
// import { AppSettings } from '../interfaces/appSettings';
import { CurrencyPipe } from '@angular/common';
import { FileBaseInfoDto } from '../services/files/dtos';
// import { NewRelateInfoDto } from '@proxy/newServices/mstin-duc/news-service/models/new';
// import * as moment from 'moment';
@Injectable({
  providedIn: 'root',
})
// @NgModule({
//   providers: [CurrencyPipe] // 👈 Thêm vào đây
// })
export class CommonsService {
  constructor(
    private localizationService: LocalizationService,
    private abpLocalService: AbpLocalStorageService,
    private currencyPipe: CurrencyPipe
  ) {
    //this.setUserInfoByKey(null);
  }

  getLocalization(key: string): string {
    let value = '';
    this.localizationService.get(key).subscribe(a => (value = a));
    return value;
  }

  getImageUrl(path: string): string {
    let value = '';
    if (path) {
      if (path.startsWith('http://') || path.startsWith('https://')) return path;
      else if (path.startsWith('/')) {
        value = `${env.baseUrlFile}${path}`;
      }
    }
    return value;
  }

  getDateByString(input: string): string {
    let dim = 'constDate.DELIMITER;'
    let date = new Date(input);
    return `${date.getDate()}${dim}${date.getMonth() + 1}${dim}${date.getFullYear()}`;
  }

  getFckFileImage(url: string, title: string): string {
    let getImage = `<p><figure class="image"><img alt="${title}" title="${title}" src="${url}"/><figcaption>${title}</figcaption></figure></p>`;
    return getImage;
  }

  getFckFileOther(url: string, title: string): string {
    let videoId = this.GetIdByLinkYouTube(url);
    let getOther = '';
    if (videoId?.length > 0) {
      getOther = `<iframe src="//www.youtube.com/embed/${videoId}" style="width:100%; height:500px;" frameborder="0" allowfullscreen></iframe>`;
    } else getOther = `<p><a href="${url}">${title}</a></p>`;
    return getOther;
  }

  getFckFileMediaMP3(url: string): string {
    let getOther = `<p style="text-align:center;"><audio controls><source src="${url}" type="audio/mpeg" /></audio></p>`;
    return getOther;
  }

  getFckFileMediaMP4(url: string): string {
    let getOther = `<p style="text-align:center;"><video controls><source src="${url}" type="video/mp4" /></video></p>`;
    return getOther;
  }

  getFckFileMediaPdf(url: string): string {
    let getOther = `<p style="text-align:center;"><object data="${url}" type="application/pdf" style="width:100%; height:500px;"></object></p>`;
    return getOther;
  }

  getFckFileMediaOffice(url: string): string {
    let urlOffice = `https://view.officeapps.live.com/op/embed.aspx?src=${url}`;
    let getOther = `<p style="text-align:center;"><iframe src="${urlOffice}" style="width:100%; height:500px;" frameborder="0"></iframe></p>`;
    return getOther;
  }

  unicodeToAscii(str: string): string {
    str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, 'a');
    str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, 'e');
    str = str.replace(/ì|í|ị|ỉ|ĩ/g, 'i');
    str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, 'o');
    str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, 'u');
    str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, 'y');
    str = str.replace(/đ/g, 'd');
    str = str.replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g, 'A');
    str = str.replace(/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/g, 'E');
    str = str.replace(/Ì|Í|Ị|Ỉ|Ĩ/g, 'I');
    str = str.replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, 'O');
    str = str.replace(/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g, 'U');
    str = str.replace(/Ỳ|Ý|Ỵ|Ỷ|Ỹ/g, 'Y');
    str = str.replace(/Đ/g, 'D');
    str = str.replace(/[^a-zA-Z0-9\s]/g, '');
    str = str.replace(/\s+/g, '-');
    return str;
  }

  getList(data: string[]): string {
    if (data.length == 0) return '';
    let list = '<ul class="list-group">';
    data.forEach(itm => {
      list += `<li class="list-group-item text-start">${itm}</li>`;
    });
    list += '</ul>';
    return list;
  }

  getInnerHTML(val: any) {
    let without_html = val.replace(/<(?:.|\n)*?>/gm, '');
    return without_html;
  }

  getBackgroupByCode(codeStatus?: number): string {
    if (!codeStatus) return '';
    else {
      if (codeStatus === 200)
        return `<span class="badge badge-light-success fs-8 fw-bold">${codeStatus}</span>`;
      else if (
        codeStatus === 401 ||
        codeStatus === 403 ||
        codeStatus === 404 ||
        codeStatus === 500 ||
        codeStatus === 501 ||
        codeStatus === 405 ||
        codeStatus === 409 ||
        codeStatus === 415
      )
        return `<span class="badge badge-light-danger fs-8 fw-bold">${codeStatus}</span>`;
      else return `<span class="badge badge-light-warning fs-8 fw-bold">${codeStatus}</span>`;
    }
  }

  // getBackgroupByMethod(method: string): string {
  //   if (method === POST || method === PUT)
  //     return `<span class="badge badge-light-success fs-8 fw-bold">${method}</span>`;
  //   else if (method === DELETE)
  //     return `<span class="badge badge-light-danger fs-8 fw-bold">${method}</span>`;
  //   else return `<span class="badge badge-light-warning fs-8 fw-bold">${method}</span>`;
  // }

  // getOrganizationUnitByKey(): OrganizationUnitDto {
  //   let results = {} as OrganizationUnitDto;
  //   let tokenInfor = jwtDecode(this.abpLocalService.getItem('access_token'));
  //   if (tokenInfor) {
  //     results.OrganizationUnitCode = tokenInfor['OrganizationUnitCode'];
  //     results.OrganizationUnitId = tokenInfor['OrganizationUnitId'];
  //     results.OrganizationUnitName = tokenInfor['OrganizationUnitName'];
  //   }
  //   return results;
  // }

  getAvatar(path: string): string {
    let value = '';
    if (path) {
      if (path.startsWith('http://') || path.startsWith('https://')) return path;
      else if (path.startsWith('/')) {
        value = `${env.baseUrlFile}${path}`;
      }
    } else {
      value = '/assets/images/avatar.png';
    }
    return value;
  }

  getImageDefault(path: string): string {
    let value = '';
    if (path) {
      if (path.startsWith('http://') || path.startsWith('https://')) return path;
      else if (path.startsWith('/')) {
        value = `${env.baseUrlFile}${path}`;
      }
    } else {
      value = '/assets/images/no-image.png';
    }
    return value;
  }

  // getUserId(): string {
  //   let tokenInfor = jwtDecode(this.abpLocalService.getItem('access_token'));
  //   if (tokenInfor) {
  //     return tokenInfor['sub'];
  //   }
  //   return '';
  // }

  // setUserInfoByKey(userInfo?: UserInfoToken): void {
  //   if (userInfo !== null) {
  //     this.abpLocalService.removeItem(AppSettings.KEY_LOCALSTORAGE_USERINFO);
  //     this.abpLocalService.setItem(AppSettings.KEY_LOCALSTORAGE_USERINFO, JSON.stringify(userInfo));
  //   } else {
  //     if (!this.abpLocalService.getItem(AppSettings.KEY_LOCALSTORAGE_USERINFO)) {
  //       let results = {} as UserInfoToken;
  //       let tokenInfor = jwtDecode(this.abpLocalService.getItem('access_token'));
  //       if (tokenInfor) {
  //         results.OrganizationUnitCode = tokenInfor['OrganizationUnitCode'];
  //         results.OrganizationUnitId = tokenInfor['OrganizationUnitId'];
  //         results.OrganizationUnitName = tokenInfor['OrganizationUnitName'];
  //         results.Avatar = tokenInfor['Avatar'];
  //         results.BirthDay = tokenInfor['BirthDay'];
  //         results.PhoneNumber = tokenInfor['phone_number'];
  //         results.Name = tokenInfor['given_name'];
  //         results.UserId = tokenInfor['sub'];
  //         results.TwoFactorEnabled = tokenInfor['TwoFactorEnabled'];
  //       }
  //       this.abpLocalService.setItem(
  //         AppSettings.KEY_LOCALSTORAGE_USERINFO,
  //         JSON.stringify(results)
  //       );
  //     }
  //   }
  // }

  // getUserInfoByKey(): UserInfoToken {
  //   return JSON.parse(this.abpLocalService.getItem(AppSettings.KEY_LOCALSTORAGE_USERINFO));
  // }

  formatCurrency(inputValue: string) {
    let amount: number;

    //replace all charactor dot
    if (inputValue.toString().includes('.')) {
      inputValue = inputValue.replace(/\./g, '');
    }

    // Remove non-numeric characters from input
    const numericValue = inputValue.toString().replace(/[^0-9.]/g, '');

    // Parse the numeric value into a number
    amount = parseFloat(numericValue);

    // Format the number into currency and update the view
    // You can adjust currency options as needed
    const formattedAmount = this.currencyPipe
      .transform(amount, 'VND', 'symbol', '1.0-0')
      .replace(/\./g, ',');

    // Update the input value with formatted currency
    return formattedAmount;
  }

  // getManagementOrganizationUnitsByUser(): string {
  //   let tokenInfor = jwtDecode(this.abpLocalService.getItem('access_token'));
  //   if (tokenInfor) {
  //     return tokenInfor['ManagementOrganizationUnits'];
  //   }
  //   return '';
  // }

  //#region login - logout - refesh
  getLoginByCode(codeStatus?: string): string {
    if (!codeStatus) return '';
    else {
      if (codeStatus.toLowerCase().indexOf('failed') < 0) {
        return `<span class="badge badge-light-success fs-8 fw-bold">Succeeded</span>`;
      } else {
        return `<span class="badge badge-light-danger fs-8 fw-bold">Failed</span>`;
      }
    }
  }
  getNameLoginByCode(codeStatus?: string): string {
    if (!codeStatus) return '';
    else {
      codeStatus = codeStatus.toLowerCase();
      if (codeStatus === 'refeshtoken')
        return `<span class="badge badge-light-info fs-8 fw-bold">Làm mới token</span>`;
      else if (codeStatus === 'loginsucceeded' || codeStatus === 'loginfailed')
        return `<span class="${
          codeStatus === 'loginfailed' ? 'badge badge-light-danger' : 'badge badge-light-success'
        } fs-8 fw-bold">Đăng nhập</span>`;
      else if (codeStatus === 'logout')
        return `<span class="badge badge-light-danger fs-8 fw-bold">Đăng xuất</span>`;
      else return '';
    }
  }
  //#endregion

  //#region Load JS file
  loadScript(src: string) {
    return new Promise<void>((resolve, reject) => {
      const existingScript = document.querySelector(`script[src="${src}"]`);

      if (existingScript) {
        existingScript.remove();
      }
      const script = document.createElement('script');
      script.src = src;
      script.onload = () => {
        console.log(`${src} loaded successfully.`);
        resolve();
      };
      script.onerror = err => {
        console.error(`Failed to load ${src}:`, err);
        reject(err);
      };
      document.head.appendChild(script);
    });
  }
  //#endregion

  //#region Load templates Slide
  //#region Template Compare
  getTempCompare(data: FileBaseInfoDto[]): string {
    if (data?.length > 0) {
      //=> start
      let getsData = `<section class="simple-box-slide-qh24"><div class="container-slide24-simple-box-description">`;
      getsData += `<div class="container-qh-compare"><div class="inner"><div class="comparison-slider-wrapper">`;
      //=> Ảnh 1
      getsData += `<div class="comparison-slider">`;
      let url0 =
        data[0].fullPathServer.startsWith('http://') ||
        data[0].fullPathServer.startsWith('https://')
          ? data[0].fullPathServer
          : `${env.baseUrlFile}${data[0].fullPathServer}`;
      let url1 =
        data[1].fullPathServer.startsWith('http://') ||
        data[1].fullPathServer.startsWith('https://')
          ? data[1].fullPathServer
          : `${env.baseUrlFile}${data[1].fullPathServer}`;
      getsData += `<div class="overlay">`;
      getsData += `${data[0].fileName}`;
      getsData += `</div>`;
      getsData += `<p>`;
      getsData += `<img src="${url0}" alt="${data[0].fileName}" title="${data[0].fileName}"/>`;
      getsData += `</p>`;
      //=> Ảnh 2
      getsData += `<div class="resize"><div class="overlay">`;
      getsData += `${data[1].fileName}`;
      getsData += `</div>`;
      getsData += `<p>`;
      getsData += `<img src="${url1}" alt="${data[1].fileName}" title="${data[1].fileName}"/>`;
      getsData += `</p>`;
      getsData += `</div>`;
      //=> divider
      getsData += `<div class="divider"></div>`;
      //=> end
      getsData += `</div>`;
      getsData += `</div></div></div>`;
      getsData += '</div></section>';
      return getsData;
    } else {
      return '';
    }
  }
  //#endregion

  //#region Template Slide Gallery
  getTempSlideGallery(data: FileBaseInfoDto[]): string {
    let getsData = '';
    if (data?.length > 0) {
      getsData += `<section class="simple-box-slide-qh24"><div class="container-slide24-simple-box-description">`;
      getsData += `<div class="amazingslider-wrapper-gallery" style="display:block;margin:0px auto 86px;max-width:1000px;position:relative;">`;
      getsData += `<div class="amazingsliderGallery" style="display:block;margin:0 auto;position:relative;">`;
      //=> amazingslider-slides
      getsData += `<div>`;
      getsData += `<ul class="amazingslider-slides">`;
      data.forEach(file => {
        let url =
          file.fullPathServer.startsWith('http://') || file.fullPathServer.startsWith('https://')
            ? file.fullPathServer
            : `${env.baseUrlFile}${file.fullPathServer}`;
        getsData += `<li>`;
        getsData += `<img src="${url}" alt="${file.fileName}" title="${file.fileName}" />`;
        getsData += `</li>`;
      });
      getsData += `</ul>`;
      getsData += `</div>`;
      //=> amazingslider-thumbnails
      getsData += '<div>';
      getsData += `<ul class="amazingslider-thumbnails">`;
      data.forEach(file => {
        let url =
          file.fullPathServer.startsWith('http://') || file.fullPathServer.startsWith('https://')
            ? file.fullPathServer
            : `${env.baseUrlFile}${file.fullPathServer}`;
        getsData += `<li>`;
        getsData += `<img src="${url}" alt="${file.fileName}" title="${file.fileName}" />`;
        getsData += `</li>`;
      });
      getsData += `</ul>`;
      getsData += `</div>`;
      getsData += `</div></div>`;
      getsData += '</div></section>';
    }
    return getsData;
  }
  //#endregion

  //#region Template Slide RightTabDask
  getTempSlideRightTabDask(data: FileBaseInfoDto[]): string {
    let getsData = '';
    if (data?.length > 0) {
      getsData = `<section class="simple-box-slide-qh24"><div class="container-slide24-simple-box-description">`;
      getsData += `<div class="amazingslider-wrapper-righttabdask" style="display:block;margin:0px auto;max-width:100%;padding-left:0px;padding-right:244px;position:relative;">`;
      getsData += `<div class="amazingsliderRightTabDask" style="display:block;margin:0 auto;position:relative;">`;
      //=> amazingslider-slides
      getsData += `<div>`;
      getsData += `<ul class="amazingslider-slides">`;
      data.forEach(file => {
        let url =
          file.fullPathServer.startsWith('http://') || file.fullPathServer.startsWith('https://')
            ? file.fullPathServer
            : `${env.baseUrlFile}${file.fullPathServer}`;
        getsData += `<li>`;
        getsData += `<img src="${url}" alt="${file.fileName}" title="${file.fileName}" />`;
        getsData += `</li>`;
      });
      getsData += `</ul>`;
      getsData += `</div>`;
      //=> amazingslider-thumbnails
      getsData += '<div>';
      getsData += `<ul class="amazingslider-thumbnails">`;
      data.forEach(file => {
        let url =
          file.fullPathServer.startsWith('http://') || file.fullPathServer.startsWith('https://')
            ? file.fullPathServer
            : `${env.baseUrlFile}${file.fullPathServer}`;
        getsData += `<li>`;
        getsData += `<img src="${url}" alt="${file.fileName}" title="${file.fileName}" />`;
        getsData += `</li>`;
      });
      getsData += `</ul>`;
      getsData += `</div>`;
      getsData += `</div></div>`;
      getsData += '</div></section>';
    }
    return getsData;
  }
  //#endregion

  //#region Gallery list image
  getTempGalleryListImage(data: FileBaseInfoDto[]): string {
    let getsData = '';
    if (data?.length > 0) {
      getsData += `<section class="simple-box-slide-qh24"><div class="container-slide24-simple-box-description"><div class="td-container">`;
      data.forEach(file => {
        let url =
          file.fullPathServer.startsWith('http://') || file.fullPathServer.startsWith('https://')
            ? file.fullPathServer
            : `${env.baseUrlFile}${file.fullPathServer}`;
        getsData += `<div class="td-column">`;
        getsData += `<a href="javascript:;" title="${file.fileName}"><img src="${url}" alt="${file.fileName}" title="${file.fileName}" /><h2>${file.fileName}</h2></a>`;
        getsData += `</div>`;
      });
      getsData += `</div></div></section>`;
    }

    return getsData;
  }
  //#endregion

  //#region Template Slide MediaPage
  getTempSlideMediaPage(data: FileBaseInfoDto[]): string {
    let getsData = '';
    if (data?.length > 0) {
      getsData = `<section class="simple-box-slide-qh24"><div class="container-slide24-simple-box-description">`;
      getsData += `<div class="amazingslider-wrapper-mediapage" style="display:block;margin:0px auto 0px;max-width:100%;position:relative;">`;
      getsData += `<div class="amazingsliderMediaPage" style="display:block;margin:0 auto;position:relative;">`;
      //=> amazingslider-slides
      getsData += `<div>`;
      getsData += `<ul class="amazingslider-slides">`;
      data.forEach(file => {
        let url =
          file.fullPathServer.startsWith('http://') || file.fullPathServer.startsWith('https://')
            ? file.fullPathServer
            : `${env.baseUrlFile}${file.fullPathServer}`;
        getsData += `<li>`;
        getsData += `<img src="${url}" alt="${file.fileName}" title="${file.fileName}" />`;
        getsData += `</li>`;
      });
      getsData += `</ul>`;
      getsData += `</div>`;
      //=> amazingslider-thumbnails
      getsData += '<div>';
      getsData += `<ul class="amazingslider-thumbnails">`;
      data.forEach(file => {
        let url =
          file.fullPathServer.startsWith('http://') || file.fullPathServer.startsWith('https://')
            ? file.fullPathServer
            : `${env.baseUrlFile}${file.fullPathServer}`;
        getsData += `<li>`;
        getsData += `<img src="${url}" alt="${file.fileName}" title="${file.fileName}" />`;
        getsData += `</li>`;
      });
      getsData += `</ul>`;
      getsData += `</div>`;
      getsData += `</div></div>`;
      getsData += '</div></section>';
    }
    return getsData;
  }
  //#endregion

  //#region Template Carousel Gallery
  getTempCarouselGallery(data: FileBaseInfoDto[]): string {
    let getsData = '';
    if (data?.length > 0) {
      getsData = `<section class="simple-box-slide-qh24"><div class="container-slide24-simple-box-description">`;
      getsData += `<div class="amazingcarousel-container-gallery-1">`;
      getsData += `<div class="amazingcarouselGallery" style="margin:0px auto;max-width:1000px;position:relative;width:100%;">`;
      getsData += `<div class="amazingcarousel-list-container">`;
      //=> items
      getsData += `<ul class="amazingcarousel-list">`;
      data.forEach(file => {
        let url =
          file.fullPathServer.startsWith('http://') || file.fullPathServer.startsWith('https://')
            ? file.fullPathServer
            : `${env.baseUrlFile}${file.fullPathServer}`;
        getsData += `<li class="amazingcarousel-item">`;
        getsData += `<div class="amazingcarousel-item-container">`;
        //=> amazingcarousel-image
        getsData += `<div class="amazingcarousel-image">`;
        getsData += `<a class="html5lightbox" href="${url}" title="${file.fileName}" data-group="amazingcarousel-1">`;
        getsData += `<img src="${url}" alt="${file.fileName}" title="${file.fileName}" />`;
        getsData += `</a>`;
        getsData += `</div>`;
        //=> amazingcarousel-title
        getsData += `<div class="amazingcarousel-title">`;
        getsData += `${file.fileName}`;
        getsData += `</div>`;
        //=> amazingcarousel-description
        getsData += `<div class="amazingcarousel-description"></div>`;
        getsData += `</div>`;
        getsData += `</li>`;
      });
      getsData += `</ul>`;
      //=> amazingcarousel-prev
      getsData += `<div class="amazingcarousel-prev">&nbsp;</div>`;
      //=> amazingcarousel-next
      getsData += `<div class="amazingcarousel-next">&nbsp;</div>`;
      getsData += `</div>`;
      //=> amazingcarousel-nav
      getsData += `<div class="amazingcarousel-nav">&nbsp;</div>`;
      getsData += `</div></div>`;
      getsData += '</div></section>';
    }
    return getsData;
  }
  //#endregion

  //#region Template Carousel List
  getTempCarouselList(data: FileBaseInfoDto[]): string {
    let getsData = '';
    if (data?.length > 0) {
      getsData = `<section class="simple-box-slide-qh24"><div class="container-slide24-simple-box-description">`;
      getsData += `<div class="amazingcarousel-container-list">`;
      getsData += `<div class="amazingcarouselList" style="margin:0px auto;max-width:240px;position:relative;width:100%;">`;
      getsData += `<div class="amazingcarousel-list-container" style="height:300px;">`;
      //=> items
      getsData += `<ul class="amazingcarousel-list">`;
      data.forEach(file => {
        let url =
          file.fullPathServer.startsWith('http://') || file.fullPathServer.startsWith('https://')
            ? file.fullPathServer
            : `${env.baseUrlFile}${file.fullPathServer}`;
        getsData += `<li class="amazingcarousel-item">`;
        getsData += `<div class="amazingcarousel-item-container">`;
        //=> amazingcarousel-image
        getsData += `<div class="amazingcarousel-image">`;
        getsData += `<a class="html5lightbox" href="${url}" title="${file.fileName}" data-group="amazingcarousel-1">`;
        getsData += `<img src="${url}" alt="${file.fileName}" title="${file.fileName}" />`;
        getsData += `</a>`;
        getsData += `</div>`;
        //=> amazingcarousel-text
        getsData += `<div class="amazingcarousel-text"><div class="amazingcarousel-title">`;
        getsData += `${file.fileName}`;
        getsData += `</div><div class="amazingcarousel-description">&nbsp;</div></div>`;
        //=> clear
        getsData += `<div style="clear:both;">&nbsp;</div>`;
        getsData += `</div>`;
        getsData += `</li>`;
      });
      getsData += `</ul>`;
      //=> amazingcarousel-prev
      getsData += `<div class="amazingcarousel-prev">&nbsp;</div>`;
      //=> amazingcarousel-next
      getsData += `<div class="amazingcarousel-next">&nbsp;</div>`;
      getsData += `</div>`;
      //=> amazingcarousel-nav
      getsData += `<div class="amazingcarousel-nav">&nbsp;</div>`;
      getsData += `</div></div>`;
      getsData += '</div></section>';
    }
    return getsData;
  }
  //#endregion
  //#endregion

  //#region Mẫu template bài viết chèn vào bài viết trong biên tập FCK
  //#region Mẫu chỉ tiêu đề
  // getTempNewTitle(data: NewRelateInfoDto[], titleBox: string): string {
  //   let getsData = '';
  //   if (data?.length > 0) {
  //     getsData = `<section class="simple-box-slide-qh24"><div class="container-slide24-simple-box-description">`;
  //     getsData += `<div class="blog_right_sidebar"><aside class="single_sidebar_widget popular_post_widget"><div class="card-rounded">`;
  //     if (titleBox) {
  //       getsData += `<h1 class="fw-bold text-dark mb-2">`;
  //       getsData += `${titleBox}`;
  //       getsData += `</h1>`;
  //     }
  //     data.forEach(item => {
  //       getsData += `<div class="d-flex align-items-center mb-2" style="margin-bottom: 5px">`;

  //       let urlDetail = this.getDetailNewPage(item.title, item.id, item.categoryId);

  //       getsData += `<a class="aLinkAutoHref fw-semibold text-gray-800 text-hover-primary fs-5 m-0" style="color: black !important;" href="${urlDetail}" data-id="${item.id}" data-title="${item.title}" data-categoryId="${item.categoryId}">${item.title}</a>`;
  //       getsData += `</div>`;
  //       getsData += `<div class="separator separator-dashed" style="margin-bottom: 10px;"></div>`;
  //     });
  //     getsData += '</div></aside></div>';
  //     getsData += '</div></section>';
  //   }
  //   return getsData;
  // }
  //#endregion
  //#region Mẫu chỉ tiêu đề, Mô tả
  // getTempNewTitleDescription(data: NewRelateInfoDto[]): string {
  //   let getsData = '';
  //   if (data?.length > 0) {
  //     getsData = `<section class="simple-box-slide-qh24"><div class="container-slide24-simple-box-description">`;
  //     getsData += `<div class="blog_right_sidebar"><aside class="single_sidebar_widget popular_post_widget"><div class="mb-3">`;
  //     data.forEach(item => {
  //       let urlDetail = this.getDetailNewPage(item.title, item.id, item.categoryId);
  //       getsData += `<div class="d-flex mb-0"><div class="d-flex flex-column">`;
  //       //=> Loop
  //       //=> tiêu đề

  //       getsData += `<div class="d-flex align-items-center mb-0" style="margin-bottom: 5px;">`;
  //       getsData += `<a class="aLinkAutoHref text-dark text-hover-primary fs-4 me-3 fw-semibold" style="color: black !important; font-size: 15px; margin-bottom : 5px;" href="${urlDetail}" data-id="${item.id}" data-title="${item.title}" data-categoryId="${item.categoryId}">${item.title}`;
  //       getsData += `<span style="color: #7c829e !important;
  //       font-size: 13px !important;">(${moment(item.datePublic).format('DD-MM-YYYY')})</span></a>`;
  //       getsData += `</div>`;
  //       //=> mô tả
  //       getsData += `<p><span class="text-muted fw-semibold fs-6" style="color: #a1a5b7 !important">`;
  //       getsData += `${item.description}`;
  //       getsData += ` </span></p>`;
  //       //=> Loop
  //       getsData += `</div></div>`;
  //       getsData += `<div class="separator separator-dashed" style="margin-bottom : 10px"></div>`;
  //     });
  //     getsData += '</div></aside></div>';
  //     getsData += '</div></section>';
  //   }
  //   return getsData;
  // }
  //#endregion
  //#region Mẫu chỉ tiêu đề, Mô tả, ảnh đại diện
  // getTempNewTitleDescriptionImage(data: NewRelateInfoDto[], titleBox: string): string {
  //   let getsData = '';
  //   if (data?.length > 0) {
  //     getsData = `<section class="simple-box-slide-qh24"><div class="container-slide24-simple-box-description">`;
  //     getsData += `<div class="blog_right_sidebar"><aside class="single_sidebar_widget popular_post_widget">`;
  //     if (titleBox) {
  //       getsData += `<h3 class="widget_title">${titleBox}</h3>`;
  //     }
  //     data.forEach(item => {
  //       let urlDetail = this.getDetailNewPage(item.title, item.id, item.categoryId);
  //       getsData += `<div class="mediaBox post_item">`;
  //       //=> Loop
  //       //=> ảnh
  //       getsData += `<p>`;
  //       getsData += `<img class="image_resized" style="aspect-ratio:640/380;width:250px;" title="${item.title}" src="${item.image}" alt="${item.title}" width="640" height="380">`;
  //       getsData += `</p>`;
  //       //=> tiêu đề, mô tả
  //       getsData += `<div class="media-body">`;
  //       getsData += `<h3><a data-id="${item.id}" data-title="${item.title}" data-categoryId="${item.categoryId}" class="aLinkAutoHref" href="${urlDetail}" style="color: black !important;">${item.title}</a></h3>`;
  //       getsData += `<p>${item.description}</p>`;
  //       getsData += ` </div>`;
  //       //=> Loop
  //       getsData += `</div>`;
  //     });
  //     getsData += '</aside></div>';
  //     getsData += '</div></section>';
  //   }
  //   return getsData;
  // }
  //#endregion

  //#region Box 5
  // getTempBox5(data: NewRelateInfoDto[], titleBox: string): string {
  //   let getsData = '';
  //   if (data?.length > 0) {
  //     getsData = `<section class="simple-box-slide-qh24"><div class="container-slide24-simple-box-description"><div class="related-news">`;
  //     if (titleBox) {
  //       getsData += `<h2 class="box-heading">`;
  //       getsData += `<a href="javascript:;" title="${titleBox}" class="heading">${titleBox}</a>`;
  //       getsData += `</h2>`;
  //     }
  //     getsData += `<div class="box-content">`;
  //     data.forEach(item => {
  //       let urlDetail = this.getDetailNewPage(item.title, item.id, item.categoryId);
  //       getsData += `<article class="story">`;
  //       //=> Loop
  //       //=> tiêu đề, mô tả
  //       getsData += `<h3 class="story__heading">`;
  //       getsData += `<a data-id="${item.id}" data-title="${item.title}" data-categoryId="${item.categoryId}" class="cms-link" href="${urlDetail}">`;
  //       getsData += `<i class="far fa-chevron-right"></i>${item.title}</a>`;
  //       getsData += `</h3>`;
  //       //=> Loop
  //       getsData += `</article>`;
  //     });
  //     getsData += `</div>`;
  //     getsData += '</></section>';
  //   }
  //   return getsData;
  // }
  //#endregion
  //#region Box 6
  // getTempBox6(data: NewRelateInfoDto[]): string {
  //   let getsData = '';
  //   if (data?.length > 0) {
  //     getsData = `<section class="simple-box-slide-qh24"><div class="container-slide24-simple-box-description">`;
  //     data.forEach(item => {
  //       let urlDetail = this.getDetailNewPage(item.title, item.id, item.categoryId);
  //       getsData += `<article class="article__relate cms-relate">`;
  //       //=> Loop
  //       //=> ảnh
  //       getsData += `<figure class="article__relate__thumb">`;
  //       getsData += `<a href="${urlDetail}"><img src="${item.image}" alt="${item.title}"/></a>`;
  //       getsData += `</figure>`;
  //       //=> tiêu đề
  //       getsData += `<h5 class="article__relate__heading">`;
  //       getsData += `<a href="${urlDetail}">${item.title}</a>`;
  //       getsData += `</h5>`;
  //       //=> mô tả
  //       getsData += `<p class="descrticle__relate__heading">`;
  //       getsData += `${item.description}`;
  //       getsData += `</p>`;
  //       //=> Loop
  //       getsData += `</article>`;
  //     });
  //     getsData += '</div></section>';
  //   }
  //   return getsData;
  // }
  //#endregion
  //#region Box 7
  // getTempBox7(data: NewRelateInfoDto[]): string {
  //   let getsData = '';
  //   if (data?.length > 0) {
  //     getsData = `<section class="simple-box-slide-qh24"><div class="container-slide24-simple-box-description"><div class="notebox_box07qh">`;
  //     data.forEach(item => {
  //       let urlDetail = this.getDetailNewPage(item.title, item.id, item.categoryId);
  //       //=> Loop
  //       getsData += `<p><a href="${urlDetail}">${item.title}</a></p>`;
  //     });
  //     getsData += '</div></div></section>';
  //   }
  //   return getsData;
  // }
  //#endregion
  //#region Box 8
  // getTempBox8(data: NewRelateInfoDto[], titleBox: string): string {
  //   let getsData = '';
  //   if (data?.length > 0) {
  //     getsData = `<section class="simple-box-slide-qh24"><div class="container-slide24-simple-box-description">`;
  //     if (titleBox) {
  //       getsData += `<div class="box-style-23"><div class="box-heading">`;
  //       getsData += `<h3 class="wrap-heading"><a class="heading" href="javascript:;" title="${titleBox}" class="heading">${titleBox}</a></h3>`;
  //       getsData += `</div></div>`;
  //     }
  //     getsData += `<div class="td-container">`;
  //     data.forEach(item => {
  //       let urlDetail = this.getDetailNewPage(item.title, item.id, item.categoryId);
  //       getsData += `<div class="td-column">`;
  //       //=> Loop
  //       //=> tiêu đề, ảnh
  //       getsData += `<a title="${item.title}" href="${urlDetail}">`;
  //       getsData += `<img src="${item.image}" title="${item.title}" alt="${item.title}"/><h2>${item.title}</h2></a>`;
  //       //=> Loop
  //       getsData += `</div>`;
  //     });
  //     getsData += '</div></div></section>';
  //   }
  //   return getsData;
  // }
  //#endregion
  //#endregion

  //#region Build detail page tin tức
  getDetailNewPage(title: string, id: string, categoryId: string): string {
    if (title?.length > 0 && id?.length > 0) {
      let tmpCategoryId = id.split('-')[0];
      if (categoryId?.length > 0) {
        tmpCategoryId = categoryId.split('-')[0];
      }
      return `/tin-tuc/${this.unicodeToAscii(title.trim()).toLowerCase()}-${
        id.split('-')[0]
      }-${tmpCategoryId}.html`;
    }
    return '';
  }
  //#endregion

  //#region Youtube
  GetIdByLinkYouTube(url: string): string {
    let regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    let match = url.match(regExp);
    if (match && match[2].length == 11) {
      return match[2];
    } else {
      return '';
    }
  }
  //#endregion

  //#region Check group role admin
  // CheckGroupAdmin(): boolean {
  //   let accessToken = jwtDecode(this.abpLocalService.getItem('access_token'));
  //   let roles: string = accessToken['role'];
  //   let isArrayRole = Array.isArray(roles);
  //   let IsAdmin = false;
  //   if (isArrayRole) {
  //     IsAdmin = roles?.length > 0 && Array.from(roles).findIndex(a => a === 'admin') >= 0;
  //   } else {
  //     IsAdmin = roles === 'admin';
  //   }
  //   return IsAdmin;
  // }
  //#endregion
}
