import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Network } from '@capacitor/network';
import { Platform } from "@ionic/angular";
import { ProfileViewmodel, TokenViewmodel, HorseViewmodel, AppointmentViewmodel, DayViewmodel } from "src/app/viewmodels/viewmodels";
import { TokenService } from '../services';
import { TranslateService } from '@ngx-translate/core';
import { LoadingService } from '../services';
import { ToastService } from '../services';

@Injectable()
export class RestService {

  private toastVisible: boolean;
  private toastText: string;

  constructor(
    public http: HttpClient,

    public loadingSvc: LoadingService,
    public toastSvc: ToastService,

    public translate: TranslateService,
    public tokenProvider: TokenService,
    public platform: Platform) {
    this.toastVisible = false;
    this.tokenProvider.resetToken();
    Network.addListener('networkStatusChange', status => {
      this.isOnline = status.connected; 
    });
  }

  //private baseUrl = 'https://www.hippocal.de';
  //private baseUrl = window.location.origin;
  private baseUrl = "http://localhost:31894";
 
  //private baseUrl = "https://hippocalweb-2017-hippocalweb-2018.azurewebsites.net";
  //private baseUrl = "https://hippocalweb-2017-hippocalwebapi.azurewebsites.net";

  //private webUrl = "https://hippocalweb-2017-hippocalweb-2018.azurewebsites.net";
  //private webUrl = "https://www.hippocal.de";
  private webUrl = "http://localhost:31894";
  
  private apiUrl = this.baseUrl + '/api/mobileauth';
  //private apiUrl = this.baseUrl + '/api';

  private isOnline: boolean = true;
  private needsLoading: boolean = false;
  public OnConnect;

  private showLoading(msg: string) {
    this.needsLoading = true;
    this.loadingSvc.show(3000, msg);
  }

  
  loadProfile(userKey: string) {
    var url = this.apiUrl + '/getprofile';
    return this.get(url, false, true, true, { userKey: userKey });
  }

  loadToken(token: TokenViewmodel, showAnimation: boolean) {
    var url = this.apiUrl + '/gettoken';
    return this.post(url, token, showAnimation, false, true);
  }

  saveToken(token: TokenViewmodel) {
    return this.tokenProvider.saveToken(token);
  }

  resetToken() {
    return this.tokenProvider.resetToken();
  }

  loadNews(userKey: string, lastDate: Date) {
    var url = this.apiUrl + '/getnews';
    return this.post(url, { UserKey: userKey, LastDate: lastDate }, false, true, true);
  }

  loadOwnAppointments(userKey: string, withAdminEvents: boolean) {
    var url = this.apiUrl + '/ownappointments';
    return this.post(url, { UserKey: userKey, WithAdminEvents: withAdminEvents }, false, true, true );
  }

  loadOwnModifiedAppointments(lastUpdate: Date, userKey: string, withAdminEvents: boolean) {
    var url = this.apiUrl + '/ownmodifiedappointments';
    return this.post(url, { LastModified: lastUpdate, UserKey: userKey, WithAdminEvents: withAdminEvents }, false, true, true);
  }

  loadAdminAppointments(userKey: string) {
    var url = this.apiUrl + '/adminappointments';
    return this.post(url, { UserKey: userKey }, false, true, true);
  }

  loadModifiedAdminAppointments(lastUpdate: Date, userKey: string) {
    var url = this.apiUrl + '/modifiedadminappointments';
    return this.post(url, { LastModified: lastUpdate, UserKey: userKey }, false, true, true);
  }

  savedirect(data: ProfileViewmodel) {
    var url = this.apiUrl + '/savedirect';
    var body = { Data: data };
    return this.post(url, body, true, false, true);
  }

  register(data: TokenViewmodel) {
    var url = this.apiUrl + '/register';
    return this.post(url, data, true, false, true);
  }

  subscribeBack() {
    var url = this.apiUrl + '/subscribe';
    return this.get(url, true, true, true, { userKey: this.Token.UserKey });
  }

  unsubscribe() {
    var url = this.apiUrl + '/unsubscribe';
    return this.get(url, true, true, true, { userKey: this.Token.UserKey });
  }

  setEmail(data: ProfileViewmodel) {
    var url = this.apiUrl + '/setemail';
    var body = { Data: data };
    return this.post(url, body, true, false, true);
  }

  validatemail(data: TokenViewmodel) {
    var url = this.apiUrl + '/validatemail';
    return this.post(url, data, true, true, true);
  }

  validatepin(data: TokenViewmodel) {
    var url = this.apiUrl + '/validatepin';
    return this.post(url, data, true, true, true);
  }

  deletePlace(placeKey: string, userKey: string) {
    var url = this.apiUrl + '/deleteplace';
    return this.get(url, true, true, true, { userKey: userKey, placeKey: placeKey });
  }

  getPlaceOwner(token: string) {
    var url = this.apiUrl + '/placeowner';
    return this.get(url, true, false, true, { token: token });
  }

  modifyProfile(profile: any) {
    var url = this.apiUrl + '/addmodifyprofile';
    return this.post(url, profile, true, true, true);
  }

  getuserstatus(userKey: string) {
    var url = this.apiUrl + '/getuserstatus';
    return this.get(url, false, true, false, { userKey: userKey });
  }

  deactivateUser(userKey : string) {
    var url = this.apiUrl + '/deactivateuser';
    return this.get(url, true, true, true, { userKey: userKey });
  }

  activateUser(userKey: string) {
    var url = this.apiUrl + '/activateuser';
    return this.get(url, true, true, true, { userKey: userKey });
  }

  addPlace(profile: ProfileViewmodel) {
    var url = this.apiUrl + '/addplace';
    var body = { Data: profile };
    return this.post(url, body, true, true, true);
  }

  addHorse(horse: HorseViewmodel) {
    var url = this.apiUrl + '/addmodifyhorse';
    return this.post(url, horse, true, true, true);
  } 

  deleteHorse(horse: HorseViewmodel) {
    var url = this.apiUrl + '/deletehorse';
    return this.post(url, horse, true, true, true);
  }

  createAppointment(appointment: AppointmentViewmodel) {
    var url = this.apiUrl + '/createappointment';
    return this.post(url, appointment, true, true, true);
  }

  getPreviousAppointment(appointment: AppointmentViewmodel) {
    var url = this.apiUrl + '/getprevious';
    return this.post(url, appointment, true, true, true);
  }

  modifyAppointment(appointment: AppointmentViewmodel) {
    var url = this.apiUrl + '/modifyappointment';
    return this.post(url, appointment, true, true, true);
  }

  deleteAppointment(appointment: AppointmentViewmodel) {
    var url = this.apiUrl + '/delete';
    return this.post(url, appointment, true, true, true);
  }

  getDay(dt: Date, placeKey: string, userKey: string) {
    var url = this.apiUrl + '/dayappointments';
    return this.get<DayViewmodel>(url, true, true, false, { dt: dt.toDateString(), placeKey: placeKey, userKey: userKey });
  }

  getPrivateDay(dt: Date, userKey: string) {
    var url = this.apiUrl + '/privateAppointments';
    return this.get<DayViewmodel>(url, false, true, false, { dt: dt.toDateString(), userKey: userKey });
  }

  getWeek(dt: Date, placeKey: string, userKey: string, withEvents: boolean) {
    var url = this.apiUrl + '/weekappointments';
    return this.get<AppointmentViewmodel[]>(url, false, true, false, { dt: dt.toDateString(), placeKey: placeKey, userKey: userKey, withEvents: withEvents });
  }

  getNextAppointments(userKey: string, withEvents: boolean) {
    var url = this.apiUrl + '/next';
    return this.get<AppointmentViewmodel[]>(url, false, true, false, { userKey: userKey, withEvents: withEvents });
  }

  getText(key: string, locale: string) {
    var url = this.apiUrl + '/texte';
    return this.get(url, false, true, true, { key: key, locale: locale });
  }

  private hideLoading() {
    this.needsLoading = false;
    this.loadingSvc.hide();
  }

  private getHeader(useToken: boolean, showAnimation: boolean, callback: any) {
    this.tokenProvider.loadToken().then( (token) => {
      if (useToken && this.tokenProvider.Expired && token.UserKey !== '' && token.EMail !== '') {
        var getToken = new TokenViewmodel(token.UserKey, token.UserPin, "", token.EMail, 0);
        this.loadToken(getToken, showAnimation).then(data => {
          if (data !== undefined) {
            token = data as TokenViewmodel;
            this.saveToken(token);
            var header = this.AddHeaders(token, useToken);
            callback(header);
          } else {
            callback(null);
          }
        }, err => {
          callback(null);
        });
      } else {
        var header = this.AddHeaders(token, useToken);
        callback(header);
      }
    });
  }

  private AddHeaders(token: TokenViewmodel, useToken: boolean) {
    var header = null;
    if (useToken && token.Token !== '' && token.Token !== undefined && token.Token !== null) {
      header = new HttpHeaders({
        'Content-Type': 'application/json; charset=utf-8',
        'Authorization': 'Bearer ' + token.Token
      });
    } else {
      header = new HttpHeaders({
        'Content-Type': 'application/json; charset=utf-8'
      });
    }
    return header;
  }

  private get<T>(url: string, showAnimation: boolean, useToken: boolean, showError: boolean, params?: any) {
    if (showAnimation) {
      this.showLoading("MSG_LOADING");
    }
    return new Promise((resolve, reject) => {
      console.info('RestService: get from url: ' + url + ' params ' + params);
      this.getHeader(useToken, showAnimation,
        (headers: any) => {
          if (headers !== null) {
            let options = { headers: headers, params: params };
            return this.http.get<T>(url, options).subscribe({ next: (data) => {
                if (showAnimation) {
                  this.hideLoading();
                }
                resolve(data);
              },
              error: (err) => {
                if (showAnimation) {
                  this.hideLoading();
                }
                if (err.status === 0) {
                  if (showError) {
                    this.toastSvc.showMessage("MSG_NO_SERVER_CONN", "", true, "", 2000);
                  }
                }
                if (err.status === 403) {
                  this.toastSvc.showMessage("MSG_NO_SERVER_CONN", "", true, "", 2000);
                }
                reject(err);
              } });
          } else {
            return reject(null);
          }
        });
    });
  }

  private post(url: string, data: any, showAnimation: boolean, useToken: boolean, showError: boolean, params?: any) {

    if (showAnimation) {
      this.showLoading("MSG_LOADING");
    }
    return new Promise((resolve, reject) => {
      let body = JSON.stringify(data);
      console.info('RestService: post to url: ' + url + ' body ' + body);
      this.getHeader(useToken, showAnimation,
        (headers: any) => {
        if (headers !== null) {
          let options = { headers: headers, params: params };
          return this.http.post(url, body, options)
            .subscribe({ next: (res) => {
                if (showAnimation) {
                  this.hideLoading();
                }
                resolve(res);
              },
              error: (err) => {
                if (showAnimation) {
                  this.hideLoading();
                }
                if (err.status === 0) {
                  if (showError) {
                    this.toastSvc.showMessage("MSG_NO_SERVER_CONN", "", true, "", 2000);
                  }
                }
                if (err.status === 403) {
                  this.toastSvc.showMessage("MSG_NO_SERVER_CONN", "", true, "", 2000);
                }
                reject(err);
              }});
        } else {
          return reject(null);
        }
      });
    });
  }

  get IsOnline(): boolean {
    return this.isOnline;
  }

  get BaseUrl(): string {
    return this.baseUrl;
  }

  get WebUrl(): string {
    return this.webUrl;
  }

  get Token(): TokenViewmodel {
    return this.tokenProvider.token;
  }
}
