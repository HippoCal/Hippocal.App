import { Component, OnInit } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { DataService } from '../../services/data/data.service';

@Component({
  selector: 'app-confirm-email',
  templateUrl: './confirm-email.page.html',
  styleUrls: ['./confirm-email.page.scss'],
})
export class ConfirmEmailPage implements OnInit {

  constructor(
    private router: Router, 
    public dataProvider: DataService) {
  }
  onSendMail() {
    let navigationExtras: NavigationExtras = {
      state: {
        email: this.dataProvider.Profile.Email
      }
    };
    this.router.navigate(['/get-email'], navigationExtras );
  }

  onBack() {
    this.router.navigate(["start"]);
  }

  ngOnInit() {
    console.log('Load ConfirmEmailPage');
  }

}
