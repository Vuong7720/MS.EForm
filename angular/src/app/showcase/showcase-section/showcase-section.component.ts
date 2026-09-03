import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { ToasterService } from '@abp/ng.theme.shared';
import { EFormService } from '@proxy/controllers';
import { FormDto } from '@proxy/form-models/forms';
import { FormFieldDto } from '@proxy/form-models/form-fields';
import { PageSectionDto } from '@proxy/form-models/page-sections';
import { PageSectionType } from '@proxy/enums';
import { FormRendererService } from '../../shared/services/form-renderer.service';
import { getApiErrorMessage } from '../../shared/services/http-error.util';
import { captchaSiteKey } from '../../../environments/environment';

declare const window: Window & { turnstile?: any };

// Nhúng 1 form NGAY TẠI CHỖ trong trang showcase (không điều hướng sang /submit-form/:formId) - về cơ bản
// là bản rút gọn của FormSubmitComponent, nhưng đóng gói thành 1 component riêng để trang showcase có thể
// lặp qua nhiều section, mỗi section 1 instance độc lập (state riêng: form đã load chưa, captcha token/
// widgetId riêng, đã nộp hay chưa) - tránh phải tự quản lý bằng tay nhiều biến toàn cục theo index/id.
@Component({
  standalone: false,
  selector: 'app-showcase-section',
  templateUrl: './showcase-section.component.html',
  styleUrls: ['./showcase-section.component.scss'],
})
export class ShowcaseSectionComponent implements OnInit {
  @Input() section: PageSectionDto;
  @ViewChild('renderContainer', { static: false }) renderContainer: ElementRef<HTMLDivElement>;
  @ViewChild('captchaContainer', { static: false }) captchaContainer: ElementRef<HTMLDivElement>;
  @ViewChild('confettiCanvas', { static: false }) confettiCanvas: ElementRef<HTMLCanvasElement>;
  @ViewChild('contentContainer', { static: false }) contentContainer: ElementRef<HTMLDivElement>;

  formDto: FormDto | null = null;
  lstAttribute: FormFieldDto[] = [];
  loading = true;
  notFound = false;
  submitted = false;
  captchaToken: string | null = null;

  // form không có field nào (vd poster/thông báo thuần hiển thị) - không có gì để nhập nên không hiện
  // nút "Nộp form"/captcha, chỉ hiển thị nội dung như 1 poster tĩnh
  get isDisplayOnly(): boolean {
    return this.lstAttribute.length === 0;
  }

  // section kiểu Content (khối nội dung tự soạn) không cần Form nào cả - nhẹ hơn cả "form 0 field" vì
  // không gọi API lấy form/field, không có captcha, không thu thập/nộp dữ liệu gì
  get isContentType(): boolean {
    return this.section?.sectionType === PageSectionType.Content;
  }
  // widgetId Turnstile trả về khi render() - mỗi section có 1 widget riêng, cần widgetId để reset() đúng
  // widget của CHÍNH section này khi cho phép nộp lại (submitAnother), không ảnh hưởng các section khác.
  private widgetId: string | null = null;

  constructor(
    private service: EFormService,
    private renderer: FormRendererService,
    private toasterService: ToasterService
  ) {}

  ngOnInit(): void {
    if (this.isContentType) {
      this.loading = false;
      setTimeout(() => {
        if (this.contentContainer) {
          this.contentContainer.nativeElement.innerHTML = this.section?.content || '';
        }
      });
      return;
    }

    if (!this.section?.formId) {
      this.notFound = true;
      this.loading = false;
      return;
    }
    this.loadForm();
  }

  private loadForm(): void {
    this.service.get(this.section.formId).subscribe(form => {
      if (!form || !form.id) {
        this.notFound = true;
        this.loading = false;
        return;
      }
      this.formDto = form;

      this.service.getFieldByFormIdByFormId(this.section.formId).subscribe(fields => {
        this.lstAttribute = fields || [];
        this.loading = false;

        setTimeout(() => {
          this.renderFields();
          if (!this.isDisplayOnly) {
            this.renderCaptcha();
          }
        });
      });
    });
  }

  private renderFields(): void {
    if (!this.renderContainer || !this.formDto) return;
    const rendered = this.renderer.renderFieldsToElements(this.formDto.content || '', this.lstAttribute, this.section.formId);
    this.renderContainer.nativeElement.innerHTML = '';
    this.renderContainer.nativeElement.appendChild(rendered);
    this.renderer.applyConditionalVisibility(this.renderContainer.nativeElement);
    this.renderer.attachAutoResizeInputs(this.renderContainer.nativeElement);
  }

  // dựng widget Cloudflare Turnstile riêng cho section này - xem comment tương tự ở FormSubmitComponent
  private renderCaptcha(attemptsLeft = 25): void {
    if (!this.captchaContainer) return;

    if (window.turnstile) {
      this.widgetId = window.turnstile.render(this.captchaContainer.nativeElement, {
        sitekey: captchaSiteKey,
        callback: (token: string) => (this.captchaToken = token),
      });
      return;
    }

    if (attemptsLeft <= 0) return;
    setTimeout(() => this.renderCaptcha(attemptsLeft - 1), 200);
  }

  submit(): void {
    if (!this.renderContainer || !this.formDto) return;
    if (!this.renderer.checkClientValidity(this.renderContainer.nativeElement)) return;
    if (!this.captchaToken) {
      this.toasterService.error('Vui lòng chờ xác thực chống spam hoàn tất trước khi nộp');
      return;
    }
    const data = this.renderer.collectFormData(this.renderContainer.nativeElement);

    this.service
      .submitFormRecord(
        {
          title: this.formDto.title,
          formId: this.section.formId,
          data: JSON.stringify(data),
          captchaToken: this.captchaToken,
        },
        { skipHandleError: true }
      )
      .subscribe({
        next: res => {
          this.toasterService.success(this.formDto?.requireApproval ? 'Nộp form thành công, đang chờ phê duyệt' : res.messages);
          this.submitted = true;
          // đợi Angular render xong khối "Cảm ơn" (*ngIf="submitted") rồi mới lấy được #confettiCanvas
          setTimeout(() => this.fireConfetti());
        },
        error: err => this.toasterService.error(getApiErrorMessage(err)),
      });
  }

  // hiệu ứng pháo giấy ăn mừng khi nộp thành công - tạo khoảnh khắc ấn tượng, dễ nhớ khi demo trực tiếp
  // cho khách hàng. Cài bằng canvas thuần (không thêm thư viện) - 1 đợt hạt rơi có trọng lực, tự dừng khi
  // hết hạt còn hiển thị (không loop vô hạn, không tốn CPU sau khi hiệu ứng kết thúc).
  private fireConfetti(): void {
    const canvas = this.confettiCanvas?.nativeElement;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const width = (canvas.width = canvas.parentElement?.clientWidth || 400);
    const height = (canvas.height = canvas.parentElement?.clientHeight || 220);

    const colors = ['#4f46e5', '#f59e0b', '#16a34a', '#ec4899', '#3b82f6', '#ffffff'];
    const maxLife = 70;
    const particles = Array.from({ length: 90 }, () => ({
      x: width / 2,
      y: height / 3,
      vx: (Math.random() - 0.5) * 11,
      vy: Math.random() * -8 - 3,
      size: Math.random() * 6 + 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * 360,
      rotSpeed: (Math.random() - 0.5) * 24,
      life: 0,
    }));

    const gravity = 0.35;

    const tick = () => {
      ctx.clearRect(0, 0, width, height);
      let alive = 0;
      particles.forEach(p => {
        if (p.life >= maxLife) return;
        alive++;
        p.vy += gravity;
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.rotSpeed;
        p.life++;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = 1 - p.life / maxLife;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
        ctx.restore();
      });
      if (alive > 0) {
        requestAnimationFrame(tick);
      } else {
        ctx.clearRect(0, 0, width, height);
      }
    };

    requestAnimationFrame(tick);
  }

  // cho phép nộp lại (hữu ích với trang demo/giới thiệu - người xem có thể muốn thử nộp nhiều lần)
  submitAnother(): void {
    this.submitted = false;
    this.captchaToken = null;
    if (this.widgetId && window.turnstile?.reset) {
      window.turnstile.reset(this.widgetId);
    }
    setTimeout(() => this.renderFields());
  }
}
