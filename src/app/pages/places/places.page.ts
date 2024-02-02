import { Component } from '@angular/core';
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
    public dataProvider: DataService, 
    private translate: TranslateService,
    public imageProvider: ImageService) {
    this.createPrivatePlace();
  }
  
  ionViewWillEnter() { 
    this.dataProvider.setCurrentTab('tab3');
  };

  selectPlace(place: PlaceViewmodel) {
    this.dataProvider.setIsPrivate(false);
    this.dataProvider.Profile.CurrentPlace = PlaceViewmodel.Clone(place);
    this.dataProvider.navigate('week');
  }

  createPrivatePlace() {
    this.privatePlace = new PlaceViewmodel(this.translate.instant('BTN_NEW_PRIVATEAPPOINTMENT'), '');
    this.privatePlace.OwnerName = this.translate.instant('BTN_NEW_PRIVATEAPPOINTMENT_DESCRIPTION');
    this.privatePlace.IsPrivate = true;
    this.color = 'divider';
  }

  onPrivateAppointment() {
    this.dataProvider.setIsPrivate(true);
    this.dataProvider.Profile.CurrentPlace.Name = '';
    this.dataProvider.Profile.CurrentPlace.PlaceKey = '';
    this.dataProvider.navigate('week');
  }
}
