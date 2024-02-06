import { Component, NgZone } from '@angular/core';
import { HorseViewmodel, PlaceViewmodel, ProfileViewmodel } from "src/app/viewmodels/viewmodels";
import { DataService, ImageService, ToastService } from 'src/app/services/services';
import { ModalController } from '@ionic/angular';
import { EditprofilePage } from '../editprofile/editprofile.page';
import { EdithorsePage } from '../edithorse/edithorse.page';

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
    private modalCtrl: ModalController,
    private zone: NgZone,
    public imageProvider: ImageService,
    private toastSvc: ToastService) {
    if (!this.dataProvider.Profile.IsRegistered) {
      this.dataProvider.navigate('register', 'tab1', { state: { animate: true, direction: 'forward' } });
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
    this.getUserImage();
  }

  async getUserImage() {

    var image = await this.imageProvider.get(this.dataProvider.Profile.ImageUrl, this.dataProvider.Profile.UserKey, "user", true, this.dataProvider.Profile.UserKey);
    if (image) {
      this.zone.run(() => {
        this.userImage = image.data;
      });
    }


  }

  async onAddHorse() {
    await this.addModifyHorse(true);
  }

  onAddPlace() {
    this.dataProvider.navigate('register', 'tab1');
  }

  onRefresh() {
    this.dataProvider.loadProfile();
  }

  onSendMail() {
    this.dataProvider.navigate('getEmail', 'tab1', { state: { email: this.dataProvider.Profile.Email } });
  }

  async onChangeProfile() {
    const modal = await this.modalCtrl.create({
      component: EditprofilePage,
    });
    modal.present();

    const { data, role } = await modal.onWillDismiss();

    let isChanged: boolean = false;
    if (role === 'save') {
      this.zone.run(() => {
        if (data.ImageUrl !== this.dataProvider.Profile.ImageUrl && this.dataProvider.Profile.ImageUrl !== '') {
          this.imageProvider.deleteImage(this.dataProvider.Profile.ImageUrl);
          isChanged = true;

        }
        this.dataProvider.saveProfile(ProfileViewmodel.PartialClone(data, this.dataProvider.Profile));
        if (isChanged) {
          this.getUserImage();
        }
        this.dataProvider.modifyProfile(this.dataProvider.Profile).then(data => {
          if (data) {
            this.dataProvider.loadProfile(() => {
              if (!this.dataProvider.Profile.NotificationsAllowed) {
                this.dataProvider.clearAllNotifications();
              }
            });
          }
        });
      });
    } else {
      if (data.ImageUrl !== this.dataProvider.Profile.ImageUrl) {
        this.imageProvider.deleteImage(data.ImageUrl)
      }
    }

  }

  async onModifyHorse(horse: HorseViewmodel) {
    await this.addModifyHorse(false, horse);
  }

  async addModifyHorse(isNew: boolean, existing?: HorseViewmodel) {
    var horse = existing ? existing : new HorseViewmodel('', '', '', '', this.dataProvider.Profile.UserKey);

    const modal = await this.modalCtrl.create({
      component: EdithorsePage,
      componentProps: { horse: HorseViewmodel.PartialClone(horse), isNew: isNew }
    });
    modal.present();

    const { data, role } = await modal.onWillDismiss();

    let isChanged: boolean = false;
    if (role === 'save') {
      this.zone.run(() => {
        if (data.ImageUrl !== horse.ImageUrl && horse.ImageUrl !== '') {
          this.imageProvider.deleteImage(horse.ImageUrl);
          isChanged = true;
        }
        if (isNew) {   
          this.dataProvider.addHorse(data);
        } else {
          existing = HorseViewmodel.PartialClone(data, horse);
        }
        this.dataProvider.saveProfile(this.dataProvider.Profile);
        if(isChanged) 
          this.dataProvider.load();
      });
    }
    else if(role === 'delete') {
      horse.UserKey = this.dataProvider.Profile.UserKey;
      this.dataProvider.deleteHorse(horse).then(result => {
        if (result) {
          this.dataProvider.load();
        }
      });
    }
    else {
      if (data.ImageUrl !== horse.ImageUrl) {
        this.imageProvider.deleteImage(data.ImageUrl)
      }
    }
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

  onDeletePlace(place: PlaceViewmodel) {
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