import { Component, NgZone, OnInit } from '@angular/core';
import { NavigationExtras  } from '@angular/router';
import { DataService, ImageService } from 'src/app/services/services';
import * as moment from 'moment';
import { TranslateService } from '@ngx-translate/core';
import { AppointmentViewmodel } from 'src/app/viewmodels/appointmentviewmodel';
import { PlaceViewmodel } from 'src/app/viewmodels/placeviewmodel';

@Component({
  selector: 'app-week',
  templateUrl: '././week.page.html',
  styleUrls: ['./week.page.scss'],
})
export class WeekPage implements OnInit {

 private firstDay: Date;
 public privatePlace: PlaceViewmodel;
 public color: string;

  constructor(
    public dataProvider: DataService, 
    public imageService: ImageService, 
    private zone: NgZone, 
    private translate: TranslateService) {
    this.firstDay = moment(new Date()).toDate();
    this.dataProvider.initWeek(this.firstDay);
    this.createPrivatePlace();
  }

  ionViewWillEnter() { 
    this.dataProvider.setCurrentTab('tab3');
  };

  ngOnInit() {
    console.log('Load Week');
  }

  public swipe(event: any) {
    if (event.direction === 4) {
      this.previousWeek();
    } else if (event.direction === 2) {
      this.nextWeek();
    }
  }

  async createPrivatePlace() {
    if(this.dataProvider.Profile.CurrentPlace.IsPrivate) {
      this.privatePlace = new PlaceViewmodel(this.dataProvider.Profile.CurrentPlace.Name, '');
      this.privatePlace.OwnerName = this.dataProvider.Profile.CurrentPlace.OwnerName;
      this.privatePlace.LocalImage = await this.placeImage();
      this.color = 'secondary-contrast';
    } else {
      this.privatePlace = this.dataProvider.Profile.CurrentPlace;
    }

  }
  
  public previousWeek(): void {
    var newDay = moment(this.dataProvider.CurrentDay.valueOf()).add(-7, 'days');
    this.firstDay = newDay.toDate();
    this.dataProvider.initWeek(this.firstDay);
  }

  public nextWeek(): void {

    var newDay = moment(this.dataProvider.CurrentDay.valueOf()).add(7, 'days');
    this.firstDay = newDay.toDate();
    this.dataProvider.initWeek(this.firstDay);
  }

  public onnowinplace() {
    this.dataProvider.navigate('nowinplace');
  }

  public onSelectDay(day: any) {
    var dt: Date = this.addDays(this.dataProvider.FirstDay, day.Offset);
    let navigationExtras: NavigationExtras = {
      state: {
        day: dt,
      }
    };
    this.dataProvider.navigate('day', '', navigationExtras);
  }

  public onShowEvent(appointment: AppointmentViewmodel) {
    if(appointment.IsPrivate){
      let navigationExtras: NavigationExtras = {
        state: {
          dt: appointment.StartDate,
          appointment: appointment
        }
      };
      this.dataProvider.navigate('privateappointment','', navigationExtras);
    } else if (appointment.OwnAppointment) {
      var place: any;
      this.dataProvider.Profile.Places.forEach((item) => {
        if (item.PlaceKey === appointment.PlaceKey) {
          place = item;
          return;
        }
      });
      let navigationExtras: NavigationExtras = {
        state: {
          dt: appointment.StartDate,
          appointment: appointment,
          place: place
        }
      };
      this.dataProvider.navigate('adminappointment', '', navigationExtras);
    } else {
      let navigationExtras: NavigationExtras = {
        state: {
          appointment: appointment,
        }
      };
      this.dataProvider.navigate('eventdetails', '',  navigationExtras);
    }
    
  }

  formatTime(appointment): string {

    var d1: Date = new Date(appointment.StartDate);
    var d2: Date = new Date(d1);

    d2.setMinutes(d1.getMinutes() + appointment.Duration);
    return this.dataProvider.formatDate(d1, "HH:mm") +
      ' - ' +
      this.dataProvider.formatDate(d2, "HH:mm");

  }

  public onShowAppointment(appointment: AppointmentViewmodel) {

    let navigationExtras: NavigationExtras = {
      state: {
        dt: appointment.StartDate,
        appointment: appointment,
      }
    };
    if(appointment.AppointmentType === 0) {
      this.dataProvider.navigate('create', '',  navigationExtras);
    } else {
      this.onShowEvent(appointment);
    }
  }

  onRefresh() {
    this.dataProvider.loadWeekData();
  }

  private addDays(date: Date, days: number): Date {
    var result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  public onPlaceDetails() {
    this.dataProvider.navigate('placedetails');
  }


  public hasPlace(): boolean {
    return this.dataProvider.Profile.CurrentPlace !== undefined && this.dataProvider.Profile.CurrentPlace.Name !== '';
  }

  public getPlaceName() {
    return this.hasPlace() ? this.dataProvider.Profile.CurrentPlace.Name : this.translate.instant("HEADER_PRIVATEAPPOINTMENTS");
  }

  async placeImage(): Promise<string> {
    var entry = this.dataProvider.Profile.CurrentPlace;
    if (entry.LocalImage === undefined) {
      var image = await this.imageService.get(entry.ImageUrl, entry.PlaceKey, "places", true, this.dataProvider.Profile.UserKey);
      if(image) {
        this.zone.run(() => {
          entry.LocalImage = image.data;
        });     
      }
      
    }
    return entry.LocalImage;
  }

}