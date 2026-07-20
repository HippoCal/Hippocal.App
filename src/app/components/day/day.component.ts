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

  /** Datum dieses Tages = Wochenanfang + Offset (Offset ist der Index 0..6). */
  private get date(): Date {
    const d = new Date(this.dataProvider.FirstDay);
    d.setDate(d.getDate() + this.day.Offset);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  /** Hebt den heutigen Tag in der Wochenliste hervor. */
  public get isToday(): boolean {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return this.date.getTime() === today.getTime();
  }

  /** Vergangene Tage treten optisch zurueck (hier ist nichts mehr zu buchen). */
  public get isPast(): boolean {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return this.date.getTime() < today.getTime();
  }

  public onSelectDay() {
    this.selectDay.emit(this.day);
  }

  public onShowAppointment(appointment: AppointmentViewmodel) {
    this.showAppointment.emit(appointment);
  }
}
