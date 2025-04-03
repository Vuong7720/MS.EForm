import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DeleteComfirmComponent } from '../shared/delete-comfirm/delete-comfirm.component';
import { CreateFormComponent } from './create_form/create_form.component';

@Component({
  standalone: false,
  selector: 'app-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.scss']
})

export class FormComponent implements OnInit {

	constructor(
		private modalService: NgbModal
	){

	}


  ngOnInit(): void {
    
  }

  listOfData: Person[] = [
    {
      key: '1',
      name: 'Biểu mẫu đăng ký thành viên hội cứu thế',
      description: 'Đăng ký tài khoản để thực hiện gia nhập công hội'
    },
    {
      key: '2',
      name: 'Biểu mẫu đăng ký dịch vụ',
      description: 'Dịch vụ lính đánh thuê'
    },
    {
      key: '3',
      name: 'Biểu mẫu đăng ký vào server black moon',
      description: 'Chuyển server'
    }
  ];

  addCategory(id: string){
	const modalRef = this.modalService.open(CreateFormComponent, { size: 'xl', backdrop: 'static', centered: true, });
	modalRef.componentInstance.id = id
  }
  delete(id: string){
	const modalRef = this.modalService.open(DeleteComfirmComponent, { size: 'confirm', backdrop: 'static', centered: true, });
	modalRef.componentInstance.id = id
  }
  
}
interface Person {
	key: string;
	name: string;
	description: string;
  }