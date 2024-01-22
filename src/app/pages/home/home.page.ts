import { Component } from '@angular/core';
import { Router, NavigationExtras } from '@angular/router';
import { AppointmentViewmodel, NewsViewmodel } from "src/app/viewmodels/viewmodels";
import { DataService, ImageService, AppointmentService, ToastService } from "src/app/services/services";
import { PlaceViewmodel } from 'src/app/viewmodels/placeviewmodel';
import * as moment from 'moment';

@Component({
  selector: 'page-home',
  templateUrl: '././home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage {

  constructor(
    private router: Router,
    public dataProvider: DataService, 
    public appointmentService: AppointmentService, 
    public imageProvider: ImageService,
    private toastSvc: ToastService) {
      this.dataProvider.refresh();
  }

  navigate(route: string, appointment?: AppointmentViewmodel, dt?: Date, news?: NewsViewmodel, place?: PlaceViewmodel) {
    let navigationExtras: NavigationExtras = {
      state: {
        dt: dt,
        appointment: appointment,
        news: news,
        place: place
      }
    };
    this.router.navigate([route], navigationExtras);
  };

  refresh() {
    this.dataProvider.loadProfile();
    this.dataProvider.refresh();
  }

  onRefreshBtn() {
    this.refresh();
  }

  onRefresh(refresher) {
    this.refresh();
    setTimeout(() => {
      refresher.complete();
    }, 1000);
  }

  onNewsDetails(news: NewsViewmodel) {
    this.navigate('/newsdetails', null, null, news);
  }

  onDeleteNews(event: Event, news: NewsViewmodel) {
    this.dataProvider.deleteNews(news);
  }

  onNewAppointment() {
    this.dataProvider.setIsPrivate(false);
    this.dataProvider.setToWeek(false);
    this.router.navigate(['tabs/tab3/week']);
  }

  public onShowAppointment(event: Event, appointment: AppointmentViewmodel) {
    event.stopPropagation();
    var place: any;
    if (appointment.AppointmentType === 0) {
      this.navigate('/create', appointment, appointment.StartDate);
    } else if (appointment.AppointmentType < 5) {
      if (appointment.OwnAppointment) {
        this.dataProvider.Profile.Places.forEach((item) => {
          if (item.PlaceKey === appointment.PlaceKey) {
            place = item;
            return;
          }
        });
        this.navigate('/adminappointment', appointment, appointment.StartDate, null, place );
      } else {
        this.navigate('/eventdetails', appointment);
      }
    } else if (appointment.AppointmentType > 4) {
      this.navigate('/privateAppointment', appointment, appointment.StartDate);
    }
  }

  getColor(appointment: AppointmentViewmodel): string {
    var now = moment();
    var startDate = moment(appointment.StartDate);
    var endDate = moment(appointment.StartDate).add(appointment.Duration, 'minutes');
    if (startDate < now && endDate > now) {
      return 'orange';
    }
    else if (now < startDate) {
      return 'divider';
    }
    else if (now > endDate) {
      return 'grey';
    }
    return 'divider';
  }

  formatTime(appointment: AppointmentViewmodel): string {

    var d1: Date = new Date(appointment.StartDate);
    var d2: Date = new Date(d1);

    d2.setMinutes(d1.getMinutes() + appointment.Duration);
    return this.dataProvider.formatDate(d1, "HH:mm") +
      ' - ' +
      this.dataProvider.formatDate(d2, "HH:mm");

  }

  onDelete(event: Event, appointment: AppointmentViewmodel) {
    if (event.cancelable) {
      event.preventDefault();
    }
    event.stopPropagation();
    this.toastSvc.confirm(() => {
      appointment.UserKey = this.dataProvider.Profile.UserKey;
      this.appointmentService.appointment = appointment;
      this.appointmentService.deleteAppointment().then((result) => {
        if (result) {
          this.appointmentService.RefreshData(true);
        } else {
          this.dataProvider.showMessage("ERR_NO_DELETE_APPOINTMENT", true);
        }
      });
    }, "HEADER_CONFIRM_DELETE", "MSG_CONFIRM_DELETE");
  }

  onSelectPlace(placeKey: string) {
    if(placeKey === '' || placeKey === undefined) {
      this.onPrivateAppointment();
    }
  }

  selectPlace(placeKey: string) {
    this.dataProvider.setIsPrivate(false);
    this.dataProvider.setCurrentPlace(placeKey);
    this.router.navigate(['tabs/tab3/week']);
  }

  onPrivateAppointment() {
    this.dataProvider.setIsPrivate(true);
    this.dataProvider.Profile.CurrentPlace.Name = '';
    this.dataProvider.Profile.CurrentPlace.PlaceKey = '';
    this.router.navigate(['tabs/tab3/week']);
  }

  formatDate(dt: string): string {
    return this.dataProvider.formatDate(new Date(dt), "dddd, LL");
  }

  getHorseImage(imageUrl: string) {
    return this.dataProvider.pathForImage(imageUrl, "horse");
  }
}
