import { AuthService } from '@abp/ng.core';
import { Component, ElementRef, OnInit, ViewChild, ViewEncapsulation, inject } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CreateCategoryComponent } from './create_category/create_category.component';
import { DeleteComfirmComponent } from '../shared/delete-comfirm/delete-comfirm.component';

@Component({
  standalone: false,
  selector: 'app-form_categories',
  templateUrl: './form_categories.component.html',
  styleUrls: ['./form_categories.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class FormCategoryComponent implements OnInit {

	constructor(
		private modalService: NgbModal
	){

	}


  ngOnInit(): void {
    
  }

  listOfData: Person[] = [
    {
      key: '1',
      name: 'Đăng ký tài khoản',
      description: 'Đăng ký tài khoản để thực hiện gia nhập công hội'
    },
    {
      key: '2',
      name: 'Đăng ký dịch vụ',
      description: 'Dịch vụ thuê lính'
    },
    {
      key: '3',
      name: 'Đăng ký vào thế giới quỷ',
      description: 'Chuyển server'
    }
  ];


  addCategory(id: string){
	const modalRef = this.modalService.open(CreateCategoryComponent, { size: 'confirm', backdrop: 'static', centered: true, });
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