import { JobTypeEnum } from '../enums/jobtypeenum';
import { AppointmentTypeEnum } from '../enums/appointmenttypeenum';
import { RecordTypeEnum } from '../enums/recordtypeenum';

export class IOwnAppointmentViewmodel {
  Id: number;
  Hk: string;
  Pk: string;
  An: string;
  Pn: string;
  Sd: Date;
  Jt: JobTypeEnum;
  At: AppointmentTypeEnum;
  Rt: RecordTypeEnum;
  Du: number;
  Co: string;
}

export class OwnAppointmentViewmodel {
  Id: number;
  Hk: string;
  Pk: string;
  An: string;
  Pn: string;
  Sd: Date;
  Jt: JobTypeEnum;
  At: AppointmentTypeEnum;
  Rt: RecordTypeEnum;
  Du: number;
  Co: string;

  constructor(ownAppointment: IOwnAppointmentViewmodel) {
    this.Id = ownAppointment.Id;
    this.Hk = ownAppointment.Hk;
    this.An = ownAppointment.An;
    this.Hk = ownAppointment.Hk;
    this.Pn = ownAppointment.Pn;
    this.Sd = ownAppointment.Sd;
    this.Jt = ownAppointment.Jt;
    this.At = ownAppointment.At;
    this.Rt = ownAppointment.Rt;
    this.Du = ownAppointment.Du;
    this.Co = ownAppointment.Co;
    this.Pk = ownAppointment.Pk;
  }

  get HorseKey(): string { return this.Hk; };
  get PlaceKey(): string { return this.Pk; };
  get AppointmentName(): string { return this.An; };
  get PlaceName(): string { return this.Pn; };
  set PlaceName(value: string) { this.Pn = value; };
  get StartDate(): Date { return this.Sd; };
  get JobType(): JobTypeEnum { return this.Jt; };
  get AppointmentType(): AppointmentTypeEnum { return this.At; };
  get RecordType(): RecordTypeEnum { return this.Rt; };
  get Duration(): number { return this.Du; };
  get Comment(): string { return this.Co; };

}

export class TypeAppointmentsViewmodel {
  JobType: JobTypeEnum;
  AppointmentType: AppointmentTypeEnum;
  Visible: boolean;
  Count: number;
  Appointments: OwnAppointmentViewmodel[];

  constructor(jobType: JobTypeEnum, appointmentType: AppointmentTypeEnum) {
    this.Count = 0;
    this.AppointmentType = appointmentType;
    this.JobType = jobType;
    this.Appointments = [];
    this.Visible = true;
  }

}

export class TypeStatusViewmodel {
  HorseKey: string;
  JobType: JobTypeEnum;
  AppointmentType: AppointmentTypeEnum;
  Visible: boolean;
}

export class OwnAppointmentsViewmodel {
  LastUpdated: Date;
  Appointments: IOwnAppointmentViewmodel[];
  HorseAppointments: TypeStatusViewmodel[];
  constructor() {
    this.Appointments = [];
    this.HorseAppointments = [];
  }
}

export class HorseAppointmentsViewmodel {
  HorseKey: string;
  LastUpdated: Date;
  TypeAppointments: TypeAppointmentsViewmodel[];

  constructor() {
    this.TypeAppointments = [];
  }


}
