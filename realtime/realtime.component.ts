import { AfterViewInit, Component, ViewChild, Injectable, OnInit, ElementRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { HttpHeaders } from '@angular/common/http';
import { MatPaginator } from '@angular/material/paginator';
import { FormControl } from '@angular/forms';
import { environment } from 'src/environments/environment';
import { Counters, Reports, FailedReports } from '../classes/services';
import { MatTableDataSource } from '@angular/material/table';
import { Color, ScaleType } from '@swimlane/ngx-charts';
import { MatDialog } from '@angular/material/dialog';
import { ConfigService } from '../config.service';
import { WebsocketService } from '../websocket.service';
import { BodyDialogComponent } from '../dialog/body-dialog/body-dialog.component';
import { SearchDialogComponent } from '../search-dialog/search-dialog.component';
import { DatePipe } from '@angular/common';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar, MatSnackBarRef  } from '@angular/material/snack-bar';
import {  retryWhen, tap } from 'rxjs/operators';
import { timer } from 'rxjs';
import { delayWhen } from 'rxjs/operators';
import { ReconnectdialogComponent } from '../reconnectdialog/reconnectdialog.component';
import { FilteredtableDialogComponent } from '../filteredtable-dialog/filteredtable-dialog.component';

export interface DialogData {

}

export interface Wager {
  Guid: string;
}

export interface ClickedButtons {
  [key: string]: boolean;
}



const headers = new HttpHeaders()
  .set('content-type', 'application/json')
  .set('Access-Control-Allow-Origin', '*');

const datepipe: DatePipe = new DatePipe('en-US')

const ELEMENT_DATA: Reports[] = [];
const COUNTER_ELEMENT_DATA: Counters[] = [];
const FAILED_ELEMENT_DATA: FailedReports[] = [];


@Component({
  selector: 'app-realtime',
  template: `
  <pre [innerHtml]="circularObj | prettyjson:3"></pre>
`,
  templateUrl: './realtime.component.html',
  styleUrls: ['./realtime.component.scss'],
  //pipes: [ PrettyPrintPipe ],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],

})

@Injectable()


export class RealtimeComponent implements OnInit, AfterViewInit {

  showFilterBar = false;

  isConditionDispatcherPW: boolean = false;
  isConditionWagerPost: boolean = false;
  isConditionRemoting: boolean = false;
  isConditioWagerSlip: boolean = false;

  ngAfterViewInit() {
    this.faileddataSource.paginator = this.failedpaginator;
  }

  CheckSvcStatus() {
    this.isConditionDispatcherPW = !this.isConditionDispatcherPW;
  }

  showDelay = new FormControl(1000);
  hideDelay = new FormControl(2000);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatPaginator) failedpaginator!: MatPaginator;
  @ViewChild(MatPaginator) successpaginator!: MatPaginator;
  @ViewChild(MatPaginator) errorpaginator!: MatPaginator;
  @ViewChild(MatPaginator) missingpaginator!: MatPaginator;

  @ViewChild('filterInput') filterInput!: ElementRef;


  view: [number, number] = [900, 290];


  viewline: [number, number] = [920, 400];

  cardColor: string = '#232837';

  startdate: any;
  enddate: any;
  // Stats Options
  gradient: boolean = true;
  showLegend: boolean = true;
  showLabels: boolean = true;
  isDoughnut: boolean = false;

  displayBasic: boolean = false;

  legend: boolean = true;
  animations: boolean = true;
  xAxis: boolean = true;
  yAxis: boolean = true;
  showYAxisLabel: boolean = true;
  showXAxisLabel: boolean = true;
  xAxisLabel: string = 'Date';
  yAxisLabel: string = 'Wagers';
  timeline: boolean = true;
  display: boolean = false;

  colorScheme: Color = {
    name: 'myScheme',
    selectable: true,
    group: ScaleType.Ordinal,
    domain: ['#43FF22', '#FF321A', '#F8FF18', '#D5D5D5'],
  };

  searchtable: any[] = [];
  searchcounter: any
  searchresult: any

  expandedElement: any | null = null;


 // columnsToDisplay: string[] = ['Guid', 'Request_Date', 'Response Date', 'Latency', 'Delay', 'Status'];
  columnsToDisplay = ['Guid', 'Request_Date', 'Response Date', 'Latency', 'Delay', 'Status'];
  sourcecolumnsToDisplay: string[] = ['Processed', 'NotProcessed', 'Late'];
  failedcolumnsToDisplay: string[] = ['Date', 'Guid'];
  messages: any[] = [];
  counters: any[] = [];
  countersto: any[] = [];
  appVersion: string = environment.version;

  public dataCounter_false: any[] = []

  filteredData: any[] = [];

  filteredBarVisible: boolean = true
  filteredBarVisible_success: boolean = false
  filteredBarVisible_error: boolean = false
  filteredBarVisible_missing: boolean = false

  filteredisTableVisible: boolean = false;
  filteredisTableVisible_success: boolean = false;
  filteredisTableVisible_error: boolean = false;
  filteredisTableVisible_missing: boolean = false;

  isTableVisible: boolean = false;
  falseisTableVisible: boolean = true;

  isSuccessTableVisible: boolean = false;
  isErrorTableVisible: boolean = false;
  isMissingTableVisible: boolean = false;

  activeButtonId: string | null = 'errors';

  private snackBarRef!: MatSnackBarRef<any>;

  showChart: boolean = true;
  falseshowChart: boolean = false;

  showFilterButton: boolean = true;
  showFilterFalseButton: boolean = false;

  //Table data
  dataSource = new MatTableDataSource<Reports>(ELEMENT_DATA);
  false_dataSource = new MatTableDataSource<Reports>(ELEMENT_DATA);
  success_dataSource !: any[];
  success_dataSource_filter!: any[];

  isConnected = true;
  isAttemptingReconnect = false;

  realTimeDataSource: any[] = []; // Stores real-time data
  realTimeDataSource_success: any[] = []; // Stores real-time data
  realTimeDataSource_missing: any[] = []; // Stores real-time data
  realTimeDataSource_error: any[] = []; // Stores real-time data

  filteredDataSource!: any[]; // Used for the filtered table
  filteredDataSource_success!: any[]; // Used for the filtered table
  filteredDataSource_error!: any[]; // Used for the filtered table
  filteredDataSource_missing = new MatTableDataSource<any>([]); // Used for the filtered table

  error_dataSource!: any[];
  defaultSortField: string = 'Guid'; // Default sort column
  defaultSortOrder: number = 1; // 1 for ascending, -1 for descending

  missing_dataSource = new MatTableDataSource<Reports>(ELEMENT_DATA);
  counterSource = new MatTableDataSource<Counters>(COUNTER_ELEMENT_DATA);
  faileddataSource = new MatTableDataSource<FailedReports>(FAILED_ELEMENT_DATA);

  selectors: FormGroup;
  originalData: any[] = [];


  title = 'WagerMonitorSvc';
  showFiller = false;
  constructor(
    private router: Router,
    private websocketService: WebsocketService,
    private configService: ConfigService,
    private http: HttpClient,
    private snackBar: MatSnackBar,
    public dialog: MatDialog,
    public BodyDialog: BodyDialogComponent,
    public SearchDialog: SearchDialogComponent,
    public ReconnectDialog: ReconnectdialogComponent,
    public FilteredtableDialog: FilteredtableDialogComponent,
    fb: FormBuilder
  ) {

    this.selectors = fb.group({
      success: [false],
      errors: [false],
      missing: [false]
    });

    this.GetErrorWagers()

  }

  toggleButtonState(buttonId: string) {
    this.activeButtonId = this.activeButtonId === buttonId ? null : buttonId;
  }

  isButtonActive(buttonId: string): boolean {
    return this.activeButtonId === buttonId;
  }

  filterData($event: any) {
    this.success_dataSource.filter = $event.target.value;
  }

  private displayError(message: string) {
    this.snackBarRef?.dismiss();
    this.snackBar.open(message, 'Close', {
      horizontalPosition: 'right',
      verticalPosition: 'top',
    });
  }

  private tryConnect() {
    if (this.websocketService.getMessageStream()) {
      this.displayStatus('Connected', 'success');
      this.showReconnectDialog();
    } else {
      this.websocketService.getMessageStream().subscribe(
        (message:any) => {
          // Handle the success case
          this.displayStatus('Connection successful', 'success');
          // Process the message as before
        },
      );
    }
  }

 

  private showReconnectDialog() {
    const dialogRef = this.dialog.open(ReconnectdialogComponent, {
      width: '250px',
      // Pass in any data you need
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        this.tryConnect(); // User wants to reconnect
      } else {
        // Handle the user's decision not to reconnect
      }
    });
  }

  hideError() {
    // Dismiss the snackbar when the error is no longer present
    this.snackBarRef?.dismiss();
  }


  private connectionEstablished = false;
   ngOnInit() {
    

    this.dataCounter = [
      {
        "name": "Successed Bets",
        "value": 0,
      },
      {
        "name": "Missing Bets",
        "value": 0
      },
      {
        "name": "Errors Bets",
        "value": 0
      },
    ]
    this.dataCounterAll = [
      {
        "name": "All bets",
        "value": 0,
      },
    ]

    this.websocketService.getMessageStreamCounters().pipe(
      tap(() => {
        this.isConnected = true; // Connection is successful    
      }),
      retryWhen(errors =>
        errors.pipe(
          tap(err => {
            this.isConnected = false; // Connection has failed
          }),
          // Delay the reconnection attempt by 5 seconds
          delayWhen(() => timer(5000))
        )
      )
    ).subscribe((counters: any) => {    
      this.countersto = counters;
      this.counters.push(counters);
      this.counters.forEach((value: any) => {

        this.dataCounter = [
          {
            "name": "Successed Bets",
            "value": value.Success,
          },
          {
            "name": "Missing Bets",
            "value": value.Missing
          },
          {
            "name": "Errors Bets",
            "value": value.Error
          },
        ]
        this.dataCounterAll = [
          {
            "name": "All bets",
            "value": value.Success + value.Missing + value.Error,
          },
        ]

        this.counters.pop();
      });
    },(error) => {
      this.isConnected = false; 
      this.displayError('An error occurred while subscribing to the WebSocket.');
      });

    this.websocketService.getMessageStreamServicesstatus().pipe(
      tap(() => {
        this.isConnected = true; // Connection is successful
      }),
      retryWhen(errors =>
        errors.pipe(
          tap(err => {
            this.isConnected = false; // Connection has failed
          }),
          // Delay the reconnection attempt by 5 seconds
          delayWhen(() => timer(5000))
        )
      )
    ).subscribe((status) => {

      this.isConditionDispatcherPW = status.DispatcherPWSvc;
      this.isConditionWagerPost = status.WagerPostSvc;
      this.isConditionRemoting = status.RemotingSvc;
      this.isConditioWagerSlip = status.WagerSlipPWSvc;

    });

    this.websocketService.getMessageStream().pipe(
      tap(() => {
       
        this.isConnected = true; // Connection is successful
      }),
    ).subscribe(
      (message) => {

        if (!this.connectionEstablished) {
          this.displayStatus('Connection successful', 'success');
          this.connectionEstablished = true; // Set the flag after first message
        }
        message.forEach((WagerArray: any) => {
          this.isConnected = true;
          
          WagerArray.RequestDateTime = datepipe.transform(WagerArray.RequestDateTime, this.configService.config.dateformat);
          WagerArray.ResponseDateTime = datepipe.transform(WagerArray.ResponseDateTime, this.configService.config.dateformat);
          WagerArray.Latency = WagerArray.Latency.toFixed(5);

          switch (WagerArray.Status) {
            case 0:
              WagerArray.Status = "Pending";
              break;
            case 1:
              WagerArray.Status = "Success";
              break;
            case 2:
              WagerArray.Status = "Error";
              break;
            case 3:
              WagerArray.Status = "Missing";
              break;
            // default case can be added if there are other statuses or to handle unexpected values
          }
        });

        message.reverse();
        this.realTimeDataSource = message;
        this.dataSource = new MatTableDataSource(message);
        this.dataSource.paginator = this.paginator;
      },
      (error) => {
      this.isConnected = false; 
      this.displayError('An error occurred while subscribing to the WebSocket.');
      this.isAttemptingReconnect = true;
      }
     
    );
   
  }

   private displayStatus(message: string, type: 'success') {
    //MatSnackBar for notifications
    this.snackBar.open('Connection successful', 'Close', {
      duration: 2000,
      panelClass: ['status', type], // Add custom classes for styling
    });
  }
  
  applyFilter(event: Event) {

    const filterValue = (event.target as HTMLInputElement).value;
    if (filterValue) {
      this.filteredDataSource = this.realTimeDataSource.filter(item =>
        item.Guid.toLowerCase().startsWith(filterValue.trim().toLowerCase())
      );
      this.filteredisTableVisible = true;
      this.falseisTableVisible = false;
    } else {
      this.filteredisTableVisible = false;
      this.falseisTableVisible = true;
    }

  }

  applyFilterSuccess(event: Event) {

    const filterValue_success = (event.target as HTMLInputElement).value;
  if (filterValue_success) {
    // When there is a filter value, apply the filter and update the data source directly
    this.filteredDataSource_success = this.realTimeDataSource_success.filter(item =>
      item.Guid.toLowerCase().startsWith(filterValue_success.trim().toLowerCase())
    );
    this.filteredisTableVisible_success = true;
    this.isSuccessTableVisible = false;
  } else {
    this.filteredisTableVisible_success = false;
    this.isSuccessTableVisible = true;
  }
  }

  applyFilterError(event: Event) {

    const filterValue_error = (event.target as HTMLInputElement).value;
    if (filterValue_error) {
      // When there is a filter value, apply the filter and show the filtered table
      this.filteredDataSource_error = this.realTimeDataSource_error.filter(item =>
        item.Guid.toLowerCase().startsWith(filterValue_error.trim().toLowerCase())
      );
      this.filteredisTableVisible_error = true;
      this.isErrorTableVisible = false;
    } else {
      // When the filter is cleared, show the unfiltered table
      this.filteredisTableVisible_error = false;
      this.isErrorTableVisible = true;
    }
  }

  applyFilterMissing(event: Event) {

    const filterValue_missing = (event.target as HTMLInputElement).value;
    if (filterValue_missing) {
      // When there is a filter value, apply the filter and show the filtered table
      this.filteredDataSource_missing.data = this.realTimeDataSource_missing.filter(item =>
        item.Guid.toLowerCase().startsWith(filterValue_missing.trim().toLowerCase())
      );
      this.filteredisTableVisible_missing = true;
      this.isMissingTableVisible = false;
    } else {
      // When the filter is cleared, show the unfiltered table
      this.filteredisTableVisible_missing = false;
      this.isMissingTableVisible = true;
    }
  }

  GetAllWagers() {

    this.isMissingTableVisible = false;
    this.falseisTableVisible = true;
    this.isErrorTableVisible = false;
    this.isSuccessTableVisible = false;

    this.filteredisTableVisible_success = false;
    this.filteredisTableVisible_error = false;
    this.filteredisTableVisible_missing = false;

    this.filteredBarVisible = true;
    this.filteredBarVisible_success = false;
    this.filteredBarVisible_error = false;
    this.filteredBarVisible_missing = false;

  }

  GetSuccessWagers(): boolean {

    this.isMissingTableVisible = false;
    this.falseisTableVisible = false;
    this.isErrorTableVisible = false;
    this.isSuccessTableVisible = true;

    this.filteredisTableVisible_error = false;
    this.filteredisTableVisible_missing = false;
    this.filteredisTableVisible = false;

    this.filteredBarVisible = false;
    this.filteredBarVisible_success = true;
    this.filteredBarVisible_error = false;
    this.filteredBarVisible_missing = false;

    this.websocketService.getMessageStreamSuccessWagers().pipe(
      tap(() => {
        this.isConnected = true; // Connection is successful
        this.isAttemptingReconnect = false; // Hide the spinner
      }),
      retryWhen(errors =>
        errors.pipe(
          tap(err => {
            this.isConnected = false; // Connection has failed
          }),
          // Delay the reconnection attempt by 5 seconds
          delayWhen(() => timer(5000))
        )
      )
    ).subscribe((message) => {

      message.forEach((WagerArray: any) => {
        WagerArray.RequestDateTime = datepipe.transform(WagerArray.RequestDateTime, this.configService.config.dateformat)
        WagerArray.ResponseDateTime = datepipe.transform(WagerArray.ResponseDateTime, this.configService.config.dateformat)
        WagerArray.Latency = WagerArray.Latency.toFixed(5);
        WagerArray.Status = "Success"

      });

      message.reverse();

      this.realTimeDataSource_success = message;

      this.success_dataSource = message;

    });
    return true
  }

  GetErrorWagers() {

    this.isMissingTableVisible = false;
    this.falseisTableVisible = false;
    this.isErrorTableVisible = true;
    this.isSuccessTableVisible = false;

    this.filteredisTableVisible_success = false;
    this.filteredisTableVisible_missing = false;
    this.filteredisTableVisible = false;

    this.filteredBarVisible = false;
    this.filteredBarVisible_success = false;
    this.filteredBarVisible_error = true;
    this.filteredBarVisible_missing = false;

    this.websocketService.getMessageStreamErrorWagers().pipe(
      tap(() => {
        this.isConnected = true; // Connection is successful
        this.isAttemptingReconnect = false; // Hide the spinner
      }),
      retryWhen(errors =>
        errors.pipe(
          tap(err => {
            this.isConnected = false; // Connection has failed
            this.isAttemptingReconnect = true; // Show the spinner
          }),
          delayWhen(() => timer(5000))
        )
      )
    ).subscribe((message) => {

      message.forEach((WagerArray: any) => {
        WagerArray.RequestDateTime = datepipe.transform(WagerArray.RequestDateTime, this.configService.config.dateformat)
        WagerArray.ResponseDateTime = datepipe.transform(WagerArray.ResponseDateTime, this.configService.config.dateformat)
        WagerArray.Latency = WagerArray.Latency.toFixed(5);
        WagerArray.Status = "Error"

      });

      message.reverse();

      this.realTimeDataSource_error = message;

      this.error_dataSource = message;
    });

  }

  toggleRow(element: any): void {
    this.expandedElement = this.expandedElement === element ? null : element;
  }

  GetMissingWagers() {

    this.filteredBarVisible = false;
    this.filteredBarVisible_success = false;
    this.filteredBarVisible_error = false;
    this.filteredBarVisible_missing = true;

    this.filteredisTableVisible_error = false;
    this.filteredisTableVisible_success = false;
    this.filteredisTableVisible = false;

    this.websocketService.getMessageStreamMissingWagers().pipe(
      tap(() => {
        this.isConnected = true; // Connection is successful
      }),
      retryWhen(errors =>
        errors.pipe(
          tap(err => {
            this.isConnected = false; // Connection has failed
          }),
          // Delay the reconnection attempt by 5 seconds
          delayWhen(() => timer(5000))
        )
      )
    ).subscribe((message) => {

      message.forEach((WagerArray: any) => {
        WagerArray.RequestDateTime = datepipe.transform(WagerArray.RequestDateTime, this.configService.config.dateformat)
        WagerArray.ResponseDateTime = datepipe.transform(WagerArray.ResponseDateTime, this.configService.config.dateformat)
        WagerArray.Latency = WagerArray.Latency.toFixed(5);
        WagerArray.Status = "Missing"

      });
      message.reverse();

      this.realTimeDataSource_missing = message;

      this.missing_dataSource = new MatTableDataSource(message);

    });

    this.isMissingTableVisible = true;
    this.falseisTableVisible = false;
    this.isErrorTableVisible = false;
    this.isSuccessTableVisible = false;

  }


  openDialogSearch() {

    const dialogRef = this.dialog.open(SearchDialogComponent, {
      data: {}
    });

    dialogRef.afterClosed().subscribe(result => {
      this.router.navigate(['/']);

    });
  }

  showBasicDialog() {
    this.displayBasic = true; // Method to show the PrimeNG dialog
  }

  showFilteredtableDialog() {

    const dialogRef = this.dialog.open(FilteredtableDialogComponent, {
      data: {}
      // Pass in any data you need
    });

    dialogRef.afterClosed().subscribe(result => {
     

      if (result) {

        this.startdate = datepipe.transform(result.StartDateTime, this.configService.config.dateformat)
        this.enddate = datepipe.transform(result.EndDateTime, this.configService.config.dateformat)
        console.log('http://' + this.configService.config.apiConfig.domain + ':' + this.configService.config.apiConfig.port + this.configService.config.methods.getinfobyfilters)
  
        this.http.post<any>('http://' + this.configService.config.apiConfig.domain + ':' + this.configService.config.apiConfig.port + this.configService.config.methods.getinfobyfilters, result
        ).subscribe((result: any) => {
  
         if (result.TWagerSummaryTable == null){
  
         } else if (result.Result == 0) {
            this.searchtable = result.TWagerSummaryTable
  
            this.searchtable.forEach((WagerArray: any) => {
              WagerArray.RequestDateTime = datepipe.transform(WagerArray.RequestDateTime, this.configService.config.dateformat)
              WagerArray.ResponseDateTime = datepipe.transform(WagerArray.ResponseDateTime, this.configService.config.dateformat)
              WagerArray.Latency = WagerArray.Latency.toFixed(5);
  
  
              if (WagerArray.Status === 0) {
                WagerArray.Status = "Pending"
  
              } else if (WagerArray.Status === 1) {
                WagerArray.Status = "Success"
  
              } else if (WagerArray.Status === 2) {
                WagerArray.Status = "Error"
  
              } else if (WagerArray.Status === 3) {
                WagerArray.Status = "Missing"
  
              }
  
            });
  
            this.searchtable.reverse();
  
            this.originalData = this.searchtable;
  
            this.false_dataSource = new MatTableDataSource(this.searchtable);
            this.false_dataSource.paginator = this.paginator;
  
  
            this.dataCounter_false = [
              {
                "name": "Successed Bets",
                "value": result.TWagerCounters.Success,
              },
              {
                "name": "Missing Bets",
                "value": result.TWagerCounters.Missing
              },
              {
                "name": "Errors Bets",
                "value": result.TWagerCounters.Error
              },
            ]
  
            this.dataCounterAll = [
              {
                "name": "All bets",
                "value": result.TWagerCounters.Success + result.TWagerCounters.Missing + result.TWagerCounters.Error,
              },
            ]
  
          } 
        });
        this.showBasicDialog();
      }
      else{
      
      }
     
    });
  }


  openDialog(Guid: any) {

    this.BodyDialog.CallBody(Guid)

    this.http.post<any>('http://' + this.configService.config.apiConfig.domain + ':' + this.configService.config.apiConfig.port + this.configService.config.methods.getwagerinfo, '{"Guid":' + '"' + Guid + '"' + '}'
    ).subscribe((data: any) => {

      if (data.TWagerRequest === null && data.TWagerResponse === null) {
        data.TWagerRequest = "No data found";
        data.TWagerResponse = "No data found";
      }

      const dialogRef = this.dialog.open(BodyDialogComponent, { data: { TWagerRequest: data.TWagerRequest, TWagerResponse: data.TWagerResponse } });

      dialogRef.afterClosed().subscribe(result => {

      });
    });
  }
  isRequestResponseVisible: boolean = false;
  requestText: string = '';
  responseText: string = '';  

  openRequestnResponse(Guid: any) {

    this.isRequestResponseVisible = true;

    this.http.post<any>('http://' + this.configService.config.apiConfig.domain + ':' + this.configService.config.apiConfig.port + this.configService.config.methods.getwagerinfo, '{"Guid":' + '"' + Guid + '"' + '}'
    ).subscribe((data: any) => {

      let requestContent = data.TWagerRequest ? JSON.stringify(data.TWagerRequest, null, 2) : "No data found";
      let responseContent = data.TWagerResponse ? JSON.stringify(data.TWagerResponse, null, 2) : "No data found";

      // Now you need to set these stringified objects to your textarea
      // Assuming you have two-way data binding set up for your textareas:
      this.requestText = requestContent;
      this.responseText = responseContent;
      

    });
  }


  get single() {
    return this.dataCounter;

  }

  get singlefalse() {
    return this.falsedataCounter;

  }

  

  onSelect(data: any): void {

  }

  onActivate(data: any): void {
  }

  onDeactivate(data: any): void {
  }

  FailedCounterArray: any
  CounterArray: any

  multi$: any[] = [];
  public dataCounter: any[] = []
  public dataCounterAll: any[] = []
  public falsedataCounter: any[] = []

}

