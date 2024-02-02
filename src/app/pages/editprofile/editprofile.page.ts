import { LocationStrategy } from '@angular/common';
import { Component, NgZone } from '@angular/core';
import { DataService, ImageService, ToastService } from "src/app/services/services";
import { ImageViewmodel } from 'src/app/viewmodels/imageviewmodel';

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

  constructor(
    public dataProvider: DataService,
    public imageProvider: ImageService,
    private locationStrategy: LocationStrategy,
    private zone: NgZone,
    private toastSvc: ToastService) {
    
  }
  
  ngOnInit() {
    this.showEventsOldValue = this.dataProvider.Profile.ShowEvents;
    this.oldImageName = this.dataProvider.Profile.ImageUrl;
    this.getProfileImage();
  }

  saveImage(fileName: string) {
    this.zone.run(() => {
      this.dataProvider.Profile.ImageUrl = fileName;
      if(this.dataProvider.Profile.ImageUrl !== this.oldImageName && this.oldImageName !== '') {
        this.imageProvider.deleteImage(this.oldImageName)
      } 
      this.dataProvider.saveProfile(this.dataProvider.Profile);
      this.getProfileImage();
    });
  }
  async uploadImage() {
    await this.imageProvider.upload(this.file, this.dataProvider.Profile.UserKey);
  }

  onGetImage() {
    this.imageProvider.getImage('user', this.dataProvider.Profile.UserKey, (file: ImageViewmodel) => {
      this.file = file;
      this.saveImage(file.fileName);
    });
  }

  onDeleteImage() {
    this.saveImage("");
  }

  refreshImage() {
    if(this.oldImageName != this.dataProvider.Profile.ImageUrl) {
      this.uploadImage();
    }
  }

  onSaveProfile() {
    this.toastSvc.confirm(() => {
        
        this.dataProvider.modifyProfile(this.dataProvider.Profile).then(data => {
          if (data) {
            this.refreshImage();
            if (this.showEventsOldValue !== this.dataProvider.Profile.ShowEvents) {
              this.showEventsOldValue = this.dataProvider.Profile.ShowEvents;
              this.dataProvider.refreshData(false);
            }
            this.dataProvider.loadProfile(() => {
              if (!this.dataProvider.Profile.NotificationsAllowed) {
                this.dataProvider.clearAllNotifications();
              }
              this.locationStrategy.back();
            });
          }
        });
      },
      "HEADER_CONFIRM_EDITPROFILE",
      "MSG_CONFIRM_EDITPROFILE");
  }

  async getProfileImage() {
    var image = await this.imageProvider.get(this.dataProvider.Profile.ImageUrl, this.dataProvider.Profile.UserKey, "user", true, this.dataProvider.Profile.UserKey);
    if(image) {
      this.zone.run(() => {
        this.profileImage = image.data;
      });    
    }
  }

}
