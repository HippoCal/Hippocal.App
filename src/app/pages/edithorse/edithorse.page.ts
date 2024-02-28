import { Component, Input, NgZone } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HorseViewmodel } from "src/app//viewmodels/viewmodels";
import { DataService, ImageService, ToastService } from "src/app/services/services";
import { UUID } from 'angular2-uuid';
import { ImageViewmodel } from 'src/app/viewmodels/imageviewmodel';
import { ModalController } from '@ionic/angular';


@Component({
  selector: 'page-edithorse',
  templateUrl: './edithorse.page.html',
  styleUrls: ['./edithorse.page.scss'],
})

export class EdithorsePage {

  public horseImage: string;
  public oldImageName: string;
  horseForm: FormGroup;
  private file: ImageViewmodel;

  @Input("horse") horse: HorseViewmodel;
  @Input("isNew") isNew: boolean;
  constructor(
    public dataProvider: DataService,
    public imageProvider: ImageService,
    private modalCtrl: ModalController,
    private zone: NgZone,
    public formBuilder: FormBuilder,
    
    private toastSvc: ToastService) {
  }

  ngOnInit() {
    this.horseForm = this.formBuilder.group({
      horseName: ['', Validators.compose([Validators.maxLength(30), Validators.required, Validators.minLength(2)])]
    });
  }

  ionViewWillEnter() {
    this.oldImageName = this.horse.ImageUrl;
    this.gethorseImage();

    if (this.isNew) {
      this.horse.HorseKey = UUID.UUID();
    }

  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad AddhorsePage');
  }

  cancel() {
    return this.modalCtrl.dismiss(this.horse, 'cancel');
  }

  saveImage(fileName: string, fileData: string) {
    this.zone.run(() => {
      this.horse.ImageUrl = fileName;
      this.horse.LocalImage = fileData;
      this.horseImage = fileData;
      this.gethorseImage();
    });

  }

  async uploadImage() {
    await this.imageProvider.upload(this.file, this.dataProvider.Profile.UserKey);
  }

  onDeleteImage() {
    this.saveImage('', this.imageProvider.defaultImageUrl("horse"));
  }

  onGetImage() {
    this.imageProvider.getImage('horse', this.horse.HorseKey, (file: ImageViewmodel) => {
      this.file = file;
      this.saveImage(file.fileName, file.data);
    });
  }

  refreshImage() {
    if (this.oldImageName != this.horse.ImageUrl && this.horse.LocalImage !== this.imageProvider.defaultImageUrl("horse")) {
      this.uploadImage();
    }
  }

  onDeleteHorse() {
    this.toastSvc.confirm(
      () => {
        this.horse.UserKey = this.dataProvider.Profile.UserKey;
        return this.modalCtrl.dismiss(this.horse, 'deleteHorse');      
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
    this.toastSvc.confirm(async () => {
      await this.refreshImage();
      return this.modalCtrl.dismiss(this.horse, 'saveHorse');    
      }, header, msg);
  }

  get isLastHorse(): boolean {
    return this.dataProvider.Profile.Horses.length < 2;
  }

  async gethorseImage() {
    var image = await this.imageProvider.get(this.horse.ImageUrl, this.horse.HorseKey, "horse", true, this.dataProvider.Profile.UserKey);
    if (image) {
      this.zone.run(() => {
        this.horseImage = image.data;
      });
    }
  }
}
