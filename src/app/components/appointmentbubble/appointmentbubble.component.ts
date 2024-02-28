import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { RecordTypeEnum } from 'src/app/enums/recordtypeenum';
import { DataService } from 'src/app/services/services';
import { AppointmentViewmodel } from 'src/app/viewmodels/appointmentviewmodel';

@Component({
  selector: 'app-appointmentbubble',
  templateUrl: './appointmentbubble.component.html',
  styleUrls: ['./appointmentbubble.component.scss'],
})
export class AppointmentbubbleComponent  implements OnInit {

  @Input('appointment') appointment: AppointmentViewmodel;
  @Input('showTime') showTime: boolean;
  @Output() showAppointment = new EventEmitter<AppointmentViewmodel>();

  recordType: RecordTypeEnum = RecordTypeEnum.Standard;
  constructor(public dataProvider: DataService) { }

  ngOnInit() { 
    this.recordType = AppointmentViewmodel.recordType(this.appointment);
  }

  get css(): string {
    var cssClasses: string;
    switch(this.recordType) {
      case RecordTypeEnum.Standard:
        cssClasses = "standardData textcenter"
        break;
      case RecordTypeEnum.Other:
        cssClasses = "otherData textcenter"
        break;
      case RecordTypeEnum.Private:
        cssClasses = "privateData textcenter"
        break;
      case RecordTypeEnum.Admin:
        cssClasses = "adminData textcenter"
        break;
    }
    if(this.appointment.IsDirty) {
      cssClasses = "dirtyData textcenter"
    }
    return cssClasses;
  }

  formatTime(appointment: AppointmentViewmodel): string {

    var d1: Date = new Date(appointment.StartDate);
    var d2: Date = new Date(d1);
    d2.setMinutes(d1.getMinutes() + appointment.Duration);
    return this.dataProvider.formatDate(d1, "HH:mm") + ' - ' + this.dataProvider.formatDate(d2, "HH:mm");

  }

  public onClick() {
    this.showAppointment.emit(this.appointment);
  }

}
