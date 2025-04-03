import { ComponentFixture, TestBed } from "@angular/core/testing";
import { CreateAttributeComponent } from "./create_attribute.component";


describe('CreateAttributeComponent', () => {
  let component: CreateAttributeComponent;
  let fixture: ComponentFixture<CreateAttributeComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CreateAttributeComponent]
    });
    fixture = TestBed.createComponent(CreateAttributeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});


