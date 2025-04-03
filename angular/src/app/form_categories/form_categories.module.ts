import { NgModule } from '@angular/core';
import { SharedModule } from '../shared/shared.module';

import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzFormModule } from 'ng-zorro-antd/form';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { FormCategoryComponent } from './form_categories.component';
import { FormCategoryRoutingModule } from './form_categories-routing.module';
import { NzDescriptionsModule } from 'ng-zorro-antd/descriptions';
import { NzPageHeaderModule } from 'ng-zorro-antd/page-header';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { CreateCategoryComponent } from './create_category/create_category.component';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
@NgModule({
  declarations: [FormCategoryComponent, CreateCategoryComponent],
  imports: [
    SharedModule,
    FormCategoryRoutingModule,
    NzButtonModule,
    NzTableModule,
    NzInputModule,
    NzFormModule,
    CKEditorModule,
    NzDescriptionsModule,
    NzPageHeaderModule,
    NzSpaceModule,
    NzDividerModule,
    NzDropDownModule,
    NzInputNumberModule
  ],
})
export class FormCategoryModule {}
