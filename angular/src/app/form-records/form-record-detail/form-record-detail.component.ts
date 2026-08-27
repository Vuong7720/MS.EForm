import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToasterService } from '@abp/ng.theme.shared';
import { EFormService } from '@proxy/controllers';
import { FormRecordDto } from '@proxy/form-models/form-records';
import { ApprovalStatus } from '@proxy/enums';
import { FormRendererService, RenderableField } from '../../shared/services/form-renderer.service';
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
  lstAttribute: RenderableField[] = [];
  formContent = '';
  loading = true;
  notFound = false;
  editing = false;
  saving = false;
  ApprovalStatus = ApprovalStatus;
  formRequireApproval = false;
  approvalNote = '';
  approving = false;
  rejecting = false;

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
      this.approvalNote = record.approvalNote || '';

      this.service.get(record.formId).subscribe(form => {
        // requireApproval là chính sách HIỆN TẠI của form (không phải cấu trúc lịch sử) nên luôn lấy
        // live, kể cả khi content/fields bên dưới lấy từ snapshot của bản ghi
        this.formRequireApproval = !!form?.requireApproval;

        // ưu tiên dùng snapshot đóng băng ngay trong bản ghi (nội dung/field lúc nộp) thay vì field
        // HIỆN TẠI của form - tránh trường hợp form gốc bị sửa sau này làm bản ghi cũ hiển thị/lưu sai.
        // Bản ghi tạo trước khi có tính năng snapshot (snapshotContent rỗng) thì fallback về cách cũ.
        if (record.snapshotContent != null) {
          this.formContent = record.snapshotContent;
          this.lstAttribute = record.snapshotFields || [];
          this.loading = false;
          setTimeout(() => this.renderReadonly());
          return;
        }

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
    const rendered = this.renderer.renderFieldsToElements(this.formContent, this.lstAttribute, this.recordDto.formId || '');
    this.renderContainer.nativeElement.innerHTML = '';
    this.renderContainer.nativeElement.appendChild(rendered);

    this.renderer.fillFormData(this.renderContainer.nativeElement, this.parseData(), true);
    // gọi SAU fillFormData để tính ẩn/hiện theo đúng dữ liệu ĐÃ LƯU của bản ghi, không phải theo form rỗng
    this.renderer.applyConditionalVisibility(this.renderContainer.nativeElement);
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

  approve(): void {
    if (!this.recordDto) return;
    this.approving = true;
    this.service.approveFormRecord(this.recordDto.id, this.approvalNote || null, { skipHandleError: true }).subscribe({
      next: res => {
        this.approving = false;
        this.toasterService.success(res.messages);
        this.load(this.recordDto!.id);
      },
      error: err => {
        this.approving = false;
        this.toasterService.error(getApiErrorMessage(err));
      },
    });
  }

  reject(): void {
    if (!this.recordDto) return;
    this.rejecting = true;
    this.service.rejectFormRecord(this.recordDto.id, this.approvalNote || null, { skipHandleError: true }).subscribe({
      next: res => {
        this.rejecting = false;
        this.toasterService.success(res.messages);
        this.load(this.recordDto!.id);
      },
      error: err => {
        this.rejecting = false;
        this.toasterService.error(getApiErrorMessage(err));
      },
    });
  }

  // xuất PDF bằng cách in chính giao diện đã render (giữ nguyên ảnh nền/màu/layout của form gốc) -
  // trình duyệt cho phép người dùng chọn "Lưu dưới dạng PDF" ngay trong hộp thoại in
  exportPdf(): void {
    window.print();
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
