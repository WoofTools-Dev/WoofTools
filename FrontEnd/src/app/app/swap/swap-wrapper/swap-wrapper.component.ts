import { Component } from '@angular/core';

@Component({
  selector: 'app-swap-wrapper-outer',
  templateUrl: './swap-wrapper.component.html',
  styleUrls: ['./swap-wrapper.component.css']
})
export class SwapWrapperComponent {

  public counter = 21;

  public handleOnClick(event: any): void {
    this.counter++;
  }


}
