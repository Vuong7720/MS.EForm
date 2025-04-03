import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChooseTempNewsComponent } from './choose-temp-news.component';

describe('ChooseTempNewsComponent', () => {
  let component: ChooseTempNewsComponent;
  let fixture: ComponentFixture<ChooseTempNewsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChooseTempNewsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ChooseTempNewsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
