import { CoreTestingModule } from "@abp/ng.core/testing";
import { ThemeSharedTestingModule } from "@abp/ng.theme.shared/testing";
import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";
import { NgxValidateCoreModule } from "@ngx-validate/core";
import { OAuthService } from 'angular-oauth2-oidc';
import { AuthService } from '@abp/ng.core';
import { FormCategoryComponent } from "./form_categories.component";

describe("FormCategoryComponent", () => {
  let fixture: ComponentFixture<FormCategoryComponent>;
  const mockOAuthService = jasmine.createSpyObj('OAuthService', ['hasValidAccessToken']);
  const mockAuthService = jasmine.createSpyObj('AuthService', ['navigateToLogin']);

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [FormCategoryComponent],
        imports: [
          CoreTestingModule.withConfig(),
          ThemeSharedTestingModule.withConfig(),
          NgxValidateCoreModule,
        ],
        providers: [
          { provide: OAuthService, useValue: mockOAuthService },
          { provide: AuthService, useValue: mockAuthService },
        ],
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(FormCategoryComponent);
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(fixture.componentInstance).toBeTruthy();
  });
});
