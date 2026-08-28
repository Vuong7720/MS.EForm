import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ToasterService } from '@abp/ng.theme.shared';
import { EFormService } from '@proxy/controllers';
import { FormDto } from '@proxy/form-models/forms';
import { FormFieldDto } from '@proxy/form-models/form-fields';
import { FormRendererService } from '../shared/services/form-renderer.service';
import { getApiErrorMessage } from '../shared/services/http-error.util';
import { captchaSiteKey } from '../../environments/environment';

declare const window: Window & { turnstile?: any };

@Component({
  standalone: false,
  selector: 'app-form-submit',
  templateUrl: './form-submit.component.html',
  styleUrls: ['./form-submit.component.scss'],
})
export class FormSubmitComponent implements OnInit {
  @ViewChild('renderContainer', { static: false }) renderContainer: ElementRef<HTMLDivElement>;
  @ViewChild('captchaContainer', { static: false }) captchaContainer: ElementRef<HTMLDivElement>;

  formId: string;
  formDto: FormDto | null = null;
  lstAttribute: FormFieldDto[] = [];
  loading = true;
  submitted = false;
  notFound = false;
  captchaToken: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private service: EFormService,
    private renderer: FormRendererService,
    private toasterService: ToasterService
  ) {}

  ngOnInit(): void {
    this.formId = this.route.snapshot.paramMap.get('formId') || '';
    if (!this.formId) {
      this.notFound = true;
      this.loading = false;
      return;
    }
    this.loadForm();
  }

  loadForm(): void {
    this.service.get(this.formId).subscribe(form => {
      if (!form || !form.id) {
        this.notFound = true;
        this.loading = false;
        return;
      }
      this.formDto = form;

      this.service.getFieldByFormIdByFormId(this.formId).subscribe(fields => {
        this.lstAttribute = fields || [];
        this.loading = false;

        setTimeout(() => {
          this.renderFields();
          this.renderCaptcha();
        });
      });
    });
  }

  private renderFields(): void {
    if (!this.renderContainer || !this.formDto) {
      return;
    }
    const rendered = this.renderer.renderFieldsToElements(this.formDto.content || '', this.lstAttribute, this.formId);
    this.renderContainer.nativeElement.innerHTML = '';
    this.renderContainer.nativeElement.appendChild(rendered);
    this.renderer.applyConditionalVisibility(this.renderContainer.nativeElement);
    this.renderer.attachAutoResizeInputs(this.renderContainer.nativeElement);
  }

  // dựng widget Cloudflare Turnstile (chống spam) - script tải async/defer (xem index.html) nên
  // window.turnstile có thể chưa sẵn sàng ngay, thử lại vài lần trong ~5s thay vì render ngay lập tức.
  private renderCaptcha(attemptsLeft = 25): void {
    if (!this.captchaContainer) return;

    if (window.turnstile) {
      window.turnstile.render(this.captchaContainer.nativeElement, {
        sitekey: captchaSiteKey,
        callback: (token: string) => (this.captchaToken = token),
      });
      return;
    }

    if (attemptsLeft <= 0) return;
    setTimeout(() => this.renderCaptcha(attemptsLeft - 1), 200);
  }

  submit(): void {
    if (!this.renderContainer || !this.formDto) {
      return;
    }
    if (!this.renderer.checkClientValidity(this.renderContainer.nativeElement)) {
      return;
    }
    if (!this.captchaToken) {
      this.toasterService.error('Vui lòng chờ xác thực chống spam hoàn tất trước khi nộp');
      return;
    }
    const data = this.renderer.collectFormData(this.renderContainer.nativeElement);

    this.service
      .submitFormRecord(
        {
          title: this.formDto.title,
          formId: this.formId,
          data: JSON.stringify(data),
          captchaToken: this.captchaToken,
        },
        { skipHandleError: true }
      )
      .subscribe({
        next: res => {
          this.toasterService.success(
            this.formDto?.requireApproval ? 'Nộp form thành công, đang chờ phê duyệt' : res.messages
          );
          this.submitted = true;
        },
        error: err => this.toasterService.error(getApiErrorMessage(err)),
      });
  }
}
