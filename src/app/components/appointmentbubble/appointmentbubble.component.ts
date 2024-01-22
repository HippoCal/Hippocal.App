import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
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

  constructor(public dataProvider: DataService)
   { }

  ngOnInit() {}

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
