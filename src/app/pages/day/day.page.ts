import { Component, Input } from '@angular/core';
import { AppointmentViewmodel, HalfHourViewmodel } from "src/app/viewmodels/viewmodels";
import { AppointmentService, DataService } from "src/app/services/services";
import { ModalController } from '@ionic/angular';
import { CreatePage } from '../create/create.page';
import { PrivateAppointmentPage } from '../privateappointment/privateappointment.page';
import { AdminappointmentPage } from '../adminappointment/adminappointment.page';

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

  async createAdmin(dt: Date) {
    const modal = await this.modalCtrl.create({
      component: AdminappointmentPage,
      componentProps: { appointment: null, dt: dt, place: this.dataProvider.Profile.CurrentPlace }
    });
    modal.present();
    const { data, role } = await modal.onWillDismiss();
    await this.postEventProcessing(data, null, role, dt);
  }

  async create(appointment: AppointmentViewmodel, dt: Date, halfhour: HalfHourViewmodel, hasEvent?: boolean) {
    const modal = await this.modalCtrl.create({
      component: CreatePage,
      componentProps: { appointment: appointment, dt: dt, hasEvent: hasEvent }
    });
    modal.present();
    const { data, role } = await modal.onWillDismiss();
    await this.postEventProcessing(data, halfhour, role, dt);
  }

  async postEventProcessing(data: AppointmentViewmodel, halfhour: HalfHourViewmodel, role: string, dt: Date) {
    switch (role) {
      case 'create':
        this.appointmentService.create();
        this.dataProvider.getMyAppointments(this.dt)
        break;
      case 'save':
        this.appointmentService.save();
        break;
      case 'delete':
        this.appointmentService.delete();
        
        break;
      case 'admin':
        await this.createAdmin(dt);
        this.dataProvider.getMyAppointments(this.dt)
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

  async createPrivate(appointment: AppointmentViewmodel, dt: Date) {
    const modal = await this.modalCtrl.create({
      component: PrivateAppointmentPage,
      componentProps: { appointment: appointment, dt: dt }
    });
    modal.present();
    const { data, role } = await modal.onWillDismiss();
    await this.postEventProcessing(data, null, role, dt);
  }

  public async onSelectHalfHour(halfhour: HalfHourViewmodel) {
    if (halfhour.CanCreate) {
      if (this.dataProvider.IsOnline) {
        if (!this.dataProvider.IsPrivate) {
          await this.create(null, halfhour.Date, halfhour, halfhour.HasEvent);
          //this.navigate('create', null, halfhour.Date, halfhour.HasEvent);
        } else {
          await this.createPrivate(null, halfhour.Date);
        }
      } else {
        this.dataProvider.showMessage("MSG_NO_APPOINTMENTS_IN_OFFLINE_MODE", true);
      }
    }
  }

  public async onShowAppointment(appointment: AppointmentViewmodel) {
    if (appointment.OwnAppointment) {
      if (!appointment.IsPrivate) {
        await this.create(appointment, appointment.StartDate, null);
      } else {
        await this.createPrivate(appointment, appointment.StartDate);
      }
    }

  }

}
