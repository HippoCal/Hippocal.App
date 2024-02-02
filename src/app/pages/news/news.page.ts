import { Component } from '@angular/core';
import { NewsViewmodel } from "src/app/viewmodels/viewmodels";
import { DataService, ImageService } from 'src/app/services/services';

@Component({
  selector: 'page-news',
  templateUrl: './news.page.html',
  styleUrls: ['./news.page.scss'],
})
export class NewsPage {
  
  public color: string;

  constructor(
    public dataProvider: DataService,
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

  onDetails(news: NewsViewmodel) {
    this.dataProvider.navigate('newsdetails', '', { state: { news: news }});
  }

}