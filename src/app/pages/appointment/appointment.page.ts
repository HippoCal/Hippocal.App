import { OnInit, Component, NgZone } from '@angular/core';
import { DataService } from '../../services/data/data.service';
import { AppointmentService, ToastService } from '../../services/services';
import { TranslateService } from '@ngx-translate/core';
import { ImageService } from '../../services/image/image.service';
import { ActivatedRoute, Router } from '@angular/router';
import { AppointmentViewmodel } from 'src/app/viewmodels/appointmentviewmodel';

@Component({
  selector: 'page-appointment',
  templateUrl: './appointment.page.html',
  styleUrls: ['./appointment.page.scss'],
})
export class AppointmentPage implements OnInit {

  userImage: string; 
  horseImage: string;

  constructor(
    public dataService: DataService, 
    private route: ActivatedRoute, 
    private router: Router, 
    private zone: NgZone, 
    public translate: TranslateService, 
    public dataProvider: DataService,
    public imageService: ImageService,
    public toastervice: ToastService, 
    public appointmentService: AppointmentService) {
    this.route.queryParams.subscribe(params => {
      if (this.router.getCurrentNavigation().extras.state) {
        this.appointmentService.appointment = this.router.getCurrentNavigation().extras.state['appointment'];
      }
    });
    this.userImage = dataService.getDefaultImage("user");
    this.horseImage = dataService.getDefaultImage("horse");
    this.getUserImage();
    this.getHorseImage();
  }

  ngOnInit() {
    console.log('Load AppointmentPage');
  }
  
  onDeleteAppointment() {
    this.toastervice.confirm(() => {
        this.appointmentService.appointment.UserKey = this.dataService.Profile.UserKey;
        this.appointmentService.deleteAppointment().then(data => {
          this.dataService.initWeek(this.dataService.CurrentDay);
          this.dataService.refreshData(false).then(() => {
            this.dataService.setNotification(this.appointmentService.appointment, true);
            this.dataProvider.navigate('home','tab1');
          });
        });
    }, "HEADER_CONFIRM_DELETE", "MSG_CONFIRM_DELETE");
  }

  formatDate(dt: Date): string {
    return this.dataService.formatDate(new Date(dt), "dddd, LL"); 
  }

  formatTime(): string {

    var d1: Date = new Date(this.appointmentService.appointment.StartDate);
    var d2: Date = new Date(d1);

    d2.setMinutes(d1.getMinutes() + this.appointmentService.appointment.Duration);
    return this.dataService.formatDate(d1, "HH:mm") +
      ' - ' +
      this.dataService.formatDate(d2, "HH:mm");

  }

  zoom() {
    var url = this.appointmentService.appointment.ImageUrl.replace("thumb_", "");
    this.dataProvider.navigate('imageview', '', { data: { imageUrl: url, key: this.appointmentService.appointment.UserKey, type: "user" }});
  }

  horsezoom() {
    var url = this.appointmentService.appointment.HorseImageUrl.replace("thumb_", "");
    this.dataProvider.navigate('/imageview', '', { data: { imageUrl: url, key: this.appointmentService.appointment.HorseKey, type: "horse" } });
  }



  async getUserImage() {
      var image = await this.imageService.get(this.appointmentService.appointment.ImageUrl, this.appointmentService.appointment.UserKey, "user", true, this.dataProvider.Profile.UserKey);
      if(image) {
        this.zone.run(() => {
          this.userImage = image.data;
        });
      }
  }

  async getHorseImage() {
    var image = await this.imageService.get(this.appointmentService.appointment.HorseImageUrl, this.appointmentService.appointment.HorseKey, "horse", true, this.dataProvider.Profile.UserKey);
    if(image) {
      this.zone.run(() => {
        this.horseImage = image.data;
      });
    }
  }

  get appointment(): AppointmentViewmodel {
    return this.appointmentService.appointment;
  }
  
}