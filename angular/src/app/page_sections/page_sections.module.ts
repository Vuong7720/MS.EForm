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
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { EditorModule } from '../shared/components/editor/editor.module';
import { PageSectionsComponent } from './page_sections.component';
import { PageSectionsRoutingModule } from './page_sections-routing.module';
import { CreateSectionComponent } from './create_section/create_section.component';

@NgModule({
  declarations: [PageSectionsComponent, CreateSectionComponent],
  imports: [
    SharedModule,
    PageSectionsRoutingModule,
    NzButtonModule,
    NzTableModule,
    NzInputModule,
    NzFormModule,
    NzDescriptionsModule,
    NzPageHeaderModule,
    NzSpaceModule,
    NzDropDownModule,
    NzSelectModule,
    NzCheckboxModule,
    NzRadioModule,
    NzDatePickerModule,
    DragDropModule,
    EditorModule,
  ],
})
export class PageSectionsModule {}
