import { Component, NgZone } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { NewsViewmodel } from "src/app/viewmodels/viewmodels";
import { DataService, ImageService } from 'src/app/services/services';

@Component({
  selector: 'page-newsdetails',
  templateUrl: './newsdetails.page.html',
  styleUrls: ['./newsdetails.page.scss']
})
export class NewsdetailsPage {

  public News: NewsViewmodel;
  public image: string;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private zone: NgZone, 
    public dataProvider: DataService, 
    public imageProvider: ImageService) {
    this.resolveParams();
    this.image = dataProvider.getDefaultImage("loading");
    this.News.isNew = false;
    this.dataProvider.saveNews();
    this.getImage();
  }

  resolveParams() {
    this.route.queryParams.subscribe(params => {
      if (this.router.getCurrentNavigation().extras.state) {
        this.News = this.router.getCurrentNavigation().extras.state['news'];
      }
    });
  }

  getImage() {
    this.imageProvider.get(this.News.ImageUrl, this.News.NewsEntryKey, "news", false, (url) => {
      this.zone.run(() => {
        this.image = url;
      });
    });
  }

  onRefresh() {
    this.dataProvider.loadNews(() => {
      this.dataProvider.News.forEach((entry) => {
        if (entry.NewsEntryKey == this.News.NewsEntryKey) {
          this.News = entry;
        }
      });
    });
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad NewsdetailsPage');
  }

}