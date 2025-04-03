import { CoreModule } from '@abp/ng.core';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { NgModule } from '@angular/core';
import { ThemeSharedModule } from '@abp/ng.theme.shared';
import { NgxValidateCoreModule } from '@ngx-validate/core';
import { NzResultModule } from 'ng-zorro-antd/result';
import { DeleteComfirmComponent } from './delete-comfirm/delete-comfirm.component';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { CmsEditorModule } from './components/cmsEditor/cms-editor.module';

@NgModule({
  declarations: [DeleteComfirmComponent],
  imports: [
    CoreModule,
    ThemeSharedModule,
    NgbDropdownModule,
    NgxValidateCoreModule,
    NzResultModule,
    NzButtonModule,
    NzSpinModule,
    CmsEditorModule
  ],
  exports: [
    CoreModule,
    ThemeSharedModule,
    NgbDropdownModule,
    NgxValidateCoreModule,
    CmsEditorModule,
    NzSpinModule
  ],
  providers: []
})
export class SharedModule {}
