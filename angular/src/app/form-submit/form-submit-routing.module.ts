import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { eLayoutType } from '@abp/ng.core';
import { FormSubmitComponent } from './form-submit.component';

// layout 'empty' -> không hiện sidebar/menu admin, vì đây là trang public cho người ngoài điền form
const routes: Routes = [
  {
    path: ':formId',
    component: FormSubmitComponent,
    data: { layout: eLayoutType.empty },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FormSubmitRoutingModule {}
