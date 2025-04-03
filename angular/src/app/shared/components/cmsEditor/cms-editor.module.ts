import { NgModule } from '@angular/core';
import { CmsEditorComponent } from './cms-editor.component';
import { CommonModule } from '@angular/common';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NzModalModule } from 'ng-zorro-antd/modal';
// import { ReadContentFromFileDocComponent } from './read-content-from-file-doc/read-content-from-file-doc.component';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzUploadModule } from 'ng-zorro-antd/upload';
//import { ReadContentFromLinkUrlComponent } from './read-content-from-link-url/read-content-from-link-url.component';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzButtonModule } from 'ng-zorro-antd/button';
//import { AngularPinturaModule } from '@pqina/angular-pintura';
//import { ChooseSlidesEditorComponent } from './choose-slides-editor/choose-slides-editor.component';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { NzImageModule } from 'ng-zorro-antd/image';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { ReadContentFromFileDocComponent } from './read-content-from-file-doc/read-content-from-file-doc.component';
import { ReadContentFromLinkUrlComponent } from './read-content-from-link-url/read-content-from-link-url.component';
import { ChooseSlidesEditorComponent } from './choose-slides-editor/choose-slides-editor.component';
import { ChooseTempNewsComponent } from './choose-temp-news/choose-temp-news.component';
//import { ChooseTempNewsComponent } from './choose-temp-news/choose-temp-news.component';
@NgModule({
  declarations: [
    CmsEditorComponent,
    ReadContentFromFileDocComponent,
    ReadContentFromLinkUrlComponent,
    ChooseSlidesEditorComponent,
    ChooseTempNewsComponent
  ],
  imports: [
    CommonModule,
    CKEditorModule,
    FormsModule,
    NzModalModule,
    NzSpinModule,
    NzUploadModule,
    NzInputModule,
    ReactiveFormsModule,
    NzFormModule,
    NzSelectModule,
    NzButtonModule,
    //AngularPinturaModule,
    NzRadioModule,
    NzImageModule,
    NzDividerModule
  ],
  exports: [CmsEditorComponent],
})
export class CmsEditorModule {}
