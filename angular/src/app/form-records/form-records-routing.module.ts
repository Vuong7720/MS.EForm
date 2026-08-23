import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { FormRecordListComponent } from './form-record-list/form-record-list.component';
import { FormRecordDetailComponent } from './form-record-detail/form-record-detail.component';

const routes: Routes = [
  { path: '', component: FormRecordListComponent },
  { path: 'view/:id', component: FormRecordDetailComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FormRecordsRoutingModule {}
