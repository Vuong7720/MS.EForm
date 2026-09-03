import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { EFormService } from '@proxy/controllers';
import { DashboardStatsDto } from '@proxy/form-models/form-records';

@Component({
  standalone: false,
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  stats: DashboardStatsDto | null = null;
  loading = true;

  constructor(
    private service: EFormService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.service.getDashboardStats().subscribe(res => {
      this.stats = res;
      this.loading = false;
    });
  }

  viewFormRecords(formId: string) {
    this.router.navigate(['/form-records'], { queryParams: { formId } });
  }

  // chiều cao cột (%) tỉ lệ theo ngày có lượt nộp nhiều nhất trong 14 ngày - dùng tối thiểu 1 để tránh
  // chia cho 0 khi cả 14 ngày đều chưa có lượt nộp nào (mọi cột sẽ ở mức 0% thay vì lỗi NaN)
  get maxDayCount(): number {
    return Math.max(1, ...(this.stats?.recordsByDay || []).map(d => d.count));
  }

  barHeightPercent(count: number): number {
    return Math.round((count / this.maxDayCount) * 100);
  }

  formatDay(dateStr: string): string {
    const d = new Date(dateStr);
    return `${d.getDate()}/${d.getMonth() + 1}`;
  }

  // chỉ hiện widget trạng thái duyệt khi có ít nhất 1 bản ghi thuộc form có bật "Cần phê duyệt" -
  // tránh hiện 1 khối toàn số 0 gây rối mắt cho tài khoản chưa dùng tính năng phê duyệt
  get hasApprovalData(): boolean {
    const b = this.stats?.approvalBreakdown;
    return !!b && b.pending + b.approved + b.rejected > 0;
  }
}
