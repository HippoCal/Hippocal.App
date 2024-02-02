import { Component, OnInit } from '@angular/core';
import { Platform } from '@ionic/angular';
import { App, AppInfo } from '@capacitor/app';
import { DataService } from 'src/app/services/services';

@Component({
  selector: 'page-about',
  templateUrl: './about.page.html'
})
export class AboutPage implements OnInit{

  public version: string | undefined;

  constructor(
    public dataProvider: DataService,
    public platform: Platform) {
    
  }

  ngOnInit() {
    this.getInfo();
  }

  onBack() {
    this.dataProvider.navigate("home");
  }

  async getInfo() {
    var info = await App.getInfo();
    if(info) {
      this.version = info.version;
    }
  } 

  ionViewWillEnter() {
    this.dataProvider.getText("KeyAbout");
  }
}
