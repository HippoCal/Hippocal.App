import { Component } from '@angular/core';
import { Platform } from '@ionic/angular';
import { App, AppInfo } from '@capacitor/app';
import { DataService } from 'src/app/services/services';

@Component({
  selector: 'page-about',
  templateUrl: './about.page.html'
})
export class AboutPage {

  public version: string | undefined;

  constructor(
    public dataProvider: DataService,
    public platform: Platform) {
    App.getInfo().then((info: AppInfo) => {
      this.version = info.version;
    });
  }

  onBack() {
    this.dataProvider.navigate("home");
  }

  ionViewWillEnter() {
    this.dataProvider.getText("KeyAbout");
  }
}
