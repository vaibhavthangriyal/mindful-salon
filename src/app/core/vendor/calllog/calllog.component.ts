import { Component, OnInit } from '@angular/core';
import { CallLogService } from './shared/calllog.service';
import { ResponseModel } from '../../../shared/shared.model';
import { CallLogModel } from './shared/calllog.model';
import { Subject } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-calllog',
  templateUrl: './calllog.component.html',
  styleUrls: ['./calllog.component.scss']
})
export class CalllogComponent implements OnInit {

  allCallLogs: CallLogModel[] = [];
  dtOptions: any = {};
  dtTrigger: Subject<any> = new Subject();
  constructor(private callLogService: CallLogService, private toasterService: ToastrService) { }

  ngOnInit() {
    this.getAllCallLogs();
  }

  getAllCallLogs() {
    this.callLogService.getAllCallLogs().subscribe((res: ResponseModel) => {
      console.log(res); 
      if (res.errors) {
        this.toasterService.error('Error While Fetching', 'Try Again');
      } else {
        if (res.data.length > 0) {
          this.allCallLogs = res.data;
          this.dtTrigger.next();
        }
      }
    });
  }

}
