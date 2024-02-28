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
    this.dataProvider.getProfileImage();
    this.profileImage = this.dataProvider.ProfileImage;
  }

  saveImage(fileName: string, fileData?: string) {
    this.zone.run(() => {
      this.profile.ImageUrl = fileName;
      if(fileData) {
        this.profileImage = fileData;
      }        
    });
  }
  
  cancel() {
    return this.modalCtrl.dismiss(this.profile, 'cancel');
  }

  onGetImage() {
    this.imageProvider.getImage('user', this.profile.UserKey, (file: ImageViewmodel) => {
      this.file = file;
      this.saveImage(file.fileName, file.data);
    });
  }

  onDeleteImage() {
    this.saveImage("");
  }

  onSaveProfile() {
    this.toastSvc.confirm(async () => {    
      if(this.file) {
        this.profile.CurrentImage = this.file;
      }
      return this.modalCtrl.dismiss(this.profile, 'save');    
      },
      "HEADER_CONFIRM_EDITPROFILE",
      "MSG_CONFIRM_EDITPROFILE", () => {
        this.cancel();
      });
  }

}
