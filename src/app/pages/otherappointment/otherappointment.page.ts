import { Component, ElementRef, Input, NgZone, ViewChild } from '@angular/core';
import { AppointmentViewmodel} from "src/app/viewmodels/viewmodels";
import { DataService, AppointmentService, ImageService, ToastService } from 'src/app/services/services';
import { TranslateService } from '@ngx-translate/core';
import * as moment from 'moment';
import { ModalController } from '@ionic/angular';
import { ImageviewPage } from '../imageview/imageview.page';


@Component({
  selector: 'page-otherappointment',
  templateUrl: './otherappointment.page.html',
  styleUrls: ['./otherappointment.page.scss']
})
export class OtherAppointmentPage {

  @ViewChild('comment') commentInput: ElementRef;
  @Input("dt") dt: Date;
  @Input("hasEvent") hasEvent: boolean;
  @Input("appointment") appointment: AppointmentViewmodel;

  public isNew: boolean;
  public area: string;
  public hasName: boolean;
  public duration: number;
  jobName: string;
  imageType: string;
  key: string;
  imageUrl: string;

  constructor(
    public dataProvider: DataService,
    public appointmentService: AppointmentService,
    private modalCtrl: ModalController,
    public imageProvider: ImageService,
    public translate: TranslateService,
    private zone: NgZone, 
    private toastSvc: ToastService) {
  }

  ngOnInit() {
    this.appointmentService.dt = moment(new Date(this.dt));
    this.duration = this.appointment.Duration;
    this.appointmentService.setAppointment(this.appointment);
    this.appointmentService.setData();
    this.hasName = false;
    this.jobName = this.appointmentService.getJobText(this.appointment.JobType);
    this.imageType = this.appointmentService.appointment.OwnAppointment ? "horse" : "user"; 
    this.key = this.appointmentService.appointment.OwnAppointment ? this.appointmentService.appointment.HorseKey : this.dataProvider.Profile.UserKey; 
    this.imageUrl = this.appointmentService.appointment.OwnAppointment ? this.dataProvider.Profile.ImageUrl : this.appointmentService.appointment.ImageUrl; 
  }

  onSave() {
    this.toastSvc.confirm(() => {
      return this.modalCtrl.dismiss(this.appointmentService.appointment, 'save');
    }, 
    "HEADER_CONFIRM_MODIFY_APPOINTMENT", 
    "MSG_CONFIRM_MODIFY_APPOINTMENT");
  }

  resize() {
    if (this.appointmentService.appointment.Comment.length > 100) {
      var element = this.commentInput['_elementRef'].nativeElement.getElementsByClassName("text-input")[0];

      var scrollHeight = element.scrollHeight;
      element.style.height = scrollHeight + 'px';
      this.commentInput['_elementRef'].nativeElement.style.height = (scrollHeight + 16) + 'px';
    }
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

}
