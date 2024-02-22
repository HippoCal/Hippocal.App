import { Component, ViewChild, ElementRef, Input } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AppointmentViewmodel, ResultIdViewmodel } from "src/app/viewmodels/viewmodels";
import { JobTypeEnum, AppointmentTypeEnum } from 'src/app/enums/enums';
import { TranslateService } from '@ngx-translate/core';
import { LocationStrategy } from '@angular/common';
import * as moment from 'moment';
import { AppointmentService, DataService, ToastService } from 'src/app/services/services';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'page-privateappointment',
  templateUrl: './privateappointment.page.html',
  styleUrls: ['./privateappointment.page.scss']
})

export class PrivateAppointmentPage {

  @ViewChild('comment') commentInput: ElementRef;

  public isNew: boolean;
  public hasName: boolean;
  public area: string = 'horses';
  public duration: number;

  @Input("dt") dt: Date;
  @Input("hasEvent") hasEvent: boolean;
  @Input("appointment") appointment: AppointmentViewmodel;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private modalCtrl: ModalController,
    public dataProvider: DataService,
    public appointmentService: AppointmentService,
    public translate: TranslateService,
    private toastSvc: ToastService,
    private locationStrategy: LocationStrategy) {
  }

  ngOnInit() {
    this.appointmentService.dt = moment(new Date(this.dt));
    this.isNew = false;
    this.hasName = false;
    this.area = "horses";
    if (this.appointment === null || this.appointment === undefined) {
      this.isNew = true;
      this.appointment = new AppointmentViewmodel(this.dataProvider.Profile.UserKey, '', '', this.appointmentService.dt, this.appointmentService.dt.hour(), this.appointmentService.dt.minute(), '', 60, JobTypeEnum.Other, AppointmentTypeEnum.Custom);
      this.appointment.HorseKey = this.dataProvider.Profile.Horses.length > 0 ? this.dataProvider.Profile.Horses[0].HorseKey : '';
    }
    this.appointmentService.setAppointment(this.appointment);
    this.duration = this.appointment.Duration;
    this.appointmentService.setHorseName(this.appointmentService.appointment.HorseKey);
    this.onChangeAppointmentType();
    this.onNameChanged();
  }

  change(event) {
    var duration: number = event.target.value;
    this.appointmentService.appointment.Duration = duration;
  }

  changeTab(event) {
    this.area = event.target.value;
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad PrivateAppointmentPage');
  }

  getHorseImage(imageUrl: string) {
    return this.dataProvider.pathForImage(imageUrl, "horse");
  }

  resize() {
    if (this.appointmentService.appointment.Comment.length > 100) {
      var element = this.commentInput['_elementRef'].nativeElement.getElementsByClassName("text-input")[0];

      var scrollHeight = element.scrollHeight;
      element.style.height = scrollHeight + 'px';
      this.commentInput['_elementRef'].nativeElement.style.height = (scrollHeight + 16) + 'px';
    }
  }

  onChangeAppointmentType() {
    this.getEventName();
  }

  onNameChanged() {
    if (this.appointmentService.appointment.AppointmentName !== '') {
      this.hasName = true;
    } else {
      this.hasName = false;
    }
  }

  private getEventName() {
    this.appointmentService.appointment.AppointmentName = this.appointmentService.getPrivateAppointmentType(this.appointmentService.appointment.AppointmentType);
    this.onNameChanged();
  }

  formatDate(dt: string): string {
    return this.dataProvider.formatDate(new Date(dt), "dddd, LL");
  }

  formatTime(dt: any): string {
    return this.dataProvider.formatDate(new Date(dt), "HH:mm");
  }

  onChangeHorse() {
    this.appointmentService.setHorseName(this.appointmentService.appointment.HorseKey);
  }

  cancel() {
    return this.modalCtrl.dismiss(this.appointment, 'cancel');
  }

  onDelete() {
    this.toastSvc.confirm(() => {
      return this.modalCtrl.dismiss(this.appointment, 'delete');
    }, "HEADER_CONFIRM_DELETE_PRIVATE_APPOINTMENT", "MSG_CONFIRM_DELETE_PRIVATE_APPOINTMENT");
  }

  onCreateOrUpdate() {
    this.toastSvc.confirm(() => {
      return this.modalCtrl.dismiss(this.appointment, this.isNew ? 'create' : 'save');
    }, 
    this.isNew ? "HEADER_CONFIRM_CREATE_PRIVATE_APPOINTMENT" : "HEADER_CONFIRM_MODIFY_APPOINTMENT", 
    this.isNew ? "MSG_CONFIRM_CREATE_PRIVATE_APPOINTMENT": "MSG_CONFIRM_MODIFY_APPOINTMENT");
  }

}
