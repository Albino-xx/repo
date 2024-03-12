import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { HistoryComponent } from './history.component';


const routes: Routes = [
  { path: '', component: HistoryComponent },
  // Add other routes as needed
];


@NgModule({
  declarations: [HistoryComponent],
  imports: [
    RouterModule.forChild(routes)
  ]
})
export class HistoryModule { }
