import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToasterService } from '@abp/ng.theme.shared';
import { EFormService } from '@proxy/controllers';
import { FormFieldDto } from '@proxy/form-models/form-fields';
import { FormRecordDto } from '@proxy/form-models/form-records';
import { FormRendererService } from '../../shared/services/form-renderer.service';
import { getApiErrorMessage } from '../../shared/services/http-error.util';

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
  editing = false;
  saving = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private service: EFormService,
    private renderer: FormRendererService,
    private toasterService: ToasterService
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
    this.loading = true;
    this.editing = false;

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

    this.renderer.fillFormData(this.renderContainer.nativeElement, this.parseData(), true);
  }

  private parseData(): Record<string, string> {
    try {
      return JSON.parse(this.recordDto?.data || '{}');
    } catch {
      return {};
    }
  }

  startEdit(): void {
    if (!this.renderContainer) return;
    this.editing = true;
    this.renderer.setEnabled(this.renderContainer.nativeElement, true);
  }

  cancelEdit(): void {
    this.editing = false;
    // render lại từ dữ liệu gốc để bỏ mọi thay đổi chưa lưu
    this.renderReadonly();
  }

  save(): void {
    if (!this.renderContainer || !this.recordDto) return;
    if (!this.renderer.checkClientValidity(this.renderContainer.nativeElement)) return;

    const data = this.renderer.collectFormData(this.renderContainer.nativeElement);
    this.saving = true;

    this.service
      .updateFormRecordByIdAndModel(
        this.recordDto.id,
        {
          title: this.recordDto.title,
          formId: this.recordDto.formId,
          data: JSON.stringify(data),
        },
        { skipHandleError: true }
      )
      .subscribe({
        next: res => {
          this.saving = false;
          this.toasterService.success(res.messages);
          this.load(this.recordDto!.id);
        },
        error: err => {
          this.saving = false;
          this.toasterService.error(getApiErrorMessage(err));
        },
      });
  }

  back(): void {
    this.router.navigate(['/form-records'], {
      queryParams: {
        formId: this.recordDto?.formId,
        pageIndex: this.route.snapshot.queryParamMap.get('pageIndex'),
        pageSize: this.route.snapshot.queryParamMap.get('pageSize'),
      },
    });
  }
}
