import { Component, NgZone } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { HorseViewmodel } from "src/app//viewmodels/viewmodels";
import { DataService, ImageService, ToastService } from "src/app/services/services";
import { UUID } from 'angular2-uuid';
import { LocationStrategy } from '@angular/common';
import { ImageViewmodel } from 'src/app/viewmodels/imageviewmodel';


@Component({ 
  selector: 'page-edithorse',
  templateUrl: './edithorse.page.html',
  styleUrls: ['./edithorse.page.scss'],
})
export class EdithorsePage {

  public isNew: boolean = true;
  public horse: HorseViewmodel = new HorseViewmodel('', '', '', '', this.dataProvider.Profile.UserKey);
  
  public horseImage: string;
  public oldImageName: string;
  horseForm: FormGroup;
  private file: ImageViewmodel;

  constructor(
    private router: Router,
    private route: ActivatedRoute, 
    public dataProvider: DataService,
    public imageProvider: ImageService,
    private zone: NgZone,
    private locationStrategy: LocationStrategy,
    public formBuilder: FormBuilder,
    private toastSvc: ToastService) {

      this.resolveParams();
    this.horseForm = formBuilder.group({
      horseName: ['', Validators.compose([Validators.maxLength(30), Validators.required, Validators.minLength(2)])]
    });
    
  }


  resolveParams() {
    this.route.queryParams.subscribe(params => {
      if (this.router.getCurrentNavigation().extras.state) {
        this.isNew = this.router.getCurrentNavigation().extras.state['isNew'];
        if (!this.isNew) {
          this.horse = this.router.getCurrentNavigation().extras.state['horse'];
        } else {
          this.horse.HorseKey = UUID.UUID();
        }
      }
      this.oldImageName = this.horse.ImageUrl;
      this.gethorseImage();
    });
  }
  
  ionViewDidLoad() {
    console.log('ionViewDidLoad AddhorsePage');
  }

  saveImage(fileName: string) {
    this.zone.run(() => {
      this.horse.ImageUrl = fileName;
      if(this.horse.ImageUrl !== this.oldImageName && this.oldImageName !== '') {
        this.imageProvider.deleteImage(this.oldImageName)
      } 
      this.dataProvider.saveProfile(this.dataProvider.Profile);
      this.gethorseImage();
    });

  }

  async uploadImage() {
    await this.imageProvider.upload(this.file, this.dataProvider.Profile.UserKey);
  }

  onDeleteImage() {
    this.saveImage("");
  }

  onGetImage() {
    this.imageProvider.getImage('horse', this.horse.HorseKey, (file: ImageViewmodel) => {
      this.file = file;
      this.saveImage(file.fileName);
    });
  }

  refreshImage() {
    if(this.oldImageName != this.horse.ImageUrl) {
      this.uploadImage();
    }
  }

  onDeleteHorse() {
    this.toastSvc.confirm(
      () => {
        this.horse.UserKey = this.dataProvider.Profile.UserKey;
        this.dataProvider.deleteHorse(this.horse).then(data => {
          if (data) {
            this.dataProvider.loadProfile(() => {
              this.locationStrategy.back();
            });
          }
        });
      }, "HEADER_CONFIRM_DELETE_HORSE", "MSG_CONFIRM_DELETE_HORSE");
  }

  onAddmodify() {

    var header, msg;

    if (this.isNew) {
      header = "HEADER_CONFIRM_ADDHORSE";
      msg = "MSG_CONFIRM_ADDHORSE";
    } else {
      header = "HEADER_CONFIRM_MODIFYHORSE";
      msg = "MSG_CONFIRM_MODIFYHORSE";
    }
    this.toastSvc.confirm(() => {
      if (this.isNew) {
        this.dataProvider.addHorse(this.horse).then(data => {
          if (data) {
            this.refreshImage();
            this.dataProvider.loadProfile(() => {
              this.locationStrategy.back();
            });
          }
        });
      } else {
        this.horse.UserKey = this.dataProvider.Profile.UserKey;
        this.dataProvider.addHorse(this.horse).then(data => {
          if (data) {
            this.refreshImage();
            this.dataProvider.loadProfile(() => {
              this.locationStrategy.back();
            });
          }
        });
      }

    }, header, msg);
  }

  get isLastHorse(): boolean {
    return this.dataProvider.Profile.Horses.length < 2;
  }

  async gethorseImage() {
    var image = await this.imageProvider.get(this.horse.ImageUrl, this.horse.HorseKey, "horse", true, this.dataProvider.Profile.UserKey);
    if(image) {
      this.zone.run(() => {
        this.horseImage = image.data;
      });    
    }
  }
}
