import { Component, OnInit } from '@angular/core';
import { DataService } from 'src/app/services/services';
import { Router } from '@angular/router';

@Component({ 
  selector: 'app-imprint',
  templateUrl: '././imprint.page.html',
  styleUrls: ['./imprint.page.scss']
})
export class ImprintPage implements OnInit {

  constructor(private router: Router, public dataProvider: DataService) {
    
  }
  ngOnInit() {
    console.log('ionViewDidLoad Imprint');
  }

  onBack() {
    this.router.navigate(['/start']);
  }

  ionViewWillEnter() {
    this.dataProvider.getText("KeyImprint");
  }

}
