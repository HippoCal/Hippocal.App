import { Injectable } from '@angular/core';
//import { FileTransfer, FileUploadOptions, FileTransferObject } from '@ionic-native/file-transfer';
import { Platform, ActionSheetController } from '@ionic/angular';
import { Filesystem, Directory, Encoding, WriteFileOptions } from '@capacitor/filesystem';
import { Camera, CameraResultType, CameraSource, ImageOptions, Photo } from '@capacitor/camera';
//import { HttpClientModule } from '@angular/common/http';
import { RestService, TokenService } from "../services";
import { TranslateService } from '@ngx-translate/core';
import { UUID } from 'angular2-uuid';

@Injectable()
export class ImageService {

  IMAGE_DIR: string = "hippocal_images";

  public imageName: string = '';
  private uploadUrl: string = '';
  private thumbExtension: string = "thumb_";
  private fullExtension: string = "fullsize_";

  //fileTransfer: FileTransferObject = null;

  constructor(private restProvider: RestService,
    //private transfer: FileTransfer,
    public tokenProvider: TokenService,
    public translate: TranslateService,
    public platform: Platform,
    public actionSheetCtrl: ActionSheetController) {
    this.uploadUrl = this.restProvider.WebUrl + '/Upload/UploadHandler.ashx'
    this.initFileTransfer();
  }

  private initFileTransfer() {
    // Todo: Fix it
    // if (this.fileTransfer == null) {
    //   this.platform.ready().then(() => {
    //     this.fileTransfer = this.transfer.create();
    //   });
    // }
  }

  public pathForImage(fileName: string, type: string): string {
    var defaultImage: string = this.getDefaultImage(type);
    if (fileName === null || fileName === '') {
      return 'assets/imgs/' + defaultImage;
    } else {
      return this.getFilePath(fileName);
    }
  };

  public getDefaultImage(type: string) : string {
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
    case "appointment":
        return "private.png";
    default:
        return '';
    }
  }

  public async loadNewsImages(news: any) {
    var hasChanges = false;
    await Promise.all(news.map(async (entry: any) => {
      if (entry.LocalImage === undefined ||
        entry.LocalImage === '' ||
        entry.LocalImage === this.pathForImage('', "news")) {
        this.get(entry.ImageUrl, entry.NewsEntryKey, "news", true, (url: any) => {
          entry.LocalImage = url;
          hasChanges = true;
        });
      }
    }));
    return hasChanges;
  }

  public async loadHorseImages(horses: any) {
    var hasChanges = false;
    await Promise.all(horses.map(async (entry: any) => {
      if (entry.LocalImage === undefined ||
        entry.LocalImage === '' ||
        entry.LocalImage === this.pathForImage('', "horse")) {
        this.get(entry.ImageUrl, entry.HorseKey, "horse", true, (url: any) => {
          entry.LocalImage = url;
          hasChanges = true;
        });
      }
    }));
    return hasChanges;
  }

  public async loadPlaceImages(places: any) {
    var hasChanges = false;
    await Promise.all(places.map(async (entry: any) => {
      if (entry.LocalImage === undefined ||
        entry.LocalImage === '' ||
        entry.LocalImage === this.pathForImage('', "places")) {
        this.get(entry.ImageUrl, entry.PlaceKey, "places", true, (url: any) => {
          entry.LocalImage = url;
          hasChanges = true;
        });
      }
    }));
    return hasChanges;
  }

  
  //places.forEach((entry) => {
  //    if (entry.LocalImage === undefined || entry.LocalImage === '' || entry.LocalImage === this.restProvider.pathForImage('', "places")) {
  //      this.get(entry.ImageUrl, entry.PlaceKey, "places", true, (url) => {
  //        entry.LocalImage = url;
  //        hasChanges = true;
  //      });
  //    }
  //  });
  //  return hasChanges;
  //}

  upload(fileName: string, url: string, key: string, userKey: string, type: string, callback: any) {
    // Todo: Fix it
    // let options: FileUploadOptions = {
    //   fileKey: key,
    //   fileName: fileName,
    //   chunkedMode: false,
    //   mimeType: 'image/jpeg',
    //   params: {
    //     uploadType: type,
    //     key: key,
    //     userkey: userKey
    //   }
    // };

    // this.initFileTransfer();
    // console.info('File upload: File-Url: ' + url + ' FileName: ' + fileName + ' Remote URL: ' + this.uploadUrl + ' Key: ' + key + ' UserKey: ' + userKey + ' Type: ' + type);
    // this.fileTransfer.upload(url, this.uploadUrl, options).then((data: any) => {
    //   var result = JSON.parse(data.response);
    //   if (result[0].name) {
    //     console.log('Uploaded image successfully ' + result[0].name);
    //     callback(result[0].name);
    //   } else {
    //     callback("");
    //   }
    // },
    //   (err: any) => {
    //     callback("");
    //     console.log('upload failed!' + err);
    //   });
  }

  download(fileName: string, url: string) {
    // Todo: Fix it
    // console.info('File download: File-Url: ' + url + ' FileName: ' + fileName + ' ImagePath: ' + this.restProvider.defaultImagePath());
    // this.initFileTransfer();
    // return this.fileTransfer.download(encodeURI(url), this.restProvider.defaultImagePath() + fileName, false, {
    //   headers: {
    //     "Authorization": "Bearer " + this.tokenProvider.Token.Token
    //   }
    // });
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

  public async imageExists(fileName: string): Promise<boolean> {
    try {
      await Filesystem.stat(
        {
          directory: Directory.Data,
          path: this.getFilePath(fileName)
        })
        return true;
    }
    catch(checkDirException)
    {
      if (checkDirException.message === 'File does not exist') {
        return false;
      } else {
        throw checkDirException;
      }
    }
  }

  public deleteLocalImage(fileName: string) {
    this.initFileTransfer();
    this.imageExists(fileName).then(async (exists: boolean) => {
      if (exists) {
        await Filesystem.deleteFile(
          {
            path: this.getFilePath(fileName),
            directory: Directory.Data
          }
        );
      }
    });

    var fullFileName = this.fullExtension + fileName;

    this.imageExists(fullFileName).then(async (exists: boolean) => {
      if (exists) {
        await Filesystem.deleteFile(
          {
            path: this.getFilePath(fullFileName),
            directory: Directory.Data
          }
        );
      }
    });
  }

  public get(imageUrl: string, key: string, type: string, loadThumb: boolean, callback: any) {
    var defaultImage: string = this.getDefaultImage(type);
    var fileName = loadThumb ? imageUrl : this.fullExtension + imageUrl;
    if (this.platform.is('cordova')) {
      if (imageUrl === undefined || imageUrl === '') {
        callback(this.pathForImage('', type));
      }
      this.initFileTransfer();

    // Todo: Fix it
    //   this.file.checkFile(this.restProvider.defaultImagePath(), fileName).then((result: any) => {
    //     if (result) {
    //       callback(this.pathForImage(fileName, type));
    //     } else {
    //       this.downloadFile(imageUrl, key, defaultImage, type, loadThumb, callback);
    //     }
    //   },
    //     (err) => {
    //       this.downloadFile(imageUrl, key, defaultImage, type, loadThumb, callback);
    //     });
    // } else {
    //   callback(this.pathForImage(fileName, type));
    }
  }

  private downloadFile(imageUrl: string, key: string, defaultImage: string, type: string, loadThumb: boolean, callback: any) {
    var url = this.getDownloadUrl(imageUrl, key, type, loadThumb);
    var fileName = loadThumb ? imageUrl : this.fullExtension + imageUrl;
    // Todo: Fix it
    // this.download(fileName, url).then((result: any) => {
    //   console.info("Download successful! " + result.nativeURL);
    //   callback(this.pathForImage(fileName, type));
    // },
    //   (err) => {
    //     console.warn("Download error! " + err);
    //     callback(this.pathForImage('', type));
    //   });

  }

  public getDownloadUrl(imageUrl: string, key: string, type: string, loadThumb: boolean): string {

    var fileName: string = imageUrl;
    var ext: string = "";
    if (imageUrl !== undefined && imageUrl !== null) {
      var imageUrlSplit = imageUrl.split('.');
      if (imageUrlSplit.length == 2) {
        fileName = imageUrlSplit[0];
        ext = imageUrlSplit[1];
      }
    }
    fileName = loadThumb ? this.thumbExtension + fileName : fileName;
    return this.restProvider.WebUrl + "/api/media/" + key + "/" + fileName + "/" + ext + "/" + type;
  }

  public getImage(callback: any) {
    this.actionSheetCtrl.create({
      header: this.translate.instant('LBL_PROFILE_SELECT_IMAGE_SOURCE'),
      buttons: [
        {
          text: this.translate.instant('LBL_PROFILE_IMAGE_SOURCE_LIB'),
          icon: 'images',
          handler: () => {
            this.takePicture(0, callback);
          }
        },
        {
          text: this.translate.instant('LBL_PROFILE_IMAGE_SOURCE_CAMERA'),
          icon: 'camera',
          handler: () => {
            this.takePicture(1, callback);
          }
        },
        {
          text: this.translate.instant('BTN_CANCEL'),
          icon: 'close-circle',
          role: 'cancel'
        }
      ]
    }).then( (actionSheet: any) => {
      actionSheet.present();
    });
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
  
  async saveImage(photo: Photo) {
    const base64Data = await this.readAsBase64(photo);

    const fileName: string = new Date().getTime() + '.jpeg';
    var options: WriteFileOptions = {
      directory: Directory.Data,
      path: this.getFilePath(fileName),
      data: base64Data
    }; 
    const savedFile = await Filesystem.writeFile(options);
  }

  getFilePath(fileName: string): string {
    return `${this.IMAGE_DIR}/${fileName}`;
  }

  public async takePicture(sourceTypeIndex: any, callback: any) {

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
      resultType: CameraResultType.Base64,
      correctOrientation: true
    };

    // Get the data of an image
    const image = await Camera.getPhoto(options);
    if (image) {
      await this.saveImage(image);
    }
  }
}
