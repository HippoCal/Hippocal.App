import { Component, ViewChild, ElementRef, Input, NgZone } from '@angular/core';
import { AppointmentViewmodel, HorseViewmodel, ProfileViewmodel } from "src/app/viewmodels/viewmodels";
import { JobTypeEnum, AppointmentTypeEnum } from 'src/app/enums/enums';
import { TranslateService } from '@ngx-translate/core';
import * as moment from 'moment';
import { AppointmentService, DataService, ImageService, ToastService } from 'src/app/services/services';
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

  public horseImage: string;
  constructor(
    private modalCtrl: ModalController,
    public dataProvider: DataService,
    private zone: NgZone,
    public appointmentService: AppointmentService,
    public translate: TranslateService,
    private toastSvc: ToastService,) {
  }

  async ngOnInit() {
    this.appointmentService.initTypes();
    this.appointmentService.dt = moment(new Date(this.dt));
    this.isNew = false;
    this.hasName = false;
    this.area = "horses";
    if (this.appointment === null || this.appointment === undefined) {
      this.isNew = true;
      this.appointment = new AppointmentViewmodel(
        this.dataProvider.Profile.UserKey,
        '',
        '',
        this.appointmentService.dt,
        this.appointmentService.dt.hour(),
        this.appointmentService.dt.minute(),
        ProfileViewmodel.GetTitle(this.dataProvider.Profile),
        60,
        JobTypeEnum.Other,
        AppointmentTypeEnum.Custom);
      this.appointment.HorseKey = this.dataProvider.Profile.Horses.length > 0 ? this.dataProvider.Profile.Horses[0].HorseKey : '';
      this.appointment.AppointmentType = AppointmentTypeEnum.Custom;
    }
    this.appointmentService.setAppointment(this.appointment);
    await this.gethorseImage();
    this.duration = this.appointment.Duration;
    this.appointmentService.setHorseName(this.appointmentService.appointment.HorseKey);
    this.onNameChanged();
    this.setActiveHorse();
  }

  setActiveHorse() {
    var hasActiveItem: boolean = false;
    if (this.dataProvider.Profile.Horses != null && this.dataProvider.Profile.Horses.length > 1) {
      this.dataProvider.Profile.Horses.forEach((item) => {
        if (this.appointmentService.appointment.HorseKey !== "") {
          if (item.HorseKey === this.appointmentService.appointment.HorseKey) {
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

  onChangeHorse(horse: HorseViewmodel) {
    this.dataProvider.Profile.Horses.forEach((item) => {
      item.IsActive = false;
    })
    horse.IsActive = true;
    this.appointmentService.appointment.HorseName = horse.Name;
    this.appointmentService.appointment.HorseImageUrl = horse.ImageUrl;
    this.appointmentService.appointment.HorseKey = horse.HorseKey;
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
    var header: string = this.isNew ? "HEADER_CONFIRM_CREATE_PRIVATE_APPOINTMENT" : "HEADER_CONFIRM_MODIFY_APPOINTMENT";
    var text: string = this.isNew ? "MSG_CONFIRM_CREATE_PRIVATE_APPOINTMENT" : "MSG_CONFIRM_MODIFY_APPOINTMENT";
    this.toastSvc.confirm(() => {
      var role: string = this.isNew ? 'create' : 'save';
      return this.modalCtrl.dismiss(this.appointment, role);
    }, header, text);
  }

  async gethorseImage() {
    if (this.dataProvider.Profile.Horses.length === 1) {
      var image = await this.dataProvider.getHorseImage(this.appointmentService.appointment.HorseKey);
      if (image !== null) {
        this.zone.run(() => {
          this.horseImage = image.data;
          this.appointmentService.appointment.HorseImageUrl = image.fileName;
        });
      }
    }
  }
}
