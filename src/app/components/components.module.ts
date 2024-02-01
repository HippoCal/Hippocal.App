import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';

import { CommonModule } from '@angular/common';
import { HorseComponent } from './horse/horse.component';
import { AppointmentComponent } from './appointment/appointment.component';
import { PlaceComponent } from './place/place.component';
import { AppointmentbubbleComponent } from './appointmentbubble/appointmentbubble.component';
import { DayComponent } from './day/day.component';
import { HourComponent } from './hour/hour.component';
import { NewsComponent } from './news/news.component';

@NgModule({
  declarations: [
    HorseComponent, 
    AppointmentComponent, 
    PlaceComponent,
    AppointmentbubbleComponent,
    DayComponent,
    HourComponent,
    NewsComponent
  ],

  imports: [
    IonicModule,
    CommonModule,
    TranslateModule.forChild()
  ],
	exports: [
    HorseComponent, 
    AppointmentComponent, 
    PlaceComponent, 
    AppointmentbubbleComponent,
    DayComponent,
    HourComponent,
    NewsComponent
  ]
})
export class ComponentsModule {}
