import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'page-start',
  templateUrl: './start.page.html',
  styleUrls: ['./start.page.scss']
})
export class StartPage {

  constructor(
    private router: Router
  ) {
      this.router.navigate(['/tabs']);
  }
}

