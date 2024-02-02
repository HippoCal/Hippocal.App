import { Component, OnInit, NgZone } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BarcodeScanner, BarcodeFormat, Barcode } from '@capacitor-mlkit/barcode-scanning';
import { TokenViewmodel } from "../../viewmodels/viewmodels";
import { DataService, ImageService } from "../../services/services";
import { AlertController } from '@ionic/angular';
import { UUID } from 'angular2-uuid';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss']
})

export class RegisterPage implements OnInit {

  public placeName: string;
  public ownerName: string;

  public isLocked: boolean;

  private isVisible: boolean;
  private isEnabled: boolean;

  isSupported = false;
  barcodes: Barcode[] = [];
  
  registerForm: FormGroup;

  constructor(
    public dataProvider: DataService,
    public imageService: ImageService,
    private alertController: AlertController,
    private zone: NgZone,
    public formBuilder: FormBuilder) {
    this.isVisible = false;
    this.isLocked = false;
    this.registerForm = formBuilder.group({
      firstName: ['', Validators.compose([Validators.maxLength(30), Validators.required, Validators.minLength(2)])],
      surName: ['', Validators.compose([Validators.maxLength(30), Validators.required, Validators.minLength(2)])],
      email: ['', Validators.compose([Validators.required, Validators.pattern('^[_A-Za-z0-9-\\+]+(\\.[_A-Za-z0-9-]+)*@[A-Za-z0-9-]+(\\.[A-Za-z0-9]+)*(\\.[A-Za-z]{2,})$')])],
      horseName: ['', Validators.compose([Validators.maxLength(30), Validators.required, Validators.minLength(2)])]
    });
  }

  ngOnInit() {
    BarcodeScanner.isSupported().then((result) => {
      this.isSupported = result.supported;
    });
  }

  onBack() {
    this.dataProvider.navigate('home', 'tab1');
  }

  addPlace() {
    this.dataProvider.addPlace().then((response) => {
      if (response) {
        this.finish();
      } else {
        this.isEnabled = false;
      }
    });
  }

  signup() {
    if (this.dataProvider.Profile.UserKey === '' || this.dataProvider.Profile.UserKey === undefined) {
      this.dataProvider.Profile.UserKey = UUID.UUID();
    }
    this.dataProvider.saveProfile(this.dataProvider.Profile);
    this.dataProvider.savedirect().then((res: any) => {
      if (res.Result) {
        var token = res.User as TokenViewmodel;
        if (res.ErrorCode === this.dataProvider.ErrorCodes.Error_Message_User_Exists) {
          if (token !== null && token !== undefined) {
            this.dataProvider.saveToken(token);
            this.dataProvider.Profile.UserKey = token.UserKey;
            this.dataProvider.saveProfile(this.dataProvider.Profile);
          }
          this.dataProvider.navigate('pin-input', 'tab1');
        } else {

          if (token !== null && token !== undefined) {
            this.dataProvider.saveToken(token);
            this.dataProvider.Profile.UserKey = token.UserKey;
            this.dataProvider.Profile.UserPin = token.UserPin;
            this.finish();
          }
        }

      } else {
        if (res.Message) {
          this.dataProvider.showMessage(res.Message, false);
        }
      }
    });
  }

  private finish() {
    this.dataProvider.Profile.IsRegistered = true;
    this.dataProvider.Profile.IsActive = true;
    this.dataProvider.saveProfile(this.dataProvider.Profile);
    this.dataProvider.loadProfile();
    this.navHome();
  }

  private navHome() {
    this.dataProvider.navigate('home', 'tab1');
  }

  get IsEnabled(): boolean {
    return this.isEnabled;
  }

  showForm() {
    return !this.isVisible;
  };

  async show() {
    window.document.querySelector('body')?.classList.add('barcode-scanner-active');

    const body = document.getElementById('myBodyId');
    if(body) {
      body.style.visibility = 'hidden';
    }
    await BarcodeScanner.startScan({ formats: [BarcodeFormat.QrCode] });
    this.isVisible = true;
    setTimeout(() => {
      if (this.isVisible) {
        this.hide();
      }
    }, 4000);
  }

  async hide() {
    // Remove all listeners
    await BarcodeScanner.removeAllListeners();

    // // Stop the barcode scanner
    await BarcodeScanner.stopScan();
    window.document.querySelector('body')?.classList.remove('barcode-scanner-active');
    this.isVisible = false;
    const body = document.getElementById('myBodyId');
    if(body) {
      body.style.visibility = 'visible';
    }
  }

  get PrivateMode(): boolean {
    return this.dataProvider.Profile.UserKey === '' || this.dataProvider.Profile.UserKey === undefined;
  }

  async requestPermissions(): Promise<boolean> {
    const { camera } = await BarcodeScanner.requestPermissions();
    return camera === 'granted' || camera === 'limited';
  }

  async presentAlert(): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Permission denied',
      message: 'Please grant camera permission to use the barcode scanner.',
      buttons: ['OK'],
    });
    await alert.present();
  }

  async scan() {
    try {
      if (this.isVisible) {
        this.hide();
        return;
      }
      const granted = await this.requestPermissions();
      if (!granted) {
        this.presentAlert();
        return;
      }

     const listener = await BarcodeScanner.addListener('barcodeScanned', async result => {
        this.zone.run(() => {
          console.log('Scanned: ', result.barcode);
          if (result.barcode && result.barcode.format === BarcodeFormat.QrCode) {
            this.isLocked = true;
            this.hide();
            if (this.dataProvider.Profile.UserKey === '' || this.dataProvider.Profile.UserKey === undefined) {
              this.dataProvider.Profile.UserKey = UUID.UUID();
            }
            this.dataProvider.getPlaceOwner(result.barcode.rawValue).then((result: any) => {
              this.dataProvider.Profile.PlaceKey = result.PlaceKey;
              this.placeName = result.PlaceName;
              this.ownerName = result.OwnerName;
              this.isEnabled = true;
              this.isLocked = false;
            }, (err) => {
              this.isEnabled = false;
              this.isLocked = false;
            });
          }
        });
      },
      );
      await this.show();
    }
    catch (ex) {
      if (ex.code === "UNAVAILABLE") {
        // if (ex.code === "UNAVAILABLE" && (this.dataService.Profile.Email === 'com2001@web.de' || this.dataService.Profile.Email === 'steffen.scholz@maerkischer-turnerbund.de')) {
        this.isEnabled = true;
        this.hide();
        if(this.dataProvider.Profile.UserKey === "") {
          this.dataProvider.Profile.UserKey = "9625b8b8-48fc-45e9-8c36-30ac595f2e7a";
        } else {
          this.dataProvider.Profile.DummyUserKey = "09e30373-7be0-4ae8-a5a3-7d419b31a247";
        }
        // Staging Longierhalle
        //this.dataService.Profile.PlaceKey = "b66db54b-9493-4cca-a239-8225cd1f5fd9";
        // localhost Longierhalle
        //this.dataService.Profile.PlaceKey = "15aa745c-ae33-452c-8e7b-3b66073db095";
        // localhost Reithalle
        
        //this.dataService.Profile.PlaceKey = "15aa745c-ae33-452c-8e7b-3b66073db095";
        // localhost New Reithalle
        this.dataProvider.Profile.PlaceKey = "e94e31f6-92e9-47bf-880d-9ab7ab7af8fb";
        this.placeName = 'Dummyplace';
        this.ownerName = 'Dummyowner';
      }
      console.log('Error is', ex);
    }
  }
}
