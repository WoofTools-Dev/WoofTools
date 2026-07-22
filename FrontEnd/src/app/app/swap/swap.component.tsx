import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnChanges, OnDestroy, Output, SimpleChanges, ViewChild, ViewEncapsulation } from "@angular/core";
import * as React from "react";
import { createRoot, Root } from "react-dom/client";
import { Widget } from "@kyberswap/widgets";
import { WalletService } from "src/app/provider/walletprovider";
import { BrowserProvider } from "ethers";

const containerElementRef = "customReactComponentContainer";

const SUPPORTED_CHAINS = new Set([
  1, 137, 56, 43114, 250, 25, 42161, 199, 106,
  1313161554, 42262, 10, 59144, 1101, 324, 8453
]);

class WidgetErrorBoundary extends React.Component<{children: React.ReactNode, onError: () => void}, {hasError: boolean}> {
  override state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  override componentDidCatch() { this.props.onError(); }
  override render() {
    if (this.state.hasError) return null;
    return this.props.children;
  }
}

@Component({
  selector: 'app-swap-wrapper',
  template: `<span #${containerElementRef}></span>`,
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['./swap.component.css'],
})

export class SwapComponent implements OnChanges, OnDestroy, AfterViewInit {

  private root: Root | null = null;
  private provider: any = null;
  private chainId: number | null = null;
  private connecting = false;
  private error = false;

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
    const eth = (window as any).ethereum;
    if (eth && eth.on) {
      eth.on('chainChanged', (hexId: string) => {
        this.chainId = parseInt(hexId, 16);
        this.provider = null;
        this.error = false;
        this.render();
        this.connectWallet();
      });
    }
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
      const address = await this.wallet.connectWallet();
      if (address) {
        const eth = (window as any).ethereum;
        const hexChainId = await eth.request({ method: 'eth_chainId' });
        this.chainId = parseInt(hexChainId, 16);
        this.provider = new BrowserProvider(eth);
      }
    } catch (e) {
      console.warn('MetaMask connection failed or rejected', e);
      this.provider = null;
    }
    this.connecting = false;
    this.render();
  }

  private handleWidgetError = () => {
    this.error = true;
    this.render();
  }

  private render() {
    if (!this.root) return;

    const content = this.connecting ? (
      <div style={{display: "flex", alignItems: "center", justifyContent: "center", padding: "40px"}}>
        <p>Connecting to MetaMask...</p>
      </div>
    ) : !this.provider || this.error ? (
      <div style={{display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px", gap: "16px"}}>
        {this.chainId !== null && !SUPPORTED_CHAINS.has(this.chainId) ? (
          <>
            <p>Unsupported network (chain ID: {this.chainId}).</p>
            <p>Switch your wallet to a supported chain.</p>
          </>
        ) : (
          <>
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
          </>
        )}
      </div>
    ) : (
      <div style={{display : "flex" , alignContent: "center" , justifyContent:"center"}}>
        <WidgetErrorBoundary onError={this.handleWidgetError}>
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
        </WidgetErrorBoundary>
      </div>
    );

    this.root.render(
      <React.StrictMode>
        {content}
      </React.StrictMode>
    );
  }
}
