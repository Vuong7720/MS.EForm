import { NgModule } from '@angular/core';
import { SharedModule } from '../shared/shared.module';
import { ShowcaseComponent } from './showcase.component';
import { ShowcaseSectionComponent } from './showcase-section/showcase-section.component';
import { EmbedSectionComponent } from './embed-section/embed-section.component';
import { ShowcaseRoutingModule } from './showcase-routing.module';

@NgModule({
  declarations: [ShowcaseComponent, ShowcaseSectionComponent, EmbedSectionComponent],
  imports: [SharedModule, ShowcaseRoutingModule],
})
export class ShowcaseModule {}
