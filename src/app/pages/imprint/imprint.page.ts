import { Component, OnInit } from '@angular/core';
import { DataService } from 'src/app/services/services';

@Component({ 
  selector: 'app-imprint',
  templateUrl: '././imprint.page.html',
  styleUrls: ['./imprint.page.scss']
})
export class ImprintPage implements OnInit {

  constructor(public dataProvider: DataService) {
    
  }
  ngOnInit() {
    console.log('ionViewDidLoad Imprint');
  }

  onBack() {
    this.dataProvider.navigate('home', 'tab1');
  }

  ionViewWillEnter() {
    this.dataProvider.getText("KeyImprint");
  }

}
