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
  private provider: any = null;
  private connecting = false;

  @ViewChild(containerElementRef, { static: true }) containerRef!: ElementRef;

  @Input() public counter = 10;
  @Output() public componentClick = new EventEmitter<void>();

  constructor(
    private wallet: WalletService
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (this.root) {
      this.render();
    }
  }

  async ngAfterViewInit() {
    this.root = createRoot(this.containerRef.nativeElement);
    this.render();
    await this.connectWallet();
  }

  ngOnDestroy() {
    if (this.root) {
      this.root.unmount();
      this.root = null;
    }
    this.provider = null;
  }

  private async connectWallet() {
    if (typeof window === "undefined" || typeof (window as any).ethereum === "undefined") {
      this.connecting = false;
      this.render();
      return;
    }
    if (this.connecting) return;
    this.connecting = true;
    this.render();
    try {
      const web3Provider = new Web3Provider((window as any).ethereum, 'any');
      await web3Provider.send("eth_requestAccounts", []);
      this.provider = web3Provider;
    } catch (e) {
      console.warn('MetaMask connection failed or rejected', e);
      this.provider = null;
    }
    this.connecting = false;
    this.render();
  }

  private render() {
    if (!this.root) return;

    const content = this.connecting ? (
      <div style={{display: "flex", alignItems: "center", justifyContent: "center", padding: "40px"}}>
        <p>Connecting to MetaMask...</p>
      </div>
    ) : !this.provider ? (
      <div style={{display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px", gap: "16px"}}>
        <p>Connect MetaMask to swap</p>
        <button
          onClick={() => this.connectWallet()}
          style={{
            padding: "12px 24px",
            background: "#F6851B",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontSize: "16px"
          }}
        >
          Connect Wallet
        </button>
      </div>
    ) : (
      <div style={{display : "flex" , alignContent: "center" , justifyContent:"center"}}>
        <Widget
            client="WoofTools"
            enableRoute={true}
            enableDexes="kyberswap-elastic,uniswapv3,uniswap"
            provider={this.provider}
            title={<div>Swap</div>}
            feeSetting={{
              feeAmount: 100,
              feeReceiver: "0xDcFCD5dD752492b95ac8C1964C83F992e7e39FA9",
              chargeFeeBy: "currency_in",
              isInBps: true,
          }}
        />
      </div>
    );

    this.root.render(
      <React.StrictMode>
        {content}
      </React.StrictMode>
    );
  }
}
