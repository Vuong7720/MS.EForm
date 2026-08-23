import { NgModule } from '@angular/core';
import { SharedModule } from '../shared/shared.module';
import { FormSubmitComponent } from './form-submit.component';
import { FormSubmitRoutingModule } from './form-submit-routing.module';

@NgModule({
  declarations: [FormSubmitComponent],
  imports: [SharedModule, FormSubmitRoutingModule],
})
export class FormSubmitModule {}
