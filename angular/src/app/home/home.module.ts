import { NgModule } from '@angular/core';
import { SharedModule } from '../shared/shared.module';
import { HomeRoutingModule } from './home-routing.module';
import { HomeComponent } from './home.component';

import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzFormModule } from 'ng-zorro-antd/form';
import { CmsEditorModule } from '../shared/components/cmsEditor/cms-editor.module';

@NgModule({
  declarations: [HomeComponent],
  imports: [
    SharedModule, 
    HomeRoutingModule,
    NzButtonModule,
    NzTableModule,
    NzInputModule,
    NzFormModule,
    CmsEditorModule
  ],
})
export class HomeModule {}
