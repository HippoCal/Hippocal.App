import { Component } from '@angular/core';
import { AppointmentViewmodel, PlaceViewmodel } from "src/app/viewmodels/viewmodels";
import { AppointmentService, DataService, ImageService } from 'src/app/services/services';
import { ModalController } from '@ionic/angular';
import { CreatePage } from '../create/create.page';
import { EventdetailsPage } from '../eventdetails/eventdetails.page';
import { AdminappointmentPage } from '../adminappointment/adminappointment.page';
import { PrivateAppointmentPage } from '../privateappointment/privateappointment.page';
import { PlacedetailsPage } from '../placedetails/placedetails.page';
import { RecordTypeEnum } from 'src/app/enums/recordtypeenum';

@Component({
  selector: 'page-nowinplace',
  templateUrl: './nowinplace.page.html',
  styleUrls: ['./nowinplace.page.scss']
})
export class NowinplacePage {
  dt: Date;

  public color: string = 'secondary-contrast';
  
  constructor(
    public dataProvider: DataService, 
    private modalCtrl: ModalController,
    public appointmentService: AppointmentService,
    public imageProvider: ImageService) {
    this.dt = new Date();
    this.dataProvider.getAppointments(this.dt);
  }

  cancel() {
    return this.modalCtrl.dismiss(null, 'cancel');
  }

  async onShowAppointment(appointment: AppointmentViewmodel) {
    if (AppointmentViewmodel.recordType(appointment) === RecordTypeEnum.Standard) {
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
    if (AppointmentViewmodel.recordType(appointment) === RecordTypeEnum.Private) {
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
        this.appointmentService.delete(null, false);
        break;
    }
  }

  async onPlaceDetails() {
    const modal = await this.modalCtrl.create({
      component: PlacedetailsPage,
    });
    modal.present();
    const { data, role } = await modal.onWillDismiss();
  }
}