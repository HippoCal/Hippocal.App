import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { NewsViewmodel } from "src/app/viewmodels/viewmodels";
import { DataService, ImageService } from 'src/app/services/services';

@Component({
  selector: 'page-news',
  templateUrl: './news.page.html',
  styleUrls: ['./news.page.scss'],
})
export class NewsPage {

  constructor(
    private router: Router,
    public dataProvider: DataService,
    public imageProvider: ImageService) {
    this.dataProvider.loadNews();
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad NewsPage');
  }

  load() {
    this.dataProvider.loadNews();
  }

  onRefresh() {
    this.load();
  }

  onDetails(news: NewsViewmodel) {
    this.router.navigate(['/newsdetails'], { state: { news: news }});
  }

  onDelete(event: Event, news: NewsViewmodel) {
    this.dataProvider.deleteNews(news);
  }

}