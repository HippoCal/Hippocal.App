import { Component, NgZone } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DataService, ImageService } from "src/app/services/services";

@Component({
  selector: 'page-imageview',
  templateUrl: './imageview.page.html',
  styleUrls: ['./imageview.page.scss']
})
export class ImageviewPage {

  public image: string;
  public data: any;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public dataProvider: DataService,
    private zone: NgZone,
    public imageProvider: ImageService) {
    this.resolveParams();
    this.image = dataProvider.getDefaultImage("loading");
  }

  resolveParams() {
    this.route.queryParams.subscribe(params => {
      if (this.router.getCurrentNavigation().extras.state) {
        this.data = this.router.getCurrentNavigation().extras.state['data'];
        this.getImage();
      }
    });
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ImageviewPage');
  }

  async getImage() {
    var image = await this.imageProvider.get(this.data.imageUrl, this.data.key, this.data.type, false, this.dataProvider.Profile.UserKey);
    if(image) {
      this.zone.run(() => {
        this.image = image.data;
      }); 
    }
  }

}
