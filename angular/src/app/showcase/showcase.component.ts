import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EFormService } from '@proxy/controllers';
import { PageDto } from '@proxy/form-models/pages';
import { PageSectionDto } from '@proxy/form-models/page-sections';

@Component({
  standalone: false,
  selector: 'app-showcase',
  templateUrl: './showcase.component.html',
  styleUrls: ['./showcase.component.scss'],
})
export class ShowcaseComponent implements OnInit {
  page: PageDto | null = null;
  sections: PageSectionDto[] = [];
  loading = true;
  notFound = false;
  // phân biệt "gọi API lỗi" với "gọi thành công nhưng chưa cấu hình section nào" - trước đây cả 2
  // trường hợp đều hiện chung 1 thông báo trống, khiến lỗi thật (vd API 404 do backend chưa cập nhật)
  // trông y hệt như trang chưa có gì, rất khó chẩn đoán khi có sự cố
  loadError = false;

  constructor(
    private service: EFormService,
    private route: ActivatedRoute
  ) {}

  // màu chủ đạo tùy biến theo trang (vd theo thương hiệu khách hàng khi demo/chào hàng) - áp dụng qua
  // CSS custom property nên tự động lan xuống cả <app-showcase-section> (biến CSS không bị chặn bởi
  // view encapsulation của Angular, khác các class/selector thường)
  get accentColor(): string {
    return this.page?.primaryColor || '#4F46E5';
  }

  ngOnInit(): void {
    // route '' (không slug) = trang mặc định, route ':slug' = trang cụ thể - xem showcase-routing.module.ts
    const slug = this.route.snapshot.paramMap.get('slug');

    this.service.getShowcasePage(slug).subscribe({
      next: res => {
        this.page = res?.page || null;
        this.sections = res?.sections || [];
        this.notFound = !this.page;
        this.loading = false;
      },
      error: () => {
        this.loadError = true;
        this.loading = false;
      },
    });
  }
}
