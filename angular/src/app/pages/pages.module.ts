import { NgModule } from '@angular/core';
import { SharedModule } from '../shared/shared.module';

import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzDescriptionsModule } from 'ng-zorro-antd/descriptions';
import { NzPageHeaderModule } from 'ng-zorro-antd/page-header';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { PagesComponent } from './pages.component';
import { PagesRoutingModule } from './pages-routing.module';
import { CreatePageComponent } from './create_page/create_page.component';

@NgModule({
  declarations: [PagesComponent, CreatePageComponent],
  imports: [
    SharedModule,
    PagesRoutingModule,
    NzButtonModule,
    NzTableModule,
    NzInputModule,
    NzFormModule,
    NzDescriptionsModule,
    NzPageHeaderModule,
    NzSpaceModule,
    NzDropDownModule,
    NzCheckboxModule,
  ],
})
export class PagesModule {}
