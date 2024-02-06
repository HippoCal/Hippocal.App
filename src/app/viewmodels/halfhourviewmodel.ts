import { ColorConst } from '../constants';
import { AppointmentViewmodel } from './viewmodels';

export class HalfHourViewmodel {
  Name: string;
  Date: Date;
  Appointments: AppointmentViewmodel[];
  HasData: boolean;
  HasEvent: boolean;
  Caption: string;
  Color: string;
  BackgroundColor: string;
  CanCreate: boolean;
  DataLoaded: boolean;

  constructor(name: string, date: Date, canCreate: boolean, dataLoaded?: boolean) {
    this.Name = name;
    this.Date = date;
    this.Appointments = [];
    this.HasData = false;
    this.HasEvent = false;
    this.DataLoaded = dataLoaded != undefined ? dataLoaded : true;
    this.CanCreate = canCreate;
    this.Color = ColorConst.COL_FONT_DAY;
    this.BackgroundColor = canCreate ? ColorConst.COL_BACK_DAY : ColorConst.COL_BACK_DAY_CLOSED;
    this.Caption = '';
  }

  get HasMoreData(): boolean {
    return this.Appointments !== undefined && this.Appointments.length > 1;
  }
}
