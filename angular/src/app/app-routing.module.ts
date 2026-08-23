import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadChildren: () => import('./home/home.module').then(m => m.HomeModule),
  },
  {
    path: 'form-category',
    pathMatch: 'full',
    loadChildren: () => import('./form_categories/form_categories.module').then(m => m.FormCategoryModule),
  },
  {
    path: 'form',
    pathMatch: 'full',
    loadChildren: () => import('./form/form.module').then(m => m.FormModule),
  },
  {
    // không dùng pathMatch:'full' vì module này có route con 'view/:id'
    path: 'form-records',
    loadChildren: () => import('./form-records/form-records.module').then(m => m.FormRecordsModule),
  },
  {
    // trang public để nộp form, không đăng ký vào route.provider.ts (không hiện trong menu admin)
    path: 'submit-form',
    loadChildren: () => import('./form-submit/form-submit.module').then(m => m.FormSubmitModule),
  },
  {
    path: 'account',
    loadChildren: () => import('@abp/ng.account').then(m => m.AccountModule.forLazy()),
  },
  {
    path: 'identity',
    loadChildren: () => import('@abp/ng.identity').then(m => m.IdentityModule.forLazy()),
  },
  {
    path: 'tenant-management',
    loadChildren: () =>
      import('@abp/ng.tenant-management').then(m => m.TenantManagementModule.forLazy()),
  },
  {
    path: 'setting-management',
    loadChildren: () =>
      import('@abp/ng.setting-management').then(m => m.SettingManagementModule.forLazy()),
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {})],
  exports: [RouterModule],
})
export class AppRoutingModule {}
