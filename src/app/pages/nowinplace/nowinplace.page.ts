import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AppointmentViewmodel, PlaceViewmodel } from "src/app/viewmodels/viewmodels";
import { DataService, ImageService } from 'src/app/services/services';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'page-nowinplace',
  templateUrl: './nowinplace.page.html',
  styleUrls: ['./nowinplace.page.scss']
})
export class NowinplacePage {
  dt: Date;

  public privatePlace: PlaceViewmodel;
  public color: string;
  
  constructor(
    private router: Router,
    public dataProvider: DataService, 
    private translate: TranslateService,
    public imageProvider: ImageService) {
    this.dt = new Date();
    this.dataProvider.getAppointments(this.dt);
    this.createPrivatePlace();
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

  placeImage(): string {
    var entry = this.dataProvider.Profile.CurrentPlace;
    if (entry.LocalImage !== undefined) {
      return entry.LocalImage;
    } else {
      return this.imageProvider.getDownloadUrl(entry.ImageUrl, entry.PlaceKey, "places", true);
    }
  }

  createPrivatePlace() {
    this.privatePlace = new PlaceViewmodel(this.dataProvider.Profile.CurrentPlace.Name, '');
    this.privatePlace.OwnerName = this.dataProvider.Profile.CurrentPlace.OwnerName;
    this.privatePlace.LocalImage = this.placeImage();
    this.color = 'secondary-contrast';
  }
}