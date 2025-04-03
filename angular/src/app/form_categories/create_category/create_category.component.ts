import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
@Component({
  standalone: false,
  selector: 'app-create_category',
  templateUrl: './create_category.component.html',
  styleUrls: ['./create_category.component.scss']
})
export class CreateCategoryComponent implements OnInit {
  form: FormGroup;
  constructor( public activeModal: NgbActiveModal){

  }
  ngOnInit(): void {
    
  }

  
  save(){

  }
}