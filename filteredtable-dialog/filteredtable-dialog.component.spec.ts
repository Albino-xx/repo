import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FilteredtableDialogComponent } from './filteredtable-dialog.component';

describe('FilteredtableDialogComponent', () => {
  let component: FilteredtableDialogComponent;
  let fixture: ComponentFixture<FilteredtableDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FilteredtableDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FilteredtableDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
