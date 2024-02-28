import { Component } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { DataService, ImageService } from 'src/app/services/services';
import { PlaceViewmodel } from 'src/app/viewmodels/placeviewmodel';
import { WeekPage } from '../week/week.page';

@Component({
  selector: 'page-places',
  templateUrl: './places.page.html',
  styleUrls: ['./places.page.scss']
})
export class PlacesPage {

  public privatePlace: PlaceViewmodel;
  public color: string;

  public hasPlaces: boolean = true;

  constructor(
    public dataProvider: DataService, 

    private modalCtrl: ModalController,
    public imageProvider: ImageService) {
      this.createPrivatePlace();
  }
  
  ionViewWillEnter() { 
    this.createPrivatePlace();
    this.hasPlaces = this.dataProvider.Profile.Places !== undefined && this.dataProvider.Profile.Places.length > 0;
    this.dataProvider.setCurrentTab('tab3');
  };

  async selectPlace(place: PlaceViewmodel) {
    this.dataProvider.Profile.CurrentPlace = PlaceViewmodel.Clone(place);
    const modal = await this.modalCtrl.create({
      component: WeekPage,
    });
    modal.present();
    const { data, role } = await modal.onWillDismiss();
  }

  createPrivatePlace() {
    this.privatePlace = this.dataProvider.createPrivatePlace(false);
    this.color = 'divider';
  }
}
