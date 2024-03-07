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
  changed: boolean = false;

  @Input("dt") dt: Date;

  constructor(
    private modalCtrl: ModalController,
    public appointmentService: AppointmentService,
    public dataProvider: DataService) {

  }

  ngOnInit() {
    this.refresh()
  }

  private refresh() {
    this.dataProvider.DayIsLoaded = false;
    this.appointmentService.syncAppointments();
    this.dayString = this.formatDate(this.dt);
    this.dataProvider.getAppointments(this.dt);
    this.dataProvider.getMyAppointments(this.dt);
  }
  cancel() {
    return this.modalCtrl.dismiss(null, this.changed ? 'changed': 'cancel');
  }

  formatDate(dt: Date): string {
    return this.dataProvider.formatDate(dt, "dddd, LL");
  }

  async postEventProcessing(data: AppointmentViewmodel, role: string) {
    switch (role) {
      case 'create':
        this.appointmentService.create(true, this.dt);
        this.dataProvider.getMyAppointments(this.dt);
        this.changed = true;
        break;
      case 'save':
        this.dataProvider.getMyAppointments(this.dt);
        this.appointmentService.save(false, null, (success) => {
          this.changed = true;
          this.refresh();
        } );
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
