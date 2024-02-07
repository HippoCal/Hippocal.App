import { Injectable } from '@angular/core';
import { Platform, ActionSheetController } from '@ionic/angular';
import { Filesystem, Directory, WriteFileOptions, FileInfo } from '@capacitor/filesystem';
import { Camera, CameraResultType, CameraSource, ImageOptions, Photo } from '@capacitor/camera';
import { HttpClient } from '@angular/common/http';
import { RestService, TokenService } from "../services";
import { TranslateService } from '@ngx-translate/core';
import { UUID } from 'angular2-uuid';
import { ImageViewmodel } from 'src/app/viewmodels/imageviewmodel';
import { exhaustMap } from 'rxjs';

@Injectable()
export class ImageService {

  IMAGE_DIR: string = "hippocal_images";

  public imageName: string = '';


  images: ImageViewmodel[] = [];

  constructor(private restProvider: RestService,
    //private transfer: FileTransfer,
    public tokenProvider: TokenService,
    public translate: TranslateService,
    private http: HttpClient,
    public platform: Platform,
    public actionSheetCtrl: ActionSheetController) {

    this.loadImages();
  }

  public pathForImage(fileName: string, imageType: string, key: string): string {
    var defaultImage: string = this.getDefaultImage(imageType);
    if (fileName === null || fileName === '') {
      return 'assets/imgs/' + defaultImage;
    } else {
      return this.getFilePath(fileName);
    }
  };

  public getDefaultImage(type: string): string {
    switch (type) {
      case "user":
        return "defaultProfile.png";
      case "news":
        return "defaultNews.png";
      case "horse":
        return "hippocal300.png";
      case "places":
        return "longierhalle.png";
      case "loading":
        return "loading.png";
      case "private":
        return "private.png";
      default:
        return '';
    }
  }

  async upload(file: ImageViewmodel, userKey: string) {
    await this.restProvider.uploadImage(file, userKey, true);
  }


  createFileName(ext: string) {
    if (ext === 'jpg' || ext === 'jpeg' || ext === 'png') {
      return UUID.UUID() + "." + ext;
    } else {
      return UUID.UUID() + ".jpg";
    }

  }

  public getImageExtension(img: any): string {
    if (img !== undefined && img !== '' && img !== null) {
      var split = img.split('.');
      if (split.length > 1) {
        return split[1];
      }
      return "jpg";
    }
    return "";
  }

  public async imageExists(fileName: string, imageType: string, key: string): Promise<boolean> {
    try {
      await Filesystem.stat(
        {
          directory: Directory.Data,
          path: this.getFilePath(fileName)
        })
      return true;
    }
    catch (checkDirException) {
      if (checkDirException.message === 'File does not exist') {
        return false;
      } else {
        throw checkDirException;
      }
    }
  }

  public async get(fileUrl: string, key: string, imageType: string, loadThumb?: boolean, userKey?: string): Promise<ImageViewmodel> {

    var fileName = fileUrl; //loadThumb ? this.thumbExtension + fileUrl : fileUrl;
    var result: ImageViewmodel = {
      fileName: fileName,
      data: '',
      key: key,
      imageType: imageType
    };

    if (fileName !== '' && fileName !== undefined && fileName !== null) {
      var file = this.images.find(e => e.fileName == fileName);
      // ist im Cache...
      if (file) {
        return file;
      }
      // suche im FileSystem
      try {
        var fileData = await Filesystem.readFile({
          directory: Directory.Data,
          path: this.getFilePath(fileName)
        });
        if (fileData) {
          result.data = `data:image/jpeg;base64,${fileData.data}`;
          return result;
        }
      } catch { }

      result = await this.download(result);
      if (result.data !== '') {
        result.data = `data:image/jpeg;base64,${result.data}`;
        result.fileName = fileName;
        await this.saveImageViewModel(result)
        return result;
      }
    }
    // nicht gefunden
    result.data = `assets/imgs/${this.getDefaultImage(imageType)}`;
    return result;

  }

  async loadImages() {
    var options = {
      directory: Directory.Data,
      path: this.IMAGE_DIR
    }
    Filesystem.readdir(options).then(result => {
      this.loadFileData(result.files);
    }, async err => {
      await Filesystem.mkdir(options);
    })
  }

  async loadFileData(files: FileInfo[]) {
    files.forEach(async file => {
      Filesystem.readFile({
        directory: Directory.Data,
        path: this.getFilePath(file.name)
      }).then(result => {
        this.images.push({
          fileName: file.name,
          data: `data:image/jpeg;base64,${result.data}`
        })
      }, async err => { })

    });
  }

  async download(image: ImageViewmodel): Promise<ImageViewmodel> {
    image = this.getExtension(image);
    await this.restProvider.loadImage(image).then((result: any) => {
      if (result) {
        image = result;
        return image;
      } else {
        return image;
      }
    });
    return image;

  }

  getExtension(image: ImageViewmodel): ImageViewmodel {

    var fileName: string = image.fileName;
    var ext: string = "";
    if (image.fileName !== undefined && image.fileName !== null) {
      var imageUrlSplit = image.fileName.split('.');
      if (imageUrlSplit.length == 2) {
        fileName = imageUrlSplit[0];
        ext = imageUrlSplit[1];
      }
    }
    image.fileName = fileName;
    image.ext = ext;
    return image;
  }

  public getImage(imageType: string, key: string, callback: any) {
    this.actionSheetCtrl.create({
      header: this.translate.instant('LBL_PROFILE_SELECT_IMAGE_SOURCE'),
      buttons: [
        {
          text: this.translate.instant('LBL_PROFILE_IMAGE_SOURCE_LIB'),
          icon: 'images',
          handler: () => {
            this.takePicture(imageType, key, 0, callback);
          }
        },
        {
          text: this.translate.instant('LBL_PROFILE_IMAGE_SOURCE_CAMERA'),
          icon: 'camera',
          handler: () => {
            this.takePicture(imageType, key, 1, callback);
          }
        },
        {
          text: this.translate.instant('BTN_CANCEL'),
          icon: 'close-circle',
          role: 'cancel'
        }
      ]
    }).then((actionSheet: any) => {
      actionSheet.present();
    });
  }



  async deleteImage(fileName: string) {
    try {
      await Filesystem.deleteFile({
        path: this.getFilePath(fileName),
        directory: Directory.Data
      })
      var file = this.images.find(e => e.fileName == fileName);
      if (file) {
        const index = this.images.indexOf(file);
        this.images.splice(index, 1);
      }
    }
    catch { }

  }

  private async readAsBase64(photo: Photo) {
    // "hybrid" will detect Cordova or Capacitor
    if (this.platform.is('hybrid')) {
      // Read the file into base64 format
      const file = await Filesystem.readFile({
        path: photo.path!
      });

      return file.data;
    }
    else {
      // Fetch the photo, read as a blob, then convert to base64 format
      const response = await fetch(photo.webPath!);
      const blob = await response.blob();

      return await this.convertBlobToBase64(blob) as string;
    }
  }

  private convertBlobToBase64 = (blob: Blob) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      resolve(reader.result);
    };
    reader.readAsDataURL(blob);
  });

  async saveImage(photo: Photo, imageType: string, key: string): Promise<ImageViewmodel> {
    const base64Data = await this.readAsBase64(photo);
    const fileName: string = this.createFileName(photo.format);
    var result: ImageViewmodel = {
      fileName: fileName,
      data: `${base64Data}`,
      key: key,
      imageType: imageType
    };
    await this.saveImageViewModel(result);
    return result;
  }

  async saveImageViewModel(image: ImageViewmodel) {

    var options: WriteFileOptions = {
      directory: Directory.Data,
      path: this.getFilePath(image.fileName),
      data: image.data
    };
    const savedFile = await Filesystem.writeFile(options);
    console.log('Saved: ', savedFile);
    this.images.push(image);
  }

  getFilePath(fileName: string): string {
    return `${this.IMAGE_DIR}/${fileName}`;
  }

  public async takePicture(imageType: string, key: string, sourceTypeIndex: any, callback: any) {

    var sourceType: CameraSource;

    switch (sourceTypeIndex) {
      case 0:
        sourceType = CameraSource.Photos;
        break;
      case 1:
        sourceType = CameraSource.Camera;
        break;
      default:
    }
    // Create options for the Camera Dialog
    var options: ImageOptions = {
      width: 400,
      height: 400,
      quality: 70,
      allowEditing: true,
      source: sourceType,
      resultType: CameraResultType.Uri,
      correctOrientation: true
    };

    // Get the data of an image
    const image = await Camera.getPhoto(options);
    if (image) {
      var result = await this.saveImage(image, imageType, key);
      callback(result)
    }
  }
}
