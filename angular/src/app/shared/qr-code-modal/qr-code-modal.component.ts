import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import * as QRCode from 'qrcode';

// Modal hiện mã QR cho 1 URL (link nộp form public, hoặc link trang giới thiệu) - dùng để in kèm lên
// poster giấy dán ở trụ sở, quét là vào thẳng trang tương ứng thay vì phải gõ URL tay.
@Component({
  standalone: false,
  selector: 'app-qr-code-modal',
  templateUrl: './qr-code-modal.component.html',
  styleUrls: ['./qr-code-modal.component.scss'],
})
export class QrCodeModalComponent implements OnInit {
  @Input() url: string;
  @Input() title = 'Mã QR';
  @ViewChild('canvas', { static: false }) canvasRef: ElementRef<HTMLCanvasElement>;

  constructor(public activeModal: NgbActiveModal) {}

  ngOnInit(): void {
    setTimeout(() => this.render());
  }

  private render(): void {
    if (!this.canvasRef || !this.url) return;
    QRCode.toCanvas(this.canvasRef.nativeElement, this.url, { width: 260, margin: 2 });
  }

  download(): void {
    if (!this.canvasRef) return;
    const link = document.createElement('a');
    link.download = 'qr-code.png';
    link.href = this.canvasRef.nativeElement.toDataURL('image/png');
    link.click();
  }
}
