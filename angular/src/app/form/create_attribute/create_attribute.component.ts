import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ClassicEditor, EditorConfig } from 'ckeditor5';
@Component({
  standalone: false,
  selector: 'app-create_attribute',
  templateUrl: './create_attribute.component.html',
  styleUrls: ['./create_attribute.component.scss']
})
export class CreateAttributeComponent implements OnInit {
  form: FormGroup;
	public config: EditorConfig | null = null;
  constructor( 
    public activeModal: NgbActiveModal,
    private fb: FormBuilder,
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

}