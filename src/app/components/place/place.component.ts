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
  public isVisible: boolean = false;

  @Input() place: PlaceViewmodel;
  @Input() color: string;
  @Input() canDelete: boolean;
  @Output() placeSelected = new EventEmitter<PlaceViewmodel>();
  constructor(
    private zone: NgZone,
    public dataProvider: DataService,
    private toastsvc: ToastService,
    private imageProvider: ImageService) { }

  ngOnInit() {
    this.getPlaceImage();
  }

  onClick(){
    // CurrentPlace nur fuer echte Plaetze direkt setzen — beim privaten Termin
    // uebernimmt das die aufrufende Seite (sie klont den Platz).
    if(!this.place.IsPrivate) {
      this.dataProvider.Profile.CurrentPlace = this.place;
    }
    // Auch fuer den privaten Termin emittieren: vorher stand das Emit INNERHALB
    // der Bedingung, dadurch war die Zeile "Neuer privater Termin" auf der
    // Places-Seite ohne Funktion (auf Home gibt es dafuer einen eigenen Button).
    this.placeSelected.emit(this.place);
  }

  get isLastPlace(): boolean {
    return this.dataProvider.Profile.Places.length < 2;
  }


  async getPlaceImage() {
    var image = await this.imageProvider.get(this.place.ImageUrl, this.place.PlaceKey, this.place.IsPrivate ? "private" : "places", true, this.dataProvider.Profile.UserKey);
    if(image) {
      this.zone.run(() => {
        this.placeImage = image.data;
        this.isVisible = true;
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
