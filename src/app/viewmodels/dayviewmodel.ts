import { AppointmentViewmodel } from './viewmodels';

export class DayViewmodel {
    PlaceName: string = '';
    FirstHour: number = 0;
    LastHour: number = 0;
    NumSlots: number = 0;
    WeeksBookingInFuture: number = 0;
    Appointments: AppointmentViewmodel[];
}
