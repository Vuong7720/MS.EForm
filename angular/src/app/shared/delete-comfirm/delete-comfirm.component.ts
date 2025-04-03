import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
@Component({
  standalone: false,
  selector: 'app-delete-comfirm',
  templateUrl: './delete-comfirm.component.html',
  styleUrls: ['./delete-comfirm.component.scss']
})
export class DeleteComfirmComponent implements OnInit {
  form: FormGroup;
  constructor( public activeModal: NgbActiveModal){

  }
  ngOnInit(): void {
    
  }

  
  save(){

  }
}