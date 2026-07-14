import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnChanges,
  OnDestroy, Output, SimpleChanges, ViewChild, ViewEncapsulation } from "@angular/core";
import * as React from "react";
import * as ReactDOM from "react-dom";
import { TestButton } from "../Test/TestComponent";

import { Widget } from "@kyberswap/widgets";

const containerElementRef = "customReactComponentContainer";



@Component({
  selector: 'app-swap-wrapper',
  template: `<span #${containerElementRef}></span>`,
  // styleUrls: [""],
  encapsulation: ViewEncapsulation.None,
  // templateUrl: './swap.component.html',
  styleUrls: ['./swap.component.css'],
})
export class SwapComponent implements OnChanges, OnDestroy, AfterViewInit {
  
   MY_TOKEN_LIST = [
    {
    "name": "KNC",
    "address": "0x1C954E8fe737F99f68Fa1CCda3e51ebDB291948C",
    "symbol": "KNC",
    "decimals": 18,
    "chainId": 1,
    "logoURI": "https://s2.coinmarketcap.com/static/img/coins/64x64/9444.png"
  },
    {
    "name": "Tether USD",
    "address": "0xdAC17F958D2ee523a2206206994597C13D831ec7",
    "symbol": "USDT",
    "decimals": 6,
    "chainId": 1,
    "logoURI": "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xdAC17F958D2ee523a2206206994597C13D831ec7/logo.png"
  },
  {
    "name": "USD Coin",
    "address": "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    "symbol": "USDC",
    "decimals": 6,
    "chainId": 1,
    "logoURI": "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png"
  },
  ]


  @ViewChild(containerElementRef, { static: true }) containerRef!: ElementRef;

  @Input() public counter = 10;
  @Output() public componentClick = new EventEmitter<void>();

  constructor() {
    this.handleClick = this.handleClick.bind(this);
  }

  public handleClick() {
    if (this.componentClick) {
      this.componentClick.emit();
      this.render();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.render();
  }

  ngAfterViewInit() {
    this.render();
  }

  ngOnDestroy() {
    ReactDOM.unmountComponentAtNode(this.containerRef.nativeElement);
  }

  private render() {
    const { counter } = this;

    ReactDOM.render(
      <React.StrictMode>
        <div style={{display : "flex" , alignContent: "center" , justifyContent:"center"}}>
        <Widget
            client="yourCompanyNameHere"
            tokenList={this.MY_TOKEN_LIST}
            enableRoute = {true}
            enableDexes="kyberswap-elastic,uniswapv3,uniswap"
            provider={null}
            title={<div>Swap</div>}
            feeSetting={{
              feeAmount: 100,
              feeReceiver: "0xDcFCD5dD752492b95ac8C1964C83F992e7e39FA9",
              chargeFeeBy: "currency_in",
              isInBps: true,
          }}
        />
        </div>
      </React.StrictMode>,
      this.containerRef.nativeElement
    );
  }
}
