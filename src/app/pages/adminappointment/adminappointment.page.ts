import { Component, ViewChild, ElementRef } from '@angular/core';
import { PlaceViewmodel, AppointmentViewmodel, ResultIdViewmodel } from "src/app/viewmodels/viewmodels";
import { DataService, AppointmentService, ToastService } from 'src/app/services/services';
import { JobTypeEnum, AppointmentTypeEnum } from 'src/app/enums/enums';
import { Router, ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import * as moment from 'moment';

@Component({
  selector: 'page-adminappointment',
  templateUrl: './adminappointment.page.html',
})
export class AdminappointmentPage {

  @ViewChild('comment') commentInput: ElementRef;

  public place: PlaceViewmodel;
  public isNew: boolean;
  public buttonText: string;
  public hasName: boolean;

  constructor(
    private route: ActivatedRoute, 
    private router: Router, 
    public dataProvider: DataService, 
    public appointmentService: AppointmentService, 
    public translate: TranslateService,
    private toastSvc: ToastService) {

      this.resolveParams();
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

  resolveParams() {
    this.route.queryParams.subscribe(params => {
      if (this.router.getCurrentNavigation().extras.state) {
        this.appointmentService.dt = moment(new Date(this.router.getCurrentNavigation().extras.state['dt']));
        this.appointmentService.appointment = this.router.getCurrentNavigation().extras.state['appointment'];
        this.place = this.router.getCurrentNavigation().extras.state['place'];
      }
    });
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

  onCreateOrModify() {
    if (this.isNew) {
      this.onCreateAppointment();
    } else {
      this.onModifyAppointment();
    }
  }

  onDelete() {
    this.toastSvc.confirm(() => {
      this.appointmentService.appointment.UserKey = this.dataProvider.Profile.UserKey;
      this.appointmentService.deleteAppointment().then((result) => {
        if (result) {
          this.appointmentService.RefreshData(true);
          this.dataProvider.navigate('home','tab3');
        } else {
          this.toastSvc.showMessage("ERR_NO_DELETE_APPOINTMENT", '', true);
        }
      });
    }, "HEADER_CONFIRM_DELETE_EVENT", "MSG_CONFIRM_DELETE_EVENT");
  }

  onCreateAppointment() {
    this.toastSvc.confirm(() => {
      this.appointmentService.createAppointment().then((result: ResultIdViewmodel) => {
        if (result.Result) {
          this.appointmentService.appointment.Id = result.Id;
          this.appointmentService.RefreshData(false);
        } else {
          this.handleError(result.ErrorId);
        }
      });
    }, "HEADER_CONFIRM_CREATE_EVENT", "MSG_CONFIRM_CREATE_EVENT");
  }

  onModifyAppointment() {
    this.toastSvc.confirm(() => {
      this.appointmentService.modifyAppointment().then((result: ResultIdViewmodel) => {
        if (result.Result) {
          this.appointmentService.SetOriginalAppointment();
          this.appointmentService.RefreshData(false);
        } else {
          this.handleError(result.ErrorId);
        }
      });
    }, "HEADER_CONFIRM_MODIFY_EVENT", "MSG_CONFIRM_MODIFY_EVENT");
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
