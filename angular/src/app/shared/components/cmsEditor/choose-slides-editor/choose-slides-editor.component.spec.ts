import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChooseSlidesEditorComponent } from './choose-slides-editor.component';

describe('ChooseSlidesEditorComponent', () => {
  let component: ChooseSlidesEditorComponent;
  let fixture: ComponentFixture<ChooseSlidesEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChooseSlidesEditorComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ChooseSlidesEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
