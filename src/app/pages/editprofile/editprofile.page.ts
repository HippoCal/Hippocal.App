import { LocationStrategy } from '@angular/common';
import { Component, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { DataService, ImageService, ToastService } from "src/app/services/services";

@Component({
  selector: 'page-editprofile',
  templateUrl: './editprofile.page.html',
  styleUrls: ['./editprofile.page.scss'],
})
export class EditprofilePage { 

  showEventsOldValue: boolean;

  constructor(
    private router: Router,
    public dataProvider: DataService,
    public imageProvider: ImageService,
    private locationStrategy: LocationStrategy,
    private zone: NgZone,
    private toastSvc: ToastService) {
    
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad EditprofilePage');
    this.showEventsOldValue = this.dataProvider.Profile.ShowEvents;
  }

  saveImage(fileName: string) {
    this.zone.run(() => {
      this.dataProvider.Profile.ImageUrl = fileName;
      this.dataProvider.saveProfile(this.dataProvider.Profile);
    });
  }

  uploadImage(fileName: string, url: string) {
    this.imageProvider.upload(fileName, url, this.dataProvider.Profile.UserKey, this.dataProvider.Profile.UserKey, 'user', (newFileName) => {
      this.saveImage(newFileName);
    });
  }

  onGetImage() {
    this.imageProvider.getImage((fileName, url) => {
      this.saveImage(fileName);
      this.uploadImage(fileName, url);
    });
  }

  onDeleteImage() {
    this.saveImage("");
  }

  onSaveProfile() {
    this.toastSvc.confirm(() => {
        
        this.dataProvider.modifyProfile(this.dataProvider.Profile).then(data => {
          if (data) {
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

  get profileImage(): string {
    return this.dataProvider.pathForImage(this.dataProvider.Profile.ImageUrl, "user");
  }

}
