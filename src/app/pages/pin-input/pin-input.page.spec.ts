import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PinInputPage } from './pin-input.page';

describe('PinInputPage', () => {
  let component: PinInputPage;
  let fixture: ComponentFixture<PinInputPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PinInputPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PinInputPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
