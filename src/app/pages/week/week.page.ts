import { Component, NgZone } from '@angular/core';
import { AppointmentService, DataService, ImageService } from 'src/app/services/services';
import * as moment from 'moment';
import { TranslateService } from '@ngx-translate/core';
import { AppointmentViewmodel } from 'src/app/viewmodels/appointmentviewmodel';
import { PlaceViewmodel } from 'src/app/viewmodels/placeviewmodel';
import { ModalController } from '@ionic/angular';
import { CreatePage } from '../create/create.page';
import { PrivateAppointmentPage } from '../privateappointment/privateappointment.page';
import { AdminappointmentPage } from '../adminappointment/adminappointment.page';
import { EventdetailsPage } from '../eventdetails/eventdetails.page';
import { DayPage } from '../day/day.page';
import { PlacedetailsPage } from '../placedetails/placedetails.page';
import { NowinplacePage } from '../nowinplace/nowinplace.page';

@Component({
  selector: 'app-week',
  templateUrl: '././week.page.html',
  styleUrls: ['./week.page.scss'],
})
export class WeekPage {

  private firstDay: Date;
  public privatePlace: PlaceViewmodel;
  public color: string;

  constructor(
    public dataProvider: DataService,
    public imageService: ImageService,
    private modalCtrl: ModalController,
    public appointmentService: AppointmentService,
    private zone: NgZone,
    private translate: TranslateService) {
    
  }

  ngOnInit() {
    this.firstDay = moment(new Date()).toDate();
    this.dataProvider.initWeek(this.firstDay);
    this.createPrivatePlace();
  }
  
  ionViewWillEnter() {
    this.dataProvider.setCurrentTab('tab3');
  };

  public swipe(event: any) {
    if (event.direction === 4) {
      this.previousWeek();
    } else if (event.direction === 2) {
      this.nextWeek();
    }
  }

  async createPrivatePlace() {
    if (this.dataProvider.Profile.CurrentPlace.IsPrivate) {
      this.privatePlace = new PlaceViewmodel(this.dataProvider.Profile.CurrentPlace.Name, '');
      this.privatePlace.OwnerName = this.dataProvider.Profile.CurrentPlace.OwnerName;
      this.privatePlace.LocalImage = await this.placeImage();
      this.color = 'secondary-contrast';
    } else {
      this.privatePlace = this.dataProvider.Profile.CurrentPlace;
    }

  }

  cancel() {
    return this.modalCtrl.dismiss(null, 'cancel');
  }

  public previousWeek(): void {
    var newDay = moment(this.dataProvider.CurrentDay.valueOf()).add(-7, 'days');
    this.firstDay = newDay.toDate();
    this.dataProvider.initWeek(this.firstDay);
  }

  public nextWeek(): void {

    var newDay = moment(this.dataProvider.CurrentDay.valueOf()).add(7, 'days');
    this.firstDay = newDay.toDate();
    this.dataProvider.initWeek(this.firstDay);
  }

  async onnowinplace() {
    const modal = await this.modalCtrl.create({
      component: NowinplacePage,
    });
    modal.present();
    const { data, role } = await modal.onWillDismiss();
  }

  async onSelectDay(day: any) {
    var dt: Date = this.addDays(this.dataProvider.FirstDay, day.Offset);

    const modal = await this.modalCtrl.create({
      component: DayPage,
      componentProps: { dt: dt }
    });
    modal.present();
    const { data, role } = await modal.onWillDismiss();
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

  formatTime(appointment): string {

    var d1: Date = new Date(appointment.StartDate);
    var d2: Date = new Date(d1);

    d2.setMinutes(d1.getMinutes() + appointment.Duration);
    return this.dataProvider.formatDate(d1, "HH:mm") +
      ' - ' +
      this.dataProvider.formatDate(d2, "HH:mm");

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

  onRefresh() {
    this.dataProvider.loadWeekData();
  }

  handleError(error: number) {
    if (error != undefined && error != null) {
      var errId = this.appointmentService.getAppointmentErrors(error);
      this.dataProvider.showMessage(errId, true);
    } else {
      this.dataProvider.showMessage("ERR_NO_SAVE_APPOINTMENT", true);
    }
  }

  private addDays(date: Date, days: number): Date {
    var result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  async onPlaceDetails() {
    const modal = await this.modalCtrl.create({
      component: PlacedetailsPage,
    });
    modal.present();
    const { data, role } = await modal.onWillDismiss();
  }


  public hasPlace(): boolean {
    return this.dataProvider.Profile.CurrentPlace !== undefined && this.dataProvider.Profile.CurrentPlace.Name !== '';
  }

  public getPlaceName() {
    return this.hasPlace() ? this.dataProvider.Profile.CurrentPlace.Name : this.translate.instant("HEADER_PRIVATEAPPOINTMENTS");
  }

  async placeImage(): Promise<string> {
    var entry = this.dataProvider.Profile.CurrentPlace;
    if (entry.LocalImage === undefined) {
      var image = await this.imageService.get(entry.ImageUrl, entry.PlaceKey, "places", true, this.dataProvider.Profile.UserKey);
      if (image) {
        this.zone.run(() => {
          entry.LocalImage = image.data;
        });
      }

    }
    return entry.LocalImage;
  }

}