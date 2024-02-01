import { Component } from '@angular/core';
import { Router, NavigationExtras } from '@angular/router';
import { DataService } from 'src/app/services/services';

@Component({
  selector: 'page-privacy',
  templateUrl: './privacy.page.html',
  styleUrls: ['./privacy.page.scss']
})
export class PrivacyPage {

  constructor(
    private router: Router,
    public dataProvider: DataService) {
    
  }

  onBack() {
    this.router.navigate(['/start']);
  }

  ionViewWillEnter() {
    this.dataProvider.getText("KeyPrivacy");
  }
}