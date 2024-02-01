import { Component, NgZone } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AppointmentViewmodel } from "src/app/viewmodels/viewmodels";
import { TranslateService } from '@ngx-translate/core';
import { DataService, ImageService } from 'src/app/services/services';

@Component({
  selector: 'page-otherappointment',
  templateUrl: './otherappointment.page.html',
  styleUrls: ['./otherappointment.page.scss']
})
export class OtherAppointmentPage {

  appointment: AppointmentViewmodel;
  userImage: string;
  horseImage: string;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    public dataProvider: DataService,
    public translate: TranslateService,
    private zone: NgZone,
    public imageProvider: ImageService) {
    this.resolveParams();
    this.userImage = dataProvider.getDefaultImage("user");
    this.horseImage = dataProvider.getDefaultImage("horse");
    this.getUserImage();
    this.getHorseImage();
  }

  resolveParams() {
    this.route.queryParams.subscribe(params => {
      if (this.router.getCurrentNavigation().extras.state) {
        this.appointment = this.router.getCurrentNavigation().extras.state['appointment'];
      }
    });
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad OtherAppointmentPage');
  }

  zoom() {
    var url = this.appointment.ImageUrl.replace("thumb_", "");
    this.router.navigate(['/imageview'], { state: { data: { imageUrl: url, key: this.appointment.UserKey, type: "user" } } });
  }

  horsezoom() {
    var url = this.appointment.HorseImageUrl.replace("thumb_", "");
    this.router.navigate(['/imageview'], { state: { data: { imageUrl: url, key: this.appointment.HorseKey, type: "horse" } } });
  }

  async getUserImage() {
    var image = await this.imageProvider.get(this.appointment.ImageUrl, this.appointment.UserKey, "user", true, this.dataProvider.Profile.UserKey);
    if(image) {
      this.zone.run(() => {
        this.userImage = image.data;
      });     
    }
  }

  async getHorseImage() {
    var image = await this.imageProvider.get(this.appointment.HorseImageUrl, this.appointment.HorseKey, "horse", true, this.dataProvider.Profile.UserKey);
    if(image) {
      this.zone.run(() => {
        this.horseImage = image.data;
      }); 
    }
  }

  onSendMessage() {

  }

  canSendMessage() {
    // deaktiviert
    return false;
  }

  formatDate(dt: Date): string {
    return this.dataProvider.formatDate(new Date(dt), "dddd, LL");
  }

  formatTime(dt: Date): string {

    var d1: Date = new Date(dt);
    var d2: Date = new Date(d1);

    d2.setMinutes(d1.getMinutes() + 30);
    return this.dataProvider.formatDate(d1, "HH:mm") +
      ' - ' +
      this.dataProvider.formatDate(d2, "HH:mm");

  }

}