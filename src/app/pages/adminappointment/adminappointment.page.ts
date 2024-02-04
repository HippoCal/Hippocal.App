import { Component, ViewChild, ElementRef, Input } from '@angular/core';
import { PlaceViewmodel, AppointmentViewmodel } from "src/app/viewmodels/viewmodels";
import { DataService, AppointmentService, ToastService } from 'src/app/services/services';
import { JobTypeEnum, AppointmentTypeEnum } from 'src/app/enums/enums';
import { TranslateService } from '@ngx-translate/core';
import * as moment from 'moment';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'page-adminappointment',
  templateUrl: './adminappointment.page.html',
})
export class AdminappointmentPage {

  @ViewChild('comment') commentInput: ElementRef;

  public isNew: boolean;
  public buttonText: string;
  public hasName: boolean;

  @Input("dt") dt: Date;
  @Input("place") place: PlaceViewmodel;
  @Input("appointment") appointment: AppointmentViewmodel;

  constructor(
    public dataProvider: DataService,
    private modalCtrl: ModalController,
    public appointmentService: AppointmentService,
    public translate: TranslateService,
    private toastSvc: ToastService) {
  }

  ngOnInit() {
    this.appointmentService.dt = moment(new Date(this.dt));
    this.appointmentService.appointment = this.appointment;
    this.appointmentService.dt = moment(new Date(this.appointmentService.dt));
    this.isNew = false;
    this.hasName = false;
    this.appointmentService.initTypes();
    if (this.appointmentService.appointment === null || this.appointmentService.appointment === undefined) {
      this.isNew = true;
      this.buttonText = this.translate.instant('BTN_CONFIRMADMINAPPOINTMENT');
      this.appointmentService.appointment = new AppointmentViewmodel(
        this.dataProvider.Profile.UserKey,
        this.place.PlaceKey,
        this.place.Name,
        this.appointmentService.dt,
        this.appointmentService.dt.hour(),
        this.appointmentService.dt.minute(),
        '',
        60,
        JobTypeEnum.Dressage,
        AppointmentTypeEnum.Other);
      this.onChangeJobType();

    }
    this.buttonText = this.isNew
      ? this.translate.instant('BTN_CONFIRMADMINAPPOINTMENT')
      : this.translate.instant('BTN_EDITADMINAPPOINTMENT');
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad AdminappointmentPage');
    this.resize();
    this.onNameChanged();
  }

  onNameChanged() {
    if (this.appointmentService.appointment.AppointmentName !== '') {
      this.hasName = true;
    } else {
      this.hasName = false;
    }
  }

  resize() {
    var element = this.commentInput['_elementRef'].nativeElement.getElementsByClassName("text-input")[0];
    var scrollHeight = element.scrollHeight;
    element.style.height = scrollHeight + 'px';
    this.commentInput['_elementRef'].nativeElement.style.height = (scrollHeight + 16) + 'px';
  }

  onChangeJobType() {
    this.appointmentService.changeJobType();
    this.appointmentService.getEventName();
    this.onNameChanged();
  }

  onChangeAppointmentType() {
    this.appointmentService.getEventName();
    this.onNameChanged();
  }

  formatDate(dt: string): string {
    return this.dataProvider.formatDate(new Date(dt), "dddd, LL");
  }

  formatTime(dt: any): string {
    return this.dataProvider.formatDate(new Date(dt), "HH:mm");
  }

  onDelete() {
    this.toastSvc.confirm(() => {
      this.appointmentService.appointment.UserKey = this.dataProvider.Profile.UserKey;
      this.appointmentService.deleteAppointment().then((result) => {
        if (result) {
          this.appointmentService.RefreshData(true);
          this.dataProvider.navigate('home', 'tab3');
        } else {
          this.toastSvc.showMessage("ERR_NO_DELETE_APPOINTMENT", '', true);
        }
      });
    }, "HEADER_CONFIRM_DELETE_EVENT", "MSG_CONFIRM_DELETE_EVENT");
  }

  cancel() {
    return this.modalCtrl.dismiss(this.appointmentService.appointment, 'cancel');
  }

  onCreateOrUpdate() {
    this.toastSvc.confirm(() => {
      return this.modalCtrl.dismiss(this.appointmentService.appointment, 'save');
    }, 
    this.isNew ? "HEADER_CONFIRM_CREATE_EVENT" : "HEADER_CONFIRM_MODIFY_EVENT",
    this.isNew ? "MSG_CONFIRM_CREATE_EVENT" : "MSG_CONFIRM_MODIFY_EVENT");
  }

}
