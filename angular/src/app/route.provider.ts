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
      },
      {
        path: '/form',
        name: 'Biểu mẫu',
        iconClass: 'bi bi-clipboard-data',
        order: 3,
        layout: eLayoutType.application,
      }
    ]);
  };
}
