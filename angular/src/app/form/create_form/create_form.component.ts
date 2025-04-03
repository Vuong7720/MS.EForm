import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ClassicEditor, EditorConfig } from 'ckeditor5';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CreateAttributeComponent } from '../create_attribute/create_attribute.component';
import { CmsEditorComponent } from 'src/app/shared/components/cmsEditor/cms-editor.component';
@Component({
  standalone: false,
  selector: 'app-create_form',
  templateUrl: './create_form.component.html',
  styleUrls: ['./create_form.component.scss']
})
export class CreateFormComponent implements OnInit  {
  form: FormGroup;
  @ViewChild('editorSEOContent') editorSEOContent: CmsEditorComponent;
	public config: EditorConfig | null = null;
  constructor( 
    public activeModal: NgbActiveModal,
    private fb: FormBuilder,
    private modalService: NgbModal
  ){

  }
  ngOnInit(): void {
    this.buildForm();
  }
  buildForm(){
    this.form = this.fb.group({
      title:[null],
      content:[null],
      categoryId:[null]
    })
  }
  
  save(){
    console.log(this.form.value)
  }


  // lấy dữ liệu thuộc tính kéo thả
  onDragStart(event: DragEvent, item: any) {
    event.dataTransfer?.setData("application/json", JSON.stringify(item));
  }
  
  
  onDragOver(event: DragEvent) {
    event.preventDefault(); // Ngăn chặn hành vi mặc định để cho phép thả
  }
  
  // hành động thả xuống để nhận dữ liệu và xử lý
  onDrop1(event: DragEvent) {
    event.preventDefault();
    const data = event.dataTransfer?.getData("application/json");
  
    if (data && this.editorSEOContent) {
      const item = JSON.parse(data);
      const editorInstance = this.editorSEOContent.editor.editorInstance;
  
      if (editorInstance) {
        editorInstance.model.change(writer => {
          const insertPosition = editorInstance.model.document.selection.getFirstPosition();
          let fieldHtml = "";
  
          switch (item.type) {
            case 1: // Input text
            case 2: // Datetime picker
            case 6: // Default text type
              fieldHtml = `<span id="${item.code}" contenteditable="false" class="drag-field field-type-${item.type}"> ${item.title} </span>`;
              break;
            case 3: // Checkbox
              fieldHtml = `<span id="${item.code}" class="drag-field field-type-${item.type}">
                              <input type="checkbox" /> <label>${item.title}</label>
                           </span>`;
              break;
            case 4: // Combo box
            case 5: // Large text
              fieldHtml = `<span id="${item.code}" contenteditable="false" class="drag-field field-type-${item.type}"> ${item.title} </span>`;
              break;
          }
  
          const viewFragment = editorInstance.data.processor.toView(fieldHtml);
          const modelFragment = editorInstance.data.toModel(viewFragment);
          // let itm = writer.createElement('span');
          // itm._setAttribute('id','idnn');
          writer.insert(modelFragment, insertPosition);
  
          // Sau khi thêm phần tử, gọi hàm xử lý resizable (nếu cần)
         // setTimeout(() => this.makeFieldsResizable(), 500);
        });
      }
    }
  }


  onDrop(event: DragEvent) {
    event.preventDefault();
    const data = event.dataTransfer?.getData("application/json");
  
    if (data && this.editorSEOContent) {
      const item = JSON.parse(data);
      const editorInstance = this.editorSEOContent.editor.editorInstance;
  
      if (editorInstance) {
        let fieldHtml = "";
  
          switch (item.type) {
            case 1: // Input text
            case 2: // Datetime picker
            case 6: // Default text type
              fieldHtml = `{<span id="${item.code}" contenteditable="false" class="drag-field field-type-${item.type}"> {${item.title}} </span>}`;
              break;
            case 3: // Checkbox
              fieldHtml = `{<span id="${item.code}" class="drag-field field-type-${item.type}">
                              <input type="checkbox" /> <label>{{${item.title}}}</label>
                           </span>}`;
              break;
            case 4: // Combo box
            case 5: // Large text
              fieldHtml = `{<span id="${item.code}" contenteditable="false" class="drag-field field-type-${item.type}"> {{${item.title}}} </span>`;
              break;
          }
  
        const viewFragment = editorInstance.data.processor.toView(fieldHtml);
        const modelFragment = editorInstance.data.toModel(viewFragment);
        editorInstance.model.change(writer => {
          writer.model.insertContent(modelFragment);
          setTimeout(() => this.makeFieldsResizable(), 500);
        });
      }
    }
  }
  makeFieldsResizable() {
    debugger
    const fields = document.querySelectorAll('.drag-field');
  
    fields.forEach((field: HTMLElement) => {
      const fieldTypeMatch = field.className.match(/field-type-(\d+)/);
      if (!fieldTypeMatch) return;
  
      const type = parseInt(fieldTypeMatch[1]);
      let maxWidth = 750, maxHeight = 23, minWidth = 50, minHeight = 23;
  
      switch (type) {
        case 2: maxWidth = 750; break; // Large text
        case 3: maxWidth = 200; break; // Date field
        case 4:
        case 5: maxWidth = 700; break; // Combo & Checkbox
      }
  alert(2);
      // Áp dụng thuộc tính resize
      field.style.resize = "horizontal";  // Chỉ cho phép kéo ngang
      field.style.overflow = "hidden"; // Ẩn nội dung tràn ra ngoài
      field.style.maxWidth = `${maxWidth}px`;
      field.style.minWidth = `${minWidth}px`;
      field.style.maxHeight = `${maxHeight}px`;
      field.style.minHeight = `${minHeight}px`;
    });
  }
  

// mở modal thêm mới thuộc tính
  addAttribute(id: string){
	const modalRef = this.modalService.open(CreateAttributeComponent, { size: 'comfirm', backdrop: 'static', centered: true, });
	modalRef.componentInstance.id = id
  }

  data = [
    {
      title:'Tên',
      code:'TEN',
      type:1, // dạng text
      config:'required: true'
    },
    {
      title:'Ngày sinh',
      code:'NS',
      type:2, // dạng datetime
      config:'required: true'
    },
    {
      title:'Nơi ở hiện tại',
      code:'DC',
      type:1,
      config:'required: true'
    },
    {
      title:'Có ngu không',
      code:'QS',
      type:3, // dạng true / false
      config:'required: true'
    },
    {
      title:'Thông tin khác',
      code:'MR',
      type:1,
      config:'required: true'
    },
  ];
}