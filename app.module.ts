import { HttpClientModule } from '@angular/common/http';
import { NgModule,APP_INITIALIZER  } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {MatTableModule} from '@angular/material/table';
import {MatPaginatorModule} from '@angular/material/paginator';
import {MatSortModule} from '@angular/material/sort';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatTabsModule} from '@angular/material/tabs';
import { LayoutModule } from '@angular/cdk/layout';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import {MatButtonToggleModule} from '@angular/material/button-toggle';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import {MatMenuModule} from '@angular/material/menu';
import {MatInputModule} from '@angular/material/input';
import { ReactiveFormsModule, FormsModule } from '@angular/forms'; 
import {MatDialogModule,  MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import {MatCardModule} from '@angular/material/card';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import { ClipboardModule } from "@angular/cdk/clipboard";
import {MatTreeModule} from '@angular/material/tree';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatSelectModule} from '@angular/material/select';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatTooltipModule} from '@angular/material/tooltip';
import {NgxChartsModule} from '@swimlane/ngx-charts';
import { ConfigService } from './config.service'; // Add the import for ConfigService
import {MatSnackBarModule} from '@angular/material/snack-bar';
import {MatChipsModule} from '@angular/material/chips';
import { BodyDialogComponent } from './dialog/body-dialog/body-dialog.component';
import { SearchDialogComponent } from './search-dialog/search-dialog.component';
import { HistoryComponent } from './history/history.component';
import {MatDatepickerModule} from '@angular/material/datepicker';
import { RealtimeComponent } from './realtime/realtime.component';
import { HandlerAlertComponent } from './handler-alert/handler-alert.component';
import { ReconnectdialogComponent } from './reconnectdialog/reconnectdialog.component';
import { FilteredtableDialogComponent } from './filteredtable-dialog/filteredtable-dialog.component';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import {TableModule} from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';



@NgModule({
  declarations: [
    AppComponent,
    BodyDialogComponent,
    SearchDialogComponent,
    HistoryComponent,
    RealtimeComponent,
    HandlerAlertComponent,
    ReconnectdialogComponent,
    FilteredtableDialogComponent
  ],
  imports: [
    BrowserModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatDatepickerModule,
    MatSelectModule,
    MatSnackBarModule,
    NgxChartsModule,
    InputTextModule,
    HttpClientModule,
    AppRoutingModule,
    TableModule,
    MatChipsModule,
    BrowserAnimationsModule, 
    MatCardModule,
    DialogModule,
    ButtonModule,
    MatAutocompleteModule,
    MatPaginatorModule,
    MatCheckboxModule,
    MatSortModule,
    MatFormFieldModule,
    MatTabsModule,
    MatTreeModule,
    MatTableModule,
    LayoutModule,
    MatToolbarModule,
    MatButtonModule,
    MatSidenavModule,
    MatIconModule,
    MatButtonToggleModule,
    MatSlideToggleModule,
    MatMenuModule,
    MatInputModule,
    FormsModule,
    MatDialogModule,
    MatProgressBarModule,
    MatListModule,
    ClipboardModule,
    ReactiveFormsModule
  ],
  entryComponents: [
    BodyDialogComponent,
    SearchDialogComponent,
    RealtimeComponent,
    ReconnectdialogComponent,
    HandlerAlertComponent,
    FilteredtableDialogComponent
  ],
  providers: [
    BodyDialogComponent,
    MatProgressSpinnerModule,
    SearchDialogComponent,
    RealtimeComponent,
    ReconnectdialogComponent,
    HandlerAlertComponent,
    FilteredtableDialogComponent,
    ConfigService, // Include the ConfigService in the providers
    {
      provide: APP_INITIALIZER,
      useFactory: (configService: ConfigService) => () => configService.loadAppConfig(),
      deps: [ConfigService],
      multi: true
    },
    { provide: MAT_DIALOG_DATA, useValue: {} },
    { provide: MatDialogRef, useValue: {} },
  ],
  bootstrap: [AppComponent],
 
})
export class AppModule {
  
 }
