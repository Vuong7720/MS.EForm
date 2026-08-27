import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SharedModule } from '../shared/shared.module';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzPageHeaderModule } from 'ng-zorro-antd/page-header';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzInputModule } from 'ng-zorro-antd/input';
import { FormRecordListComponent } from './form-record-list/form-record-list.component';
import { FormRecordDetailComponent } from './form-record-detail/form-record-detail.component';
import { FormRecordsRoutingModule } from './form-records-routing.module';

@NgModule({
  declarations: [FormRecordListComponent, FormRecordDetailComponent],
  imports: [
    SharedModule,
    FormsModule,
    FormRecordsRoutingModule,
    NzButtonModule,
    NzTableModule,
    NzPageHeaderModule,
    NzSpaceModule,
    NzDropDownModule,
    NzTagModule,
    NzCheckboxModule,
    NzInputModule,
  ],
})
export class FormRecordsModule {}
