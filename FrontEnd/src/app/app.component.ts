import { Component, ViewChild, HostListener } from '@angular/core';
import { MatDrawer } from '@angular/material/sidenav';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  title = 'my-app';
  resize = false;
  isMobile = false;
  @ViewChild('drawer', { static: true }) drawer!: MatDrawer;

  constructor() {
    this.checkMobile();
  }

  @HostListener('window:resize')
  onResize() {
    this.checkMobile();
  }

  checkMobile() {
    this.isMobile = window.innerWidth <= 768;
  }

  toggleDrawer() {
    this.drawer.toggle();
  }

  onDrawerChange(opened: boolean) {
    // drawer state changed
  }
}
