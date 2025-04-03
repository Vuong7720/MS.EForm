import { ToasterService } from '@abp/ng.theme.shared';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { EFormService } from '@proxy/controllers';
import { FormCategoryDto } from '@proxy/form-models/form-categories';
@Component({
  standalone: false,
  selector: 'app-create_category',
  templateUrl: './create_category.component.html',
  styleUrls: ['./create_category.component.scss']
})
export class CreateCategoryComponent implements OnInit {
  form: FormGroup;
  @Input() Id: string;
  @Output() categoryUpdate = new EventEmitter();
  cateModel: FormCategoryDto


  constructor( 
    public activeModal: NgbActiveModal,
    private fb: FormBuilder,
    private service: EFormService,
    private toasterService: ToasterService
  
  ){}


  ngOnInit(): void {
    this.buildForm();
    if(this.Id){
      console.log(this.Id)
      this.getCategoryById(this.Id);
    }
  }

  getCategoryById(id: string){
    this.service.getCategoryByIdById(id).subscribe(res =>{
      this.cateModel = res;
      this.buildForm();
    })
  }

  buildForm(){
    this.form = this.fb.group({
      title:[this.cateModel?.title || null],
      description:[this.cateModel?.description || null],
      index:[this.cateModel?.index || null]
    })
  }

  save(){
    if(this.form.invalid){
      this.toasterService.error("Dữ liệu nhập vào không hợp lệ")
      return;
    }
    this.Id?
    this.service.updateFormCategoryByIdAndModel(this.Id, this.form.value).subscribe(res =>{
      if(res.status){
        this.toasterService.success(res.messages);
        this.categoryUpdate.emit(res.messages)
        this.activeModal.close();
      }else{
        this.toasterService.error(res.messages);
      }
    })
    :this.service.createFormCategoryByModel(this.form.value).subscribe(res =>{
      if(res.status){
        this.toasterService.success(res.messages);
        this.categoryUpdate.emit(res.messages)
        this.activeModal.close();
      }else{
        this.toasterService.error(res.messages);
      }
    })
  }
}