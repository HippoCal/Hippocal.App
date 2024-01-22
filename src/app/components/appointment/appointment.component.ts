import { Component, Input } from '@angular/core';
import { AppointmentViewmodel } from "src/app/viewmodels/viewmodels";
import { DataService } from 'src/app/services/services';

@Component({
  selector: 'app-appointment',
  templateUrl: './appointment.component.html',
  styleUrls: ['./appointment.component.scss'],
})
export class AppointmentComponent {

  @Input('appointment') appointment: AppointmentViewmodel;

  constructor(public dataProvider: DataService) { 
    
  }

  formatTime(appointment: AppointmentViewmodel): string {

    var d1: Date = new Date(appointment.StartDate);
    var d2: Date = new Date(d1);

    d2.setMinutes(d1.getMinutes() + appointment.Duration);
    return this.dataProvider.formatDate(d1, "HH:mm") +
      ' - ' +
      this.dataProvider.formatDate(d2, "HH:mm");

  }

}
