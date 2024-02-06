import { Platform } from '@ionic/angular';
import { Injectable } from '@angular/core';
import { ProfileViewmodel, PlaceViewmodel, TokenViewmodel, HorseViewmodel, PlaceAppointmentsViewmodel, NewsViewmodel, HalfHourViewmodel, WeekViewmodel, AppointmentViewmodel, DayViewmodel } from "src/app/viewmodels/viewmodels";
import { AppointmentTypeEnum } from 'src/app/enums/enums';
import { ImageService, RestService, StorageService, ToastService } from '../services';
import { TranslateService } from '@ngx-translate/core';
import * as moment from 'moment';
import { UUID } from 'angular2-uuid';
import { Router } from '@angular/router';
import { ColorConst } from 'src/app/constants';


@Injectable()
export class DataService {

  private PROFILE_KEY: string = '_profile';
  private APPOINTMENT_KEY: string = '_appointment';
  private NEWS_KEY: string = '_news';
  private locale: string = '';

  private currentTab: string = 'tab1';
  public IsLoaded: boolean;

  private profile: ProfileViewmodel;

  private appointments: AppointmentViewmodel[] = [];
  private weekAppointments: AppointmentViewmodel[] = [];
  private news: NewsViewmodel[] = [];
  private unreadNews: NewsViewmodel[] = [];
  private halfHours: HalfHourViewmodel[] = [];
  private placeAppointments: PlaceAppointmentsViewmodel[] = [];
  private week: WeekViewmodel[] = [];
  private currentDay: Date;
  private firstDay: Date;
  private weekString: string;
  private remoteText: string = "";
  private unreadMessages: number = 0;
  private dayIsLoaded: boolean = false;
  private toWeek: boolean = false;
  private isPrivate: boolean = false;
  private MaxFreeLogins: number = 5;


  constructor(
    public translate: TranslateService,
    public toastSvc: ToastService,
    public storage: StorageService,
    public restProvider: RestService,
    public imageProvider: ImageService,
    private router: Router,
    public platform: Platform) {

    this.IsLoaded = false;

    this.getLocale();
    this.setMomentLocale();
    this.currentDay = new Date();
  }

  getUUID() {
    return UUID.UUID();
  }

  getDay(dt: Date, placeKey: string, userKey: string) {
    if (this.IsOnline) {
      if (!this.IsPrivate) {
        return this.restProvider.getDay(dt, placeKey, userKey);
      } else {
        return this.restProvider.getPrivateDay(dt, userKey);
      }
    } else {
      return this.offlineResponse();
    }
  }


  getWeek(dt: Date, placeKey: string, userKey: string) {
    if (this.IsOnline) {
      return this.restProvider.getWeek(dt, placeKey, userKey, this.Profile.ShowEvents);
    } else {
      return this.offlineResponse();
    }
  }

  clearAllNotifications() {
    // Todo: Fix it
    // if (this.platform.is('cordova')) {
    //   cordova.plugins.notification.local.clearAll();
    // }
  }

  setNotification(appointment: AppointmentViewmodel, onlyCancel: boolean) {
    if (this.platform.is('cordova')) {
      var text: string;
      var startTime: Date = new Date(new Date(appointment.StartDate).getTime() - this.profile.NotificationDelay * 60000);
      if (appointment.AppointmentType === AppointmentTypeEnum.Standard) {
        text = this.translate.instant("MSG_NOTIFICATION");

        text = text.replace("${placeName}", appointment.PlaceName);
        text = text.replace("${horse}", appointment.HorseName);
      } else if (appointment.AppointmentType > 0 && appointment.AppointmentType < 5) {
        text = this.translate.instant("MSG_NOTIFICATION_EVENT");
        text = text.replace("${placeName}", appointment.PlaceName);
        text = text.replace("${text}", appointment.HorseName);
      }
      else if (appointment.AppointmentType > 5) {
        text = this.translate.instant("MSG_NOTIFICATION_PRIVATE");
        text = text.replace("${text}", appointment.AppointmentName);
      }
      text = text.replace("${time}", this.formatDate(new Date(appointment.StartDate), "HH:mm"));

      let notification = {
        id: appointment.Id,
        title: this.translate.instant("HEADER_NOTIFICATION"),
        text: text,
        at: startTime,
        icon: 'https://www.hippocal.de/content/images/hippocal.png'
      };
      // Todo: Fix it
      // cordova.plugins.notification.local.clear(notification.id,
      //   () => {
      //     if (!onlyCancel) {
      //       cordova.plugins.notification.local.schedule(notification);
      //     }
      //   });
    }
  }

  getuserstatus(callback: any) {
    if (this.IsOnline) {
      this.restProvider.getuserstatus(this.Profile.UserKey).then((result: any) => {
        if (result) {
          console.log('-getuserstatus: IsActive: ' + result.IsActive + ' EMailConfirmed: ' + result.EmailConfirmed + ' NumLogins: ' + result.NumLogins);
          this.Profile.NumLogins = result.NumLogins;
          this.Profile.EmailConfirmed = result.EmailConfirmed;
          this.Profile.IsActive = result.IsActive;
          this.setPLaces(result.Places);
          if (this.Profile.Places.length === 0) {
            this.isPrivate = true;
          }
          this.saveProfile(this.Profile);
        }
        return callback(true);
      }, (err) => {
        return callback(false);
      });
    } else {
      return callback(false);
    }
  }

  deactivateUser() {
    if (this.IsOnline) {
      return this.restProvider.deactivateUser(this.Profile.UserKey);
    } else {
      return this.offlineResponse();
    }
  }

  public getDefaultImage(type: any): string {
    return this.imageProvider.pathForImage("", type, "");
  }

  public pathForImage(img: any, type: any): string {
    return this.imageProvider.pathForImage(img, type, "");
  }

  activateUser() {
    if (this.IsOnline) {
      return this.restProvider.activateUser(this.Profile.UserKey);
    } else {
      return this.offlineResponse();
    }
  }

  async setPLaces(places: any) {
    if (places !== null) {
      this.Profile.Places = [];
      var localImage: string = this.imageProvider.getDefaultImage("places");
      places.forEach((item: any) => {
        var newPlace = new PlaceViewmodel(
          item.Name,
          item.PlaceKey,
          item.OwnerName,
          item.FirstHour,
          item.LastHour,
          item.MaxCapacity,
          item.ImageUrl,
          localImage,
          item.IsAdmin
        );
        newPlace.Description = item.Description;
        newPlace.WeeksBookingInFuture = item.WeeksBookingInFuture;
        newPlace.BusinessHours = this.getBusinessHours(item.BusinessHours, item.FirstHour, item.LastHour);
        newPlace.BookableTo = item.WeeksBookingInFuture !== -1 ? this.formatDate(moment(new Date()).add(item.WeeksBookingInFuture, 'weeks').toDate(), "dddd, LL") : this.translate.instant("LBL_INFINITE");
        this.Profile.Places.push(newPlace);

        if (this.Profile.CurrentPlace !== undefined && this.Profile.CurrentPlace !== null) {
          if (this.Profile.CurrentPlace.PlaceKey === newPlace.PlaceKey) {
            this.Profile.CurrentPlace = PlaceViewmodel.Clone(newPlace);
          }
        }
      });
      this.saveProfile(this.Profile);
      if (this.Profile.Places.length === 1) {
        this.Profile.CurrentPlace = PlaceViewmodel.Clone(this.Profile.Places[0]);
      }
    }
  }


  async setHorses(horses: HorseViewmodel[]) {
    if (horses !== null) {
      var tmphorses: HorseViewmodel[] = [];
      var localImage: string = this.getDefaultImage("horse");
      horses.forEach((item: HorseViewmodel) => {
        this.Profile.Horses.forEach((horse: HorseViewmodel) => {
          if (horse.HorseKey == item.HorseKey) {
            item.Appointments = horse.Appointments;
          }
        });
        var newHorse = new HorseViewmodel(
          item.Name,
          item.HorseKey,
          item.ImageUrl,
          localImage,
        );
        newHorse.Appointments = item.Appointments;
        tmphorses.push(newHorse);
      });
      this.Profile.Horses = tmphorses;
      this.saveProfile(this.Profile);
    }
  }


  private getBusinessHours(businessHours, start, end): any[] {
    var result: any[] = [];
    try {
      var i: number;
      if (businessHours !== '' && businessHours !== undefined && businessHours !== null) {
        var daySplit = businessHours.split('|');
        i = 1;
        daySplit.forEach((dayItem: any) => {
          var hourSplit = dayItem.split(';');
          if (hourSplit.length === 2) {
            var startSplit = hourSplit[0].split(':');
            var endSplit = hourSplit[1].split(':');
            if (startSplit.length === 2 && endSplit.length === 2) {
              var startHour: number = startSplit[0] as number;
              var startMinute: number = startSplit[1] as number;
              var endHour: number = endSplit[0] as number;
              var endMinute: number = endSplit[1] as number;
              var businessHourText = this.formatTime(startHour, startMinute, 'HH:mm') +
                ' - ' +
                this.formatTime(endHour, endMinute, 'HH:mm') +
                " " +
                this.translate.instant("LBL_OCLOCK");
              result.push({
                dayName: moment.weekdays(i),
                businessHourText: businessHourText,
                startHour: startHour,
                startMinute: startMinute,
                endHour: endHour,
                endMinute: endMinute
              });
            }
            i++;
            if (i > 6) {
              i = 0;
            }
          }
        });
      } else {
        i = 1;
        for (var j = 0; j < 7; j++) {
          var startHour: number = start;
          var endHour: number = end;
          var businessHourText = this.formatTime(startHour, "00", 'HH:mm') +
            ' - ' +
            this.formatTime(endHour, "00", 'HH:mm') +
            " " +
            this.translate.instant("LBL_OCLOCK");
          result.push({
            dayName: moment.weekdays(i),
            businessHourText: businessHourText,
            startHour: startHour,
            startMinute: 0,
            endHour: endHour,
            endMinute: 0
          });
          i++;
          if (i > 6) {
            i = 0;
          }
        }
      }
    }
    finally { }
    return result;
  }

  loadProfile(callback?: any): void {
    if (this.IsOnline) {
      var userKey = this.Profile.UserKey;
      if (userKey === '' || userKey === undefined) {
        var token = this.restProvider.Token;
        if (token !== undefined && token !== null) {
          userKey = token.UserKey;
        }
      }
      if (userKey === '' || userKey === undefined) {
        if (callback) {
          callback();
        }
      }
      this.restProvider.loadProfile(userKey).then((response: any) => {
        if (response !== null && response !== undefined) {
          var data: any = response;
          if (data.IsValid && data.Data.UserKey === userKey) {
            this.Profile.ImageUrl = data.Data.Image;
            this.Profile.DisplayName = data.Data.DisplayName;
            this.Profile.UserKey = data.Data.UserKey;
            this.setHorses(data.Horses);
            this.setPLaces(data.Places);
            if (this.Profile.Places.length === 0) {
              this.isPrivate = true;
            }
            this.Profile.IsRegistered = this.Profile.UserKey !== '' && this.Profile.UserKey === userKey;
            this.saveProfile(this.Profile);
            if (callback) {
              callback();
            }
          }
        }
      }, (err) => {
        console.log(err);
        if (callback) {
          callback();
        }
      });
    }
  }

  modifyProfile(profile: ProfileViewmodel) {
    if (this.IsOnline) {
      var minProfile = {
        'Name': profile.Name,
        'FirstName': profile.FirstName,
        'UserKey': profile.UserKey,
        'Image': profile.ImageUrl,
        'DisplayName': profile.DisplayName,
        'IsPublicProfile': profile.IsPublicProfile
      };
      return this.restProvider.modifyProfile(minProfile);
    } else {
      return this.offlineResponse();
    }
  }

  addPlace() {
    if (this.IsOnline) {
      return this.restProvider.addPlace(new ProfileViewmodel(this.Profile.UserKey, this.Profile.PlaceKey));
    } else {
      return this.offlineResponse();
    }
  }

  addHorse(horse: HorseViewmodel) {
    horse.UserKey = this.Profile.UserKey;
    this.Profile.Horses.push(horse);
    if (this.IsOnline) {
      return this.restProvider.addHorse(horse);
    } else {
      return this.offlineResponse();
    }
  }


  deleteHorse(horse: HorseViewmodel) {
    if (this.IsOnline) {
      return this.restProvider.deleteHorse(horse);
    } else {
      return this.offlineResponse();
    }

  }

  loadNews(callback?: any) {
    this.storage?.get(this.NEWS_KEY).then(data => {
      if (data !== undefined && data !== null) {
        this.news = data as NewsViewmodel[];
      }
    });
    if (this.IsOnline) {
      this.restProvider.loadNews(this.Profile.UserKey, new Date(this.Profile.LastNewsRefresh))
        .then(async (data: any) => {
          if (data !== undefined && data !== null && data.Data.length > 0) {
            this.Profile.LastNewsRefresh = new Date(data.LastDate);
            var list = data.Data as NewsViewmodel[];
            if (list !== null && list !== undefined) {
              list.forEach(item => {
                item.downloaded = false;
                item.isNew = true;
                var exists: boolean = false;
                this.news.forEach((existing: NewsViewmodel) => {
                  if (existing.NewsEntryKey === item.NewsEntryKey) {
                    exists = true;
                    existing.Headline = item.Headline;
                    existing.isNew = true;
                    existing.Name = item.Name;
                    existing.Text = item.Text;
                    if (existing.ImageUrl !== item.ImageUrl) {
                      existing.ImageUrl = item.ImageUrl;
                      existing.downloaded = false;
                      item.LocalImage = this.getDefaultImage("news");
                    }
                  }
                });
                if (!exists) {
                  item.LocalImage = this.getDefaultImage("news");
                  this.news.push(item);
                }
              });

              this.saveProfile(this.Profile);
            }
          }
          this.saveNews();
          if (callback !== undefined) {
            callback();
          }
        }, (err) => { });
    }
  }

  saveNews() {
    this.getUnreadMessages();
    this.storage?.set(this.NEWS_KEY, this.news);
  }

  getUnreadMessages() {
    this.unreadMessages = 0;
    this.unreadNews = [];
    this.news.forEach((item) => {
      if (item.isNew) {
        this.unreadMessages++;
        this.unreadNews.push(item);
      }
    });
  }

  getThumbUrl(news: NewsViewmodel) {

    var url: string = this.restProvider.WebUrl + "/api/media/";
    var split = news.ImageUrl.split('.');
    return url + news.NewsEntryKey + "/" + split[1] + "/thumb_" + split[0];
  }

  deleteNews(news: NewsViewmodel) {
    var newList: NewsViewmodel[] = [];
    this.news.forEach(item => {
      if (item.NewsEntryKey !== news.NewsEntryKey ||
        (item.NewsEntryKey === news.NewsEntryKey && item.LastModification !== news.LastModification)) {
        newList.push(item);
      } else {
        if (item.ImageUrl !== "") {
          // Todo: fix it  
          //this.imageProvider.deleteImage(item.ImageUrl);
        }
      }
    });
    this.news = newList;
    this.saveNews();
  }

  loadHomeData() {
    this.loadAppointments().then(() => {
      this.initDay();
      this.saveAppointments();
    });
  }

  refreshData(doAll: boolean) {
    if (doAll) {
      this.loadHomeData();
    }
    this.loadNews();
    if (this.IsOnline) {
      if (doAll) {
        this.getuserstatus(() => { });
      }
      return this.restProvider.getNextAppointments(this.Profile.UserKey, this.Profile.ShowEvents)
        .then((data: any) => {
          if (data !== undefined) {
            this.appointments = <AppointmentViewmodel[]>data;
            this.saveAppointments();
            if (this.currentDay !== undefined) {
              this.getAppointments(this.currentDay);
              return this.onlineReponse();
            }
          }
          return this.offlineResponse(true);
        }, (err) => {
          return this.onlineReponse();
        });
    } else {
      return this.onlineReponse();
    }
  }

  refresh() {
    return this.refreshData(true);
  }

  private onlineReponse() {
    return new Promise((resolve, reject) => {
      resolve(true);
      reject(true);
    });
  }

  public offlineResponse(showMessage?: boolean) {
    if (showMessage) {
      this.showMessage("MSG_NO_NOT_ONLINE", true);
    }
    return new Promise((resolve, reject) => {
      resolve(false);
      reject(false);
    });
  }

  private buildPlaceAppointments() {
    this.placeAppointments = [];
    this.appointments.forEach(item => {
      var found: boolean = false;
      if (!item.needsDelete) {
        this.placeAppointments.forEach(place => {
          if (place.PlaceKey === item.PlaceKey && item.AppointmentType < 5) {
            place.Appointments.push(<AppointmentViewmodel>item);
            found = true;
            return;
          } else if (place.PlaceKey === '' && item.AppointmentType > 4) {
            place.Appointments.push(item);
            found = true;
            return;
          }
        });
        if (!found) {
          if (item.AppointmentType < 5) {
            let newPlace: PlaceAppointmentsViewmodel = { PlaceKey: item.PlaceKey, PlaceName: item.PlaceName, Appointments: [] };
            newPlace.Appointments.push(item);
            this.placeAppointments.push(newPlace);
          } else {
            let privatePlace: PlaceAppointmentsViewmodel = { PlaceKey: '', PlaceName: this.translate.instant("LBL_PRIVATE_APPOINTMENTS"), Appointments: [] };
            privatePlace.Appointments.push(item);
            this.placeAppointments.push(privatePlace);
          }

        }
      }
    });

  }

  initWeek(currentDay: Date) {

    this.currentDay = currentDay;

    var firstDay = moment(this.currentDay).startOf('week');
    var lastDay = moment(this.currentDay).endOf('week');
    this.firstDay = firstDay.toDate();
    this.weekString = this.formatDate(this.firstDay, "L") + ' - ' + this.formatDate(lastDay.toDate(), "L");
    this.week = [];
    for (var i = 0; i < 7; i++) {
      var dt: Date = this.addDays(this.firstDay, i);
      this.week.push(new WeekViewmodel(this.formatDate(dt, "ddd DD.MM"), i));
    }
    this.loadWeekData();
  }

  loadWeekData() {
    var placeKey: string = '';
    if (this.Profile.CurrentPlace !== undefined && this.Profile.CurrentPlace !== null) {
      placeKey = this.Profile.CurrentPlace.PlaceKey;
    }
    this.getWeek(this.firstDay, placeKey, this.Profile.UserKey).then((result) => {
      var hasResult = false;
      if (result) {
        this.weekAppointments = <AppointmentViewmodel[]>result;
        hasResult = true;
      }
      this.week = [];
      var apps = hasResult ? this.weekAppointments : this.appointments;
      for (var i = 0; i < 7; i++) {
        var dayAppointments = [];
        var dt: Date = this.addDays(this.firstDay, i);
        var hasData: boolean = false;
        apps.forEach(item => {
          if (this.isTheSameDate(new Date(item.StartDate), dt) && (item.PlaceKey === placeKey || item.PlaceKey === '')) {
            dayAppointments.push(item);
            hasData = true;
          }
        });
        let weekDay: WeekViewmodel = new WeekViewmodel(this.formatDate(dt, "ddd DD.MM"), i, dayAppointments, hasData);
        this.week.push(weekDay);
      }
    }, (err) => { });

  }

  private addDays(date: Date, days: number): Date {
    var result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  saveAppointments() {
    this.storage?.set(this.APPOINTMENT_KEY, this.appointments);
    this.buildPlaceAppointments();
  }

  async getProfileFromStorage() {
    await this.storage?.get(this.PROFILE_KEY).then((value) => {
      try {
        if (value !== null && value !== undefined) {
          this.profile = value;
          if (this.Profile.CurrentPlace !== undefined && this.Profile.CurrentPlace !== null) {
            if (this.profile.CurrentPlace.IsAdmin === undefined) {
              this.profile.CurrentPlace.IsAdmin = false;
            }
          }
          if (this.Profile.Places.length === 0) {
            this.isPrivate = true;
          }
          if (this.profile.IsPublicProfile === undefined) {
            this.profile.IsPublicProfile = true;
          }
          if (this.profile.NumLogins === undefined) {
            this.profile.NumLogins = 0;
          }
          if (this.profile.EmailConfirmed === undefined) {
            this.profile.EmailConfirmed = false;
          }
          if (this.profile.ShowEvents === undefined) {
            this.profile.ShowEvents = true;
          }
        } else {
          this.profile = new ProfileViewmodel('', '');
        }
        this.IsLoaded = true;
      } catch (err) {
        this.profile = new ProfileViewmodel('', '');
      }
    });
  }

  async getAppointmentsFromStorage() {
    await this.storage?.get(this.APPOINTMENT_KEY).then((value) => {
      if (value && this.appointments.length === 0) {
        this.appointments = value;
      }
    });
  }

  async load(callback?: any) {
    this.getProfileFromStorage().then(() => {
      callback();
    });
  }

  async loadAppointments() {
    if (!this.storage.isReady) {
      setTimeout(() => {
        this.getAppointmentsFromStorage();
      }, 1000);
    } else {
      this.getAppointmentsFromStorage();
    }
  }

  saveToken(token: TokenViewmodel) {
    return this.restProvider.saveToken(token);
  }

  resetToken() {
    return this.restProvider.resetToken();
  }

  subscribeBack() {
    if (this.IsOnline) {
      return this.restProvider.subscribeBack(this.Profile.UserKey)
        .catch(reason => {
          this.showMessage('ERR_MSG_UNSUBSCRIBE', true);
        });
    } else {
      return this.offlineResponse();
    };
  }

  unsubscribe() {
    if (this.IsOnline) {
      return this.restProvider.unsubscribe(this.Profile.UserKey)
        .catch(reason => {
          this.showMessage('ERR_MSG_UNSUBSCRIBE', true);
        });
    } else {
      return this.offlineResponse();
    };
  }

  register(userPin: string) {
    if (this.IsOnline) {
      let tokenViewmodel = new TokenViewmodel('', userPin, '', this.Profile.Email, 0);
      return this.restProvider.register(tokenViewmodel)
        .catch(reason => {
          this.showMessage('ERR_MSG_PINVALIDATION', true);
        });
    } else {
      return this.offlineResponse();
    };
  }

  savedirect() {
    if (this.IsOnline) {
      return this.restProvider.savedirect(this.profile)
        .catch(reason => {
          this.showMessage(reason.message, false);
        });
    } else {
      return this.offlineResponse();
    };
  }

  setEmail(email: string) {
    if (this.IsOnline) {
      var tmpprofile = new ProfileViewmodel(this.profile.UserKey, "", email);
      return this.restProvider.setEmail(tmpprofile)
        .catch(reason => {
          this.showMessage(reason.message, false);
        });
    } else {
      return this.offlineResponse();
    };
  }

  validatepin(data: TokenViewmodel) {
    if (this.IsOnline) {
      return this.restProvider.validatepin(data)
        .catch(reason => {
          this.showMessage(reason.message, false);
        });
    } else {
      return this.offlineResponse();
    };
  }

  validatemail(data: TokenViewmodel) {
    if (this.IsOnline) {
      return this.restProvider.validatemail(data)
        .catch(reason => {
          this.showMessage(reason.message, false);
        });
    } else {
      return this.offlineResponse();
    };
  }

  deletePlace(placeKey: string, userKey: string) {
    return this.restProvider.deletePlace(placeKey, userKey);
  }

  getPlaceOwner(token: string) {
    return this.restProvider.getPlaceOwner(token);
  }

  toggleActive(isActive: boolean) {
    this.profile.IsActive = isActive;
    this.saveProfile(this.profile);
  }

  saveProfile(value: ProfileViewmodel): void {
    if (value.UserKey !== '' && value.UserKey !== undefined) {
      if (value.Email === '' || value.Email === undefined) {
        var token = this.restProvider.Token;
        if (token !== null && token !== undefined) {
          value.Email = token.EMail;
        }
      }
      this.profile = value;
      this.storage?.set(this.PROFILE_KEY, this.profile);
    }
  }

  showMessage(message: string, useTranslation: boolean) {
    this.toastSvc.showMessage(message, '', useTranslation);
  }

  setCurrentPlace(placeKey: any) {
    this.Profile.Places.forEach((item: PlaceViewmodel) => {
      if (item.PlaceKey === placeKey) {
        this.Profile.CurrentPlace = PlaceViewmodel.Clone(item);
        return;
      }
    });
  }

  // loads day data
  getAppointments(currentDate: Date) {
    this.currentDay = currentDate;
    this.dayIsLoaded = false;
    this.IsPrivate ? this.initPrivateDay() : this.initDay();
    if (this.IsOnline) {
      var placeKey: string = ''
      if (this.Profile.CurrentPlace !== undefined && this.Profile.CurrentPlace !== null) {
        placeKey = this.Profile.CurrentPlace.PlaceKey;
      }
      this.getDay(this.currentDay, placeKey, this.Profile.UserKey)
        .then(data => {
          if (data !== undefined && !this.dayIsLoaded) {
            var day: DayViewmodel = <DayViewmodel>data;
            if (day !== null) {
              if (day.PlaceName !== undefined && day.PlaceName !== "" && day.PlaceName !== null) {
                if (this.Profile.CurrentPlace.WeeksBookingInFuture !== day.WeeksBookingInFuture || this.Profile.CurrentPlace.MaxCapacity != day.NumSlots) {
                  this.Profile.CurrentPlace.WeeksBookingInFuture = day.WeeksBookingInFuture;
                  this.Profile.CurrentPlace.BookableTo = day.WeeksBookingInFuture !== -1 ? this.formatDate(moment(new Date()).add(day.WeeksBookingInFuture, 'weeks').toDate(), "dddd, LL") : this.translate.instant("LBL_INFINITE");
                  this.Profile.CurrentPlace.MaxCapacity = day.NumSlots;
                  this.saveProfile(this.Profile);
                }
              }
              if (day.Appointments !== undefined) {
                this.pushAppointments(day.Appointments);
                this.dayIsLoaded = true;
                return this.onlineReponse();
              }
            }
          }
          return this.offlineResponse();
        }, (err) => {
          return this.offlineResponse();
        });
      return this.offlineResponse();
    } else {
      return this.offlineResponse();
    }
  }

  formatDate(dt: Date, formate: string): string {
    return moment.parseZone(dt).locale(this.Locale).format(formate);
  }

  getText(key: string) {
    this.remoteText = "";
    this.storage?.get(key).then((value) => {
      if (value) {
        this.remoteText = value;
        return value;
      } else {
        return this.restProvider.getText(key, this.Locale).then((result) => {
          if (result !== "" && result !== undefined && result !== null) {
            this.remoteText = result.toString();
            this.storage?.set(key, result.toString());
          }
        });
      }
    }).catch((error) => {
      console.log('error: ', error);
      return '';
    });
  }

  setToWeek(value: boolean) {
    this.toWeek = value;
  }

  setIsPrivate(value: boolean) {
    this.isPrivate = value;
  }

  getHeader(header: string) {
    return this.IsOnline ? this.translate.instant(header) : this.translate.instant('HEADER_OFFLINE');
  }

  private initDay() {
    this.halfHours = [];
    var firstHour: number = 0;
    var lastHour: number = 23;
    var firstMinute: number = 0;
    var lastMinute: number = 0;
    try {
      if (this.Profile.CurrentPlace !== undefined && this.Profile.CurrentPlace !== null) {
        firstHour = this.Profile.CurrentPlace.FirstHour;
        lastHour = this.Profile.CurrentPlace.LastHour;
        if (this.Profile.CurrentPlace.BusinessHours !== null && this.Profile.CurrentPlace.BusinessHours !== undefined) {
          if (this.Profile.CurrentPlace.BusinessHours.length > 0) {
            var dayNumber: number = moment(this.currentDay).isoWeekday();
            var dayData = this.Profile.CurrentPlace.BusinessHours[dayNumber - 1];
            firstHour = dayData.startHour as number;
            lastHour = dayData.endHour as number;
            firstMinute = dayData.startMinute as number;
            lastMinute = dayData.endMinute as number;
          }
        }
      }
    }
    finally {
      var startTime = this.getTime(firstHour, firstMinute).add(-1, 'minutes');
      var time = this.getTime(firstHour, firstMinute);
      var endTime = this.getTime(lastHour, lastMinute);
      while (time.isBetween(startTime, endTime)) {
        this.pushHalfHour(moment(time).hour(), moment(time).minute());
        time = moment(time).add(30, 'minutes');
      }
    }
  }

  private initPrivateDay() {
    this.halfHours = [];
    var firstHour: number = 0;
    var lastHour: number = 24;
    var firstMinute: number = 0;
    var lastMinute: number = 0;

    var startTime = this.getTime(firstHour, firstMinute).add(-1, 'minutes');
    var time = this.getTime(firstHour, firstMinute);
    var endTime = this.getTime(lastHour, lastMinute);
    while (time.isBetween(startTime, endTime)) {
      this.pushHalfHour(moment(time).hour(), moment(time).minute());
      time = moment(time).add(30, 'minutes');
    }

  }

  private pushHalfHour(hour: number, minute: number) {

    var dt: Date = new Date(this.currentDay.getFullYear(),
      this.currentDay.getMonth(),
      this.currentDay.getDate(),
      hour,
      minute);
    var canCreate: boolean = dt >= new Date();
    if (this.Profile.CurrentPlace !== undefined && this.Profile.CurrentPlace !== null) {
      if (this.Profile.CurrentPlace.WeeksBookingInFuture !== -1 && !this.IsPrivate) {
        var lastDay: Date = new Date();
        lastDay.setDate(new Date().getDate() + this.Profile.CurrentPlace.WeeksBookingInFuture * 7);
        canCreate = (dt >= new Date(moment.now()) && dt <= lastDay);
      } else {
        canCreate = (dt >= new Date(moment.now()))
      }
    }
    this.halfHours.push(new HalfHourViewmodel(this.formatDate(dt, "HH:mm"), dt, canCreate, this.dayIsLoaded));
  }

  private getLocale() {
    this.locale = "de-DE";
  }

  setMomentLocale() {
    //var momentLocale = this.Locale.substring(0, 2);
    moment.locale(this.Locale);
  }

  private setItemInHalfHour(item: AppointmentViewmodel, halfhour: HalfHourViewmodel) {

    if (item.AppointmentType === 0) {
      if (item.IsAnonymous) {
        item.UserName = this.translate.instant("LBL_ANONYMOUS");
        item.HorseName = this.translate.instant("LBL_ANONYMOUS");
      }
      halfhour.Appointments.push(item);
      var count = halfhour.Appointments.length > 0 ? halfhour.Appointments.filter(e => e.IsPrivate === false).length : 0;
      halfhour.HasData = true;
      halfhour.CanCreate = true;
      if (this.Profile.CurrentPlace !== undefined && this.Profile.CurrentPlace !== null) {
        if (this.Profile.CurrentPlace.WeeksBookingInFuture !== -1) {
          var lastDay: Date = new Date();
          lastDay.setDate(new Date().getDate() + this.Profile.CurrentPlace.WeeksBookingInFuture * 7);
          halfhour.CanCreate = halfhour.Date >= new Date(moment.now()) &&
            halfhour.Date < lastDay &&
            this.profile.CurrentPlace.MaxCapacity > count;
        } else {
          halfhour.CanCreate = halfhour.Date >= new Date(moment.now()) &&
            this.profile.CurrentPlace.MaxCapacity > count;
        }
      }
    } else if (item.AppointmentType > 4) {
      halfhour.Appointments.push(item);
      halfhour.HasData = true;
    }
    else {
      halfhour.Caption = item.AppointmentName;
      halfhour.HasEvent = true;
      halfhour.Color = "#0f5524";
      halfhour.CanCreate = true;
      if (this.Profile.CurrentPlace !== undefined && this.Profile.CurrentPlace !== null) {
        halfhour.CanCreate = halfhour.Date > new Date() &&
          this.profile.CurrentPlace.MaxCapacity > halfhour.Appointments.length &&
          !item.BlockPlace;
      }
    }
    if (halfhour.CanCreate) {
      halfhour.BackgroundColor = item.Color ? item.Color : ColorConst.COL_BACK_DAY;
    } else {
      halfhour.BackgroundColor = ColorConst.COL_BACK_DAY_CLOSED;
    }

  }

  private setHalfHourAppointments(dayAppointments: AppointmentViewmodel[], halfhour: HalfHourViewmodel) {

    dayAppointments.forEach(item => {
      if (this.Profile.CurrentPlace !== undefined && this.Profile.CurrentPlace !== null) {
        if (this.isTheSameTime(new Date(item.StartDate), new Date(halfhour.Date)) &&
          (item.PlaceKey === this.Profile.CurrentPlace.PlaceKey || item.AppointmentType > 4)) {
          this.setItemInHalfHour(item, halfhour);
        }
        if (this.isInRange(new Date(item.StartDate), new Date(halfhour.Date), item.Duration) &&
          (item.PlaceKey === this.Profile.CurrentPlace.PlaceKey || item.AppointmentType > 4)) {
          this.setItemInHalfHour(item, halfhour);
        }
      } else {
        if (this.isTheSameTime(new Date(item.StartDate), new Date(halfhour.Date)) &&
          (item.AppointmentType > 4)) {
          this.setItemInHalfHour(item, halfhour);
        }
        if (this.isInRange(new Date(item.StartDate), new Date(halfhour.Date), item.Duration) &&
          (item.AppointmentType > 4)) {
          this.setItemInHalfHour(item, halfhour);
        }
      }
    });
  }

  private pushAppointments(dayAppointments: AppointmentViewmodel[]) {
    this.halfHours.forEach(halfhour => {
      halfhour.DataLoaded = true;
      this.setHalfHourAppointments(dayAppointments, halfhour);
    });
  }

  private formatTime(hour: any, minute: any, format: any) {

    return moment(hour.toString() + minute.toString(), "hmm").format(format);
  }

  private getTime(hour: any, minute: any) {

    var format = 'hh:mm:ss';
    return moment(hour.toString() + ':' + minute.toString() + ':00', format);
  }

  private isInRange(d1: Date, d2: Date, duration: number) {

    var time = this.getTime(moment(d2).hour(), moment(d2).minute());
    var beforeTime = this.getTime(moment(d1).hour(), moment(d1).minute());
    var endTime = moment(d1).add(duration, 'minutes');
    var afterTime = this.getTime(endTime.hour(), endTime.minute());

    return time.isBetween(beforeTime, afterTime);

  }

  private isTheSameTime(d1: Date, d2: Date) {
    return moment(d1).hour() === moment(d2).hour() && moment(d1).minute() === moment(d2).minute();
  }

  private isTheSameDate(d1: Date, d2: Date) {
    return moment(d1).isSame(moment(d2), "day");
  }

  async navigate(url: string, tab?: string, extras?: any): Promise<boolean> {
    if (tab) {
      this.currentTab = tab;
    }
    return this.router.navigate([`tabs/${this.currentTab}/${url}`], extras);
  }

  get Profile(): ProfileViewmodel {
    return this.profile;
  }

  get FreeLogins(): number {
    return this.MaxFreeLogins - this.profile.NumLogins;
  }

  get PlaceAppointments(): PlaceAppointmentsViewmodel[] {
    return this.placeAppointments;
  }

  get DayData(): HalfHourViewmodel[] {
    return this.halfHours;
  }

  get NowInPlaceData(): HalfHourViewmodel[] {
    var returnValue: HalfHourViewmodel[] = [];
    this.halfHours.forEach((item) => {
      var hour = moment(new Date(item.Date)).hour();
      var currentHour = moment().hour();
      if (hour === currentHour || hour - 1 === currentHour || hour + 1 === currentHour) {
        returnValue.push(item);
      }
    });
    return returnValue;
  }

  get CurrentDay(): Date {
    return this.currentDay;
  }

  get FirstDay(): Date {
    return this.firstDay;
  }

  get WeekData(): WeekViewmodel[] {
    return this.week;
  }

  get WeekString(): any {
    return this.weekString;
  }

  get News(): NewsViewmodel[] {
    return this.news;
  }

  get UnreadNews(): NewsViewmodel[] {
    return this.unreadNews;
  }

  get IsOnline(): boolean {
    return this.restProvider.IsOnline;
  }

  get ToWeek(): boolean {
    return this.toWeek;
  }

  get IsPrivate(): boolean {
    return this.isPrivate;
  }

  get DayIsLoaded(): boolean {
    return this.dayIsLoaded;
  }

  get HasPlaces(): boolean {
    return this.Profile?.Places?.length !== 0;
  }

  get BaseUrl(): string {
    return this.restProvider.BaseUrl;
  }

  get Locale(): string {
    return this.locale;
  }

  get RemoteText(): string {
    return this.remoteText;
  }

  setCurrentTab(tab: string) {
    this.currentTab = tab;
  }


  get ErrorCodes(): any {
    return {
      Error_Message_No_EMail: "3003",
      Error_Message_User_Exists: "3004",
      Error_Message_No_User: "3005",
      Error_Message_No_Place: "3006",
      Error_Message_Error: "3007"
    }
  }
  get UnreadMessages(): number {
    return this.unreadMessages;
  }

  get BusinessHours(): string {
    if (this.Profile.CurrentPlace !== undefined && this.Profile.CurrentPlace !== null) {
      var text = this.translate.instant("LBL_BUSINESSHOURS");
      text = text.replace("${start}", this.Profile.CurrentPlace.FirstHour.toString());
      text = text.replace("${finish}", (this.Profile.CurrentPlace.LastHour).toString());

    }
    return text;
  }

}
