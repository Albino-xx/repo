import { Component, OnInit, ViewChild, Inject } from '@angular/core';
import { MatCheckbox } from '@angular/material/checkbox';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatInput } from '@angular/material/input';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ConfigService } from '../config.service';

@Component({
  selector: '[app-filteredtable-dialog]',
  templateUrl: './filteredtable-dialog.component.html',
  styleUrls: ['./filteredtable-dialog.component.scss']
})
export class FilteredtableDialogComponent  {

  @ViewChild('startDateInput') startDateInput!: MatInput;
  @ViewChild('endDateInput') endDateInput!: MatInput;

  @ViewChild('successCheckbox') successCheckbox!: MatCheckbox;
  @ViewChild('errorsCheckbox') errorsCheckbox!: MatCheckbox;
  @ViewChild('missingCheckbox') missingCheckbox!: MatCheckbox;

  events: string[] = [];
  form: FormGroup;

  constructor(private http: HttpClient, private configService: ConfigService, private fb: FormBuilder, public dialogRef: MatDialogRef<FilteredtableDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.form = this.fb.group({
      startDate: [this.getCurrentDateTimeStartDate()],
      endDate: [this.getCurrentDateTimeEndDate()],
      success: [false],
      errors: [false],
      missing: [false]
    }, { validators: this.checkAtLeastOneCheckboxSelected });
  }

   // Validator to check at least one checkbox is selected
   checkAtLeastOneCheckboxSelected(group: FormGroup) {
    const checkboxes = ['success', 'errors', 'missing'];

    const atLeastOneSelected = checkboxes.some(checkbox => group.get(checkbox)?.value);

    return atLeastOneSelected ? null : { atLeastOneCheckboxRequired: true };
  }

  getCurrentDateTimeEndDate(): string {
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = ('0' + (currentDate.getMonth() + 1)).slice(-2);
    const day = ('0' + currentDate.getDate()).slice(-2);


    const staticTime = '23:59:00';

    return `${year}-${month}-${day}T${staticTime}`;
  }

  getCurrentDateTimeStartDate(): string {
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = ('0' + (currentDate.getMonth() + 1)).slice(-2);
    const day = ('0' + currentDate.getDate()).slice(-2);


    const staticTime = '00:00:00';

    return `${year}-${month}-${day}T${staticTime}`;
  }

  addEvent(type: string, event: MatDatepickerInputEvent<Date>) {
    this.events.push(`${type}: ${event.value}`);
  }



  BacktoRT() {
    window.location.reload();
  }

  SendFilterParams() {

    const selectedValues: number[] = [];

    if (this.form.value.success) {
      selectedValues.push(1); // '1' represents 'Success'
    }
    if (this.form.value.errors) {
      selectedValues.push(2); // '2' represents 'Errors'
    }
    if (this.form.value.missing) {
      selectedValues.push(3); // '3' represents 'Missing'
    }


    const filterParams2 = {
      StartDateTime: this.form.value.startDate ? new Date(this.form.value.startDate).toISOString() : null,
      EndDateTime: this.form.value.endDate ? new Date(this.form.value.endDate).toISOString() : null,
      WagerStatus: selectedValues
    };

    this.dialogRef.close(filterParams2);

    const serializedFilterParams2 = JSON.stringify(filterParams2);
    localStorage.setItem("FilterParamshistory", serializedFilterParams2);

  }
 
}
