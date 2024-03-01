import { Component, Input } from '@angular/core';
import { AppointmentViewmodel, HalfHourViewmodel } from "src/app/viewmodels/viewmodels";
import { AppointmentService, DataService } from "src/app/services/services";
import { ModalController } from '@ionic/angular';
import { CreatePage } from '../create/create.page';
import { PrivateAppointmentPage } from '../privateappointment/privateappointment.page';
import { AdminappointmentPage } from '../adminappointment/adminappointment.page';
import { RecordTypeEnum } from 'src/app/enums/recordtypeenum';
import { OtherAppointmentPage } from '../otherappointment/otherappointment.page';

@Component({
  selector: 'page-day',
  templateUrl: './day.page.html',
  styleUrls: ['./day.page.scss'],
})
export class DayPage {

  dayString: string;

  @Input("dt") dt: Date;

  constructor(
    private modalCtrl: ModalController,
    public appointmentService: AppointmentService,
    public dataProvider: DataService) {

  }

  ngOnInit() {
    this.dataProvider.DayIsLoaded = false;
    this.appointmentService.syncAppointments();
    this.dayString = this.formatDate(this.dt);
    this.dataProvider.getAppointments(this.dt);
    this.dataProvider.getMyAppointments(this.dt);
  }

  cancel() {
    return this.modalCtrl.dismiss(null, 'cancel');
  }

  formatDate(dt: Date): string {
    return this.dataProvider.formatDate(dt, "dddd, LL");
  }

  // async createAdmin(dt: Date) {
  //   const modal = await this.modalCtrl.create({
  //     component: AdminappointmentPage,
  //     componentProps: { appointment: null, dt: dt }
  //   });
  //   modal.present();
  //   const { data, role } = await modal.onWillDismiss();
  //   await this.postEventProcessing(data, null, role, dt);
  // }

  // async createPrivate(appointment: AppointmentViewmodel, dt: Date) {
  //   const modal = await this.modalCtrl.create({
  //     component: PrivateAppointmentPage,
  //     componentProps: { appointment: appointment, dt: dt }
  //   });
  //   modal.present();
  //   const { data, role } = await modal.onWillDismiss();
  //   await this.postEventProcessing(data, null, role, dt);
  // }
  
  // async create(appointment: AppointmentViewmodel, dt: Date, halfhour: HalfHourViewmodel, hasEvent?: boolean) {
  //   const modal = await this.modalCtrl.create({
  //     component: CreatePage,
  //     componentProps: { appointment: appointment, dt: dt, hasEvent: hasEvent }
  //   });
  //   modal.present();
  //   const { data, role } = await modal.onWillDismiss();
  //   await this.postEventProcessing(data, halfhour, role, dt);
  // }

  async postEventProcessing(data: AppointmentViewmodel, role: string) {
    switch (role) {
      case 'create':
        this.appointmentService.create(true, this.dt);
        this.dataProvider.getMyAppointments(this.dt);
        break;
      case 'save':
        this.appointmentService.save();
        break;
      case 'delete':
        this.appointmentService.delete();      
        break;
      case 'admin':
        await this.createModal(null, RecordTypeEnum.Admin, data.StartDate, true);
        break;
    }
  }

  handleError(error: number) {
    if (error != undefined && error != null) {
      var errId = this.appointmentService.getAppointmentErrors(error);
      this.dataProvider.showMessage(errId, true);
    } else {
      this.dataProvider.showMessage("ERR_NO_SAVE_APPOINTMENT", true);
    }
  }

  async onSelectHalfHour(halfhour: HalfHourViewmodel) {
    if (halfhour.CanCreate) {
      if (this.dataProvider.IsOnline) {
        var recordType: RecordTypeEnum;
        if (!this.dataProvider.IsPrivate) {
          recordType = RecordTypeEnum.Standard;
        } else {
          recordType = RecordTypeEnum.Private;
        }
        await this.createModal(null, recordType, halfhour.Date, true);
      } else {
        this.dataProvider.showMessage("MSG_NO_APPOINTMENTS_IN_OFFLINE_MODE", true);
      }
    }
  }

  async onShowAppointment(appointment: AppointmentViewmodel) {
    var recordType = AppointmentViewmodel.recordType(appointment);
    await this.createModal(appointment, recordType, appointment.StartDate, appointment.IsInTheFuture);
  }

  async createModal(appointment: AppointmentViewmodel, recordType: RecordTypeEnum, dt: Date, isInTheFuture: boolean) {
    let component: any;
    if (!isInTheFuture) {
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
      componentProps: { appointment: appointment, dt: dt }
    });
    modal.present();
    const { data, role } = await modal.onWillDismiss();
    this.postEventProcessing(data, role);
  }

}
