import { Component, OnInit } from '@angular/core';
import { NavigationExtras} from '@angular/router';
import { DataService } from '../../services/data/data.service';

@Component({
  selector: 'app-confirm-email',
  templateUrl: './confirm-email.page.html',
  styleUrls: ['./confirm-email.page.scss'],
})
export class ConfirmEmailPage implements OnInit {

  constructor(
    public dataProvider: DataService) {
  }
  onSendMail() {
    let navigationExtras: NavigationExtras = {
      state: {
        email: this.dataProvider.Profile.Email
      }
    };
    this.dataProvider.navigate('get-email', 'tab1', navigationExtras );
  }

  onBack() {
    this.dataProvider.navigate("home", 'tab1');
  }

  ngOnInit() {
    console.log('Load ConfirmEmailPage');
  }

}
