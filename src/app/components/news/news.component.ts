import { Component, EventEmitter, Input, NgZone, Output } from '@angular/core';
import { NewsViewmodel } from "src/app/viewmodels/viewmodels";
import { DataService, ImageService, ToastService } from 'src/app/services/services';

@Component({
  selector: 'app-news',
  templateUrl: './news.component.html',
  styleUrls: ['./news.component.scss'],
})
export class NewsComponent {

  @Input('news') news: NewsViewmodel;
  @Input('color') color: string;
  @Output() showNews = new EventEmitter<NewsViewmodel>();
  public newsKey: string;
  public newsImage: string;

  constructor(
    public dataProvider: DataService, 
    private zone: NgZone, 
    public imageProvider: ImageService,
    private toastsvc: ToastService) {

  }

  ngOnInit() {
    this.getnewsImage();
  }
  

  onDeleteNews(news: NewsViewmodel) {
    this.toastsvc.confirm(() => {
      this.dataProvider.deleteNews(news);
    },
      "HEADER_CONFIRM_DELETE_NEWS",
      "MSG_CONFIRM_DELETE_NEWS");
  }

  async getnewsImage() {
    var image = await this.imageProvider.get(this.news.ImageUrl, this.news.NewsEntryKey, "news", true, this.dataProvider.Profile.UserKey);
    if(image) {
      this.zone.run(() => {
        this.newsImage = image.data;
      });    
    }
  }

  public onClick() {
    this.showNews.emit(this.news);
  }
}
