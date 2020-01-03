import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DataTablesModule } from 'angular-datatables';
import { InputSwitchModule } from 'primeng/inputswitch';
import { FullCalendarModule } from '@fullcalendar/angular'; // for FullCalendar!
import { BannerComponent } from './banner.component';
import { BannerService } from './shared/banner.service';
import { BannerRoutingModule } from './shared/banner.routing';

@NgModule({
  imports: [
    CommonModule,
    DataTablesModule,
    FormsModule,
    ReactiveFormsModule,
    InputSwitchModule,
    FullCalendarModule
  ],
  declarations: [BannerComponent],
  providers:[BannerService],
  exports: [
    BannerRoutingModule
  ]
})
export class BannerModule { }
