import { Component, Input, NgZone } from '@angular/core';
import { JobTypeEnum, AppointmentTypeEnum } from 'src/app/enums/enums';
import { HorseViewmodel, HorseAppointmentsViewmodel, TypeAppointmentsViewmodel, OwnAppointmentViewmodel, IOwnAppointmentViewmodel } from "src/app/viewmodels/viewmodels";
import { AppointmentService, DataService, ImageService, ToastService } from 'src/app/services/services';

@Component({
  selector: 'app-horse',
  templateUrl: './horse.component.html',
  styleUrls: ['./horse.component.scss'],
})
export class HorseComponent {

  @Input('horse') horse: HorseViewmodel;
  @Input('color') color: string;
  @Input('canDelete') canDelete: boolean;
  @Input('showappointments') showAppointments: boolean;
  public horseKey: string;
  public horseAppointments: HorseAppointmentsViewmodel;
  public horseImage: string;

  constructor(
    public dataProvider: DataService, 
    private zone: NgZone, 
    public appointmentProvider: AppointmentService, 
    public imageProvider: ImageService,
    private toastsvc: ToastService) {

    
    this.horseAppointments = new HorseAppointmentsViewmodel();
  }

  ngOnInit() {
    this.gethorseImage();
  }

  onClick(horse: HorseViewmodel) {
    if (this.showAppointments) {
      if (this.horseKey === horse.HorseKey) {
        this.horseKey = '';
      } else {
        this.horseKey = horse.HorseKey;
        this.appointmentProvider.GetHorseAppointments(horse.HorseKey, (data: HorseAppointmentsViewmodel) => {
          this.horseAppointments = data
        });
      }
    }
  }

  getAppointmentName(data: IOwnAppointmentViewmodel) {
    let ownAppointment: OwnAppointmentViewmodel = new OwnAppointmentViewmodel(data);

    if (ownAppointment.AppointmentName !== undefined && ownAppointment.AppointmentName !== null && ownAppointment.PlaceName !== undefined && ownAppointment.PlaceName !== null) {
        return ownAppointment.PlaceName + ": " + ownAppointment.AppointmentName;
    }
    if (ownAppointment.AppointmentName !== undefined && ownAppointment.AppointmentName !== null) {
      return ownAppointment.AppointmentName;
    }
    if (ownAppointment.PlaceName !== undefined && ownAppointment.PlaceName !== undefined) {
      return ownAppointment.PlaceName;
    }
    return '';
  }

  onTypeClick(typeAppointment: TypeAppointmentsViewmodel) {
    typeAppointment.Visible = !typeAppointment.Visible;
    this.appointmentProvider.SaveStatus(typeAppointment, this.horseKey);
  }

  getCaption(jobType: JobTypeEnum, appointmentType: AppointmentTypeEnum) {
    return this.appointmentProvider.getCaption(jobType, appointmentType);
  }

  onDeleteHorse(horse: HorseViewmodel) {
    this.toastsvc.confirm(() => {
      horse.UserKey = this.dataProvider.Profile.UserKey;
      this.dataProvider.deleteHorse(horse).then(result => {
        if (result) {
          this.dataProvider.load();
        }
      });
    },
      "HEADER_CONFIRM_DELETE_HORSE",
      "MSG_CONFIRM_DELETE_HORSE");
  }

  formatTime(data: IOwnAppointmentViewmodel): string {

    let ownAppointment: OwnAppointmentViewmodel = new OwnAppointmentViewmodel(data);
    var d1: Date = new Date(ownAppointment.StartDate);
    var d2: Date = new Date(d1);

    d2.setMinutes(d1.getMinutes() + ownAppointment.Duration);
    return this.dataProvider.formatDate(d1, "HH:mm") +
      ' - ' +
      this.dataProvider.formatDate(d2, "HH:mm");

  }

  formatDate(data: IOwnAppointmentViewmodel): string {
    let ownAppointment: OwnAppointmentViewmodel = new OwnAppointmentViewmodel(data);
    return this.dataProvider.formatDate(new Date(ownAppointment.StartDate), "dddd, LL");
  }

  get isLastHorse(): boolean {
    return this.dataProvider.Profile.Horses.length < 2;
  }

  async gethorseImage() {
    var image = await this.imageProvider.get(this.horse && this.horse.ImageUrl ? this.horse.ImageUrl : '', this.horse.HorseKey, "horse", true, this.dataProvider.Profile.UserKey);
    if(image) {
      this.zone.run(() => {
        this.horseImage = image.data;
      });    
    }
  }

}
