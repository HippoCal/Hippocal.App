import { Component } from '@angular/core';
import { Router, NavigationExtras, ActivatedRoute } from '@angular/router';
import { AppointmentViewmodel, HalfHourViewmodel } from "src/app/viewmodels/viewmodels";
import { DataService } from "src/app/services/services";
import * as moment from 'moment';

@Component({
  selector: 'page-day',
  templateUrl: './day.page.html',
  styleUrls: ['./day.page.scss'],
})
export class DayPage {

  private dt: Date;
  private newDay: any;
  dayString: string;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    public dataProvider: DataService) {

    this.resolveParams();
  }

  resolveParams() {
    this.route.queryParams.subscribe(params => {
      if (this.router.getCurrentNavigation().extras.state) {
        this.newDay = new Date(this.router.getCurrentNavigation().extras.state['day']);
        this.dt = new Date();
        if (this.newDay !== undefined) {
          this.dt = this.newDay;
        }
        this.dataProvider.getAppointments(this.dt);
        this.dayString = this.formatDate(this.dt);
      }
    });
  }

  navigate(route: string, appointment?: AppointmentViewmodel, dt?: Date, hasEvent?: boolean) {
    let navigationExtras: NavigationExtras = {
      state: {
        dt: dt,
        hasEvent: hasEvent,
        appointment: appointment
      }
    };
    this.router.navigate([route], navigationExtras);
  };

  formatDate(dt: Date): string {
    return this.dataProvider.formatDate(dt, "dddd, LL");
  }

  public onSelectHalfHour(halfhour: HalfHourViewmodel) {
    // Todo: Fix it
    //if (halfhour.CanCreate && halfhour.DataLoaded) {
    if (halfhour.CanCreate) {
      if (this.dataProvider.IsOnline) {
        if (!this.dataProvider.IsPrivate) {
          this.navigate('tabs/tab3/create', null, halfhour.Date, halfhour.HasEvent);
        } else {
          this.navigate('tabs/tab3/privateappointment', null, halfhour.Date);
        }

      } else {
        this.dataProvider.showMessage("MSG_NO_APPOINTMENTS_IN_OFFLINE_MODE", true);
      }
    }
  }

  public onShowAppointment(appointment: AppointmentViewmodel) {
    //event.stopPropagation();
    this.navigate('tabs/tab3//create', appointment, appointment.StartDate);
  }

  public onShowPrivateAppointment(appointment: AppointmentViewmodel) {
    //event.stopPropagation();
    this.navigate('tabs/tab3/privateappointment', appointment, appointment.StartDate);
  }

  public onShowOtherAppointment(appointment: AppointmentViewmodel) {
    //event.stopPropagation();
    this.navigate('tabs/tab3//otherappointment', appointment);
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad DayPage');
  }

}
