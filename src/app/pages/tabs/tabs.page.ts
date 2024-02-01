import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { DataService } from "../../services/services";

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss']
})
export class TabsPage {

	constructor(public dataService: DataService, public translateService: TranslateService) {
    
  }

}
