import { Platform } from '@ionic/angular';
import { Injectable } from '@angular/core';
import { ProfileViewmodel, PlaceViewmodel, TokenViewmodel, HorseViewmodel, PlaceAppointmentsViewmodel, NewsViewmodel, HalfHourViewmodel, WeekViewmodel, AppointmentViewmodel, DayViewmodel } from "src/app/viewmodels/viewmodels";
import { RecordTypeEnum } from 'src/app/enums/enums';
import { ImageService, RestService, StorageService, ToastService } from '../services';
import { TranslateService } from '@ngx-translate/core';
import * as moment from 'moment';
import { UUID } from 'angular2-uuid';
import { Router } from '@angular/router';
import { ColorConst } from 'src/app/constants';
import { LocalNotifications, ScheduleOptions } from '@capacitor/local-notifications';
import { ImageViewmodel } from 'src/app/viewmodels/imageviewmodel';


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
  private profileImage: string = "";


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

  async modifyAppointment(appointment: AppointmentViewmodel) {
    await this.setNotification(appointment, true);
    return this.restProvider.modifyAppointment(appointment);
  }

  async clearAllNotifications() {
    await LocalNotifications.removeAllDeliveredNotifications();
  }

  async clearNotification(appointment: AppointmentViewmodel) {
    await LocalNotifications.cancel({ notifications: [{ id: appointment.Id }] });
  }

  async setNotification(appointment: AppointmentViewmodel, cancelFirst: boolean) {

    if (!this.Profile.NotificationsAllowed) return;
    await LocalNotifications.requestPermissions();
    if (cancelFirst) {
      this.clearNotification(appointment);
    }
    var text: string;
    var scheduleTime: Date = new Date(new Date(appointment.StartDate).getTime() - this.profile.NotificationDelay * 60000);
    var title: string = this.translate.instant("HEADER_NOTIFICATION");
    var startTimeText = this.formatDate(new Date(appointment.StartDate), "HH:mm");
    var endTime: Date = moment(appointment.StartDate).add(appointment.Duration, "minute").toDate();
    var endTimeText = this.formatDate(endTime, "HH:mm");
    if (AppointmentViewmodel.recordType(appointment) === RecordTypeEnum.Standard) {
      text = this.translate.instant("MSG_NOTIFICATION");
      text = text.replace("${placeName}", appointment.PlaceName);
      text = text.replace("${horse}", appointment.HorseName);
      text = text.replace("${text}", appointment.AppointmentName);
    } else if (AppointmentViewmodel.recordType(appointment) === RecordTypeEnum.Admin) {
      text = this.translate.instant("MSG_NOTIFICATION_EVENT");
      text = text.replace("${placeName}", appointment.PlaceName);
      text = text.replace("${text}", appointment.AppointmentName);
    }
    else if (AppointmentViewmodel.recordType(appointment) === RecordTypeEnum.Private) {
      text = this.translate.instant("MSG_NOTIFICATION_PRIVATE");
      text = text.replace("${text}", appointment.AppointmentName);
    }
    text = text.replace("${starttime}", startTimeText);
    text = text.replace("${endtime}", endTimeText);
    console.log(`Sending local notification text: ${text} title: ${title} when: ${scheduleTime} id: ${appointment.Id}`);

    await LocalNotifications.schedule({
      notifications: [
        {
          id: appointment.Id,
          title: title,
          body: text,
          schedule: { at: scheduleTime },
          iconColor: '#1ab749'
        }
      ]
    });
  }

  getuserstatus(callback: any, incNumLogins: boolean) {
    if (this.IsOnline && this.Profile !== undefined) {
      this.restProvider.getuserstatus(this.Profile.UserKey).then((result: any) => {
        if (result) {
          console.log('-getuserstatus: IsActive: ' + result.IsActive + ' EMailConfirmed: ' + result.EmailConfirmed + ' NumLogins: ' + result.NumLogins);
          if (incNumLogins) {
            this.Profile.NumLogins++;
          }
          this.Profile.EmailConfirmed = result.EmailConfirmed;
          this.Profile.IsActive = result.IsActive;
          this.setPlaces(result.Places);
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

  async setPlaces(places: any) {
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
      horses.forEach((horse: HorseViewmodel) => {
        if(!this.Profile.Horses.some( e => e.HorseKey === horse.HorseKey)) {
          this.Profile.Horses.push(horse);
        }
      });
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
            this.setPlaces(data.Places);
            this.setHorses(data.Horses);
            if (this.Profile.Places.length === 0) {
              this.isPrivate = true;
              if (this.Profile.Horses.length === 0 && this.Profile.HorseName !== '') {
                var horse: HorseViewmodel = new HorseViewmodel(this.Profile.HorseName, UUID.UUID());
                this.addModifyHorse(horse, true);
              }
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

  addModifyHorse(horse: HorseViewmodel, isNew: boolean) {
    horse.UserKey = this.Profile.UserKey;
    if(isNew) {
      this.Profile.Horses.push(horse);
    }
    
    if (this.IsOnline) {
      return this.restProvider.addModifyHorse(horse);
    } else {
      return this.offlineResponse();
    }
  }


  deleteHorse(horse: HorseViewmodel) {
    return this.restProvider.deleteHorse(horse).then((result) => {
      if (result) {
        var indexValue: number = -1;
        this.profile.Horses.forEach((horse, index) => {
          if (horse.HorseKey === horse.HorseKey) {
            indexValue = index;
            return;
          }
        });
        if (indexValue !== -1) {
          this.profile.Horses.splice(indexValue, 1)
        }
        this.saveProfile(this.profile);
      }
    })

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

  refreshData(doAll: boolean) {
    if (doAll) {
      this.getLocalAppointments();
    }
    if (this.IsOnline) {
      if (this.Profile === undefined) {
        setTimeout(() => {
          this.refreshOnline(doAll)
        }, 1000);
      }
      else {
        this.refreshOnline(doAll);
      }
    }
  }

  private refreshOnline(doAll: boolean) {
    if (doAll) {
      this.getuserstatus(() => { }, false);
    }
    this.loadHomeAppointments();
    this.loadNews();
  }

  loadHomeAppointments() {
    this.restProvider.getNextAppointments(this.Profile.UserKey, this.Profile.ShowEvents)
      .then((data: any) => {
        var apps = data as AppointmentViewmodel[];
        if (apps) {
          this.mergeAppintments(apps);
        }
      });
  }

  mergeAppintments(apps: AppointmentViewmodel[]) {
    this.appointments = apps;
    this.saveAppointments();
  }

  refresh() {
    this.refreshData(true);
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

  buildPlaceAppointments() {
    this.placeAppointments = [];
    var now = moment(new Date()).add(-1, 'days');
    var validAppointments = this.appointments.filter(e => moment(e.StartDate).isSameOrAfter(now));
    validAppointments = validAppointments.sort((a: any, b: any) => moment(a.StartDate).diff(moment(b.StartDate)))
    validAppointments.forEach((item: AppointmentViewmodel) => {
      var found: boolean = false;
      if (item.needsDelete === false || item.needsDelete === undefined) {
        this.placeAppointments.forEach(place => {
          if ((place.PlaceKey === item.PlaceKey && item.AppointmentType < 5) || (place.PlaceKey === '' && item.AppointmentType > 4)) {
            place.Appointments.push(item);
            found = true;
            return;
          }
        });
        if (!found) {
          if (AppointmentViewmodel.recordType(item) !== RecordTypeEnum.Private) {
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
    this.getWeekAppointments();
    this.loadWeek();
  }

  addAppointment(app: any) {
    var existing = this.appointments.filter(e => e.Id === app.Id);
    if (existing && existing.length === 0 || app.Id === 0) {
      this.appointments.push(app);
      this.saveAppointments();
    }
  }

  updateAppointment(app: AppointmentViewmodel) {
    var existing = this.appointments.filter(e => e.Id === app.Id);
    if (existing && existing.length !== 0) {
      var existingApp = existing[0];
      if (existingApp) {
        existingApp = AppointmentViewmodel.Merge(existingApp, app);
        this.saveAppointments();
      }
    }
  }

  refreshAppointmentId(app: AppointmentViewmodel, save: boolean) {
    var existing = this.appointments.filter(e => e.AppointmentType === app.AppointmentType && e.PlaceKey === app.PlaceKey && e.StartDate === app.StartDate && e.StartHour === app.StartHour && e.StartMinute === app.StartMinute);
    if (existing && existing.length !== 0) {
      existing[0].Id = app.Id;
      existing[0].IsDirty = app.IsDirty;
      if (save) {
        this.saveAppointments();
      }
    }
  }

  removeAppointment(app: AppointmentViewmodel, deleteFinal: boolean) {
    if (deleteFinal) {
      var indexValue: number = -1;
      this.appointments.forEach((item, index) => {
        if (item.Id === app.Id) {
          indexValue = index;
          return;
        }
      });
      if (indexValue !== -1) {
        this.appointments.splice(indexValue, 1)
      }
    } else {
      var existing = this.appointments.filter(e => e.Id === app.Id);
      if (existing && existing.length > 0) {
        existing[0].needsDelete = true;
      }
    }
    this.removeFromHalfHours(app);
  }

  removeFromHalfHours(app: AppointmentViewmodel) {
    this.halfHours.forEach((halfhour) => {
      var appIndex: number = -1;
      halfhour.Appointments.forEach((existing, index) => {
        if (existing.Id === app.Id) {
          appIndex = index;
          return;
        }
      });
      if (appIndex !== -1) {
        halfhour.Appointments.splice(appIndex, 1);
        this.getHalfHourColor(app, halfhour);
      }
    });
  }

  getUnsavedAppointments() {
    return this.appointments.filter(e => e.Id === 0);
  }

  getDeletedAppointments() {
    return this.appointments.filter(e => e.needsDelete === true);
  }

  getWeekAppointments() {
    var placeKey: string = '';
    if (this.Profile.CurrentPlace !== undefined && this.Profile.CurrentPlace !== null) {
      placeKey = this.Profile.CurrentPlace.PlaceKey;
    }

    var lastDay = moment(this.firstDay).endOf('week');
    var apps = this.appointments.filter((item) => {
      return (item.PlaceKey === placeKey || (item.PlaceKey === "" && AppointmentViewmodel.recordType(item) === RecordTypeEnum.Private)) &&
        (item.needsDelete === false || item.needsDelete === undefined) &&
        moment(item.StartDate).isSameOrAfter(this.firstDay) &&
        moment(item.StartDate).isSameOrBefore(lastDay);
    });
    this.setWeekAppointments(placeKey, apps);

  }

  setWeekAppointments(placeKey: string, apps: AppointmentViewmodel[]) {
    this.week = [];
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
  }

  loadWeek() {
    var placeKey: string = '';
    if (this.Profile.CurrentPlace !== undefined && this.Profile.CurrentPlace !== null) {
      placeKey = this.Profile.CurrentPlace.PlaceKey;
    }
    if (placeKey === '') return;
    this.loadWeekData(placeKey);
  }

  loadWeekData(placeKey: string) {

    this.getWeek(this.firstDay, placeKey, this.Profile.UserKey).then((result) => {
      var hasResult = false;
      if (result) {
        this.weekAppointments = <AppointmentViewmodel[]>result;
        this.addWeekAppointments()
        hasResult = true;
      }
      this.week = [];
      var apps = hasResult ? this.weekAppointments : this.appointments;
      this.setWeekAppointments(placeKey, apps);
    }, (err) => { });

  }

  private addWeekAppointments() {
    var hasChanges = false;
    this.weekAppointments.forEach((item) => {
      var existing = this.appointments.filter(e => e.Id === item.Id);
      if (existing && existing.length === 0) {
        this.appointments.push(item);
        hasChanges = true;
      }
    });
    if (hasChanges) {
      this.saveAppointments();
    }
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
    await this.storage?.get(this.PROFILE_KEY).then(async (value) => {
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
        await this.getHorseImages();
        this.IsLoaded = true;
      } catch (err) {
        this.profile = new ProfileViewmodel('', '');
      }
    });
  }

  private async getHorseImages() {
    this.profile.Horses.forEach(async (horse: HorseViewmodel) => {
      if (horse.LocalImage === '' || horse.LocalImage === null || horse.LocalImage === undefined) {
        var image = await this.imageProvider.get(horse.ImageUrl, horse.HorseKey, "horse", true, this.Profile.UserKey);
        if (image) {
          horse.LocalImage = image.data;
        }
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

  async getLocalAppointments() {
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

  async saveProfile(value: ProfileViewmodel) {
    if (value.UserKey !== '' && value.UserKey !== undefined) {
      if (value.Email === '' || value.Email === undefined) {
        var token = this.restProvider.Token;
        if (token !== null && token !== undefined) {
          value.Email = token.EMail;
        }
      }
      var horses: HorseViewmodel[] = [];
      value.Horses.forEach((horse) => {
        horse.UserKey = this.profile.UserKey;
        horses.push(HorseViewmodel.Clone(horse));
        horse.LocalImage = '';
      })
      await this.storage?.set(this.PROFILE_KEY, value);
      value.Horses = horses;
      this.profile = value;
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

  createPrivatePlace(setCurrentPlace: boolean): PlaceViewmodel {
    var privatePlace = new PlaceViewmodel(this.translate.instant('BTN_NEW_PRIVATEAPPOINTMENT'), '');
    privatePlace.OwnerName = this.translate.instant('BTN_NEW_PRIVATEAPPOINTMENT_DESCRIPTION');
    privatePlace.IsPrivate = true;
    if (setCurrentPlace) {
      this.Profile.CurrentPlace = privatePlace;
    }
    return privatePlace;
  }

  getMyAppointments(currentDate: Date) {
    this.currentDay = currentDate;
    if (!this.dayIsLoaded) {
      this.IsPrivate ? this.initPrivateDay() : this.initDay();
    }

    var placeKey: string = '';
    if (this.Profile.CurrentPlace !== undefined && this.Profile.CurrentPlace !== null) {
      placeKey = this.Profile.CurrentPlace.PlaceKey;
    }

    var apps = this.appointments.filter((item) => {
      return item.PlaceKey === placeKey &&
        (item.needsDelete === false || item.needsDelete === undefined) &&
        moment(item.StartDate).isSameOrAfter(currentDate) &&
        moment(item.StartDate).isSameOrBefore(moment(currentDate).add(1, 'days'));
    });
    if (apps) {
      this.pushAppointments(apps);
    }

  }

  // loads day data
  getAppointments(currentDate: Date) {
    if (!this.dayIsLoaded) {
      this.currentDay = currentDate;
      this.IsPrivate ? this.initPrivateDay() : this.initDay();
    }
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

  async getHorseImage(horseKey: string): Promise<ImageViewmodel> {
    
    var horses = this.Profile.Horses.filter( e => e.HorseKey === horseKey);
    if(horses && horses.length > 0) {
      var horse = horses[0];
      return await this.imageProvider.get(horse.ImageUrl, horseKey, "horse", true, this.Profile.UserKey);
    }
    return null;
  }

  async getProfileImage() {
    var image = await this.imageProvider.get(this.Profile.ImageUrl, this.Profile.UserKey, "user", true, this.Profile.UserKey);
    if (image) {
      this.profileImage = image.data;
    }
  }

  setMomentLocale() {
    //var momentLocale = this.Locale.substring(0, 2);
    moment.locale(this.Locale);
  }

  private setItemInHalfHour(item: AppointmentViewmodel, halfhour: HalfHourViewmodel) {

    if (halfhour.Appointments.some(e => e.Id === item.Id)) return;
    // standard
    if (AppointmentViewmodel.recordType(item) === RecordTypeEnum.Standard) {
      if (item.IsAnonymous) {
        item.UserName = this.translate.instant("LBL_ANONYMOUS");
        item.HorseName = this.translate.instant("LBL_ANONYMOUS");
      }
      halfhour.Appointments.push(item);
      this.getHalfHourColor(item, halfhour);
      // private
    } else if (AppointmentViewmodel.recordType(item) === RecordTypeEnum.Private) {
      halfhour.Appointments.push(item);
      halfhour.HasData = true;
    }
    else if(AppointmentViewmodel.recordType(item) === RecordTypeEnum.Other) {
      halfhour.Appointments.push(item);
      halfhour.HasData = true;
      if (this.Profile.CurrentPlace !== undefined && this.Profile.CurrentPlace !== null) {
        halfhour.CanCreate = halfhour.Date > new Date() &&
          this.profile.CurrentPlace.MaxCapacity > halfhour.Appointments.length;
      }
    }
    // admin
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


  private getHalfHourColor(item: AppointmentViewmodel, halfhour: HalfHourViewmodel) {
    var count = halfhour.Appointments.length > 0 ? halfhour.Appointments.filter(e => AppointmentViewmodel.recordType(e) !== RecordTypeEnum.Private).length : 0;
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
          (item.PlaceKey === this.Profile.CurrentPlace.PlaceKey || AppointmentViewmodel.recordType(item) === RecordTypeEnum.Private)) {
          this.setItemInHalfHour(item, halfhour);
        }
        if (this.isInRange(new Date(item.StartDate), new Date(halfhour.Date), item.Duration) &&
          (item.PlaceKey === this.Profile.CurrentPlace.PlaceKey || AppointmentViewmodel.recordType(item) === RecordTypeEnum.Private)) {
          this.setItemInHalfHour(item, halfhour);
        }
      } else {
        if (this.isTheSameTime(new Date(item.StartDate), new Date(halfhour.Date)) &&
          (AppointmentViewmodel.recordType(item) === RecordTypeEnum.Private)) {
          this.setItemInHalfHour(item, halfhour);
        }
        if (this.isInRange(new Date(item.StartDate), new Date(halfhour.Date), item.Duration) &&
          (AppointmentViewmodel.recordType(item) === RecordTypeEnum.Private)) {
          this.setItemInHalfHour(item, halfhour);
        }
      }
    });
  }

  pushAppointments(dayAppointments: AppointmentViewmodel[]) {
    this.halfHours.forEach(halfhour => {
      halfhour.DataLoaded = true;
      this.setHalfHourAppointments(dayAppointments, halfhour);
    });
  }

  refreshHalfHourAppointments(appointment: AppointmentViewmodel) {
    this.halfHours.forEach(halfhour => {
      halfhour.Appointments.forEach((existing, index) => {
        if (existing.Id === appointment.Id) {
          halfhour.Appointments.splice(index, 1);
        }
      });
    });
    var apps: AppointmentViewmodel[] = [];
    apps.push(appointment);
    this.pushAppointments(apps);
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

  async navigateNoTabs(url: string, extras?: any): Promise<boolean> {
    return this.router.navigate([url], extras);
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
    return this.Profile?.CurrentPlace.IsPrivate;
  }

  set DayIsLoaded(value: boolean) {
    this.dayIsLoaded = value;
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

  get ProfileImage(): string {
    return this.profileImage;
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
