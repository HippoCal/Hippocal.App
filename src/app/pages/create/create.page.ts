import { Component, ElementRef, ViewChild } from '@angular/core';
import { Router, ActivatedRoute, NavigationExtras } from '@angular/router';
import { AppointmentViewmodel, ResultIdViewmodel } from "src/app/viewmodels/viewmodels";
import { AppointmentTypeEnum, JobTypeEnum } from 'src/app/enums/enums';
import { DataService, AppointmentService, ToastService, ImageService } from 'src/app/services/services';

import { TranslateService } from '@ngx-translate/core';
import * as moment from 'moment';

@Component({
  selector: 'page-create',
  templateUrl: './create.page.html',
  styleUrls: ['./create.page.scss']
})
export class CreatePage {

  @ViewChild('comment') commentInput: ElementRef;

  public dt: Date;
  public isNew: boolean;
  public hasEvent: boolean;
  public area: string;
  public hasName: boolean;
  public duration: number;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    public dataProvider: DataService,
    public appointmentService: AppointmentService,
    public imageProvider: ImageService,
    public translate: TranslateService,
    private toastSvc: ToastService) {
    this.resolveParams();
  }

  resolveParams() {
    this.route.queryParams.subscribe(params => {
      if (this.router.getCurrentNavigation().extras.state) {
        this.dt = this.router.getCurrentNavigation().extras.state['dt'];
        this.hasEvent = this.router.getCurrentNavigation().extras.state['hasEvent'] as boolean;
        var appointment = this.router.getCurrentNavigation().extras.state['appointment'] as AppointmentViewmodel;
        
        this.appointmentService.dt = moment(new Date(this.dt));
        this.area = "horses";
        
        if (appointment === null || appointment === undefined) {
          this.isNew = true;
         appointment = new AppointmentViewmodel(
            this.dataProvider.Profile.UserKey,
            this.dataProvider.Profile.CurrentPlace.PlaceKey,
            this.dataProvider.Profile.CurrentPlace.Name,
            this.appointmentService.dt,
            this.appointmentService.dt.hour(),
            this.appointmentService.dt.minute(),
            this.dataProvider.Profile.DisplayName !== '' && this.dataProvider.Profile.DisplayName !== undefined
              ? this.dataProvider.Profile.DisplayName
              : this.dataProvider.Profile.FirstName + ' ' + this.dataProvider.Profile.Name,
            30,
            JobTypeEnum.Other,
            AppointmentTypeEnum.Standard);
          appointment.HorseKey = this.dataProvider.Profile.Horses[0].HorseKey;
        }
        this.duration = appointment.Duration;
        this.appointmentService.SetAppointment(appointment);
        this.appointmentService.SetData();
        this.hasName = false;
        this.onNameChanged();
        this.onChangeJobType();
      }
    });
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad CreatePage');
  }

  onCreateAdminAppointment() {
    let navigationExtras: NavigationExtras = {
      state: {
        dt: this.dt,
        appointment: null,
        place: this.dataProvider.Profile.CurrentPlace
      }
    };
    this.router.navigate(['AdminappointmentPage'], navigationExtras);
  }

  onDelete() {
    this.toastSvc.confirm(() => {
      this.appointmentService.appointment.UserKey = this.dataProvider.Profile.UserKey;
      this.appointmentService.deleteAppointment().then((result) => {
        if (result) {
          this.appointmentService.RefreshData(true);
          this.router.navigate(['tabs/tab1']);
        } else {
          this.dataProvider.showMessage("ERR_NO_DELETE_APPOINTMENT", true);
        }
      });
    }, "HEADER_CONFIRM_DELETE", "MSG_CONFIRM_DELETE");
  }

  changeDuration(event){
    event.stopPropagation();
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

  onCreateAppointment() {
    this.toastSvc.confirm(() => {
      this.appointmentService.SetData();
      this.appointmentService.createAppointment().then((result: ResultIdViewmodel) => {
        if (result.Result) {
          this.appointmentService.appointment.Id = result.Id;
          this.appointmentService.RefreshData(false);
          this.router.navigate(['tabs/tab1']);
          this.appointmentService.LoadOwnData();
        } else {
          this.handleError(result.ErrorId);
        }
      });
    }, "HEADER_CONFIRM_CREATE", "MSG_CONFIRM_CREATE");
  }

  onModifyAppointment() {
    this.toastSvc.confirm(() => {
      this.appointmentService.SetData();
      this.appointmentService.modifyAppointment().then((result: ResultIdViewmodel) => {
        if (result.Result) {
          this.appointmentService.SetOriginalAppointment();
          this.appointmentService.RefreshData(false);
          this.router.navigate(['tabs/tab1']);
          this.appointmentService.LoadOwnData();
        } else {
          this.handleError(result.ErrorId);
        }
      });
    }, "HEADER_CONFIRM_MODIFY_APPOINTMENT", "MSG_CONFIRM_MODIFY_APPOINTMENT");
  }


  formatDate(dt: string): string {
    return this.dataProvider.formatDate(new Date(dt), "dddd, LL");
  }

  formatTime(dt: any): string {
    return this.dataProvider.formatDate(new Date(dt), "HH:mm");
  }

  getHorseImage(imageUrl: string) {
    return this.dataProvider.pathForImage(imageUrl, "horse");
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
