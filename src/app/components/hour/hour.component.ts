import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { DataService } from 'src/app/services/services';
import { AppointmentViewmodel } from 'src/app/viewmodels/appointmentviewmodel';
import { DayViewmodel } from 'src/app/viewmodels/dayviewmodel';
import { HalfHourViewmodel } from 'src/app/viewmodels/halfhourviewmodel';

@Component({
  selector: 'app-hour',
  templateUrl: './hour.component.html',
  styleUrls: ['./hour.component.scss'],
})
export class HourComponent  implements OnInit {
  @Input('halfHour') halfHour: HalfHourViewmodel;
  @Output() selectHalfHour = new EventEmitter<HalfHourViewmodel>();
  @Output() showAppointment = new EventEmitter<AppointmentViewmodel>();

  constructor(public dataProvider: DataService) { }

  ngOnInit() {}

  public onSelectHalfHour() {
    this.selectHalfHour.emit(this.halfHour);
  }

  public onShowAppointment(appointment: AppointmentViewmodel) {
    this.showAppointment.emit(appointment);
  }
}
