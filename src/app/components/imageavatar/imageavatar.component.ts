import { Component, Input, NgZone, OnInit } from '@angular/core';
import { DataService, ImageService } from 'src/app/services/services';
import { RecordTypeEnum } from 'src/app/enums/recordtypeenum';
import { ImageViewmodel } from 'src/app/viewmodels/imageviewmodel';
import { ImageviewPage } from 'src/app/pages/imageview/imageview.page';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-imageavatar',
  templateUrl: './imageavatar.component.html',
  styleUrls: ['./imageavatar.component.scss'],
})
export class ImageavatarComponent implements OnInit {

  @Input('imageurl') imageurl: string;
  @Input('key') key: string;
  @Input('imageType') imageType: string;

  public image: string;

  public isVisible: boolean = false;
  recordType: RecordTypeEnum;

  constructor(
    private dataProvider: DataService,
    private modalCtrl: ModalController,
    private imageProvider: ImageService,
    private zone: NgZone,
  ) {

  }

  ngOnInit() {
    this.getImage();
  }

  async zoom() {
    
    const modal = await this.modalCtrl.create({
      component: ImageviewPage,
      componentProps: { imageUrl: this.imageurl, key: this.key, type: this.imageType }
    });
    modal.present();
    const { data, role } = await modal.onWillDismiss();
  }

  async getImage() {
    var image: ImageViewmodel = null;
    switch (this.imageType) {
      case 'horse':
        image = await this.dataProvider.getHorseImage(this.key);
        break;
      default:
        image = await this.imageProvider.get(this.imageurl, this.key, this.imageType, true, this.dataProvider.Profile.UserKey);
        break;
    }
    if (image !== null) {
      this.imageurl = image.fileName;
      this.zone.run(() => {
        this.image = image.data;
        this.isVisible = true;
      });
    } 
  }
}
