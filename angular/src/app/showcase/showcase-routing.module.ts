import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { eLayoutType } from '@abp/ng.core';
import { ShowcaseComponent } from './showcase.component';
import { EmbedSectionComponent } from './embed-section/embed-section.component';

// layout 'empty' -> không hiện sidebar/menu admin, đây là trang public giới thiệu EForm cho người ngoài xem/điền thử.
// Không slug (/showcase) = trang giới thiệu mặc định; có slug (/showcase/:slug) = 1 trang cụ thể -
// cùng 1 component đọc route param 'slug' (rỗng nếu không có) rồi gọi chung 1 API get-showcase-page.
//
// route 'embed/:id' - trang nhúng ĐỘC LẬP 1 khu vực duy nhất (không hero/không các khu vực khác), dùng để
// gắn vào <iframe> trên bất kỳ website ngoài nào - xem embed-section.component.ts
const routes: Routes = [
  {
    path: '',
    component: ShowcaseComponent,
    data: { layout: eLayoutType.empty },
  },
  {
    path: 'embed/:id',
    component: EmbedSectionComponent,
    data: { layout: eLayoutType.empty },
  },
  {
    path: ':slug',
    component: ShowcaseComponent,
    data: { layout: eLayoutType.empty },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ShowcaseRoutingModule {}
