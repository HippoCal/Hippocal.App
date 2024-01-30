import { Injectable } from '@angular/core';
import { Platform, ActionSheetController } from '@ionic/angular';
import { Filesystem, Directory, WriteFileOptions, FileInfo } from '@capacitor/filesystem';
import { Camera, CameraResultType, CameraSource, ImageOptions, Photo } from '@capacitor/camera';
import { HttpClient } from '@angular/common/http';
import { RestService, TokenService } from "../services";
import { TranslateService } from '@ngx-translate/core';
import { UUID } from 'angular2-uuid';
import { FileViewmodel } from 'src/app/viewmodels/fileviewmodel';
import { HorseViewmodel } from 'src/app/viewmodels/horseviewmodel';
import { NewsViewmodel } from 'src/app/viewmodels/newsviewmodel';
import { PlaceViewmodel } from 'src/app/viewmodels/placeviewmodel';

@Injectable()
export class ImageService {

  IMAGE_DIR: string = "hippocal_images";

  public imageName: string = '';
  private uploadUrl: string = '';
  private thumbExtension: string = "thumb_";
  private fullExtension: string = "fullsize_";

  images: FileViewmodel[] = [];

  constructor(private restProvider: RestService,
    //private transfer: FileTransfer,
    public tokenProvider: TokenService,
    public translate: TranslateService,
    private http: HttpClient,
    public platform: Platform,
    public actionSheetCtrl: ActionSheetController) {
    this.uploadUrl = this.restProvider.WebUrl + '/Upload/UploadHandler.ashx';
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
      case "appointment":
        return "private.png";
      default:
        return '';
    }
  }

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

  public async get(fileUrl: string, key: string, imageType: string, loadThumb: boolean): Promise<FileViewmodel> {

    var fileName = fileUrl; //loadThumb ? this.thumbExtension + fileUrl : fileUrl;
    var result: FileViewmodel = {
      fileName: fileName,
      data: '',
      key: key,
      imageType: imageType
    };

    if (fileName !== '' && fileName !== undefined) {
      var file = this.images.find(e => e.fileName == fileName);
      // ist im Cache...
      if (file) {
        return file;
      }
      // Filesystem.readFile({
      //   directory: Directory.Data,
      //   path: this.getFilePath(fileName)
      // }).then(fileData => {
      //   result.data = `data:image/jpeg;base64,${fileData.data}`;
      //   this.images.push(result);
      //   return result;
      // }, async err => {
      //   console.log(err);
      // });
    }
    // Todo: add Download...
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

  private downloadFile(imageUrl: string, key: string, defaultImage: string, type: string, loadThumb: boolean, callback: any) {
    var url = this.getApiUrl(imageUrl, key, type, loadThumb);
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

  public getApiUrl(imageUrl: string, key: string, type: string, loadThumb: boolean): string {

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

  async uploadImage(file: FileViewmodel) {
    const response = await fetch(file.data);
    const blob = await response.blob();
    const formData = new FormData();
    formData.append('bytes', blob, file.fileName)
    this.http.post
  }

  async deleteImage(file: FileViewmodel) {
    await Filesystem.deleteFile({
      path: this.getFilePath(file.fileName),
      directory: Directory.Data
    })
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

  async saveImage(photo: Photo, imageType: string, key: string) {
    const base64Data = await this.readAsBase64(photo);
    const fileName: string = this.createFileName(photo.format);
    var options: WriteFileOptions = {
      directory: Directory.Data,
      path: this.getFilePath(fileName),
      data: base64Data
    };

    const savedFile = await Filesystem.writeFile(options);
    console.log('Saved: ', savedFile);
    var result: FileViewmodel = {
      fileName: fileName,
      data: `${base64Data}`,
      key: key,
      imageType: imageType
    };
    this.images.push(result);
    return fileName;
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
      var fileName = await this.saveImage(image, imageType, key);
      callback(fileName, fileName)
    }
  }
}
