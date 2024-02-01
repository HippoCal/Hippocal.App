import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ImageviewPage } from './imageview.page';

describe('ImageviewPage', () => {
  let component: ImageviewPage;
  let fixture: ComponentFixture<ImageviewPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ImageviewPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ImageviewPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
