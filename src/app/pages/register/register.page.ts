import { Component, OnInit, NgZone } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BarcodeScanner, BarcodeFormat } from '@capacitor-mlkit/barcode-scanning';
import { TokenViewmodel } from "../../viewmodels/viewmodels";
import { DataService, ImageService } from "../../services/services";
import { UUID } from 'angular2-uuid';
import { Router } from '@angular/router';

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

  registerForm: FormGroup;

  constructor(
    private router: Router,
    public dataService: DataService,
    public imageService: ImageService,
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

  }

  onBack() {
    this.router.navigate(['/tabs']);
  }

  addPlace() {
    this.dataService.addPlace().then((response) => {
      if (response) {
        this.finish();
      } else {
        this.isEnabled = false;
      }
    });
  }

  signup() {
    if (this.dataService.Profile.UserKey === '' || this.dataService.Profile.UserKey === undefined) {
      this.dataService.Profile.UserKey = UUID.UUID();
    }
    this.dataService.saveProfile(this.dataService.Profile);
    this.dataService.savedirect().then((res: any) => {
      if (res.Result) {
        var token = res.User as TokenViewmodel;
        if (res.ErrorCode === this.dataService.ErrorCodes.Error_Message_User_Exists) {
          if (token !== null && token !== undefined) {
            this.dataService.saveToken(token);
            this.dataService.Profile.UserKey = token.UserKey;
            this.dataService.saveProfile(this.dataService.Profile);
          }
          this.router.navigate(['/pin-input']);
        } else {

          if (token !== null && token !== undefined) {
            this.dataService.saveToken(token);
            this.dataService.Profile.UserKey = token.UserKey;
            this.dataService.Profile.UserPin = token.UserPin;
            this.finish();
          }
        }

      } else {
        if (res.Message) {
          this.dataService.showMessage(res.Message, false);
        }
      }
    });
  }

  private finish() {
    this.dataService.Profile.IsRegistered = true;
    this.dataService.Profile.IsActive = true;
    this.dataService.saveProfile(this.dataService.Profile);
    this.dataService.loadProfile();
    this.navHome();
  }

  private navHome() {
    this.router.navigate(['tabs/']);
  }

  get IsEnabled(): boolean {
    return this.isEnabled;
  }

  showForm() {
    return !this.isVisible;
  };

  async hide() {
    // Remove all listeners
    await BarcodeScanner.removeAllListeners();

    // Stop the barcode scanner
    await BarcodeScanner.stopScan();
    window.document.querySelector('body')?.classList.remove('barcode-scanner-active');
    this.isVisible = false;
  }

  get PrivateMode(): boolean {
    return this.dataService.Profile.UserKey === '' || this.dataService.Profile.UserKey === undefined;
  }

  async scan() {
    try {
      if (this.isVisible) {
        this.hide();
        return;
      }
      window.document.querySelector('body')?.classList.add('barcode-scanner-active');
      const listener = await BarcodeScanner.addListener('barcodeScanned', async result => {
        this.zone.run(() => {
          console.log('Scanned: ', result.barcode);
          if (result.barcode && result.barcode.format === BarcodeFormat.QrCode) {
            this.isLocked = true;
            this.hide();
            if (this.dataService.Profile.UserKey === '' || this.dataService.Profile.UserKey === undefined) {
              this.dataService.Profile.UserKey = UUID.UUID();
            }
            this.dataService.getPlaceOwner(result.barcode.rawValue).then((result: any) => {
              this.dataService.Profile.PlaceKey = result.PlaceKey;
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
      await BarcodeScanner.startScan({ formats: [BarcodeFormat.QrCode] });
    }
    catch (ex) {
      if (ex.code === "UNAVAILABLE") {
        // if (ex.code === "UNAVAILABLE" && (this.dataService.Profile.Email === 'com2001@web.de' || this.dataService.Profile.Email === 'steffen.scholz@maerkischer-turnerbund.de')) {
        this.isEnabled = true;
        if(this.dataService.Profile.UserKey === "") {
          this.dataService.Profile.UserKey = "9625b8b8-48fc-45e9-8c36-30ac595f2e7a";
        } else {
          this.dataService.Profile.DummyUserKey = "09e30373-7be0-4ae8-a5a3-7d419b31a247";
        }
        // Staging Longierhalle
        //this.dataService.Profile.PlaceKey = "b66db54b-9493-4cca-a239-8225cd1f5fd9";
        // localhost Longierhalle
        //this.dataService.Profile.PlaceKey = "15aa745c-ae33-452c-8e7b-3b66073db095";
        // localhost Reithalle
        
        //this.dataService.Profile.PlaceKey = "15aa745c-ae33-452c-8e7b-3b66073db095";
        // localhost New Reithalle
        this.dataService.Profile.PlaceKey = "e94e31f6-92e9-47bf-880d-9ab7ab7af8fb";
        this.placeName = 'Dummyplace';
        this.ownerName = 'Dummyowner';
      }
      console.log('Error is', ex);
    }
  }
}
