import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { DataService, ImageService } from 'src/app/services/services';
import { PlaceViewmodel } from 'src/app/viewmodels/placeviewmodel';

@Component({
  selector: 'page-places',
  templateUrl: './places.page.html',
  styleUrls: ['./places.page.scss']
})
export class PlacesPage {

  public privatePlace: PlaceViewmodel;
  public color: string;

  constructor(
    private router: Router,
    public dataProvider: DataService, 
    private translate: TranslateService,
    public imageProvider: ImageService) {
    this.createPrivatePlace();
  }
  
  selectPlace(place: PlaceViewmodel) {
    this.dataProvider.setIsPrivate(false);
    this.dataProvider.Profile.CurrentPlace = PlaceViewmodel.Clone(place);
    this.router.navigate(['tabs/tab3/week']);
  }

  createPrivatePlace() {
    this.privatePlace = new PlaceViewmodel(this.translate.instant('BTN_NEW_PRIVATEAPPOINTMENT'), '');
    this.privatePlace.LocalImage = this.dataProvider.getDefaultImage('appointment');
    this.privatePlace.OwnerName = this.translate.instant('BTN_NEW_PRIVATEAPPOINTMENT_DESCRIPTION');
    this.color = 'divider';
  }

  onPrivateAppointment() {
    this.dataProvider.setIsPrivate(true);
    this.dataProvider.Profile.CurrentPlace.Name = '';
    this.dataProvider.Profile.CurrentPlace.PlaceKey = '';
    this.router.navigate(['tabs/tab3/week']);
  }

  ionViewWillEnter() {
  }

}
