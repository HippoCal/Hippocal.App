import { Component, Input, NgZone } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { NewsViewmodel } from "src/app/viewmodels/viewmodels";
import { DataService, ImageService } from 'src/app/services/services';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'page-newsdetails',
  templateUrl: './newsdetails.page.html',
  styleUrls: ['./newsdetails.page.scss']
})
export class NewsdetailsPage {

  public image: string;

  @Input("news") news: NewsViewmodel;
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private zone: NgZone,
    public dataProvider: DataService,
    private modalCtrl: ModalController,
    public imageProvider: ImageService) {
    
  }

  ngOnInit() {
    this.image = this.dataProvider.getDefaultImage("loading");
    this.getImage();
    this.news.isNew = false;
    this.dataProvider.saveNews();
  }

  cancel() {
    return this.modalCtrl.dismiss(null, 'cancel');
  }

  async getImage() {
    var image = await this.imageProvider.get(this.news.ImageUrl, this.news.NewsEntryKey, "news", false, this.dataProvider.Profile.UserKey);
    if (image) {
      this.zone.run(() => {
        this.image = image.data;
      });
    }
  }

  onRefresh() {
    this.dataProvider.loadNews(() => {
      this.dataProvider.News.forEach((entry) => {
        if (entry.NewsEntryKey == this.news.NewsEntryKey) {
          this.news = entry;
        }
      });
    });
  }


}