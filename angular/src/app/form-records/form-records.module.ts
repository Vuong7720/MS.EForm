import { NgModule } from '@angular/core';
import { SharedModule } from '../shared/shared.module';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzPageHeaderModule } from 'ng-zorro-antd/page-header';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { FormRecordListComponent } from './form-record-list/form-record-list.component';
import { FormRecordDetailComponent } from './form-record-detail/form-record-detail.component';
import { FormRecordsRoutingModule } from './form-records-routing.module';

@NgModule({
  declarations: [FormRecordListComponent, FormRecordDetailComponent],
  imports: [
    SharedModule,
    FormRecordsRoutingModule,
    NzButtonModule,
    NzTableModule,
    NzPageHeaderModule,
    NzSpaceModule,
    NzDropDownModule,
  ],
})
export class FormRecordsModule {}
