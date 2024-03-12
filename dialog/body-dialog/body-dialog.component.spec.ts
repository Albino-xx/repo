import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BodyDialogComponent } from './body-dialog.component';

describe('BodyDialogComponent', () => {
  let component: BodyDialogComponent;
  let fixture: ComponentFixture<BodyDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BodyDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BodyDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
