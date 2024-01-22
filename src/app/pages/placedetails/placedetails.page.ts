import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { DataService, ImageService } from 'src/app/services/services';

@Component({
  selector: 'page-placedetails',
  templateUrl: './placedetails.page.html',
  styleUrls: ['./placedetails.page.scss']
})
export class PlacedetailsPage {


  constructor(
    private router: Router,
    public dataProvider: DataService, 
    public imageProvider: ImageService) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad PlacedetailsPage');
  }

  zoom() {
    var url = this.dataProvider.Profile.CurrentPlace.ImageUrl.replace("thumb_", "");
    this.router.navigate(['/imageview'], { state: { data: { imageUrl: url, key: this.dataProvider.Profile.CurrentPlace.PlaceKey, type: "places" } } });
  }

  get details(): string {
    return this.dataProvider.Profile.CurrentPlace.Description !== null && this.dataProvider.Profile.CurrentPlace.Description !== undefined ? this.dataProvider.Profile.CurrentPlace.Description : "";
  }

  get placeImage(): string {
    return this.dataProvider.pathForImage(this.dataProvider.Profile.CurrentPlace.ImageUrl, "places");
  }
}
