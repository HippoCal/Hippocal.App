import { NgModule } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { IonicModule } from '@ionic/angular';
import { ComponentsModule } from '../../components/components.module';

import { HorsesPage } from './horses.page';
import { RouterModule, Routes } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

const routes: Routes = [
  {
    path: '',
    component: HorsesPage
  }
];

@NgModule({
  declarations: [
    HorsesPage,
  ],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TranslateModule.forChild(),
    RouterModule.forChild(routes),
    ComponentsModule
  ],
  exports: [
    HorsesPage
  ]
})
export class HorsesPageModule {}
