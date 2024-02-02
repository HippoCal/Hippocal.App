import { Component, NgZone } from '@angular/core';
import { DataService, ImageService } from 'src/app/services/services';

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
    public imageProvider: ImageService) {
  }

  ngOnInit() {
    this.getPlaceImage();
  }

  zoom() {
    var url = this.dataProvider.Profile.CurrentPlace.ImageUrl.replace("thumb_", "");
    this.dataProvider.navigate('imageview', '', { state: { data: { imageUrl: url, key: this.dataProvider.Profile.CurrentPlace.PlaceKey, type: "places" } } });
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
