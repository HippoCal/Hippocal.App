import { Component } from '@angular/core';
import { DataService } from 'src/app/services/services';

@Component({
  selector: 'page-logout',
  templateUrl: './logout.page.html',
  styleUrls: ['./logout.page.scss']
})
export class LogoutPage {

  public isActive: boolean
  constructor(

    public dataProvider: DataService) {
      
  }

  onBack() {
    this.dataProvider.navigate("home", 'tab1');
  }
  
  onLogout() {
    this.dataProvider.unsubscribe().then((result: boolean) => {
      if (result) {
        this.dataProvider.toggleActive(false);
        this.dataProvider.navigate('home', 'tab1');
      }
    });
  }

  getHeader() {
      return this.dataProvider.getHeader( this.dataProvider.Profile.IsActive ? 'HEADER_LOGOUT' : 'HEADER_LOGIN')
  }

  onLogin() {
    this.dataProvider.subscribeBack().then((result: boolean) => {
      if (result) {
        this.dataProvider.toggleActive(true);
        this.dataProvider.navigate('home', 'tab1');
      }
    });
  }
}
