import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReadContentFromLinkUrlComponent } from './read-content-from-link-url.component';

describe('ReadContentFromLinkUrlComponent', () => {
  let component: ReadContentFromLinkUrlComponent;
  let fixture: ComponentFixture<ReadContentFromLinkUrlComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReadContentFromLinkUrlComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ReadContentFromLinkUrlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
