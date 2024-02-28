import { Injectable } from '@angular/core';

import { AppointmentViewmodel, HorseAppointmentsViewmodel, OwnAppointmentViewmodel, TypeAppointmentsViewmodel, IOwnAppointmentViewmodel, OwnAppointmentsViewmodel, TypeStatusViewmodel, ResultIdViewmodel, ProfileViewmodel } from "../../viewmodels/viewmodels";
import { JobTypeEnum, AppointmentTypeEnum } from '../../enums/enums';

import { DataService, StorageService } from '../services';
import { RestService } from '../services';

import { TranslateService } from '@ngx-translate/core';
import * as moment from 'moment';


@Injectable()
export class AppointmentService {

  public dt: any;
  public appointment: AppointmentViewmodel;
  private originalappointment: AppointmentViewmodel;

  private jobtypes: any = [];
  private standardJobtypes: any = [];
  private privateAppointmenttypes: any = [];
  private appointmenttypes: any = [];
  private selectedAppointmenttypes: any = [];

  private _ownAppointments: OwnAppointmentsViewmodel;

  private OWN_APPOINTMENTS_KEY: string = '_ownappointments';

  constructor(public storage: StorageService, public translate: TranslateService,
    public dataProvider: DataService,
    public restProvider: RestService) {
    this.initTypes();
    //this.loadOwnData();
  }

  initTypes() {
    this.translate.get([
      "JOBTYPE_OTHER",
      "JOBTYPE_DRESSAGE",
      "JOBTYPE_JUMPING",
      "JOBTYPE_LUNGING",
      "JOBTYPE_FREERIDING",
      "JOBTYPE_COURSE",
      "JOBTYPE_TRAINING",
      "JOBTYPE_WESTERN",
      "JOBTYPE_HORSEMANSHIP",
      "JOBTYPE_VAULTING",
      "JOBTYPE_MAINTENANCE",
      "APPOINTMENTTYPE_OTHER",
      "APPOINTMENTTYPE_TRAINING",
      "APPOINTMENTTYPE_COURSE",
      "APPOINTMENTTYPE_MAINTENANCE",
      "APPOINTMENTTYPE_DENTIST",
      "APPOINTMENTTYPE_BLACKSMITH",
      "APPOINTMENTTYPE_VACCINATION",
      "APPOINTMENTTYPE_VET",
      "APPOINTMENTTYPE_CUSTOM",
      "APPOINTMENTTYPE_SADDLER"
    ]).subscribe(
      (values) => {
        this.jobtypes = [
          { id: JobTypeEnum.Other, text: values.JOBTYPE_OTHER },
          { id: JobTypeEnum.Dressage, text: values.JOBTYPE_DRESSAGE },
          { id: JobTypeEnum.Jumping, text: values.JOBTYPE_JUMPING },
          { id: JobTypeEnum.Lunging, text: values.JOBTYPE_LUNGING },
          { id: JobTypeEnum.Maintenance, text: values.JOBTYPE_MAINTENANCE }
        ];
        this.appointmenttypes = [
          { id: AppointmentTypeEnum.Other, text: values.APPOINTMENTTYPE_OTHER },
          { id: AppointmentTypeEnum.Training, text: values.APPOINTMENTTYPE_TRAINING },
          { id: AppointmentTypeEnum.Course, text: values.APPOINTMENTTYPE_COURSE },
          { id: AppointmentTypeEnum.Maintenance, text: values.APPOINTMENTTYPE_MAINTENANCE }
        ];
        this.privateAppointmenttypes = [
          { id: AppointmentTypeEnum.Dentist, text: values.APPOINTMENTTYPE_DENTIST },
          { id: AppointmentTypeEnum.Blacksmith, text: values.APPOINTMENTTYPE_BLACKSMITH },
          { id: AppointmentTypeEnum.Vaccination, text: values.APPOINTMENTTYPE_VACCINATION },
          { id: AppointmentTypeEnum.Vet, text: values.APPOINTMENTTYPE_VET },
          { id: AppointmentTypeEnum.Custom, text: values.APPOINTMENTTYPE_CUSTOM },
          { id: AppointmentTypeEnum.Saddler, text: values.APPOINTMENTTYPE_SADDLER }
        ];
        this.standardJobtypes = [
          { id: JobTypeEnum.Other, text: values.JOBTYPE_OTHER },
          { id: JobTypeEnum.Dressage, text: values.JOBTYPE_DRESSAGE },
          { id: JobTypeEnum.Jumping, text: values.JOBTYPE_JUMPING },
          { id: JobTypeEnum.Lunging, text: values.JOBTYPE_LUNGING },
          { id: JobTypeEnum.FreeRiding, text: values.JOBTYPE_FREERIDING },
          { id: JobTypeEnum.Horsemanship, text: values.JOBTYPE_HORSEMANSHIP },
          { id: JobTypeEnum.Course, text: values.JOBTYPE_COURSE },
          { id: JobTypeEnum.Training, text: values.JOBTYPE_TRAINING },
          { id: JobTypeEnum.Western, text: values.JOBTYPE_WESTERN },
          { id: JobTypeEnum.Vaulting, text: values.JOBTYPE_VAULTING }
        ];
      });
    this.selectedAppointmenttypes = this.appointmenttypes;
  }

  getJobText(jobType: JobTypeEnum) {
    var jobTypes = this.standardJobtypes.filter( e => e.id == jobType);
    if(jobTypes && jobTypes.length > 0) {
      return jobTypes[0].text;
    }
    jobTypes = this.jobtypes.filter( e => e.id == jobType);
    if(jobTypes && jobTypes.length > 0) {
      return jobTypes[0].text;
    }
    return '';
  }

  decTime() {
    this.dt = moment(this.dt).add(-30, 'minutes');
  }

  incTime() {
    this.dt = moment(this.dt).add(30, 'minutes');
  }
  decDate() {
    this.dt = moment(this.dt).add(-1, 'days');
  }

  incDate() {
    this.dt = moment(this.dt).add(1, 'days');
  }

  setAppointment(data: AppointmentViewmodel) {
    this.appointment = this.clone(data);
    this.originalappointment = data;
  }

  loadOwnData() {
    this._ownAppointments = new OwnAppointmentsViewmodel();

    let result: OwnAppointmentsViewmodel = new OwnAppointmentsViewmodel();
    this.storage.get(this.OWN_APPOINTMENTS_KEY).then(data => {
      if (data !== undefined && data !== null) {
        result = <OwnAppointmentsViewmodel>data;
        this.restProvider.loadOwnModifiedAppointments(new Date(result.LastUpdated), this.dataProvider.Profile.UserKey, this.dataProvider.Profile.ShowEvents).then((data: IOwnAppointmentViewmodel[]) => {
          if (data !== null && data !== undefined) {
            data.forEach((item: IOwnAppointmentViewmodel) => {
              this.addOwnAppointment(item, result);
            });
            result.LastUpdated = new Date();
            var res = result.Appointments.sort((a: any, b: any) => a.Sd - b.Sd);
            result.Appointments = res;
            this._ownAppointments.Appointments = result.Appointments;
            this._ownAppointments.LastUpdated = result.LastUpdated;
            this._ownAppointments.HorseAppointments = result.HorseAppointments != undefined ? result.HorseAppointments : this._ownAppointments.HorseAppointments;
            this.saveOwnAppointments();
          }
        });
      } else {
        this.restProvider.loadOwnAppointments(this.dataProvider.Profile.UserKey, this.dataProvider.Profile.ShowEvents).then((data: IOwnAppointmentViewmodel[]) => {
          if (data !== null && data !== undefined) {
            result.Appointments = data.sort((a: any, b: any) => a.Sd - b.Sd);;
            result.LastUpdated = new Date();
            this._ownAppointments.Appointments = result.Appointments;
            this._ownAppointments.LastUpdated = result.LastUpdated;
            this._ownAppointments.HorseAppointments = result.HorseAppointments != undefined ? result.HorseAppointments : this._ownAppointments.HorseAppointments;
            this.saveOwnAppointments();
          }
        });
      }
    });
  }

  saveStatus(typeAppointment: TypeAppointmentsViewmodel, horseKey: string) {
    let found: boolean = false;
    if (this._ownAppointments.HorseAppointments !== undefined) {
      this._ownAppointments.HorseAppointments.forEach((item) => {
        if (item.AppointmentType === typeAppointment.AppointmentType && item.HorseKey === horseKey && item.JobType === typeAppointment.JobType) {
          item.Visible = typeAppointment.Visible;

        }
      });
    }
    if (!found) {
      let vm: TypeStatusViewmodel = new TypeStatusViewmodel();
      vm.AppointmentType = typeAppointment.AppointmentType;
      vm.JobType = typeAppointment.JobType;
      vm.Visible = typeAppointment.Visible;
      vm.HorseKey = horseKey;
      this._ownAppointments.HorseAppointments.push(vm);
    }
    this.saveOwnAppointments();
  }

  private clone(data: AppointmentViewmodel): AppointmentViewmodel {
    var app = new AppointmentViewmodel(data.UserKey,
      data.PlaceKey,
      data.PlaceName,
      data.StartDate,
      data.StartHour,
      data.StartMinute,
      data.UserName,
      data.Duration,
      data.JobType,
      data.AppointmentType);
    app.AppointmentName = data.AppointmentName;
    app.Id = data.Id;
    app.HorseName = data.HorseName;
    app.HorseKey = data.HorseKey;
    app.HorseImageUrl = data.HorseImageUrl;
    app.BlockPlace = data.BlockPlace;
    app.Color = data.Color;
    app.Comment = data.Comment;
    app.FreeSlots = data.FreeSlots;
    app.ImageUrl = data.ImageUrl;
    app.IsAnonymous = data.IsAnonymous;
    app.IsInTheFuture = data.IsInTheFuture;
    app.needsDelete = data.needsDelete;
    app.NumSlots = data.NumSlots;
    app.OwnAppointment = data.OwnAppointment;
    app.RecurrenceType = data.RecurrenceType;
    app.UserKey = data.UserKey;
    return app;
  }

  private setStatus(existing: TypeAppointmentsViewmodel, horseKey: string) {
    if (this._ownAppointments.HorseAppointments !== undefined) {
      this._ownAppointments.HorseAppointments.forEach((item) => {
        if (item.AppointmentType == existing.AppointmentType && item.JobType == existing.JobType && item.HorseKey == horseKey) {
          existing.Visible = item.Visible;
          return;
        }
      })
    }

  }

  private saveOwnAppointments() {
    this.storage.set(this.OWN_APPOINTMENTS_KEY, this._ownAppointments);
  }

  public getHorseAppointments(horseKey: string, callback) {
    let result: HorseAppointmentsViewmodel = new HorseAppointmentsViewmodel();
    result.HorseKey = horseKey;
    this._ownAppointments.Appointments.forEach((item: IOwnAppointmentViewmodel) => {
      if (item.Hk == horseKey) {
        this.addOwnHorseAppointment(item, result);
      }   
    });
    callback(result);
  }

  private removeAppointment(data: AppointmentViewmodel) {
    this.dataProvider.removeAppointment(data, true);
    this.dataProvider.saveAppointments();
  }

  private addOwnAppointment(data: IOwnAppointmentViewmodel, result: OwnAppointmentsViewmodel) {
    let ownAppointment: OwnAppointmentViewmodel = this.createOwnAppointment(data);
    let insert: boolean = true;
    result.Appointments.forEach((existingAppointment, index) => {
      if (existingAppointment.Id == ownAppointment.Id) {
        insert = false;
        result.Appointments[index] = data;
        return;
      }
    });
    if (insert) {
      result.Appointments.push(data);
    }
  }

  private addOwnHorseAppointment(data: IOwnAppointmentViewmodel, result: HorseAppointmentsViewmodel) {

    let ownAppointment: OwnAppointmentViewmodel = this.createOwnAppointment(data);
    let found: boolean = false;
    result.TypeAppointments.forEach((typeAppointment) => {
      if (typeAppointment.JobType === ownAppointment.JobType && typeAppointment.AppointmentType === ownAppointment.AppointmentType) {
        let insert: boolean = true;
        typeAppointment.Appointments.forEach((app, index) => {
          if (app.Id == ownAppointment.Id) {
            insert = false;
            typeAppointment.Appointments[index] = ownAppointment;
          }
        });
        if (insert) {
          typeAppointment.Appointments.push(ownAppointment);
          var res = typeAppointment.Appointments.sort((a: any, b: any) => a.StartDate - b.StartDate)
          typeAppointment.Appointments = res;
        }
        found = true;
      }
    })
    if (!found) {
      var newItem = new TypeAppointmentsViewmodel(ownAppointment.JobType, ownAppointment.AppointmentType);
      newItem.Appointments.push(ownAppointment);
      this.setStatus(newItem, data.Hk);
      result.TypeAppointments.push(newItem);
    }
  }

  private createOwnAppointment(data: IOwnAppointmentViewmodel):OwnAppointmentViewmodel {

    let ownAppointment: OwnAppointmentViewmodel = new OwnAppointmentViewmodel(data);
    if (ownAppointment.PlaceKey !== "" && ownAppointment.PlaceKey !== null) {
      this.dataProvider.Profile.Places.forEach((place) => {
        if (place.PlaceKey == ownAppointment.PlaceKey) {
          ownAppointment.PlaceName = place.Name;
        }
      });
    }
    return ownAppointment;
  }

  public toOwnAppointment(horseAppointments: AppointmentViewmodel): IOwnAppointmentViewmodel {
    let vm: IOwnAppointmentViewmodel = new IOwnAppointmentViewmodel();
    vm.An = horseAppointments.AppointmentName;
    vm.At = horseAppointments.AppointmentType;
    vm.Jt = horseAppointments.JobType;
    vm.Co = horseAppointments.Comment;
    vm.Du = horseAppointments.Duration;
    vm.Hk = horseAppointments.HorseKey;
    vm.Id = horseAppointments.Id;
    vm.Pk = horseAppointments.PlaceKey;
    vm.Pn = horseAppointments.PlaceName;
    vm.Sd = new Date(horseAppointments.StartDate);
    return vm;
  }

  refreshData(deleteNotification: boolean) {
    this.dataProvider.initWeek(this.dataProvider.CurrentDay);
  }

  public setHorseName(horseKey: string) {
    this.dataProvider.Profile.Horses.forEach(item => {
      if (item.HorseKey === horseKey) {
        this.appointment.HorseName = item.Name;
        this.appointment.HorseImageUrl = item.ImageUrl;
        return;
      }
    });
  }

  setData() {
    this.appointment.StartDate = this.dt;
    this.appointment.StartHour = moment(this.dt).hours();
    this.appointment.StartMinute = moment(this.dt).minutes();
    if (this.dataProvider.Profile.Horses.length === 1) {
      this.appointment.HorseKey = this.dataProvider.Profile.Horses[0].HorseKey;
      this.appointment.HorseName = this.dataProvider.Profile.Horses[0].Name;
      this.appointment.HorseImageUrl = this.dataProvider.Profile.Horses[0].ImageUrl;
      
    } else {
      this.setHorseName(this.appointment.HorseKey);
    }
  }

  create(refreshDay?: boolean, dt?: Date) {
    this.setData();
    this.dataProvider.addAppointment(this.appointment);
    this.createAppointment(this.appointment).then((result: ResultIdViewmodel) => {
      if (result.Result) {
        this.appointment.Id = result.Id;
        this.appointment.IsDirty = false;
        this.dataProvider.refreshAppointmentId(this.appointment, true);
        if(refreshDay) {
          this.dataProvider.getMyAppointments(dt);
        }
      } else {
        this.handleError(result.ErrorId);
      }
    });
  }
  
  syncAppointments() {
    var unsaved = this.dataProvider.getUnsavedAppointments();
    var hasChanges: boolean = false;
    if(unsaved && unsaved.length > 0) {
      unsaved.forEach( (item) => {
        this.createAppointment(item).then((result: ResultIdViewmodel) => {
          if (result.Result) {
            item.Id = result.Id;
            this.dataProvider.refreshAppointmentId(item, true);
            hasChanges = true;
          } 
        });
      });
    }
    var notDeleted = this.dataProvider.getDeletedAppointments();
    if(notDeleted && notDeleted.length > 0) {
      notDeleted.forEach( (item) => {
        this.deleteAppointment(item).then(() => {
            hasChanges = true;
        });
      });
    }
    if(hasChanges) {
      this.dataProvider.saveAppointments();
    }
  }

  delete(callback?: any, refreshDay?: boolean) {
    this.appointment.UserKey = this.dataProvider.Profile.UserKey;
    this.dataProvider.removeAppointment(this.appointment, false);
    this.dataProvider.saveAppointments();
    if(refreshDay) {
      this.dataProvider.getMyAppointments(this.dt)
    }
    
    this.deleteAppointment(this.appointment).then((result) => {
      if (result) {
        this.removeAppointment(this.appointment);
        this.refreshData(false);
        this.dataProvider.saveAppointments();
        if(callback) {
          callback();
        }
      } else {
        this.dataProvider.showMessage("ERR_NO_DELETE_APPOINTMENT", true);
      }
    });
  }

  save( initWeek?: boolean, firstDay?: Date) {
    this.setData();
    this.modifyAppointment().then((result: ResultIdViewmodel) => {
      if (result.Result) {
        this.appointment.IsDirty = false;
        this.dataProvider.updateAppointment(this.appointment);
        this.SetOriginalAppointment();
        return;
      } else {      
        this.dataProvider.removeAppointment(this.appointment, true);
        this.dataProvider.addAppointment(this.originalappointment);
        this.refreshLocal(this.originalappointment, initWeek, firstDay);
        this.handleError(result.ErrorId);
        return;
      }
    });      
    this.appointment.IsDirty = true;
    this.dataProvider.updateAppointment(this.appointment);
    this.refreshLocal(this.appointment, initWeek, firstDay);  
  }

  private refreshLocal(app: AppointmentViewmodel, initWeek?: boolean, firstDay?: Date) {
    setTimeout( () => {
      if(new Date(this.dt).getDate() === new Date(this.dataProvider.CurrentDay).getDate()) {
        this.dataProvider.refreshHalfHourAppointments(app);     
      }
      if(initWeek) {
        this.dataProvider.initWeek(firstDay);
      } 
  }, 200)
  }

  handleError(error: number) {
    if (error != undefined && error != null) {
      var errId = this.getAppointmentErrors(error);
      this.dataProvider.showMessage(errId, true);
    } else {
      this.dataProvider.showMessage("ERR_NO_SAVE_APPOINTMENT", true);
    }
  }

  public getDateText(): string {
    return this.formatDate(this.dt);
  }

  public getDurationText(): string {
    var toDate = moment(this.dt).add(this.appointment.Duration, 'minutes');
    return this.formatTime(this.dt) + " - " + this.formatTime(toDate) + " " + this.translate.instant("LBL_OCLOCK");
  }

  public getTimeText() {
    switch (this.appointment.Duration) {
      case 30: return "30min";
      case 60: return "1h";
      case 90: return "1,5h";
      case 120: return "2h";
      case 150: return "2,5h";
      case 180: return "3h";
      case 210: return "3,5h";
      case 240: return "4h";
      case 270: return "4,5h";
      case 300: return "5h";
      case 330: return "5,5h";
      case 360: return "6h";
      default:
        return "";
    }
  }

  public changeJobType() {

    switch (this.appointment.JobType) {
      case 1:
        this.selectedAppointmenttypes = this.appointmenttypes;
        break;
      default:
        this.selectedAppointmenttypes = [];
        this.appointmenttypes.forEach((item) => {
          if (item.id === 2 || item.id === 3) {
            this.selectedAppointmenttypes.push(item);
          }
        });
        this.appointment.AppointmentType = AppointmentTypeEnum.Training;
        break;
    }
  }

  public createAppointment(appointment: AppointmentViewmodel) {
    if (this.dataProvider.IsOnline) {
      return this.restProvider.createAppointment(appointment);
    } else {
      return this.dataProvider.offlineResponse();
    }
  }

  public SetOriginalAppointment() {
    this.originalappointment = this.appointment;
  }

  public async modifyAppointment() {
    if (this.dataProvider.IsOnline) {
      return this.restProvider.modifyAppointment(this.appointment);
    } else {
      return this.dataProvider.offlineResponse();
    }
  }

  public deleteAppointment(appointment: AppointmentViewmodel) {
    if (this.dataProvider.IsOnline) {
      return this.restProvider.deleteAppointment(appointment);
    } else {
      return this.dataProvider.offlineResponse();
    }
  }

  public getAppointmentErrors(errorId: number): string {
    switch (errorId) {
      case 2001:
        return "ERR_MAX_APPOINTMENTS_PER_PLACE_EXCEEDED";
      case 2002:
        return "ERR_MAX_APPOINTMENTS_PER_DAY_EXCEEDED"
      case 2003:
        return "ERR_USER_NOT_FOUND";
      case 2004:
        return "ERR_PLACE_NOT_FOUND";
      case 2005:
        return "ERR_APPOINTMENT_NOT_FOUND";
      case 2006:
        return "ERR_APPOINTMENT_TOO_EARLY";
      case 2007:
        return "ERR_APPOINTMENT_IN_THE_PAST";
      case 2008:
        return "ERR_APPOINTMENT_EXCEEDS_UPPER_BORDER";
      case 2009:
        return "ERR_APPOINTMENT_EXCEEDS_LOWER_BORDER";
      case 1000:
      default:
        return "ERR_UNKNOWN";
    }
  }

  getEventName() {
    var userName = ProfileViewmodel.GetTitle(this.dataProvider.Profile);
    var jobTypeName = this.getJobType(this.appointment.JobType);
    var appointmentTypeName = this.getAppointmentType(this.appointment.AppointmentType);

    switch (this.appointment.AppointmentType) {
      case AppointmentTypeEnum.Other:
        this.appointment.AppointmentName = appointmentTypeName;
        break;
      case AppointmentTypeEnum.Training:
      case AppointmentTypeEnum.Course:
        this.appointment.AppointmentName = jobTypeName + ": " + appointmentTypeName + " " + this.translate.instant("JOBNAME_FRAGMENT_WITH") + " " + userName;
        this.appointment.BlockPlace = false;
        this.appointment.FreeSlots = true;
        break;
      case AppointmentTypeEnum.Maintenance:
        this.appointment.AppointmentName = appointmentTypeName;
        this.appointment.BlockPlace = true;
        this.appointment.FreeSlots = false;
        break;
    }
  }

  getJobType(id: number) {
    var result = '';
    this.jobtypes.forEach((item) => {
      if (item.id === id) {
        result = item.text;
        return;
      }
    });
    return result;
  }

  getStandardJobType(id: number) {
    var result = 'Standard-Termin';
    this.standardJobtypes.forEach((item) => {
      if (item.id === id) {
        result = item.text;
        return;
      }
    });
    return result;
  }

  getPrivateAppointmentType(id: AppointmentTypeEnum) {
    var result = '';
    this.privateAppointmenttypes.forEach((item) => {
      if (item.id === id) {
        result = item.text;
        return;
      }
    });
    return result;
  }

  getAppointmentType(id: AppointmentTypeEnum) {
    var result = '';
    this.appointmenttypes.forEach((item) => {
      if (item.id === id) {
        result = item.text;
        return;
      }
    });
    return result;
  }

  getCaption(jobType: JobTypeEnum, appointmentType: AppointmentTypeEnum): string {

    if (appointmentType !== AppointmentTypeEnum.Standard) {
      return this.getPrivateAppointmentType(appointmentType);
    }
    return this.getStandardJobType(jobType);
  }

  formatDate(dt: string): string {
    return this.dataProvider.formatDate(new Date(dt), "dddd, LL");
  }

  formatTime(dt: any): string {
    return this.dataProvider.formatDate(new Date(dt), "HH:mm");
  }

  get JobTypes(): any {
    return this.jobtypes;
  }

  get StandardJobTypes(): any {
    return this.standardJobtypes;
  }

  get AppointmentTypes(): any {
    return this.selectedAppointmenttypes;
  }

  get PrivateAppointmentTypes(): any {
    return this.privateAppointmenttypes;
  }

  get OwnAppointments(): IOwnAppointmentViewmodel[] {
    return this._ownAppointments.Appointments;
  }

}
