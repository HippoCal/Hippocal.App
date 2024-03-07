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
import { DayPage } from '../day/day.page';
import { PlacedetailsPage } from '../placedetails/placedetails.page';
import { NowinplacePage } from '../nowinplace/nowinplace.page';
import { RecordTypeEnum } from 'src/app/enums/recordtypeenum';
import { OtherAppointmentPage } from '../otherappointment/otherappointment.page';

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
    this.refresh();
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

  cancel() {
    return this.modalCtrl.dismiss(null, 'cancel');
  }

  public previousWeek(): void {
    this.appointmentService.syncAppointments();
    var newDay = moment(this.dataProvider.CurrentDay.valueOf()).add(-7, 'days');
    this.firstDay = newDay.toDate();
    this.dataProvider.initWeek(this.firstDay);
  }

  public nextWeek(): void {
    this.appointmentService.syncAppointments();
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
    if(role === 'changed') {
      this.refresh()
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
        this.appointmentService.save(true, this.firstDay);
        break;
      case 'delete':
        this.appointmentService.delete(null, false);
        this.dataProvider.initWeek(this.firstDay);
        break;
    }

  }

  onRefresh() {
    this.appointmentService.syncAppointments();
    this.dataProvider.loadWeek();
  }

  refresh() {
    this.firstDay = moment(new Date()).toDate();
    this.appointmentService.syncAppointments();
    this.dataProvider.initWeek(this.firstDay);
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
    if (this.dataProvider.Profile.CurrentPlace.IsPrivate) return;
    const modal = await this.modalCtrl.create({
      component: PlacedetailsPage,
    });
    modal.present();
    const { data, role } = await modal.onWillDismiss();
  }


  public hasPlace(): boolean {
    return this.dataProvider.Profile.CurrentPlace !== undefined && !this.dataProvider.Profile.CurrentPlace.IsPrivate;
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