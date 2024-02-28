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
  AppointmentType: AppointmentTypeEnum = AppointmentTypeEnum.Other;
  RecurrenceType: RecurrenceTypeEnum = RecurrenceTypeEnum.Daily;
  NumSlots: number;
  Duration: number;
  AppointmentName: string = '';
  Comment: string = '';
  StartDate: Date;
  StartHour: number;
  StartMinute: number;
  IsDirty: boolean;
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
    this.needsDelete = false;
    this.IsDirty = true;
  }

  public static recordType(appointment: AppointmentViewmodel): RecordTypeEnum {
    if(appointment.AppointmentType === AppointmentTypeEnum.Standard && appointment.OwnAppointment) return RecordTypeEnum.Standard;
    if(appointment.AppointmentType === AppointmentTypeEnum.Standard && !appointment.OwnAppointment) return RecordTypeEnum.Other;
    if(appointment.AppointmentType > 4) return RecordTypeEnum.Private;
    return RecordTypeEnum.Admin;
  }

  public static Merge(existing: AppointmentViewmodel, newApp: AppointmentViewmodel): AppointmentViewmodel {
    existing.AppointmentName = newApp.AppointmentName;
    existing.AppointmentType = newApp.AppointmentType;
    existing.StartDate = newApp.StartDate;
    existing.StartHour = newApp.StartHour;
    existing.StartMinute = newApp.StartMinute;
    existing.Duration = newApp.Duration;
    existing.JobType = newApp.JobType;
    existing.Comment = newApp.Comment;
    existing.HorseImageUrl = newApp.HorseImageUrl;
    existing.HorseKey = newApp.HorseKey;
    existing.HorseName = newApp.HorseName;
    existing.IsDirty = newApp.IsDirty;
    return existing;
  }
}
