import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReadContentFromFileDocComponent } from './read-content-from-file-doc.component';

describe('ReadContentFromFileDocComponent', () => {
  let component: ReadContentFromFileDocComponent;
  let fixture: ComponentFixture<ReadContentFromFileDocComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReadContentFromFileDocComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ReadContentFromFileDocComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
