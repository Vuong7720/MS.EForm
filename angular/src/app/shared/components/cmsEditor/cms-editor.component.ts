import {
  AfterViewInit,
  Component,
  EventEmitter,
  forwardRef,
  Input,
  Output,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import * as customBuild from './ckCustomBuild/build/ckeditor';
import { CKEditorComponent } from '@ckeditor/ckeditor5-angular';
import { environment as env } from '../../../../environments/environment';
// import { CommonsService } from '../../services/commons.service';
import { NzModalService } from 'ng-zorro-antd/modal';
// import { FckEditorManagementComponent } from 'src/app/pages/file-management/fck-editor-management/fck-editor-management.component';
// import { TypeUploadFck } from 'src/app/pages/file-management/commons/uploadParams';
import {
  CreateManyFileWithStreamInput,
  FileInfoDto,
} from '../../services/files/dtos';
import { ReadContentFromFileDocComponent } from './read-content-from-file-doc/read-content-from-file-doc.component';
// import { Message, MessageChooseSlide, MessageChooseTemplateNew } from '../../interfaces/message';
import { ReadContentFromLinkUrlComponent } from './read-content-from-link-url/read-content-from-link-url.component';
//#region Công cụ chỉnh sửa ảnh
// pintura
// import {
//   LocaleCore,
//   LocaleCrop,
//   LocaleFinetune,
//   LocaleFilter,
//   LocaleAnnotate,
//   LocaleMarkupEditor,
//   LocaleFill,
//   LocaleRedact,
//   LocaleFrame,
//   LocaleSticker,
//   LocaleResize,
// } from '../../../../assets/locale/vi_VN';
// import {
//   // editor
//   createDefaultImageReader,
//   createDefaultImageWriter,
//   createDefaultShapePreprocessor,
//   // plugins
//   setPlugins,
//   plugin_crop,
//   plugin_finetune,
//   plugin_finetune_defaults,
//   plugin_filter,
//   plugin_filter_defaults,
//   plugin_annotate,
//   markup_editor_defaults,
//   plugin_fill,
//   plugin_sticker,
//   plugin_redact,
//   plugin_frame,
//   plugin_resize,
//   plugin_frame_defaults,
//   // filepond
//   legacyDataToImageState,
//   openEditor,
//   processImage,
//   createDefaultImageOrienter,
//   //=> fill
//   createDefaultColorOptions,
//   colorStringToColorArray,
//   PinturaNode,
//   createNode,
//   createDefaultImageScrambler,
// } from '@pqina/pintura';
import { DomSanitizer } from '@angular/platform-browser';
import { FileExtention } from '../../services/files';
import { finalize } from 'rxjs';
import { ToasterService } from '@abp/ng.theme.shared';
import { ConfigStateService } from '@abp/ng.core';
import { ChooseSlidesEditorComponent } from './choose-slides-editor/choose-slides-editor.component';
//import { SlideType, TemplateNews } from '@proxy/newServices/mstin-duc/news-service/commons';
import { ChooseTempNewsComponent } from './choose-temp-news/choose-temp-news.component';
import { CommonsService } from '../../services/commons.service';
// setPlugins(
//   plugin_crop,
//   plugin_finetune,
//   plugin_filter,
//   plugin_annotate,
//   plugin_fill,
//   plugin_sticker,
//   plugin_redact,
//   plugin_frame,
//   plugin_resize,
//   plugin_frame_defaults
// );
//#endregion
@Component({
  standalone:false,
  selector: 'app-editor',
  templateUrl: './cms-editor.component.html',
  styleUrls: ['./cms-editor.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CmsEditorComponent),
      multi: true,
    },
  ],
})
export class CmsEditorComponent implements ControlValueAccessor, AfterViewInit {
  public Editor = customBuild;
  fileImageExt = env.fileImageExt;
  fileOfficeExt = ['doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx'];
  fileEmbedExt = ['doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx', 'pdf', 'mp3', 'mp4'];
  @Input() readonly: boolean = false;
  @Input() genMenu: boolean = false;
  @ViewChild('editor', { static: false }) editor: CKEditorComponent;
  @Input() disableTwoWayDataBinding: boolean = false;
  @Output() onSetImage: EventEmitter<any> = new EventEmitter();
  @Input() featureLoadJS: boolean = false;
  private _value: string = '';
  get value() {
    return this._value;
  }
  ngAfterViewInit(): void {
    if (this.featureLoadJS) {
    }
  }
  set value(v: string) {
    if (v !== this._value) {
      this._value = v;
      this.onChange(v);
    }
  }

  constructor(
    private _commonService: CommonsService,
    private modalService: NzModalService,
    private viewContainerRef: ViewContainerRef,
    //=> cho công cụ sửa ảnh
    private sanitizer: DomSanitizer,
    //private fileService: FileService,
    private toasterService: ToasterService,
    private configStateService: ConfigStateService
  ) {}

  onChange(obj: any) {}

  onTouch() {}

  writeValue(obj: any): void {
    this._value = obj;
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouch = fn;
  }

  //=> Gán giá trị dạng Html vào vị trí con trỏ chuột đang click
  setDataHtml(dataEditor: FileInfoDto[]) {
    dataEditor.forEach(item => {
      let ext = item.fullPathServer.substring(item.fullPathServer.lastIndexOf('.') + 1);
      let content = '';
      if (this.fileImageExt.indexOf(ext.toLowerCase()) >= 0) {
        content = this._commonService.getFckFileImage(
          item.fullPathServer.startsWith('http://') || item.fullPathServer.startsWith('https://')
            ? item.fullPathServer
            : `${env.baseUrlFile}${item.fullPathServer}`,
          item.fileName
        );
      } else if (ext.toLowerCase() === 'mp3') {
        content = this._commonService.getFckFileMediaMP3(
          item.fullPathServer.startsWith('http://') || item.fullPathServer.startsWith('https://')
            ? item.fullPathServer
            : `${env.baseUrlFile}${item.fullPathServer}`
        );
      } else if (ext.toLowerCase() === 'mp4') {
        content = this._commonService.getFckFileMediaMP4(
          item.fullPathServer.startsWith('http://') || item.fullPathServer.startsWith('https://')
            ? item.fullPathServer
            : `${env.baseUrlFile}${item.fullPathServer}`
        );
      } else if (ext.toLowerCase() === 'pdf') {
        content = this._commonService.getFckFileMediaPdf(
          item.fullPathServer.startsWith('http://') || item.fullPathServer.startsWith('https://')
            ? item.fullPathServer
            : `${env.baseUrlFile}${item.fullPathServer}`
        );
      } else if (this.fileOfficeExt.indexOf(ext.toLowerCase()) >= 0) {
        content = this._commonService.getFckFileMediaOffice(
          item.fullPathServer.startsWith('http://') || item.fullPathServer.startsWith('https://')
            ? item.fullPathServer
            : `${env.baseUrlFile}${item.fullPathServer}`
        );
      } else {
        content = this._commonService.getFckFileOther(
          item.fullPathServer.startsWith('http://') || item.fullPathServer.startsWith('https://')
            ? item.fullPathServer
            : `${env.baseUrlFile}${item.fullPathServer}`,
          item.fileName
        );
      }
      const viewFragment = this.editor.editorInstance.data.processor.toView(content);
      const modelFragment = this.editor.editorInstance.data.toModel(viewFragment);
      this.editor.editorInstance.model.change(writer => {
        writer.model.insertContent(modelFragment);
      });
    });
  }

  @Input() config = {
    placeholder: '',
    toolbar: {
      items: [
        'heading',
        'sourceEditing',
        'fontFamily',
        'fontsize',
        'alignment',
        'fontColor',
        'fontBackgroundColor',
        'bold',
        'italic',
        'strikethrough',
        'underline',
        'subscript',
        'superscript',
        'link',
        'outdent',
        'indent',
        'bulletedList',
        'numberedList',
        'todoList',
        'code',
        'codeBlock',
        'insertTable',
        'imageUpload',
        'imageInsert',
        'openfilemanager',
        'mediaEmbed',
        'selectAll',
        'autoImage',
        'findAndReplace',
        'generalHtmlSupport',
        'htmlEmbed',
        'pasteFromOffice',
        'blockQuote',
        'undo',
        'redo',
        'clipboard',
        'fullScreen',
        'highlight',
        'horizontalLine',
        'removeFormat',
        'pageBreak',
        'specialCharacters',
        'restrictedEditingException',
        'showBlocks',
        '|',
        'importFromWord',
        'cloneFromUrl',
        'templatesManager',
        'slidesManager',
        'pieManager',
        'newTemplatesManager',
        'style',
        '|',
        'accessibilityHelp',
      ],
      shouldNotGroupWhenFull: true,
    },
    wordCount: {
      onUpdate: (stats: any) => {
        let placeWordCount = document.getElementById('word-count-editor');
        if (placeWordCount != null) {
          placeWordCount.innerHTML = `Số từ: ${stats.words}, số ký tự: ${stats.characters}`;
        }
      },
    },
    image: {
      styles: ['alignLeft', 'alignCenter', 'alignRight'],
      resizeUnit: 'px',
      resizeOptions: [
        {
          name: 'resizeImage:original',
          label: 'Original',
          value: null,
        },
        {
          name: 'resizeImage:custom',
          label: 'Custom',
          value: 'custom',
        },
        {
          name: 'resizeImage:100',
          label: '100px',
          value: '100',
        },
        {
          name: 'resizeImage:150',
          label: '150px',
          value: '150',
        },
        {
          name: 'resizeImage:250',
          label: '250px',
          value: '250',
        },
        {
          name: 'resizeImage:500',
          label: '500px',
          value: '500',
        },
        {
          name: 'resizeImage:750',
          label: '750px',
          value: '750',
        },
        {
          name: 'resizeImage:1000',
          label: '1000px',
          value: '1000',
        },
        {
          name: 'resizeImage:1200',
          label: '1200px',
          value: '1200',
        },
        {
          name: 'resizeImage:1500',
          label: '1500px',
          value: '1500',
        },
        {
          name: 'resizeImage:2000',
          label: '2000px',
          value: '2000',
        },
      ],
      toolbar: [
        'imageStyle:alignLeft',
        'imageStyle:alignCenter',
        'imageStyle:alignRight',
        '|',
        'ImageResize',
        'toggleImageCaption',
        'Image',
        '|',
        'imageTextAlternative',
        'imageStyle:inline',
        'imageStyle:wrapText',
        'LinkImage',
        'cMSImageChoose',
        'cMSImageEdit',
      ],
    },
    language: {
      ui: 'vi',
    },

    htmlSupport: {
      allow: [
        {
          name: /^.*$/,
          attributes: true,
          classes: true,
          styles: true,
        },
      ],
    },
    style: {
      definitions: [
        {
          name: 'Article category',
          element: 'h3',
          classes: ['category'],
        },
        {
          name: 'Title',
          element: 'h2',
          classes: ['document-title'],
        },
        {
          name: 'Subtitle',
          element: 'h3',
          classes: ['document-subtitle'],
        },
        {
          name: 'Info box',
          element: 'p',
          classes: ['info-box'],
        },
        {
          name: 'Side quote',
          element: 'blockquote',
          classes: ['side-quote'],
        },
        {
          name: 'Marker',
          element: 'span',
          classes: ['marker'],
        },
        {
          name: 'Spoiler',
          element: 'span',
          classes: ['spoiler'],
        },
        {
          name: 'Code (dark)',
          element: 'pre',
          classes: ['fancy-code', 'fancy-code-dark'],
        },
        {
          name: 'Code (bright)',
          element: 'pre',
          classes: ['fancy-code', 'fancy-code-bright'],
        },
      ],
    },
    //#region Config fontFamily
    fontFamily: {
      supportAllValues: true,
    },
    fontSize: {
      options: [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 30, 40, 64],
      supportAllValues: true,
    },
    //#endregion
  };
  onReady(editor: any) {
    if (editor.model.schema.isRegistered('image')) {
      editor.model.schema.extend('image', { allowAttributes: 'blockIndent' });
    }
    editor.model.document.on('change:data', () => {});
  }

  clkbtnFCKChoosefile(): void {
    const modal = this.modalService.create({
      nzTitle: '',
      nzContent: "FckEditorManagementComponent",
      nzViewContainerRef: this.viewContainerRef,
      nzData: {},
      nzFooter: null,
      nzWidth: '92%',
      nzCentered: true,
      nzClosable: true,
      nzKeyboard: false,
    });
    const instanceRef = modal.getContentComponent();
    // instanceRef.typeUploadFck = TypeUploadFck.FILE;
    // instanceRef.manyFiles = true;

    modal.afterClose.subscribe((data: FileInfoDto[]) => {
      if (data !== undefined && data.length > 0) this.setDataHtml(data);
    });
  }

  //#region open chọn file word
  onBtnFCKCloneFromDoc(): void {
    const modal = this.modalService.create({
      nzTitle: '',
      nzContent: ReadContentFromFileDocComponent,
      nzViewContainerRef: this.viewContainerRef,
      nzData: {},
      nzFooter: null,
      nzCentered: true,
      nzClosable: true,
      nzKeyboard: false,
      nzMaskClosable: false,
      nzClassName: 'w-modal-dialog',
    });

    modal.afterClose.subscribe((result) => {
      if (result?.Success) {
        this.isSpinning = true;
        setTimeout(() => {
          this.isSpinning = false;
          const viewFragment = this.editor.editorInstance.data.processor.toView(result.Obj.content);
          const modelFragment = this.editor.editorInstance.data.toModel(viewFragment);
          this.editor.editorInstance.model.change(writer => {
            writer.model.insertContent(modelFragment);
          });
        }, 5000);
      }
    });
  }
  isSpinning: boolean = false;
  //#endegion

  public myWatchdogConfig = {
    crashNumberLimit: 5,
  };

  //#region Clone từ Link web
  onBtnFCKCloneFromLink(): void {
    const modal = this.modalService.create({
      nzTitle: '',
      nzContent: ReadContentFromLinkUrlComponent,
      nzViewContainerRef: this.viewContainerRef,
      nzData: {},
      nzFooter: null,
      nzCentered: true,
      nzClosable: true,
      nzKeyboard: false,
      nzMaskClosable: false,
      nzClassName: 'w-modal-dialog',
    });

    modal.afterClose.subscribe((result) => {
      if (result?.Success) {
        this.isSpinning = true;
        setTimeout(() => {
          this.isSpinning = false;
          const viewFragment = this.editor.editorInstance.data.processor.toView(result.Obj.content);
          const modelFragment = this.editor.editorInstance.data.toModel(viewFragment);
          this.editor.editorInstance.model.change(writer => {
            writer.model.insertContent(modelFragment);
          });
          if (this.onSetImage !== null) {
            this.onSetImage.emit(result.Obj);
          }
        }, 1000);
      }
    });
  }
  //#endregion

  //#region Click edit image
  clkbtnFCKEditImage(): void {
    const imageUtils: any = this.editor.editorInstance.plugins.get('ImageUtils');
    const element = imageUtils.getClosestSelectedImageElement(
      this.editor.editorInstance.model.document.selection
    );
    console.log(JSON.stringify(element));
    console.log(element.getAttribute('src') as string);
    let src = element.getAttribute('src') as string;
    if (!src.startsWith(env.apis.default.url)) {
      // this.modalSrc = src;
      // this.modalVisible = true;
    } else {
      //=> Load dữ liệu qua fullPathServer
      let fullPathServer = src.replace(env.apis.default.url, '');
      // this.onShowTool(fullPathServer);
    }
  }
  //#endregion

   

  //#region Chọn 1 mẫu slide để biên tập
  clkbtnFCKSlidesManagerFCK(): void {
    const modal = this.modalService.create({
      nzTitle: '',
      nzContent: ChooseSlidesEditorComponent,
      nzViewContainerRef: this.viewContainerRef,
      nzData: {},
      nzFooter: null,
      nzCentered: true,
      nzClosable: true,
      nzKeyboard: false,
      nzMaskClosable: false,
      nzClassName: 'w-modal-dialog',
    });
    modal.afterClose.subscribe((result) => {
      if (result?.Success && result?.Data?.length > 0) {
        this.isSpinning = true;
        setTimeout(() => {
          this.isSpinning = false;
          let content = '';
          // if (result.Type === SlideType.CAROURAL_GALLERY) {
          //   content = this._commonService.getTempCarouselGallery(result.Data);
          // } else if (result.Type === SlideType.CAROURAL_LIST) {
          //   content = this._commonService.getTempCarouselList(result.Data);
          // } else if (result.Type === SlideType.COMPARISON) {
          //   content = this._commonService.getTempCompare(result.Data);
          // } else if (result.Type === SlideType.SLIDE_GALLERY) {
          //   content = this._commonService.getTempSlideGallery(result.Data);
          // } else if (result.Type === SlideType.SLIDE_MEDIAPAGE) {
          //   content = this._commonService.getTempSlideMediaPage(result.Data);
          // } else if (result.Type === SlideType.SLIDE_RIGHTTABDASK) {
          //   content = this._commonService.getTempSlideRightTabDask(result.Data);
          // } else if (result.Type === SlideType.GALLERY_LISTIMAGE) {
          //   content = this._commonService.getTempGalleryListImage(result.Data);
          // }
          if (content?.length > 0) {
            const viewFragment = this.editor.editorInstance.data.processor.toView(content);
            const modelFragment = this.editor.editorInstance.data.toModel(viewFragment);
            this.editor.editorInstance.model.change(writer => {
              writer.model.insertContent(modelFragment);
            });
          }
        }, 1000);
      }
    });
  }
  //#endregion

  //#region Chọn 1 mẫu Bài viết để biên tập
  btnNewTemplatesManagerFCK(): void {
    const modal = this.modalService.create({
      nzTitle: '',
      nzContent: ChooseTempNewsComponent,
      nzViewContainerRef: this.viewContainerRef,
      nzData: {},
      nzFooter: null,
      nzCentered: true,
      nzClosable: true,
      nzKeyboard: false,
      nzMaskClosable: false,
      nzClassName: 'w-modal-dialog-listnew',
    });
    modal.afterClose.subscribe((result) => {
      if (result?.Success && result?.Data?.length > 0) {
        console.log(JSON.stringify(result.Data));
        this.isSpinning = true;
        setTimeout(() => {
          this.isSpinning = false;
          let content = '';
          // if (result.Type === TemplateNews.TMPTITLE) {
          //   content = this._commonService.getTempNewTitle(result.Data, result.TitleBox);
          // } else if (result.Type === TemplateNews.TMPTITLEDESCRIPTION) {
          //   content = this._commonService.getTempNewTitleDescription(result.Data);
          // } else if (result.Type === TemplateNews.TMPTITLEDESCRIPTIONIMAGE) {
          //   content = this._commonService.getTempNewTitleDescriptionImage(
          //     result.Data,
          //     result.TitleBox
          //   );
          // } else if (result.Type === TemplateNews.TMPBOX5) {
          //   content = this._commonService.getTempBox5(result.Data, result.TitleBox);
          // } else if (result.Type === TemplateNews.TMPBOX6) {
          //   content = this._commonService.getTempBox6(result.Data);
          // } else if (result.Type === TemplateNews.TMPBOX7) {
          //   content = this._commonService.getTempBox7(result.Data);
          // } else if (result.Type === TemplateNews.TMPBOX8) {
          //   content = this._commonService.getTempBox8(result.Data, result.TitleBox);
          // }
          if (content?.length > 0) {
            const viewFragment = this.editor.editorInstance.data.processor.toView(content);
            const modelFragment = this.editor.editorInstance.data.toModel(viewFragment);
            this.editor.editorInstance.model.change(writer => {
              writer.model.insertContent(modelFragment);
            });
          }
        }, 1000);
      }
    });
  }
  //#endregion
}
