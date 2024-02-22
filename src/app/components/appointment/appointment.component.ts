import { Component, EventEmitter, Input, NgZone, Output } from '@angular/core';
import { AppointmentViewmodel } from "src/app/viewmodels/viewmodels";
import { DataService, ImageService} from 'src/app/services/services';
import * as moment from 'moment';


@Component({
  selector: 'app-appointment',
  templateUrl: './appointment.component.html',
  styleUrls: ['./appointment.component.scss'],
})
export class AppointmentComponent {

  @Input('appointment') appointment: AppointmentViewmodel;
  @Input('canDelete') canDelete: boolean;
  @Output() showAppointment = new EventEmitter<AppointmentViewmodel>();
  @Output() deleteAppointment = new EventEmitter<AppointmentViewmodel>();
  
  public horseImage: string;

  constructor(
    private dataProvider: DataService, 
    private imageProvider: ImageService,
    private zone: NgZone, 
    ) { 
    
  }

  ngOnInit() {
    this.gethorseImage();
  }
  
  formatDate(dt: string): string {
    return this.dataProvider.formatDate(new Date(dt), "dddd, LL");
  }
  
  formatTime(appointment: AppointmentViewmodel): string {

    var d1: Date = new Date(appointment.StartDate);
    var d2: Date = new Date(d1);

    d2.setMinutes(d1.getMinutes() + appointment.Duration);
    return this.dataProvider.formatDate(d1, "HH:mm") +
      ' - ' +
      this.dataProvider.formatDate(d2, "HH:mm");

  }

  // onDelete(event: Event, appointment: AppointmentViewmodel) {
  //   if (event.cancelable) {
  //     event.preventDefault();
  //   }
  //   event.stopPropagation();
  //   this.toastSvc.confirm(() => {
  //     appointment.UserKey = this.dataProvider.Profile.UserKey;
  //     this.appointmentService.appointment = appointment;
  //     this.appointmentService.deleteAppointment(this.appointmentService.appointment).then((result) => {
  //       if (result) {
  //         this.appointmentService.refreshData(true);
  //       } else {
  //         this.dataProvider.showMessage("ERR_NO_DELETE_APPOINTMENT", true);
  //       }
  //     });
  //   }, "HEADER_CONFIRM_DELETE", "MSG_CONFIRM_DELETE");
  // }

  onDelete() {
    this.deleteAppointment.emit(this.appointment);
  }

  getColor(appointment: AppointmentViewmodel): string {
    var now = moment();
    var startDate = moment(appointment.StartDate);
    var endDate = moment(appointment.StartDate).add(appointment.Duration, 'minutes');
    if (startDate < now && endDate > now) {
      return 'orange';
    }
    else if (now < startDate) {
      return 'divider';
    }
    else if (now > endDate) {
      return 'grey';
    }
    return 'divider';
  }

  
  async gethorseImage() {
    var image = await this.imageProvider.get(this.appointment.HorseImageUrl, this.appointment.HorseKey, "horse", true, this.dataProvider.Profile.UserKey);
    if(image) {
      this.zone.run(() => {
        this.horseImage = image.data;
      });    
    }
  }

  public onClick() {
    this.showAppointment.emit(this.appointment);
  }

}
