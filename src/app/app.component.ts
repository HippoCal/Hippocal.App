import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Platform } from '@ionic/angular';
import { SplashScreen } from '@capacitor/splash-screen';
import { register } from 'swiper/element/bundle';
import { AppointmentService, DataService, ImageService, StorageService } from './services/services';
import { ProfileViewmodel } from './viewmodels/profileviewmodel';
import { TokenViewmodel } from './viewmodels/viewmodels';
import { environment } from '../environments/environment';

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
    public imageProvider: ImageService,
    public storageProvider: StorageService,
    public appointmentService: AppointmentService,
    public platform: Platform) {
    platform.ready().then(() => {
        SplashScreen.hide();
    });
    this.storageProvider.init( () => {

      this.start();
    });

  }

  public getTitle() {
    return ProfileViewmodel.GetTitle(this.dataProvider.Profile);
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
      //"MNU_LOGOUT",
      "MNU_LOGIN"
    ]).subscribe(
      (values) => {
        this.pages = [
          { title: values.MNU_HOME, url: '', icon: "home" },
          { title: values.MNU_PROFILE, url: 'tabs/tab1/profile', icon: "people" },
          // { title: values.MNU_HORSES, url: 'tabs/tab1/horses', icon: "heart" },
          { title: values.MNU_REGISTER, url: 'tabs/tab1/register', icon: "finger-print" },
          { title: values.MNU_ABOUT, url: 'tabs/tab1/about', icon: "information-circle" },
          { title: values.MNU_IMPRINT, url: 'tabs/tab1/imprint', icon: "globe" },
          { title: values.MNU_PRIVACY, url: 'tabs/tab1/privacy', icon: "diamond" },
          
        ];
        // if(this.dataProvider.Profile.IsActive) {
        //   this.pages.push({ title: values.MNU_LOGOUT, url: 'tabs/tab1/logout', icon: "close-circle" })
        // } else {
        //   this.pages.push({ title: values.MNU_LOGIN, url: 'tabs/tab1/logout', icon: "close-circle" })
        // }
        
      });
  }

  /**
   * Sprachwahl. Es existieren nur assets/i18n/de.json und en.json — deshalb
   * strikt auf diese beiden begrenzen. (Vorher konnte die Browsersprache z.B.
   * auf 'fr' oder 'zh-cmn-Hans' schalten, wofür es keine Datei gibt.)
   */
  private readonly LANG_KEY = '_lang';
  public readonly supportedLangs = ['de', 'en'];
  public currentLang = 'de';

  async initTranslate() {
    this.translate.setDefaultLang('de');
    this.translate.addLangs(this.supportedLangs);

    // Gespeicherte Wahl schlägt Browsersprache; sonst Browsersprache, sonst de.
    const stored = await this.storageProvider.get(this.LANG_KEY);
    const browser = this.translate.getBrowserLang() ?? '';
    const lang = this.supportedLangs.includes(stored)
      ? stored
      : this.supportedLangs.includes(browser)
        ? browser
        : 'de';

    this.currentLang = lang;
    this.translate.use(lang);
  }

  /** Sprachumschaltung aus dem Side-Menu. */
  async switchLanguage(lang: string) {
    if (!this.supportedLangs.includes(lang) || lang === this.currentLang) {
      return;
    }
    this.currentLang = lang;
    this.translate.use(lang);
    await this.storageProvider.set(this.LANG_KEY, lang);
    // Menütitel sind einmalig übersetzte Strings -> neu aufbauen.
    this.buildMenu();
    // Remote-Texte (/texte) werden pro Locale gecacht und beim nächsten Aufruf
    // in der neuen Sprache geladen.
  }

  openProfile() {
    this.dataProvider.navigate('profile', 'tab1');
  }

  openPage(page) {

    if (!this.dataProvider.Profile.IsActive ||
      (!this.dataProvider.Profile.EmailConfirmed && this.dataProvider.Profile.NumLogins > 5)) {
      this.dataProvider.navigate('profile', 'tab1');
    } else {
      this.dataProvider.navigate('home', 'tab1');
    }
  }

  start() {
    // Dev-Login (nur non-prod): ?devlogin=<userKey>:<pin> seedet Profile+Token
    // im Storage, damit man sich im Browser ohne QR-Scan anmelden kann.
    this.applyDevLogin().then(() => this.startCore())
  }

  /**
   * Nur im Dev-Build: liest ?devlogin=<userKey>:<pin>:<email> aus der URL und
   * legt Profile + Token so an, wie es sonst der QR-Scan täte.
   * Die E-Mail MUSS die echte des Users sein: /gettoken prüft
   * `(user.eMail ?? null) === (input.EMail ?? null)` — bei Abweichung kommt ein
   * leerer Token zurück und alle Folge-Calls laufen auf 401.
   * Users ohne E-Mail in der DB: dritten Teil weglassen. In Prod ein No-Op.
   */
  private async applyDevLogin(): Promise<void> {
    if (environment.production) { return }
    const dev = new URLSearchParams(window.location.search).get('devlogin')
    if (!dev) { return }
    // E-Mail kann selbst ':' enthalten -> Rest wieder zusammenfügen.
    const [userKey, pin, ...rest] = dev.split(':')
    if (!userKey) { return }
    const email = rest.join(':')

    // Reihenfolge ist wichtig: ZUERST den Token, DANN den UserKey ins Profil.
    // Sobald Profile.UserKey gesetzt ist, koennen andere Stellen (z.B. der
    // home.page-Konstruktor ueber refresh()) authentifizierte Requests
    // ausloesen — ohne bereits vorhandenen Token laufen die in ein 401.
    await this.dataProvider.saveToken(
      new TokenViewmodel(userKey, pin ?? '', '', email, 0),
    )

    const profile = this.dataProvider.Profile
    profile.UserKey = userKey
    profile.UserPin = pin ?? ''
    profile.Email = email
    profile.EmailConfirmed = true
    profile.IsActive = true
    profile.IsRegistered = true
    await this.dataProvider.saveProfile(profile)

    // Das geseedete Profil enthält weder Plätze noch Pferde — bei echten Nutzern
    // stehen die aus der Registrierung im Storage. loadProfile() holt beides per
    // /getprofile nach, sonst laufen Seiten wie create.page auf leere Horses.
    this.dataProvider.loadProfile()

    console.log('[devlogin] Token+Profile seeded for', userKey)
  }

  startCore() {
    try {
      this.dataProvider.load( () => {
        //this.dataProvider.getLocalHomeData();
        // initTranslate ist async (liest die gespeicherte Sprache) — buildMenu
        // MUSS danach laufen, sonst stehen die Menütitel in der alten Sprache.
        void this.initTranslate().then(() => this.buildMenu());
        this.dataProvider.getProfileImage();
        if (this.dataProvider.Profile.UserKey !== '' &&
        (this.dataProvider.Profile.Email === '' ||
          this.dataProvider.Profile.Email === undefined ||
          this.dataProvider.Profile.Email === null)) {
          console.log("No email... calling email page");
          this.dataProvider.navigate('getemail', 'tab1');
          return;
        }
        if(this.dataProvider.Profile.UserKey === '') {
          this.getStartModus(false);
        } else {
          this.dataProvider.getuserstatus((result) => {
            this.getStartModus(result);
          }, true);
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
        this.dataProvider.refreshData(false);
      }
    }
    // not registered yet
    if (this.dataProvider.Profile.UserKey === '') {
      this.dataProvider.navigateNoTabs('register');
      return;
    }

     // registered but not active any more, try to re-enter
     if (!this.dataProvider.Profile.IsActive) {
      this.dataProvider.navigate('logout', 'tab1');
      return;
    }

    // registered but not active any more, try to re-enter
    if (!this.dataProvider.Profile.EmailConfirmed && this.dataProvider.Profile.NumLogins > 5) {
      this.dataProvider.navigate('profile', 'tab1');
      return;
    }
    // active but not yet email confirmed - hint page to confirm email
    if (!this.dataProvider.Profile.EmailConfirmed) {
      this.dataProvider.navigate('confirm-email', 'tab1');
    }

  }



  // callErrorStart() {
  //   if (!this.dataProvider.Profile.IsRegistered) {
  //     this.dataProvider.navigate('register/']);
  //   }
  // }
}
