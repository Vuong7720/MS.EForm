import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { EFormService } from '@proxy/controllers';
import { FormFieldDto } from '@proxy/form-models/form-fields';
import { FormRecordDto } from '@proxy/form-models/form-records';
import { FormRendererService } from '../../shared/services/form-renderer.service';

@Component({
  standalone: false,
  selector: 'app-form-record-detail',
  templateUrl: './form-record-detail.component.html',
  styleUrls: ['./form-record-detail.component.scss'],
})
export class FormRecordDetailComponent implements OnInit {
  @ViewChild('renderContainer', { static: false }) renderContainer: ElementRef<HTMLDivElement>;

  recordDto: FormRecordDto | null = null;
  lstAttribute: FormFieldDto[] = [];
  formContent = '';
  loading = true;
  notFound = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private service: EFormService,
    private renderer: FormRendererService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id') || '';
    if (!id) {
      this.notFound = true;
      this.loading = false;
      return;
    }
    this.load(id);
  }

  private load(id: string): void {
    this.service.getFormRecordByIdById(id).subscribe(record => {
      if (!record || !record.id) {
        this.notFound = true;
        this.loading = false;
        return;
      }
      this.recordDto = record;

      this.service.get(record.formId).subscribe(form => {
        this.formContent = form?.content || '';

        this.service.getFieldByFormIdByFormId(record.formId).subscribe(fields => {
          this.lstAttribute = fields || [];
          this.loading = false;

          setTimeout(() => this.renderReadonly());
        });
      });
    });
  }

  private renderReadonly(): void {
    if (!this.renderContainer || !this.recordDto) {
      return;
    }
    const rendered = this.renderer.renderFieldsToElements(this.formContent, this.lstAttribute);
    this.renderContainer.nativeElement.innerHTML = '';
    this.renderContainer.nativeElement.appendChild(rendered);

    let data: Record<string, string> = {};
    try {
      data = JSON.parse(this.recordDto.data || '{}');
    } catch {
      data = {};
    }
    this.renderer.fillFormData(this.renderContainer.nativeElement, data, true);
  }

  back(): void {
    this.router.navigate(['/form-records'], { queryParams: { formId: this.recordDto?.formId } });
  }
}
