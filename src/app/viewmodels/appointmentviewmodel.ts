import { JobTypeEnum } from '../enums/jobtypeenum';
import { AppointmentTypeEnum } from '../enums/appointmenttypeenum';
import { RecurrenceTypeEnum } from '../enums/recurrencetypeenum';
import { RecordTypeEnum } from '../enums/recordtypeenum';

export class AppointmentViewmodel {
  Id: number;
  UserName: string;
  HorseName: string = '';
  HorseImageUrl: string = '';
  HorseKey: string = '';
  PlaceKey: string = '';
  UserKey: string = '';
  ImageUrl: string = '';
  PlaceName: string = '';
  Color: string = '';
  OwnAppointment: boolean = false;
  IsInTheFuture: boolean = false;
  BlockPlace: boolean = false;
  FreeSlots: boolean = false;
  JobType: JobTypeEnum;
  IsPrivate: boolean;
  AppointmentType: AppointmentTypeEnum = AppointmentTypeEnum.Other;
  RecurrenceType: RecurrenceTypeEnum = RecurrenceTypeEnum.Daily;
  RecordType: RecordTypeEnum = RecordTypeEnum.Standard;
  NumSlots: number;
  Duration: number;
  AppointmentName: string = '';
  Comment: string = '';
  StartDate: Date;
  StartHour: number;
  StartMinute: number;
  IsAnonymous: boolean = false;
  needsDelete: boolean = false;

  constructor(userKey: string, placeKey: string, placeName: string, startDate: Date, startHour: number, startMinute: number, userName?: string, duration?: number, jobType?: JobTypeEnum, appointmentType?: AppointmentTypeEnum) {
    this.UserKey = userKey;
    this.PlaceKey = placeKey;
    this.PlaceName = placeName;
    this.StartDate = startDate;
    this.StartHour = startHour;
    this.StartMinute = startMinute;
    this.UserName = userName !== undefined ? userName : '';
    this.Duration = duration !== undefined ? duration : 30;
    this.JobType = jobType !== undefined ? jobType : JobTypeEnum.Other;
    this.IsInTheFuture = true;
    this.AppointmentType = appointmentType !== undefined ? appointmentType : AppointmentTypeEnum.Standard;
    this.NumSlots = 1;
    this.OwnAppointment = true;
    this.Id = 0;
    this.IsPrivate = false;
    this.needsDelete = false;
  }

 

}
