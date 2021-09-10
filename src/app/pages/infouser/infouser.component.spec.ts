import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InfouserComponent } from './infouser.component';

describe('InfouserComponent', () => {
  let component: InfouserComponent;
  let fixture: ComponentFixture<InfouserComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InfouserComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InfouserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
