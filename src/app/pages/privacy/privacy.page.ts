import { Component } from '@angular/core';
import { DataService } from 'src/app/services/services';

@Component({
  selector: 'page-privacy',
  templateUrl: './privacy.page.html',
  styleUrls: ['./privacy.page.scss']
})
export class PrivacyPage {

  constructor(
    public dataProvider: DataService) {
    
  }

  onBack() {
    this.dataProvider.navigate('home', 'tab1');
  }

  ionViewWillEnter() {
    this.dataProvider.getText("KeyPrivacy");
  }
}