import { Component } from '@angular/core';
import { Platform } from '@ionic/angular';
import { Router } from '@angular/router';
import { App, AppInfo } from '@capacitor/app';
import { DataService } from 'src/app/services/services';

@Component({
  selector: 'page-about',
  templateUrl: './about.page.html'
})
export class AboutPage {

  public version: string | undefined;

  constructor(
    private router: Router,
    public dataService: DataService,
    public platform: Platform) {
    App.getInfo().then((info: AppInfo) => {
      this.version = info.version;
    });
  }

  onBack() {
    this.router.navigate(["/start"]);
  }

  ionViewWillEnter() {
    this.dataService.getText("KeyAbout");
  }
}
