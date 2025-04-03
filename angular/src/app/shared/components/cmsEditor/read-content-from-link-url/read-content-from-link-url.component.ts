import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { ToasterService } from '@abp/ng.theme.shared';
// import { SettingSiteClonesService } from '@proxy/newServices/mstin-duc/news-service/controller';
import { finalize } from 'rxjs';
// import { SettingSiteClonesBaseDto } from '@proxy/newServices/mstin-duc/news-service/models/setting-site-clones';

@Component({
  standalone:false,
  selector: 'app-read-content-from-link-url',
  templateUrl: './read-content-from-link-url.component.html',
  styleUrl: './read-content-from-link-url.component.scss',
})
export class ReadContentFromLinkUrlComponent implements OnInit {
  form: FormGroup;
  isVisible: false;
  isSpinning: boolean = false;
  // data: SettingSiteClonesBaseDto[] = [];
  constructor(
    private fb: FormBuilder,
    private nzModalRef: NzModalRef,
    private toasterService: ToasterService,
    // private settingSiteClonesService: SettingSiteClonesService
  ) {}
  ngOnInit(): void {
    this.buidForm();
    this.OnLoadSettings();
  }
  OnLoadSettings(): void {
    this.isSpinning = true;
    // this.settingSiteClonesService
    //   .getsByFCK()
    //   .pipe(
    //     finalize(() => {
    //       this.isSpinning = false;
    //     })
    //   )
    //   .subscribe(response => {
    //     this.data = response;
    //   });
  }
  buidForm() {
    this.form = this.fb.group({
      linkUrl: [null, [Validators.required, Validators.minLength(2), Validators.maxLength(500)]],
      pathContent: [null, [Validators.required]],
    });
  }

  onBack(): void {
    this.nzModalRef.destroy();
  }

  submitForm() {
    if (!this.form.valid) {
      this.toasterService.error('NewsService::Category:NoInValid');
      return;
    }
    this.isSpinning = true;
    // this.settingSiteClonesService
    //   .GetContentFromLink(this.form.value)
    //   .pipe(
    //     finalize(() => {
    //       this.isSpinning = false;
    //     })
    //   )
    //   .subscribe(response => {
    //     if (response !== null) {
    //       if (!response.title && !response.content) {
    //         this.toasterService.error(
    //           'Không có thông tin nội dung từ link. Vui lòng kiểm tra lại.'
    //         );
    //         return;
    //       }
    //       this.nzModalRef.close({
    //         Success: true,
    //         Title: '',
    //         Obj: response,
    //       });
    //     } else {
    //       this.toasterService.error('Không có thông tin nội dung từ link. Vui lòng kiểm tra lại.');
    //     }
    //   });
  }
}
