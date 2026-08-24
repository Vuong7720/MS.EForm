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
}
