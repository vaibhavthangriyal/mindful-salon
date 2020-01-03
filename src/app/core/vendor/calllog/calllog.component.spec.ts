import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CalllogComponent } from './calllog.component';

describe('CalllogComponent', () => {
  let component: CalllogComponent;
  let fixture: ComponentFixture<CalllogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CalllogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CalllogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
