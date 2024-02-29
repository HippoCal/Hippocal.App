import { Component, ViewChild } from '@angular/core';
import { IonInput } from '@ionic/angular';
import { DataService, ImageService } from 'src/app/services/services';
import { TokenViewmodel } from "src/app/viewmodels/viewmodels";

@Component({
  selector: 'page-pin-input',
  templateUrl: './pin-input.page.html',
  styleUrls: ['./pin-input.page.scss']
})
export class PinInputPage {

  @ViewChild('Field1', {static: false}) field1!: IonInput;
  focusIsSet: boolean = false;

  pin: string = '';
  pin1: string = '';
  pin2: string = '';
  pin3: string = '';
  pin4: string = '';
  pin5: string = '';

  constructor(
    public dataProvider: DataService, public imageProvider: ImageService) {

  }

  gotoNextField(element, nextElement) {
    if(element.value !== '')
    {
      nextElement.setFocus();
    }
    
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad PinInputPage');
    this.setFocus();
  }


  public ngAfterViewChecked(): void { 
    this.setFocus();
  }

  validatepin() {
    this.pin = this.pin1 + this.pin2 + this.pin3 + this.pin4 + this.pin5;
    // var dummyToken = new TokenViewmodel(this.dataProvider.Profile.UserKey, this.pin, "", this.dataProvider.Profile.Email, 0);
    // this.dataProvider.saveToken(dummyToken);
    // this.dataProvider.Profile.UserPin = this.pin;
    this.dataProvider.saveProfile(this.dataProvider.Profile);
    this.dataProvider.register(this.pin).then((result: any) => {
      if (result !== undefined && result.Result) {
        var token = result.User as TokenViewmodel;
        if (token !== null && token !== undefined) {
          this.dataProvider.saveToken(token);
          this.dataProvider.Profile.UserKey = token.UserKey;
          this.dataProvider.Profile.UserPin = token.UserPin;
          this.dataProvider.Profile.EmailConfirmed = true;
          this.finish();
        }
      } else {
        if (result !== undefined && result.Message) {
          this.dataProvider.showMessage(result.Message, false);
        } else {
          this.dataProvider.showMessage('ERR_MSG_PINVALIDATION', true);
        }
      }
    });
  }

  private setFocus()
  {
    if (!this.focusIsSet) {
      this.field1.setFocus();
     // Disable focus on setTimeout()
      // Timeout needed for buggy behavior otherwise!
      setTimeout(() => {this.focusIsSet = true; }, 1000);
    }
  }
  private finish() {
    this.dataProvider.Profile.IsRegistered = true;
    this.dataProvider.Profile.IsActive = true;
    this.dataProvider.saveProfile(this.dataProvider.Profile);
    this.dataProvider.loadProfile();
    this.navHome();
  }

  private navHome() {
    this.dataProvider.navigate('home');
  }
}