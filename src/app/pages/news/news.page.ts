import { Component } from '@angular/core';
import { NewsViewmodel } from "src/app/viewmodels/viewmodels";
import { DataService, ImageService } from 'src/app/services/services';
import { ModalController } from '@ionic/angular';
import { NewsdetailsPage } from '../newsdetails/newsdetails.page';

@Component({
  selector: 'page-news',
  templateUrl: './news.page.html',
  styleUrls: ['./news.page.scss'],
})
export class NewsPage {
  
  public color: string;

  constructor(
    public dataProvider: DataService,
    private modalCtrl: ModalController,
    public imageProvider: ImageService) {
  }

  ionViewWillEnter() { 
    this.dataProvider.setCurrentTab('tab2');
  };

  ngOnInit() { 
    this.dataProvider.loadNews();
    this.color = 'divider';
  }

  load() {
    this.dataProvider.loadNews();
  }

  onRefresh() {
    this.load();
  }

  async onDetails(news: NewsViewmodel) {
    const modal = await this.modalCtrl.create({
      component: NewsdetailsPage,
      componentProps: { news: news }
    });
    modal.present();
    const { data, role } = await modal.onWillDismiss();
  }

}