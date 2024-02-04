import { Component } from '@angular/core';
import { NavigationExtras } from '@angular/router';
import { AppointmentViewmodel, NewsViewmodel } from "src/app/viewmodels/viewmodels";
import { DataService, ImageService, AppointmentService } from "src/app/services/services";
import { PlaceViewmodel } from 'src/app/viewmodels/placeviewmodel';
import * as moment from 'moment';
import { ModalController } from '@ionic/angular';
import { CreatePage } from '../create/create.page';
import { AdminappointmentPage } from '../adminappointment/adminappointment.page';
import { EventdetailsPage } from '../eventdetails/eventdetails.page';
import { PrivateAppointmentPage } from '../privateappointment/privateappointment.page';
import { WeekPage } from '../week/week.page';
import { NewsdetailsPage } from '../newsdetails/newsdetails.page';

@Component({
  selector: 'page-home',
  templateUrl: '././home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage {

  public color: string;

  constructor(
    public dataProvider: DataService, 
    private modalCtrl: ModalController,
    public appointmentService: AppointmentService, 
    public imageProvider: ImageService) {
      
  }

  ionViewWillEnter() { 
    this.dataProvider.setCurrentTab('tab1');
  };

  ngOnInit() { 
    this.color = 'divider';
  }
  
  navigate(route: string, tab: string, appointment?: AppointmentViewmodel, dt?: Date, news?: NewsViewmodel, place?: PlaceViewmodel, ) {
    let navigationExtras: NavigationExtras = {
      state: {
        dt: dt,
        appointment: appointment,
        news: news,
        place: place
      }
    };
    this.dataProvider.navigate(route, tab, navigationExtras);
  };

  refresh(refresher?) {
    this.dataProvider.loadProfile();
    this.dataProvider.refresh();
    if(refresher) {
      refresher.target.complete();
    }
    
  }

  onRefreshBtn() {
    this.refresh();
  }

  onRefresh(refresher) {
    this.refresh(refresher);
    setTimeout(() => {
      if(refresher) {
        refresher.target.complete();
      }
    }, 4000);
  }

  async onNewsDetails(news: NewsViewmodel) {
    const modal = await this.modalCtrl.create({
      component: NewsdetailsPage,
      componentProps: { news: news }
    });
    modal.present();
    const { data, role } = await modal.onWillDismiss();
  }

  onNewAppointment() {
    this.dataProvider.setIsPrivate(false);
    this.dataProvider.setToWeek(false);
    this.dataProvider.navigate('places', 'tab3');
  }

  async onShowAppointment(appointment: AppointmentViewmodel) {
    if (appointment.AppointmentType === 0) {
      const modal = await this.modalCtrl.create({
        component: CreatePage,
        componentProps: { appointment: appointment, dt: appointment.StartDate }
      });
      modal.present();
      const { data, role } = await modal.onWillDismiss();
      this.postEventProcessing(data, role);
    } else {
      this.onShowEvent(appointment);
    }
  }
  
  public onShowEvent(appointment: AppointmentViewmodel) {
    // private appointment
    if (appointment.IsPrivate) {
      this.showPrivateAppointment(appointment)
      // own admin event
    } else if (appointment.OwnAppointment) {
      var place: any;
      this.dataProvider.Profile.Places.forEach((item) => {
        if (item.PlaceKey === appointment.PlaceKey) {
          place = item;
          return;
        }
      });
      this.showAdminAppointment(appointment, place)
    } else {
      // other admin event
      this.showEvent(appointment)
    }
  }

  async showPrivateAppointment(appointment: AppointmentViewmodel) {

    const modal = await this.modalCtrl.create({
      component: PrivateAppointmentPage,
      componentProps: { appointment: appointment, dt: appointment.StartDate }
    });
    modal.present();
    const { data, role } = await modal.onWillDismiss();
    this.postEventProcessing(data, role);
  }

  async showAdminAppointment(appointment: AppointmentViewmodel, place: PlaceViewmodel) {

    const modal = await this.modalCtrl.create({
      component: AdminappointmentPage,
      componentProps: { appointment: appointment, dt: appointment.StartDate, place: place }
    });
    modal.present();
    const { data, role } = await modal.onWillDismiss();
    this.postEventProcessing(data, role);
  }

  async showEvent(appointment: AppointmentViewmodel) {

    const modal = await this.modalCtrl.create({
      component: EventdetailsPage,
      componentProps: { appointment: appointment, dt: appointment.StartDate }
    });
    modal.present();
    const { data, role } = await modal.onWillDismiss();
    this.postEventProcessing(data, role);
  }

  postEventProcessing(data: AppointmentViewmodel, role: string) {
    switch (role) {
      case 'save':
        this.appointmentService.save();
        break;
      case 'delete':
        this.appointmentService.delete();
        break;
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

  onSelectPlace(placeKey: string) {
    if(placeKey === '' || placeKey === undefined) {
      this.onPrivateAppointment();
    } else {
      this.selectPlace(placeKey);
    }
  }

  async selectPlace(placeKey: string) {
    this.dataProvider.setIsPrivate(false);
    this.dataProvider.setCurrentPlace(placeKey);
    const modal = await this.modalCtrl.create({
      component: WeekPage,
    });
    modal.present();
    const { data, role } = await modal.onWillDismiss();
  }

  async onPrivateAppointment() {
    this.dataProvider.setIsPrivate(true);
    this.dataProvider.Profile.CurrentPlace.Name = '';
    this.dataProvider.Profile.CurrentPlace.PlaceKey = '';
    const modal = await this.modalCtrl.create({
      component: WeekPage,
    });
    modal.present();
    const { data, role } = await modal.onWillDismiss();
  }

  formatDate(dt: string): string {
    return this.dataProvider.formatDate(new Date(dt), "dddd, LL");
  }
}
