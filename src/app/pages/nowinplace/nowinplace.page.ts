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
import { OtherAppointmentPage } from '../otherappointment/otherappointment.page';
import * as moment from 'moment';

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
    public imageProvider: ImageService) 
    {
      this.dt = moment().startOf('day').toDate();
      this.dataProvider.getAppointments(this.dt);
    }

  cancel() {
    return this.modalCtrl.dismiss(null, 'cancel');
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

  async onPlaceDetails() {
    const modal = await this.modalCtrl.create({
      component: PlacedetailsPage,
    });
    modal.present();
    const { data, role } = await modal.onWillDismiss();
  }
}