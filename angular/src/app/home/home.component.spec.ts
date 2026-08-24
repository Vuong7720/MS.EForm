import { CoreTestingModule } from "@abp/ng.core/testing";
import { ThemeSharedTestingModule } from "@abp/ng.theme.shared/testing";
import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";
import { NgxValidateCoreModule } from "@ngx-validate/core";
import { NO_ERRORS_SCHEMA } from "@angular/core";
import { Router } from "@angular/router";
import { of } from "rxjs";
import { HomeComponent } from "./home.component";
import { OAuthService } from 'angular-oauth2-oidc';
import { AuthService } from '@abp/ng.core';
import { EFormService } from "@proxy/controllers";

describe("HomeComponent", () => {
  let fixture: ComponentFixture<HomeComponent>;
  const mockOAuthService = jasmine.createSpyObj('OAuthService', ['hasValidAccessToken']);
  const mockAuthService = jasmine.createSpyObj('AuthService', ['navigateToLogin']);
  const mockEFormService = jasmine.createSpyObj('EFormService', ['getDashboardStats']);
  mockEFormService.getDashboardStats.and.returnValue(of({ totalForms: 0, totalRecords: 0, topForms: [] }));

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [HomeComponent],
        schemas: [NO_ERRORS_SCHEMA],
        imports: [
          CoreTestingModule.withConfig(),
          ThemeSharedTestingModule.withConfig(),
          NgxValidateCoreModule,
        ],
        providers: [
          { provide: OAuthService, useValue: mockOAuthService },
          { provide: AuthService, useValue: mockAuthService },
          { provide: EFormService, useValue: mockEFormService },
          { provide: Router, useValue: jasmine.createSpyObj('Router', ['navigate']) },
        ],
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(HomeComponent);
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it("should load dashboard stats on init", () => {
    expect(mockEFormService.getDashboardStats).toHaveBeenCalled();
    expect(fixture.componentInstance.stats?.totalForms).toBe(0);
  });
});
