import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EFormService } from '@proxy/controllers';
import { PageSectionDto } from '@proxy/form-models/page-sections';

// Trang nhúng ĐỘC LẬP cho 1 khu vực duy nhất (form hoặc khối nội dung), KHÔNG có hero/thương hiệu/các khu
// vực khác của trang showcase - mục đích để gắn vào BẤT KỲ website nào khác qua <iframe> (xem nút "Sao
// chép mã nhúng" ở /page-sections), đúng với nhu cầu gốc: đổi nội dung/poster ngay trên website hiện có
// của khách hàng mà không cần build lại trang đó. Tái dùng nguyên ShowcaseSectionComponent để không lặp
// lại logic load form/render/nộp/captcha.
@Component({
  standalone: false,
  selector: 'app-embed-section',
  templateUrl: './embed-section.component.html',
  styleUrls: ['./embed-section.component.scss'],
})
export class EmbedSectionComponent implements OnInit {
  section: PageSectionDto | null = null;
  loading = true;
  notFound = false;

  constructor(
    private service: EFormService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.notFound = true;
      this.loading = false;
      return;
    }

    this.service.getEmbedSection(id).subscribe({
      next: res => {
        this.section = res?.id ? res : null;
        this.notFound = !this.section;
        this.loading = false;
      },
      error: () => {
        this.notFound = true;
        this.loading = false;
      },
    });
  }
}
