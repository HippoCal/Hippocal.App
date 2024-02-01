import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EdithorsePage } from './edithorse.page';

describe('EdithorsePage', () => {
  let component: EdithorsePage;
  let fixture: ComponentFixture<EdithorsePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EdithorsePage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EdithorsePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
