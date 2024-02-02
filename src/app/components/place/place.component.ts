import { Component, EventEmitter, Input, NgZone, OnInit, Output } from '@angular/core';
import { DataService, ImageService, ToastService } from 'src/app/services/services';
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
  @Input('canDelete') canDelete: boolean;
  @Output() click = new EventEmitter<PlaceViewmodel>();
  constructor(
    private zone: NgZone,
    public dataProvider: DataService,
    private toastsvc: ToastService,
    private imageProvider: ImageService) { }

  ngOnInit() {
    this.getPlaceImage();
  }

  onClick(){
    this.dataProvider.Profile.CurrentPlace = this.place;
    this.click.emit(this.place);
  }

  get isLastPlace(): boolean {
    return this.dataProvider.Profile.Places.length < 2;
  }


  async getPlaceImage() {
    var image = await this.imageProvider.get(this.place.ImageUrl, this.place.PlaceKey, this.place.IsPrivate ? "private" : "places", true, this.dataProvider.Profile.UserKey);
    if(image) {
      this.zone.run(() => {
        this.placeImage = image.data;
      });    
    }
  }

  onDeletePlace() {
    this.toastsvc.confirm(() => {
      this.dataProvider.deletePlace(this.place.PlaceKey, this.dataProvider.Profile.UserKey).then(result => {
        if (result) {
          this.dataProvider.loadProfile();
        }
      });
    },
      "HEADER_CONFIRM_DELETE_PLACE",
      "MSG_CONFIRM_DELETE_PLACE");
  }
}
