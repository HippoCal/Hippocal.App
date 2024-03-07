import { Component } from '@angular/core';
import { NavigationExtras } from '@angular/router';
import { AppointmentViewmodel, NewsViewmodel } from "src/app/viewmodels/viewmodels";
import { DataService, ImageService, AppointmentService, ToastService } from "src/app/services/services";
import { PlaceViewmodel } from 'src/app/viewmodels/placeviewmodel';
import * as moment from 'moment';
import { ModalController } from '@ionic/angular';
import { CreatePage } from '../create/create.page';
import { AdminappointmentPage } from '../adminappointment/adminappointment.page';
import { PrivateAppointmentPage } from '../privateappointment/privateappointment.page';
import { WeekPage } from '../week/week.page';
import { NewsdetailsPage } from '../newsdetails/newsdetails.page';
import { RecordTypeEnum } from 'src/app/enums/recordtypeenum';
import { OtherAppointmentPage } from '../otherappointment/otherappointment.page';

@Component({
  selector: 'page-home',
  templateUrl: '././home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage {

  public color: string;

  constructor(
    public dataProvider: DataService, 
    private toastSvc: ToastService,
    private modalCtrl: ModalController,
    public appointmentService: AppointmentService, 
    public imageProvider: ImageService) {
      this.dataProvider.refresh();  
  }

  ionViewWillEnter() { 
    this.dataProvider.setCurrentTab('tab1');
    this.color = 'divider';
    this.loadAppointments();
  };

  ngOnInit() { 
    this.appointmentService.initTypes();
  }
  
  async loadAppointments() {
    await this.dataProvider.getLocalAppointments();
    this.dataProvider.buildPlaceAppointments();
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
    this.dataProvider.setToWeek(false);
    this.dataProvider.navigate('places', 'tab3');
  }

  onDeleteAppointment(appointment: AppointmentViewmodel) {
    this.toastSvc.confirm(() => {
      appointment.UserKey = this.dataProvider.Profile.UserKey;
      this.appointmentService.appointment = appointment;
      this.appointmentService.delete( () => {
        this.loadAppointments();
      }, false)
    }, "HEADER_CONFIRM_DELETE", "MSG_CONFIRM_DELETE");
  }

  async onShowAppointment(appointment: AppointmentViewmodel) {
    var recordType = AppointmentViewmodel.recordType(appointment);
    let component: any;
    if (!appointment.IsInTheFuture || !appointment.OwnAppointment) {
      component = OtherAppointmentPage;
    } else {
      switch (recordType) {
        case RecordTypeEnum.Standard:
          component = CreatePage;
          break
        case RecordTypeEnum.Admin:
          component = AdminappointmentPage;
          break;
        case RecordTypeEnum.Private:
          component = PrivateAppointmentPage;
          break;
        case RecordTypeEnum.Other:
          component = OtherAppointmentPage;
          break;
      }
    }
    const modal = await this.modalCtrl.create({
      component: component,
      componentProps: { appointment: appointment, dt: appointment.StartDate }
    });
    modal.present();
    const { data, role } = await modal.onWillDismiss();
    this.postEventProcessing(data, role);
  }

  postEventProcessing(data: AppointmentViewmodel, role: string) {
    switch (role) {
      case 'save':
        this.appointmentService.save( false, null, (success) => {
          if(success === false) {
            this.refresh();
          }          
        } );
        this.loadAppointments();
        break;
      case 'delete':
        this.appointmentService.delete(null, false);
        this.loadAppointments();
        break;
    }
    
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
    this.dataProvider.setCurrentPlace(placeKey);
    const modal = await this.modalCtrl.create({
      component: WeekPage,
    });
    modal.present();
    const { data, role } = await modal.onWillDismiss();
  }

  async onPrivateAppointment() {
    this.dataProvider.createPrivatePlace(true);
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
