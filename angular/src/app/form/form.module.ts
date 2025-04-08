import { NgModule } from '@angular/core';
import { SharedModule } from '../shared/shared.module';

import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzFormModule } from 'ng-zorro-antd/form';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { NzDescriptionsModule } from 'ng-zorro-antd/descriptions';
import { NzPageHeaderModule } from 'ng-zorro-antd/page-header';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { FormComponent } from './form.component';
import { CreateFormComponent } from './create_form/create_form.component';
import { FormCategoryRoutingModule } from '../form_categories/form_categories-routing.module';
import { FormRoutingModule } from './form-routing.module';
import { CmsEditorModule } from '../shared/components/cmsEditor/cms-editor.module';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzListModule } from 'ng-zorro-antd/list';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { CreateAttributeComponent } from './create_attribute/create_attribute.component';
import { EditorModule } from '../shared/components/editor/editor.module';


@NgModule({
  declarations: [FormComponent, CreateFormComponent, CreateAttributeComponent],
  imports: [
    SharedModule,
    FormRoutingModule,
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
    CmsEditorModule,
    NzModalModule,
    NzSelectModule,
    NzListModule,
    NzTypographyModule,
    NzToolTipModule,
    EditorModule
  ],
})
export class FormModule {}
