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

  }

  cancel() {
    return this.modalCtrl.dismiss(null, 'cancel');
  }

  get details(): string {
    return this.dataProvider.Profile.CurrentPlace.Description !== null && this.dataProvider.Profile.CurrentPlace.Description !== undefined ? this.dataProvider.Profile.CurrentPlace.Description : "";
  }

}
