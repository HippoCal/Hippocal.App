import { Component, NgZone} from '@angular/core';
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
    public dataProvider: DataService, 
    private zone: NgZone, 
    public imageProvider: ImageService,
    private toastSvc: ToastService) {
    if (!this.dataProvider.Profile.IsRegistered) {
      this.dataProvider.navigate('register','tab1', {state: { animate: true, direction: 'forward' }});
    }
    this.area = "basic";
    this.color = 'divider';
    this.lockedOut = (!this.dataProvider.Profile.IsActive && !this.dataProvider.IsPrivate) || (!this.dataProvider.Profile.EmailConfirmed && this.dataProvider.Profile.NumLogins > 5);
    this.lockOutReasonEMail = (!this.dataProvider.Profile.EmailConfirmed && this.dataProvider.Profile.NumLogins > 5);
    if (!this.dataProvider.Profile.IsActive) {
      this.lockOutReasonEMail = false;
    }
  }

  ngOnInit() {
    this.getUserImage();;
  }

  async getUserImage() {

    var image = await this.imageProvider.get(this.dataProvider.Profile.ImageUrl, this.dataProvider.Profile.UserKey, "user", true, this.dataProvider.Profile.UserKey);
    if(image) {
      this.zone.run(() => {
        this.userImage = image.data;
      }); 
    }
      

  }

  onAddHorse() {
    this.dataProvider.navigate('edithorse', 'tab1', {state: { isNew: true }});
  }

  onAddPlace() {
    this.dataProvider.navigate('register', 'tab1');
  }

  onRefresh() {
    this.dataProvider.loadProfile();
  }

  onSendMail() {
    this.dataProvider.navigate('getEmail', 'tab1', {state: { email: this.dataProvider.Profile.Email }});
  }

  onChangeProfile() {
    this.dataProvider.navigate('editprofile', 'tab1');
  }

  onModifyHorse(horse: HorseViewmodel) {
    this.dataProvider.navigate('edithorse', 'tab1', {state: { isNew: false, horse: horse }});
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
            this.dataProvider.navigate('home', 'tab1');
          }
        });
      },
      "HEADER_CONFIRM_ACTIVATEPROFILE",
      "MSG_CONFIRM_ACTIVATEPROFILE");
  }

  public onPlaceDetails() {
    this.dataProvider.navigate('placedetails', 'tab1');
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