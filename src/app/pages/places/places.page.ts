import { Component } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
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

  constructor(
    public dataProvider: DataService, 
    private translate: TranslateService,
    private modalCtrl: ModalController,
    public imageProvider: ImageService) {
    this.createPrivatePlace();
  }
  
  ionViewWillEnter() { 
    this.dataProvider.setCurrentTab('tab3');
  };

  async selectPlace(event: Event, place: PlaceViewmodel) {
    event.stopPropagation();
    this.dataProvider.setIsPrivate(false);
    this.dataProvider.Profile.CurrentPlace = PlaceViewmodel.Clone(place);
    const modal = await this.modalCtrl.create({
      component: WeekPage,
    });
    modal.present();
    const { data, role } = await modal.onWillDismiss();
  }

  createPrivatePlace() {
    this.privatePlace = new PlaceViewmodel(this.translate.instant('BTN_NEW_PRIVATEAPPOINTMENT'), '');
    this.privatePlace.OwnerName = this.translate.instant('BTN_NEW_PRIVATEAPPOINTMENT_DESCRIPTION');
    this.privatePlace.IsPrivate = true;
    this.color = 'divider';
  }

  async onPrivateAppointment() {
    this.dataProvider.setIsPrivate(true);
    this.dataProvider.Profile.CurrentPlace.Name = '';
    this.dataProvider.Profile.CurrentPlace.PlaceKey = '';
    const modal = await this.modalCtrl.create({
      component: WeekPage,
    });
    modal.present();
    const { data, role } = await modal.onWillDismiss();
  }
}
