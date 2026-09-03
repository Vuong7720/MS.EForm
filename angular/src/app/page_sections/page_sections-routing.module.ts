import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PageSectionsComponent } from './page_sections.component';

const routes: Routes = [{ path: '', component: PageSectionsComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PageSectionsRoutingModule {}
