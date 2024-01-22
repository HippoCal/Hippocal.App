import { Component, NgZone} from '@angular/core';
import { Router, NavigationExtras, ActivatedRoute } from '@angular/router';
import { HorseViewmodel, PlaceViewmodel } from "src/app/viewmodels/viewmodels";
import { DataService, ImageService, ToastService } from 'src/app/services/services';

@Component({
  selector: 'page-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss']
})
export class ProfilePage {

  public area: string;
  public lockedOut: boolean;
  public lockOutReasonEMail: boolean;
  public userImage: string;
  public color: string;

  constructor(
    private router: Router,
    private route: ActivatedRoute, 
    public dataProvider: DataService, 
    private zone: NgZone, 
    public imageProvider: ImageService,
    private toastSvc: ToastService) {
    if (!this.dataProvider.Profile.IsRegistered) {
      this.router.navigate(['/register'], {state: { animate: true, direction: 'forward' }});
    }
    this.imageProvider.loadHorseImages(this.dataProvider.Profile.Horses);
    this.imageProvider.loadPlaceImages(this.dataProvider.Profile.Places);
    this.userImage = dataProvider.getDefaultImage("user");
    this.getUserImage();
    this.area = "basic";
    this.color = 'divider';
    this.lockedOut = (!this.dataProvider.Profile.IsActive && !this.dataProvider.IsPrivate) || (!this.dataProvider.Profile.EmailConfirmed && this.dataProvider.Profile.NumLogins > 5);

    this.lockOutReasonEMail = (!this.dataProvider.Profile.EmailConfirmed && this.dataProvider.Profile.NumLogins > 5);
    if (!this.dataProvider.Profile.IsActive) {
      this.lockOutReasonEMail = false;
    }
  }

  ionViewWillEnter() {
    this.getUserImage();
  }

  getUserImage() {
    this.imageProvider.get(this.dataProvider.Profile.ImageUrl, this.dataProvider.Profile.UserKey, "user", true, (url) => {
      this.zone.run(() => {
        this.userImage = url;
      });
    });
  }

  onAddHorse() {
    this.router.navigate(['/edithorse'], {state: { isNew: true }});
  }

  onAddPlace() {
    this.router.navigate(['tabs/tab1/register']);
  }

  onRefresh() {
    this.dataProvider.loadProfile();
  }

  onSendMail() {
    this.router.navigate(['/getEmail'], {state: { email: this.dataProvider.Profile.Email }});
  }

  onChangeProfile() {
    this.router.navigate(['/editprofile']);
  }

  onModifyHorse(horse: HorseViewmodel) {
    this.router.navigate(['/edithorse'], {state: { isNew: false, horse: horse }});
  }

  notificationallowed(): string {
    return this.dataProvider.Profile.NotificationsAllowed ? "LBL_YES" : "LBL_NO";
  }

  publicprofileallowed(): string {
    return this.dataProvider.Profile.IsPublicProfile ? "LBL_YES" : "LBL_NO";
  }

  showeventsallowed(): string {
    return this.dataProvider.Profile.ShowEvents ? "LBL_YES" : "LBL_NO";
  }

  onActivate() {

    this.toastSvc.confirm(() => {
        this.dataProvider.activateUser().then(result => {
          if (result) {
            this.dataProvider.Profile.IsActive = true;
            this.dataProvider.saveProfile(this.dataProvider.Profile);
            this.router.navigate(['/start']);
          }
        });
      },
      "HEADER_CONFIRM_ACTIVATEPROFILE",
      "MSG_CONFIRM_ACTIVATEPROFILE");
  }

  public onPlaceDetails() {
    this.router.navigate(['/placedetails']);
  }

  onDeletePlace(event: Event, place: PlaceViewmodel) {
    event.stopPropagation();
    this.toastSvc.confirm(() => {
        this.dataProvider.deletePlace(place.PlaceKey, this.dataProvider.Profile.UserKey).then(result => {
          if (result) {
            this.dataProvider.loadProfile();
          }
        });
      },
      "HEADER_CONFIRM_DELETE_PLACE",
      "MSG_CONFIRM_DELETE_PLACE");
  }
}