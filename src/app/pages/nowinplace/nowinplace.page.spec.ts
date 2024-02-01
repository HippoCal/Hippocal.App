import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NowinplacePage } from './nowinplace.page';

describe('NowinplacePage', () => {
  let component: NowinplacePage;
  let fixture: ComponentFixture<NowinplacePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NowinplacePage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NowinplacePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
