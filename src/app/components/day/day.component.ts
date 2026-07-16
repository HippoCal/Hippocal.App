import { Component, EventEmitter, Input, Output } from '@angular/core';
import { DataService } from 'src/app/services/services';
import { AppointmentViewmodel } from 'src/app/viewmodels/appointmentviewmodel';
import { WeekViewmodel } from 'src/app/viewmodels/weekviewmodel';

@Component({
  selector: 'app-day',
  templateUrl: './day.component.html',
  styleUrls: ['./day.component.scss'],
})

export class DayComponent {
  @Input() day: WeekViewmodel;
  @Output() selectDay = new EventEmitter<WeekViewmodel>();
  @Output() showAppointment = new EventEmitter<AppointmentViewmodel>();

  constructor(public dataProvider: DataService) { }


  public onSelectDay() {
    this.selectDay.emit(this.day);
  }

  public onShowAppointment(appointment: AppointmentViewmodel) {
    this.showAppointment.emit(appointment);
  }
}
