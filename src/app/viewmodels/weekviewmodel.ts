import { AppointmentViewmodel } from './viewmodels';

export class WeekViewmodel {
  Name: string;
  Offset: number;
  Appointments: AppointmentViewmodel[];
  HasData: boolean;

  constructor(name: string, offset: number, appointments?: AppointmentViewmodel[], hasData?: boolean) {
    this.Name = name;
    this.Offset = offset
    this.Appointments = appointments !== undefined ? appointments : [];
    this.HasData = hasData !== undefined ? hasData : false;
  }
}
