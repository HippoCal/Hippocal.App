import { Component, NgZone } from '@angular/core';
import { AppointmentViewmodel } from "src/app/viewmodels/viewmodels";
import { DataService, ImageService } from "src/app/services/services";
import { TranslateService } from '@ngx-translate/core';
import { Router, ActivatedRoute, NavigationExtras } from '@angular/router';

@Component({
  selector: 'page-eventdetails',
  templateUrl: './eventdetails.page.html',
  styleUrls: ['./eventdetails.page.scss'],
})
export class EventdetailsPage {

  public appointment: AppointmentViewmodel;
  userImage: string;

  constructor(
    private router: Router,
    private route: ActivatedRoute, 
    public dataProvider: DataService, 
    public translate: TranslateService, 
    private zone: NgZone, 
    public imageProvider: ImageService) {
    this.resolveParams();
    this.userImage = imageProvider.getDefaultImage("user");
    this.getUserImage();
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad EventdetailsPage');
  }

  resolveParams() {
    this.route.queryParams.subscribe(params => {
      if (this.router.getCurrentNavigation().extras.state) {
        this.appointment = this.router.getCurrentNavigation().extras.state['appointment'];
      }
    });
  }
  
  zoom() {
    var url = this.appointment.ImageUrl.replace("thumb_", "");
    let navigationExtras: NavigationExtras = {
      state: {
        imageUrl: url,
        key: this.appointment.UserKey,
        type: "user"
      }
    };
    this.router.navigate(['imageview', navigationExtras]);
  }

  async getUserImage() {  
    var image = await this.imageProvider.get(this.appointment.ImageUrl, this.appointment.UserKey, "user", true);
    if(image) {
      this.zone.run(() => {
        this.userImage = image.data;
      });    
    }
  }

  formatDate(): string {
    return this.dataProvider.formatDate(new Date(this.appointment.StartDate), "dddd, LL");
  }

  formatTime(): string {

    var d1: Date = new Date(this.appointment.StartDate);
    var d2: Date = new Date(d1);

    d2.setMinutes(d1.getMinutes() + this.appointment.Duration);
    return this.dataProvider.formatDate(d1, "HH:mm") + ' - ' + this.dataProvider.formatDate(d2, "HH:mm") + " " + this.translate.instant("LBL_OCLOCK");

  }

}
