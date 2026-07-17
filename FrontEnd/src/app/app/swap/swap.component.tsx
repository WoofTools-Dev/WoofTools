import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnChanges,
  OnDestroy, Output, SimpleChanges, ViewChild, ViewEncapsulation } from "@angular/core";
import * as React from "react";
import { createRoot, Root } from "react-dom/client";
import { Widget } from "@kyberswap/widgets";
import { WalletService } from "src/app/provider/walletprovider";
import { Web3Provider } from "@ethersproject/providers";

const containerElementRef = "customReactComponentContainer";

@Component({
  selector: 'app-swap-wrapper',
  template: `<span #${containerElementRef}></span>`,
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['./swap.component.css'],
})
export class SwapComponent implements OnChanges, OnDestroy, AfterViewInit {

  private root: Root | null = null;
  private cachedProvider: any = null;

  @ViewChild(containerElementRef, { static: true }) containerRef!: ElementRef;

  @Input() public counter = 10;
  @Output() public componentClick = new EventEmitter<void>();

  constructor(
    private wallet: WalletService
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    this.render();
  }

  ngAfterViewInit() {
    this.render();
  }

  ngOnDestroy() {
    if (this.root) {
      this.root.unmount();
      this.root = null;
    }
    this.cachedProvider = null;
  }

  private getProvider() {
    if (this.cachedProvider) {
      return this.cachedProvider;
    }
    if (typeof window !== "undefined" && typeof (window as any).ethereum !== "undefined") {
      this.cachedProvider = new Web3Provider((window as any).ethereum, 'any');
      return this.cachedProvider;
    }
    return null;
  }

  private render() {
    const provider = this.getProvider();

    if (!this.root) {
      this.root = createRoot(this.containerRef.nativeElement);
    }

    this.root.render(
      <React.StrictMode>
        <div style={{display : "flex" , alignContent: "center" , justifyContent:"center"}}>
        <Widget
            client="WoofTools"
            enableRoute={true}
            enableDexes="kyberswap-elastic,uniswapv3,uniswap"
            provider={provider}
            title={<div>Swap</div>}
            feeSetting={{
              feeAmount: 100,
              feeReceiver: "0xDcFCD5dD752492b95ac8C1964C83F992e7e39FA9",
              chargeFeeBy: "currency_in",
              isInBps: true,
          }}
        />
        </div>
      </React.StrictMode>
    );
  }
}
