import { Injectable } from '@angular/core';
import { LoadingController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  isLoading = false;

  private loading: any;
  constructor(public loadingController: LoadingController, public translate: TranslateService) { }

  async show(duration: number, message: string) {
    this.isLoading = true;
    this.loading = await this.loadingController.create({
      cssClass: 'ion-loading',
      duration: duration,
      spinner: 'circular',
      message: this.translate.instant(message)
    });
    return this.loading.present();
  }

  async hide() {

    try {
    if(!this.isLoading) {
      return;
    }
      await this.loading.dismiss().then(() => 
      {
        this.isLoading = false;
        this.loading = null;
      }).catch((error) => {
        this.isLoading = false;
        console.log('error: ', error);
      });
    }
    catch {}

  }
}
