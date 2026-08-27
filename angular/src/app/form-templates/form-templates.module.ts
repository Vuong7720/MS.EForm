import { NgModule } from '@angular/core';
import { SharedModule } from '../shared/shared.module';

import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzPageHeaderModule } from 'ng-zorro-antd/page-header';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { FormTemplatesComponent } from './form-templates.component';
import { FormTemplatesRoutingModule } from './form-templates-routing.module';

@NgModule({
  declarations: [FormTemplatesComponent],
  imports: [
    SharedModule,
    FormTemplatesRoutingModule,
    NzButtonModule,
    NzGridModule,
    NzCardModule,
    NzEmptyModule,
    NzPageHeaderModule,
    NzModalModule,
    NzSpinModule,
  ],
})
export class FormTemplatesModule {}
