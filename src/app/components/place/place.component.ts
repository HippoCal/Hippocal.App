import { Component, EventEmitter, Input, NgZone, OnInit, Output } from '@angular/core';
import { DataService, ImageService } from 'src/app/services/services';
import { PlaceViewmodel } from 'src/app/viewmodels/placeviewmodel';

@Component({
  selector: 'app-place',
  templateUrl: './place.component.html',
  styleUrls: ['./place.component.scss'],
})
export class PlaceComponent  implements OnInit {

  public placeImage: string;

  @Input('place') place: PlaceViewmodel;
  @Input('color') color: string;
  @Output() click = new EventEmitter<PlaceViewmodel>();
  constructor(
    private zone: NgZone,
    private dataProvider: DataService,
    private imageProvider: ImageService) { }

  ngOnInit() {
    this.getPlaceImage();
  }

  onClick(){
    this.click.emit(this.place);
  }

  async getPlaceImage() {
    var image = await this.imageProvider.get(this.place.ImageUrl, this.place.PlaceKey, this.place.IsPrivate ? "private" : "places", true, this.dataProvider.Profile.UserKey);
    if(image) {
      this.zone.run(() => {
        this.placeImage = image.data;
      });    
    }
  }
}
