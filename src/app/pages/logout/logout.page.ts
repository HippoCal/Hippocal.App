import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ProfileViewmodel } from 'src/app/viewmodels/viewmodels';
import { DataService } from 'src/app/services/services';

@Component({
  selector: 'page-logout',
  templateUrl: './logout.page.html',
  styleUrls: ['./logout.page.scss']
})
export class LogoutPage {

  public isActive: boolean
  constructor(
    private router: Router,
    public dataProvider: DataService) {
      
  }

  onBack() {
    this.router.navigate(["tabs/tab1"]);
  }
  
  onLogout() {
    this.dataProvider.unsubscribe().then((result: boolean) => {
      if (result) {
        this.dataProvider.toggleActive(false);
        this.router.navigate(['tabs/tab1']);
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
        this.router.navigate(['tabs/tab1']);
      }
    });
  }
}
