import { Component, NgZone } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { DataService, ImageService } from 'src/app/services/services';
import { ImageviewPage } from '../imageview/imageview.page';

@Component({
  selector: 'page-placedetails',
  templateUrl: './placedetails.page.html',
  styleUrls: ['./placedetails.page.scss']
})
export class PlacedetailsPage {

  public placeImage: string;

  constructor(
    private zone: NgZone,
    public dataProvider: DataService, 
    private modalCtrl: ModalController,
    public imageProvider: ImageService) {
  }

  ngOnInit() {
    this.getPlaceImage();
  }

  cancel() {
    return this.modalCtrl.dismiss(null, 'cancel');
  }

  async zoom() {
    var url = this.dataProvider.Profile.CurrentPlace.ImageUrl.replace("thumb_", "");
    const modal = await this.modalCtrl.create({
      component: ImageviewPage,
      componentProps: { imageUrl: url, key: this.dataProvider.Profile.CurrentPlace.PlaceKey, type: "places" }
    });
    modal.present();
    const { data, role } = await modal.onWillDismiss();
  }

  get details(): string {
    return this.dataProvider.Profile.CurrentPlace.Description !== null && this.dataProvider.Profile.CurrentPlace.Description !== undefined ? this.dataProvider.Profile.CurrentPlace.Description : "";
  }

  async getPlaceImage() {
    var image = await this.imageProvider.get(this.dataProvider.Profile.CurrentPlace.ImageUrl, this.dataProvider.Profile.CurrentPlace.PlaceKey, "places", true, this.dataProvider.Profile.UserKey);
    if(image) {
      this.zone.run(() => {
        this.placeImage = image.data;
      });    
    }
  }
}
