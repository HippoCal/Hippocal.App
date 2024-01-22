import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GetEmailPage } from './get-email.page';

describe('GetEmailPage', () => {
  let component: GetEmailPage;
  let fixture: ComponentFixture<GetEmailPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GetEmailPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GetEmailPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
