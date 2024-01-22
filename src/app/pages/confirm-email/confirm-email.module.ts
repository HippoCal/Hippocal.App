import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { IonicModule } from '@ionic/angular';

import { ConfirmEmailPage } from './confirm-email.page';
import { GetEmailPage } from '../get-email/get-email.page';

const routes: Routes = [
  { path: '', component: ConfirmEmailPage }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TranslateModule.forChild(),
    RouterModule.forChild(routes)
  ],
  declarations: [ConfirmEmailPage]
})
export class ConfirmEmailPageModule {}
