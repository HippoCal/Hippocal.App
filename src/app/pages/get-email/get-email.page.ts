import { Component } from '@angular/core';
import { Platform } from '@ionic/angular';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { TokenViewmodel } from "src/app/viewmodels/viewmodels";
import { DataService } from "src/app/services/services";

@Component({
  selector: 'page-get-email',
  templateUrl: './get-email.page.html',
  styleUrls: ['./get-email.page.scss'],
})

export class GetEmailPage {

  public email: string;
  public unregisterBackButtonAction: any;

  emailForm: FormGroup;
  isReady: boolean;
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    public platform: Platform,
    public dataProvider: DataService,
    public formBuilder: FormBuilder) {
    this.resolveParams();
    this.emailForm = formBuilder.group({
      email: ['', Validators.compose([Validators.required, Validators.pattern('^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$')])]
    });
    this.isReady = false;
  }

  resolveParams() {
    this.route.queryParams.subscribe(params => {
      if (this.router.getCurrentNavigation().extras.state) {
        this.email = this.router.getCurrentNavigation().extras.state['email'];
      }
    });
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad GetEmailPage');
  }

  ionViewWillLeave() {
    this.unregisterBackButtonAction && this.unregisterBackButtonAction();
  }

  signup() {
    if (this.emailForm.valid) {

      this.dataProvider.setEmail(this.email).then(async (res: any) => {
        if (res.Result) {
          var token = res.User as TokenViewmodel;
          if (token !== null && token !== undefined) {
            this.dataProvider.saveToken(token);
            this.dataProvider.Profile.Email = token.EMail;
            this.dataProvider.Profile.UserKey = token.UserKey;
            this.dataProvider.Profile.UserPin = token.UserPin;
            this.dataProvider.Profile.IsRegistered = true;
            this.dataProvider.Profile.IsActive = true;
            this.dataProvider.Profile.NumLogins = 0;
            this.dataProvider.Profile.EmailConfirmed = false;
            this.dataProvider.saveProfile(this.dataProvider.Profile);
            this.isReady = true;
            this.dataProvider.refresh();
            this.finish();
          }
        } else {
          if (res.Message) {
            this.dataProvider.showMessage(res.Message, false);
          }
        }
      });
    }
  }

  private finish() {
    this.dataProvider.navigate('home', 'tab1');
  }
}
