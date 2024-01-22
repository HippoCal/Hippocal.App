import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { PlaceViewmodel } from 'src/app/viewmodels/placeviewmodel';

@Component({
  selector: 'app-place',
  templateUrl: './place.component.html',
  styleUrls: ['./place.component.scss'],
})
export class PlaceComponent  implements OnInit {

  @Input('place') place: PlaceViewmodel;
  @Input('color') color: string;
  @Output() click = new EventEmitter<PlaceViewmodel>();
  constructor() { }

  ngOnInit() {}

  onClick(){
    this.click.emit(this.place);
  }
}
