import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Platform } from '@ionic/angular';
import { SplashScreen } from '@capacitor/splash-screen';
import { Router } from '@angular/router';
import { register } from 'swiper/element/bundle';
import { DataService, ImageService, StorageService } from './services/services';

//import { App, AppInfo } from '@capacitor/app';
register();

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {

  pages: any[];

  constructor(
    public dataProvider: DataService,
    private translate: TranslateService,
    private router: Router,
    public imageProvider: ImageService,
    public storageProvider: StorageService,
    public platform: Platform) {
    platform.ready().then(() => {
        SplashScreen.hide();
    });
    this.storageProvider.init( () => {

      this.start();
    });

  }

  public getTitle() {
    if (this.dataProvider.Profile?.DisplayName !== "") {
      return this.dataProvider.Profile?.DisplayName;
    } else {
      return this.dataProvider.Profile?.FirstName + " " + this.dataProvider.Profile?.Name;
    }
  }

  buildMenu() {
    this.translate.get([
      "MNU_HOME",
      "MNU_REGISTER",
      "MNU_ABOUT",
      "MNU_PROFILE",
      "MNU_HORSES",
      "MNU_IMPRINT",
      "MNU_PRIVACY",
      "MNU_LOGOUT",
      "MNU_LOGIN"
    ]).subscribe(
      (values) => {
        this.pages = [
          { title: values.MNU_HOME, url: '', icon: "home" },
          { title: values.MNU_PROFILE, url: 'tabs/tab1/profile', icon: "people" },
          { title: values.MNU_HORSES, url: 'tabs/tab1/horses', icon: "heart" },
          { title: values.MNU_REGISTER, url: 'tabs/tab1/register', icon: "finger-print" },
          { title: values.MNU_ABOUT, url: 'tabs/tab1/about', icon: "information-circle" },
          { title: values.MNU_IMPRINT, url: 'tabs/tab1/imprint', icon: "globe" },
          { title: values.MNU_PRIVACY, url: 'tabs/tab1/privacy', icon: "hand" },
          
        ];
        if(this.dataProvider.Profile.IsActive) {
          this.pages.push({ title: values.MNU_LOGOUT, url: 'tabs/tab1/logout', icon: "close-circle" })
        } else {
          this.pages.push({ title: values.MNU_LOGIN, url: 'tabs/tab1/logout', icon: "close-circle" })
        }
        
      });
  }

  initTranslate() {
    // Set the default language for translation strings, and the current language.
    this.translate.setDefaultLang('de');
    this.translate.addLangs(['en']);
    this.translate.use('de');
    // const browserLang = this.translate.getBrowserLang();

    // if (browserLang) {
    //   if (browserLang === 'zh') {
    //     const browserCultureLang = this.translate.getBrowserCultureLang();

    //     if (browserCultureLang.match(/-CN|CHS|Hans/i)) {
    //       this.translate.use('zh-cmn-Hans');
    //     } else if (browserCultureLang.match(/-TW|CHT|Hant/i)) {
    //       this.translate.use('zh-cmn-Hant');
    //     }
    //   } else {
    //     this.translate.use(this.translate.getBrowserLang());
    //   }
    // } else {
    //   this.translate.use('de'); // Set your language here
    // }
  }

  get profileImage(): string {
    return this.dataProvider.pathForImage(this.dataProvider.Profile?.ImageUrl, "user");
  }

  openProfile() {
    this.router.navigate(['/profile']);
  }

  openPage(page) {

    if (!this.dataProvider.Profile.IsActive ||
      (!this.dataProvider.Profile.EmailConfirmed && this.dataProvider.Profile.NumLogins > 5)) {
      this.router.navigate(['/profile']);
    } else {
      this.router.navigate(['/start']);
    }
  }

  start() {
    try {
      this.dataProvider.load( () => {
        this.dataProvider.loadHomeData();
        this.initTranslate();
        this.buildMenu();
        if (this.dataProvider.Profile.UserKey !== '' &&
        (this.dataProvider.Profile.Email === '' ||
          this.dataProvider.Profile.Email === undefined ||
          this.dataProvider.Profile.Email === null)) {
          console.log("No email... calling email page");
          this.router.navigate(['getemail/']);
          return;
        }
        if(this.dataProvider.Profile.UserKey === '') {
          this.getStartModus(false);
        } else {
          this.dataProvider.getuserstatus((result) => {
            this.getStartModus(result);
          });
        }

      });
    } catch (e) {
      this.getStartModus(false);
    }
  }

  getStartModus(doRefresh: boolean) {
    // registered, active and email confirmed - ok status
    if (this.dataProvider.Profile.EmailConfirmed && this.dataProvider.Profile.IsActive) {
      if (doRefresh) {
        this.dataProvider.refreshData(false).then(() => {
          return;
        });
      }
    }
    // not registered yet
    if (this.dataProvider.Profile.UserKey === '') {
      this.router.navigate(['register/']);
      return;
    }

     // registered but not active any more, try to re-enter
     if (!this.dataProvider.Profile.IsActive) {
      this.router.navigate(['logout/']);
      return;
    }

    // registered but not active any more, try to re-enter
    if (!this.dataProvider.Profile.EmailConfirmed && this.dataProvider.Profile.NumLogins > 5) {
      this.router.navigate(['profile/']);
      return;
    }
    // active but not yet email confirmed - hint page to confirm email
    if (!this.dataProvider.Profile.EmailConfirmed) {
      this.router.navigate(['confirmemail/']);
    }
  }

  // callErrorStart() {
  //   if (!this.dataProvider.Profile.IsRegistered) {
  //     this.router.navigate(['register/']);
  //   }
  // }
}
