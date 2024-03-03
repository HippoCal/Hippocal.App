import { Component, EventEmitter, Input, NgZone, OnInit, Output } from '@angular/core';
import { AppointmentViewmodel } from "src/app/viewmodels/viewmodels";
import { DataService, ImageService} from 'src/app/services/services';
import * as moment from 'moment';
import { AppointmentTypeEnum } from 'src/app/enums/appointmenttypeenum';
import { RecordTypeEnum } from 'src/app/enums/recordtypeenum';


@Component({
  selector: 'app-appointment',
  templateUrl: './appointment.component.html',
  styleUrls: ['./appointment.component.scss'],
})
export class AppointmentComponent implements OnInit {

  @Input('appointment') appointment: AppointmentViewmodel;
  @Input('canDelete') canDelete: boolean;
  @Output() showAppointment = new EventEmitter<AppointmentViewmodel>();
  @Output() deleteAppointment = new EventEmitter<AppointmentViewmodel>();
  
  public horseImage: string;
  public isVisible: boolean = false;

  recordType: RecordTypeEnum;

  constructor(
    private dataProvider: DataService, 
    private imageProvider: ImageService,
    private zone: NgZone, 
    ) { 
    
  }

  ionViewWillEnter() {
    
  }

  getAvatarLetter(): string {
    switch (this.appointment.AppointmentType) {
      case AppointmentTypeEnum.Course:
        return 'L';
      case AppointmentTypeEnum.Maintenance:
        return 'H';
      case AppointmentTypeEnum.Training:
        return 'T';
      case AppointmentTypeEnum.Other:
        return 'V';
      default:
        return '?';
    }
  }

  ngOnInit() {
    this.recordType = AppointmentViewmodel.recordType(this.appointment);
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
    else if (now > endDate) {
      return 'grey';
    }
    else if(this.recordType === RecordTypeEnum.Admin) {
      return 'admin';
    }
    else if(this.recordType === RecordTypeEnum.Private) {
      return 'blue';
    }
    else if(this.recordType === RecordTypeEnum.Standard) {
      return 'primary';
    }
    return 'divider';
  }

  
  async gethorseImage() {
    var image = await this.dataProvider.getHorseImage(this.appointment.HorseKey);
      if (image !== null) {
        this.zone.run(() => {
          this.horseImage = image.data;
          this.appointment.HorseImageUrl = image.fileName;
          this.isVisible = true;
        });
      }
  }

  public onClick() {
    this.showAppointment.emit(this.appointment);
  }

}
