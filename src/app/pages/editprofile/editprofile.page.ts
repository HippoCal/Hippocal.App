import { Component, NgZone } from '@angular/core';
import { DataService, ImageService, ToastService } from "src/app/services/services";
import { ImageViewmodel } from 'src/app/viewmodels/imageviewmodel';
import { ModalController } from '@ionic/angular';
import { ProfileViewmodel } from 'src/app/viewmodels/profileviewmodel';

@Component({
  selector: 'page-editprofile',
  templateUrl: './editprofile.page.html',
  styleUrls: ['./editprofile.page.scss'],
})
export class EditprofilePage { 

  showEventsOldValue: boolean;

  public profileImage: string;
  public oldImageName: string;
  private file: ImageViewmodel;

  public profile: ProfileViewmodel;
  
  constructor(
    private modalCtrl: ModalController,
    public dataProvider: DataService,
    public imageProvider: ImageService,

    private zone: NgZone,
    private toastSvc: ToastService) {
    
  }
  
  ngOnInit() {
    this.profile = ProfileViewmodel.PartialClone(this.dataProvider.Profile);
    this.showEventsOldValue = this.dataProvider.Profile.ShowEvents;
    this.oldImageName = this.dataProvider.Profile.ImageUrl;
    this.getProfileImage();
  }

  saveImage(fileName: string) {
    this.zone.run(() => {
      this.profile.ImageUrl = fileName;
      this.getProfileImage();
    });
  }
  async uploadImage() {
    await this.imageProvider.upload(this.file, this.dataProvider.Profile.UserKey);
  }

  cancel() {
    return this.modalCtrl.dismiss(this.profile, 'cancel');
  }

  onGetImage() {
    this.imageProvider.getImage('user', this.profile.UserKey, (file: ImageViewmodel) => {
      this.file = file;
      this.saveImage(file.fileName);
    });
  }

  onDeleteImage() {
    this.saveImage("");
  }

  onSaveProfile() {
    this.toastSvc.confirm(async () => {
      await this.uploadImage();
      return this.modalCtrl.dismiss(this.profile, 'save');    
      },
      "HEADER_CONFIRM_EDITPROFILE",
      "MSG_CONFIRM_EDITPROFILE", () => {
        this.cancel();
      });
  }

  async getProfileImage() {
    var image = await this.imageProvider.get(this.profile.ImageUrl, this.profile.UserKey, "user", true, this.profile.UserKey);
    if(image) {
      this.zone.run(() => {
        this.profileImage = image.data;
      });    
    }
  }

}
