import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { AppointmentViewmodel, HorseViewmodel, ProfileViewmodel } from "src/app/viewmodels/viewmodels";
import { AppointmentTypeEnum, JobTypeEnum } from 'src/app/enums/enums';
import { DataService, AppointmentService, ToastService, ImageService } from 'src/app/services/services';
import { TranslateService } from '@ngx-translate/core';
import * as moment from 'moment';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'page-create',
  templateUrl: './create.page.html',
  styleUrls: ['./create.page.scss']
})
export class CreatePage {

  @ViewChild('comment') commentInput: ElementRef;

  public isNew: boolean;
  public hasName: boolean;
  public duration: number;

  @Input("dt") dt: Date;
  @Input("hasEvent") hasEvent: boolean;
  @Input("appointment") appointment: AppointmentViewmodel;

  constructor(
    public dataProvider: DataService,
    private modalCtrl: ModalController,
    public appointmentService: AppointmentService,
    public imageProvider: ImageService,
    public translate: TranslateService,
    private toastSvc: ToastService) {
  }

  ngOnInit() {
    this.appointmentService.initTypes();
    this.appointmentService.dt = moment(new Date(this.dt));

    if (this.appointment === null || this.appointment === undefined) {
      this.isNew = true;
      this.appointment = new AppointmentViewmodel(
        this.dataProvider.Profile.UserKey,
        this.dataProvider.Profile.CurrentPlace.PlaceKey,
        this.dataProvider.Profile.CurrentPlace.Name,
        this.appointmentService.dt,
        this.appointmentService.dt.hour(),
        this.appointmentService.dt.minute(),
        ProfileViewmodel.GetTitle(this.dataProvider.Profile),
        30,
        JobTypeEnum.Other,
        AppointmentTypeEnum.Standard);
      this.appointment.HorseKey = this.dataProvider.Profile.Horses[0].HorseKey;
    }
    this.duration = this.appointment.Duration;
    this.appointmentService.setAppointment(this.appointment);
    this.appointmentService.setData();
    this.hasName = false;
    this.onNameChanged();
    //this.onChangeJobType();
    this.setActiveHorse();
  }

  setActiveHorse() {
    var hasActiveItem: boolean = false;
    if (this.dataProvider.Profile.Horses != null && this.dataProvider.Profile.Horses.length > 1) {
      this.dataProvider.Profile.Horses.forEach((item) => {
        if(this.appointmentService.appointment.HorseKey !== "") {
          if(item.HorseKey === this.appointmentService.appointment.HorseKey) {
            hasActiveItem = true;
            item.IsActive = true;
            this.onChangeHorse(item);
          }
        } 
        else if (item.IsActive) {
          hasActiveItem = true;
          this.onChangeHorse(item);
          return;
        }
      })
      if (!hasActiveItem) {
        this.dataProvider.Profile.Horses[0].IsActive = true;
        this.onChangeHorse(this.dataProvider.Profile.Horses[0]);
      }
    }
  }

  onCreateAdminAppointment() {
    return this.modalCtrl.dismiss(this.appointmentService.appointment, 'admin');
  }

  onDelete() {
    this.toastSvc.confirm(() => {
      return this.modalCtrl.dismiss(this.appointmentService.appointment, 'delete');
    }, "HEADER_CONFIRM_DELETE", "MSG_CONFIRM_DELETE");
  }


  changeDuration(event) {
    var duration: number = event.target.value;
    this.appointmentService.appointment.Duration = duration;
  }

  onChangeJobType() {
    this.appointmentService.appointment.AppointmentName = this.appointmentService.getStandardJobType(this.appointmentService.appointment.JobType);
    this.onNameChanged();
  }

  resize() {
    if (this.appointmentService.appointment.Comment.length > 100) {
      var element = this.commentInput['_elementRef'].nativeElement.getElementsByClassName("text-input")[0];

      var scrollHeight = element.scrollHeight;
      element.style.height = scrollHeight + 'px';
      this.commentInput['_elementRef'].nativeElement.style.height = (scrollHeight + 16) + 'px';
    }
  }

  onNameChanged() {
    if (this.appointmentService.appointment.AppointmentName !== '') {
      this.hasName = true;
    } else {
      this.hasName = false;
    }
  }

  onChangeHorse(horse: HorseViewmodel) {
    this.dataProvider.Profile.Horses.forEach((item) => {
      item.IsActive = false;
    })
    horse.IsActive = true;
    this.appointmentService.appointment.HorseName = horse.Name;
    this.appointmentService.appointment.HorseImageUrl = horse.ImageUrl;
    this.appointmentService.appointment.HorseKey = horse.HorseKey;
  }

  onCreateOrUpdate() {
    this.toastSvc.confirm(() => {
      return this.modalCtrl.dismiss(this.appointmentService.appointment, this.isNew ? 'create' : 'save');
    },
      this.isNew ? "HEADER_CONFIRM_CREATE" : "HEADER_CONFIRM_MODIFY_APPOINTMENT",
      this.isNew ? "MSG_CONFIRM_CREATE" : "MSG_CONFIRM_MODIFY_APPOINTMENT");
  }

  cancel() {
    return this.modalCtrl.dismiss(this.appointmentService.appointment, 'cancel');
  }

  formatDate(dt: string): string {
    return this.dataProvider.formatDate(new Date(dt), "dddd, LL");
  }

  formatTime(dt: any): string {
    return this.dataProvider.formatDate(new Date(dt), "HH:mm");
  }

  handleError(error: number) {
    if (error != undefined && error != null) {
      var errId = this.appointmentService.getAppointmentErrors(error);
      this.dataProvider.showMessage(errId, true);
    } else {
      this.dataProvider.showMessage("ERR_NO_SAVE_APPOINTMENT", true);
    }
  }
}
