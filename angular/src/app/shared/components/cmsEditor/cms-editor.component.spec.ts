import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CmsEditorComponent } from './cms-editor.component';

describe('CmsEditorComponent', () => {
  let component: CmsEditorComponent;
  let fixture: ComponentFixture<CmsEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CmsEditorComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CmsEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
