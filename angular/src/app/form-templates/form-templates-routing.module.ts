import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { FormTemplatesComponent } from './form-templates.component';

const routes: Routes = [{ path: '', component: FormTemplatesComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FormTemplatesRoutingModule {}
