import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { RouterModule, Routes } from '@angular/router';
import { PrivateAppointmentPage } from './privateappointment.page';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ComponentsModule } from 'src/app/components/components.module';

const routes: Routes = [
  {
    path: '',
    component: PrivateAppointmentPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule.forChild(),
    RouterModule.forChild(routes),
    ComponentsModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  declarations: [ PrivateAppointmentPage ]
})
export class PrivateAppointmentPageModule {}
