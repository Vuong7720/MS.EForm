import { RoutesService, eLayoutType } from '@abp/ng.core';
import { APP_INITIALIZER } from '@angular/core';

export const APP_ROUTE_PROVIDER = [
  { provide: APP_INITIALIZER, useFactory: configureRoutes, deps: [RoutesService], multi: true },
];

function configureRoutes(routesService: RoutesService) {
  return () => {
    routesService.add([
      {
        path: '/',
        name: '::Menu:Home',
        iconClass: 'fas fa-home',
        order: 1,
        layout: eLayoutType.application,
      },
      {

        path: '/form-category',
        name: 'Danh mục biểu mẫu',
        iconClass: 'fas fa-list',
        order: 2,
        layout: eLayoutType.application,
        requiredPolicy: 'EForm.FormCategories',
      },
      {
        path: '/form-templates',
        name: 'Mẫu có sẵn',
        iconClass: 'bi bi-stars',
        order: 3,
        layout: eLayoutType.application,
        requiredPolicy: 'EForm.Forms',
      },
      {
        path: '/form',
        name: 'Biểu mẫu',
        iconClass: 'bi bi-clipboard-data',
        order: 4,
        layout: eLayoutType.application,
        requiredPolicy: 'EForm.Forms',
      },
      {
        path: '/form-records',
        name: 'Kết quả nộp form',
        iconClass: 'bi bi-card-checklist',
        order: 5,
        layout: eLayoutType.application,
        requiredPolicy: 'EForm.FormRecords',
      },
      {
        // đăng ký để RoutesService biết layout 'empty' cho trang public này (invisible: không hiện trong menu)
        path: '/submit-form',
        name: 'Nộp form',
        invisible: true,
        layout: eLayoutType.empty,
      },
      {
        path: '/pages',
        name: 'Trang giới thiệu',
        iconClass: 'bi bi-file-earmark-text',
        order: 6,
        layout: eLayoutType.application,
        requiredPolicy: 'EForm.Pages',
      },
      {
        path: '/page-sections',
        name: 'Khu vực hiển thị',
        iconClass: 'bi bi-window-stack',
        order: 7,
        layout: eLayoutType.application,
        requiredPolicy: 'EForm.PageSections',
      },
      {
        // hiện trong menu để bấm 1 phát vào xem trang giới thiệu public, không cần gõ URL tay -
        // click sẽ chuyển layout sang 'empty' (ẩn sidebar) vì đây là trang public, không phải trang quản trị
        path: '/showcase',
        name: 'Xem trang giới thiệu (Demo)',
        iconClass: 'bi bi-box-arrow-up-right',
        order: 8,
        layout: eLayoutType.empty,
      }
    ]);
  };
}
