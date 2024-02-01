import { Component, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { AppointmentViewmodel, PlaceViewmodel } from "src/app/viewmodels/viewmodels";
import { DataService, ImageService } from 'src/app/services/services';

@Component({
  selector: 'page-nowinplace',
  templateUrl: './nowinplace.page.html',
  styleUrls: ['./nowinplace.page.scss']
})
export class NowinplacePage {
  dt: Date;

  public color: string = 'secondary-contrast';
  
  constructor(
    private router: Router,
    public dataProvider: DataService, 
    public imageProvider: ImageService) {
    this.dt = new Date();
    this.dataProvider.getAppointments(this.dt);
  }

  public onShowAppointment(event: Event, appointment: AppointmentViewmodel) {
    event.stopPropagation();
    this.router.navigate(['/create'], { state: { dt: appointment.StartDate, appointment: appointment }});
  }

  public onShowOtherAppointment(event: Event, appointment: AppointmentViewmodel) {
    event.stopPropagation();
    this.router.navigate(['/otherAppointment'], { state: { appointment: appointment }});
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad NowinplacePage');
  }

  public onPlaceDetails() {
    this.router.navigate(['/placedetails']);
  }
}