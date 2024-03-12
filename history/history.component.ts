import { AfterViewInit, Component, ViewChild, Injectable, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { HttpHeaders } from '@angular/common/http';
import { MatPaginator } from '@angular/material/paginator';
import { FormControl } from '@angular/forms';
import { Subject } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Counters, Services, Reports, FailedReports } from '../classes/services';
import { MatTableDataSource } from '@angular/material/table';
import { Color, ScaleType } from '@swimlane/ngx-charts';
import { MatDialog } from '@angular/material/dialog';
import { ConfigService } from '../config.service';
import { ThemePalette } from '@angular/material/core';
import { BodyDialogComponent } from '../dialog/body-dialog/body-dialog.component';
import { SearchDialogComponent } from '../search-dialog/search-dialog.component';
import { DatePipe } from '@angular/common';
import { FormBuilder, FormGroup } from '@angular/forms';
import { HandlerAlertComponent } from '../handler-alert/handler-alert.component';


export interface DialogData {

}

export interface ClickedButtons {
  [key: string]: boolean;
}

export interface Message {
  Late: number,
  Notprocessed: number,
  Processed: number,
}

export interface ChipColor {
  name: string;
  color: ThemePalette;
}

const headers = new HttpHeaders()
  .set('content-type', 'application/json')
  .set('Access-Control-Allow-Origin', '*');

const datepipe: DatePipe = new DatePipe('en-US')

const ELEMENT_DATA: Reports[] = [];
const COUNTER_ELEMENT_DATA: Counters[] = [];
const FAILED_ELEMENT_DATA: FailedReports[] = [];


export interface PeriodicElement {
  guid: string;
  delay: string;
  status: string;
  body: string;
}

interface Counter {
  name: string;
  value: number;

}

@Component({
  selector: 'app-history',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],

})

@Injectable()


export class HistoryComponent implements OnInit, AfterViewInit {

  clickedRows = new Set<Reports>();
  public message!: Subject<Message>;

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

  toggleButtonState(buttonId: string) {
    this.activeButtonId = this.activeButtonId === buttonId ? null : buttonId;
  }

  isButtonActive(buttonId: string): boolean {
    return this.activeButtonId === buttonId;
  }

  GetSuccessWagers(event: string) {
    const filterValue = event;
    this.false_dataSource.filter = filterValue.trim().toLowerCase();
  }

  GetErrorWagers(event: string) {
    const filterValue = event;
    this.false_dataSource.filter = filterValue.trim().toLowerCase();
  }

  GetMissingWagers(event: string) {
    const filterValue = event;
    this.false_dataSource.filter = filterValue.trim().toLowerCase();
  }

  GetAllWagers(event: string) {
    const filterValue = event;
    this.false_dataSource.filter = filterValue.trim().toLowerCase();
  }

  showDelay = new FormControl(1000);
  hideDelay = new FormControl(2000);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatPaginator) failedpaginator!: MatPaginator;

  goToBottom(): void {
    window.scrollTo(0, document.body.scrollHeight);
  }

  view: [number, number] = [900, 290];

  viewline: [number, number] = [920, 400];

  cardColor: string = '#232837';


  // options
  gradient: boolean = true;
  showLegend: boolean = true;
  showLabels: boolean = true;
  isDoughnut: boolean = false;

  legend: boolean = true;
  animations: boolean = true;
  xAxis: boolean = true;
  yAxis: boolean = true;
  showYAxisLabel: boolean = true;
  showXAxisLabel: boolean = true;
  xAxisLabel: string = 'Date';
  yAxisLabel: string = 'Wagers';
  timeline: boolean = true;

  colorScheme: Color = {
    name: 'myScheme',
    selectable: true,
    group: ScaleType.Ordinal,
    domain: ['#43FF22', '#FF321A', '#F8FF18', '#D5D5D5'],
  };

  isCardDisabled = true;
  searchtable: any[] = [];
  searchcounter: any
  searchresult: any
  public dataCounterAll: any[] = []
  public dataCounter_false: any[] = []

  expandedElement!: Reports | null;
  columnsToDisplay: string[] = ['Guid', 'Request_Date', 'Response Date', 'Latency', 'Delay', 'Status'];
  sourcecolumnsToDisplay: string[] = ['Processed', 'NotProcessed', 'Late'];
  failedcolumnsToDisplay: string[] = ['Date', 'Guid'];
  messages: any[] = [];

  counters: any[] = [];

  startdate: any;
  enddate: any;

  clickedButtons: ClickedButtons = {};
  activeButtonId: string | null = 'all';

  countersto: any[] = [];
  appVersion: string = environment.version;

  columnsToDisplayWithExpand = [...this.columnsToDisplay, 'expand'];
  failedcolumnsToDisplayWithExpand = [...this.failedcolumnsToDisplay, 'expand'];
  filteredData: any[] = [];

  showChart: boolean = false;
  falseshowChart: boolean = true;

  showFilterButton: boolean = false;
  showFilterFalseButton: boolean = true;

  isTableVisible: boolean = true;
  falseisTableVisible: boolean = false;

  dataSource = new MatTableDataSource<Reports>(ELEMENT_DATA);

  false_dataSource = new MatTableDataSource<Reports>(ELEMENT_DATA);

  counterSource = new MatTableDataSource<Counters>(COUNTER_ELEMENT_DATA);
  faileddataSource = new MatTableDataSource<FailedReports>(FAILED_ELEMENT_DATA);

  selectors: FormGroup;

  originalData: any[] = [];
  DateTitle: any[] = [];


  title = 'WagerMonitorSvc';
  showFiller = false;
  constructor(
    private configService: ConfigService,
    private http: HttpClient,
    public dialog: MatDialog,
    public BodyDialog: BodyDialogComponent,
    public SearchDialog: SearchDialogComponent,
    fb: FormBuilder

  ) {


    this.selectors = fb.group({
      success: [false],
      errors: [false],
      missing: [false]
    });

  }

  filterData(event: KeyboardEvent) {

    const filterValue = (event.target as HTMLInputElement).value;

    if (!filterValue) {
      // If no filter value, reset to the original data
      this.false_dataSource.data = this.originalData; // Assuming originalData holds the unfiltered data
    } else {
      // Filter data based on the Guid starting with the entered value
      this.false_dataSource.data = this.originalData.filter(item =>
        item.Guid.toLowerCase().startsWith(filterValue.trim().toLowerCase())
      );
    }
  }

  ngOnInit() {
    const storedFilterParams = localStorage.getItem("FilterParams");
    if (storedFilterParams) {
      const filterParams = JSON.parse(storedFilterParams);

      this.startdate = filterParams.StartDateTime
      this.enddate = filterParams.EndDateTime

      this.http.post<any>('http://' + this.configService.config.apiConfig.domain + ':' + this.configService.config.apiConfig.port + this.configService.config.methods.getinfobyfilters, filterParams
      ).subscribe((result: any) => {

       if (result.TWagerSummaryTable == null){

        this.dialog.open(HandlerAlertComponent, {
          width: '300px',
        
        });

       } else if (result.Result == 0) {
          this.searchtable = result.TWagerSummaryTable

          this.searchtable.forEach((WagerArray: any) => {
            WagerArray.RequestDateTime = datepipe.transform(WagerArray.RequestDateTime, 'dd/MM/YYYY HH:mm:ss')
            WagerArray.ResponseDateTime = datepipe.transform(WagerArray.ResponseDateTime, 'dd/MM/YYYY HH:mm:ss')
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

    }
  }

 

  openDialogSearch() {
    const dialogRef = this.dialog.open(SearchDialogComponent, {
      data: {}
    });
    dialogRef.afterClosed().subscribe(result => {
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


  get single() {
    return this.dataCounter_false;

  }

  get singlefalse() {
    return this.falsedataCounter;

  }


  formatJson(obj: any, indent = ''): string {
    if (typeof obj !== 'object') {
      return `${indent}${obj}`;
    }
    let result = '{\n';
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const value = obj[key];
        result += `${indent}  "${key}": ${this.formatJson(value, `${indent}  `)},\n`;
      }
    }
    result += `${indent.slice(0, -2)}\n}`;
    return result;
  }



  onSelect(data: any): void {

  }

  onActivate(data: any): void {
  }

  onDeactivate(data: any): void {
  }



  FailedCounterArray: any
  CounterArray: any
  // single: any[] = [];
  multi$: any[] = [];
  public dataCounter: any[] = []
  public falsedataCounter: any[] = []

  


  filterDataChips(event: any) {
    this.dataSource.filter = event;
  }

}

