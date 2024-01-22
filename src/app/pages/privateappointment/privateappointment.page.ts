import { Component, ViewChild, ElementRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AppointmentViewmodel, ResultIdViewmodel } from "src/app/viewmodels/viewmodels";
import { JobTypeEnum, AppointmentTypeEnum } from 'src/app/enums/enums';
import { TranslateService } from '@ngx-translate/core';
import { LocationStrategy } from '@angular/common';
import * as moment from 'moment';
import { AppointmentService, DataService, ToastService } from 'src/app/services/services';

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
  private app: AppointmentViewmodel;
  private dt: Date;

  public duration: number;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    public dataProvider: DataService,
    public appointmentService: AppointmentService,
    public translate: TranslateService,
    private toastSvc: ToastService,
    private locationStrategy: LocationStrategy) {
    this.resolveParams();
  }

  resolveParams() {
    this.route.queryParams.subscribe(params => {
      if (this.router.getCurrentNavigation().extras.state) {
        this.app = this.router.getCurrentNavigation().extras.state['appointment'];
        this.dt = this.router.getCurrentNavigation().extras.state['dt'];
        this.appointmentService.dt = moment(new Date(this.dt));
        this.isNew = false;
        this.hasName = false;
        this.area = "horses";
        if (this.app === null || this.app === undefined) {
          this.isNew = true;
          this.app = new AppointmentViewmodel(this.dataProvider.Profile.UserKey, '', '', this.appointmentService.dt, this.appointmentService.dt.hour(), this.appointmentService.dt.minute(), '', 60, JobTypeEnum.Other, AppointmentTypeEnum.Custom);
          this.app.HorseKey = this.dataProvider.Profile.Horses.length > 0 ? this.dataProvider.Profile.Horses[0].HorseKey : '';
        }
        this.appointmentService.SetAppointment(this.app);
        this.duration = this.app.Duration;
        this.appointmentService.setHorseName(this.appointmentService.appointment.HorseKey);
        this.onChangeAppointmentType();
        this.onNameChanged();
      }
    });
  }

  change(event){
    event.stopPropagation();
    var duration: number = event.target.value;
    this.appointmentService.appointment.Duration = duration;
  }

  changeTab(event){
    event.stopPropagation();
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

  onCreateOrModify() {
    if (this.isNew) {
      this.onCreateAppointment();
    } else {
      this.onModifyAppointment();
    }
  }

  onChangeHorse() {
    this.appointmentService.setHorseName(this.appointmentService.appointment.HorseKey);
  }

  onDelete() {
    this.toastSvc.confirm(() => {
      this.appointmentService.appointment.UserKey = this.dataProvider.Profile.UserKey;
      this.appointmentService.deleteAppointment().then((result) => {
        if (result) {
          this.appointmentService.RefreshData(true);
          this.locationStrategy.historyGo(-1);
        } else {
          this.dataProvider.showMessage("ERR_NO_DELETE_APPOINTMENT", true);
        }
      });
    }, "HEADER_CONFIRM_DELETE_PRIVATE_APPOINTMENT", "MSG_CONFIRM_DELETE_PRIVATE_APPOINTMENT");
  }

  onCreateAppointment() {
    this.toastSvc.confirm(() => {
      this.appointmentService.SetData();
      this.appointmentService.createAppointment().then((result: ResultIdViewmodel) => {
        if (result.Result) {
          this.appointmentService.appointment.Id = result.Id;
          this.appointmentService.RefreshData(false);
          this.locationStrategy.historyGo(-1);
        } else {
          this.handleError(result.ErrorId);
        }
      });
    }, "HEADER_CONFIRM_CREATE_PRIVATE_APPOINTMENT", "MSG_CONFIRM_CREATE_PRIVATE_APPOINTMENT");
  }

  onModifyAppointment() {
    this.toastSvc.confirm(() => {
      this.appointmentService.SetData();
      this.appointmentService.modifyAppointment().then((result: ResultIdViewmodel) => {
        if (result.Result) {
          this.appointmentService.SetOriginalAppointment();
          this.appointmentService.RefreshData(false);
          this.locationStrategy.historyGo(-1);
        } else {
          this.handleError(result.ErrorId);
        }
      });
    }, "HEADER_CONFIRM_MODIFY_APPOINTMENT", "MSG_CONFIRM_MODIFY_APPOINTMENT");
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
