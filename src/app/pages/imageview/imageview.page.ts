import { Component, Input, NgZone, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { DataService, ImageService } from "src/app/services/services";

@Component({
  selector: 'page-imageview',
  templateUrl: './imageview.page.html',
  styleUrls: ['./imageview.page.scss']
})
export class ImageviewPage implements OnInit {

  public image: string;
  public data: any;

  @Input() imageUrl: string;
  @Input() key: string;
  @Input() type: string;

  constructor(
    public dataProvider: DataService,
    private modalCtrl: ModalController,
    private zone: NgZone,
    public imageProvider: ImageService) {
    this.image = dataProvider.getDefaultImage("loading");
  }

  ngOnInit() {
    this.getImage();
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ImageviewPage');
  }

  
  cancel() {
    return this.modalCtrl.dismiss(null, 'cancel');
  }

  async getImage() {
    var image = await this.imageProvider.get(this.imageUrl, this.key, this.type, false, this.dataProvider.Profile.UserKey);
    if(image) {
      this.zone.run(() => {
        this.image = image.data;
      }); 
    }
  }

}
