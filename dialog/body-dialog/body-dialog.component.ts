import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatDialog } from '@angular/material/dialog';
import { HttpClient } from '@angular/common/http';
import { ConfigService } from 'src/app/config.service';


export class WagerInfo {
  Result: any;
  ErrParams: any;
  ErrMsg: any;
  TWagerRequest!: []
  TWagerResponse!: []
}

@Component({
  selector: 'app-body-dialog',
  templateUrl: './body-dialog.component.html',
  styleUrls: ['./body-dialog.component.scss']
})
export class BodyDialogComponent implements OnInit {
  response: any = {
    Result: 0,
    ErrParams: "",
    ErrMsg: "",
    TWagerRequest: [],
    TWagerResponse: []
  }
  wagers: any[] = [];
  // Declare requestItem as an array (if it's an array)
  requestItem: any[] = [];

  constructor(@Inject(MAT_DIALOG_DATA) public data:any,public dialog: MatDialog,private configService: ConfigService, private http: HttpClient) { }

  ngOnInit(): void {

  }


  CallBody(GuidValue: any) {

    this.http.post<any>('http://'+this.configService.config.apiConfig.domain+':'+this.configService.config.apiConfig.port+this.configService.config.methods.getwagerinfo, '{"Guid":' + '"' + GuidValue + '"' + '}'
    ).subscribe((data: any) => {

      this.response = data;
      this.requestItem = data.TWagerRequest; // Assign data to requestItem

    });
  }



}
