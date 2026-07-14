import { Component } from '@angular/core';
import { AppComponent } from 'src/app/app.component';

@Component({
  selector: 'app-layout-side',
  templateUrl: './layout-side.component.html',
  styleUrls: ['./layout-side.component.css'],
})
export class LayoutSideComponent {
  constructor(public app: AppComponent) {}
}
