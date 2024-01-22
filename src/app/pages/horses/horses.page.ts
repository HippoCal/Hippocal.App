import { Component } from '@angular/core';
import { DataService } from 'src/app/services/services';

@Component({
  selector: 'page-horses',
  templateUrl: './horses.page.html',
  styleUrls: ['./horses.page.scss']
})
export class HorsesPage {
  constructor(public dataProvider: DataService) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad HorsesPage');
  }


}
