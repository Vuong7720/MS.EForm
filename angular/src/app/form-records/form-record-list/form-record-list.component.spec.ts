import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToasterService } from '@abp/ng.theme.shared';
import { of } from 'rxjs';
import { EFormService } from '@proxy/controllers';
import { FormRecordListComponent } from './form-record-list.component';

describe('FormRecordListComponent', () => {
  let fixture: ComponentFixture<FormRecordListComponent>;
  let component: FormRecordListComponent;
  let serviceSpy: jasmine.SpyObj<EFormService>;
  let routerSpy: jasmine.SpyObj<Router>;

  const pagedResult = {
    totalCount: 2,
    items: [
      { id: '1', title: 'Bản ghi A', formId: 'f1' },
      { id: '2', title: 'Bản ghi B', formId: 'f1' },
    ],
  };

  function setup(queryFormId: string | null) {
    serviceSpy = jasmine.createSpyObj('EFormService', ['getPagingFormRecord', 'deleteFormRecordById', 'get']);
    serviceSpy.getPagingFormRecord.and.returnValue(of(pagedResult as any));
    serviceSpy.get.and.returnValue(of({ requireApproval: false } as any));
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      declarations: [FormRecordListComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: EFormService, useValue: serviceSpy },
        { provide: Router, useValue: routerSpy },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { queryParamMap: { get: (key: string) => (key === 'formId' ? queryFormId : null) } },
          },
        },
        { provide: ToasterService, useValue: jasmine.createSpyObj('ToasterService', ['success', 'error']) },
        { provide: NgbModal, useValue: jasmine.createSpyObj('NgbModal', ['open']) },
      ],
    });

    fixture = TestBed.createComponent(FormRecordListComponent);
    component = fixture.componentInstance;
  }

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('should create', () => {
    setup(null);
    expect(component).toBeTruthy();
  });

  it('should load paged records on init', () => {
    setup(null);
    fixture.detectChanges();

    expect(serviceSpy.getPagingFormRecord).toHaveBeenCalled();
    expect(component.totalCount).toBe(2);
    expect(component.lstRecord.length).toBe(2);
  });

  it('should filter by formId from the query param', () => {
    setup('f1');
    fixture.detectChanges();

    expect(component.page.formId).toBe('f1');
    expect(serviceSpy.getPagingFormRecord).toHaveBeenCalledWith(jasmine.objectContaining({ formId: 'f1' }));
  });

  it('should navigate to the detail view when view() is called', () => {
    setup(null);
    component.view('abc-123');
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/form-records/view', 'abc-123'], {
      queryParams: { formId: component.page.formId, pageIndex: component.page.pageIndex, pageSize: component.page.pageSize },
    });
  });

  it('should clear the formId filter and navigate back to the plain list', () => {
    setup('f1');
    fixture.detectChanges();
    component.page.formId = 'f1';

    component.clearFilter();

    expect(component.page.formId).toBeUndefined();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/form-records']);
  });
});
