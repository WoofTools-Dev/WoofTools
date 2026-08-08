import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnChanges, OnDestroy, Output, SimpleChanges, ViewChild, ViewEncapsulation } from "@angular/core";
import * as React from "react";
import { createRoot, Root } from "react-dom/client";
import { Widget } from "@kyberswap/widgets";
import { WalletService } from "src/app/provider/walletprovider";
import { BrowserProvider } from "ethers";
import { ChainService } from "src/app/Service/chain.service";
import ChewySwapWidget from "./chewy-swap.widget";

const containerElementRef = "customReactComponentContainer";

const SUPPORTED_CHAINS = new Set([1, 109]);

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
  private activeChain: 'ethereum' | 'shibarium' = 'ethereum';
  private chainSub: { unsubscribe: () => void } | null = null;

  @ViewChild(containerElementRef, { static: true }) containerRef!: ElementRef;

  @Input() public counter = 10;
  @Output() public componentClick = new EventEmitter<void>();

  constructor(
    private wallet: WalletService,
    private chainService: ChainService
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (this.root) {
      this.render();
    }
  }

  async ngAfterViewInit() {
    this.root = createRoot(this.containerRef.nativeElement);
    this.activeChain = this.chainService.getActiveChain();
    this.chainSub = this.chainService.chain$.subscribe((chain) => {
      this.activeChain = chain;
      this.error = false;
      this.render();
      this.syncWalletNetwork();
    });
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
    this.chainSub?.unsubscribe();
    if (this.root) {
      this.root.unmount();
      this.root = null;
    }
    this.provider = null;
  }

  private async syncWalletNetwork() {
    if (!this.wallet.isWalletConnected()) return;
    const meta = this.chainService.getChainMeta(this.activeChain);
    const currentChainId = await this.wallet.getChainId();
    if (currentChainId !== meta.chainId) {
      await this.wallet.ensureNetwork(meta.chainId);
    }
  }

  private async connectWallet() {
    if (typeof window === "undefined" || typeof (window as any).ethereum === "undefined") {
      this.connecting = false;
      this.render();
      return;
    }
    if (this.connecting) return;
    this.connecting = true;
    this.error = false;
    this.render();
    try {
      const address = await this.wallet.connectWallet();
      if (address) {
        const eth = (window as any).ethereum;
        const hexChainId = await eth.request({ method: 'eth_chainId' });
        this.chainId = parseInt(hexChainId, 16);
        this.provider = new BrowserProvider(eth);
        this.syncWalletNetwork();
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

    const isSupportedChain = this.chainId === null || SUPPORTED_CHAINS.has(this.chainId);

    const content = this.connecting ? (
      <div style={{display: "flex", alignItems: "center", justifyContent: "center", padding: "40px", color: "var(--text-primary, #ffffff)", fontFamily: "'Inter', 'Poppins', Roboto, Arial, sans-serif"}}>
        <p>Connecting to MetaMask...</p>
      </div>
    ) : !isSupportedChain ? (
      <div style={{display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px", gap: "16px", color: "var(--text-primary, #ffffff)", fontFamily: "'Inter', 'Poppins', Roboto, Arial, sans-serif"}}>
        <p>Unsupported network (chain ID: {this.chainId}).</p>
        <button
          onClick={() => this.syncWalletNetwork()}
          className="swap-connect-btn"
          style={{
            padding: "12px 24px",
            background: "var(--primary, #ea801e)",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontSize: "16px",
            fontFamily: "'Inter', 'Poppins', Roboto, Arial, sans-serif"
          }}
        >
          Switch to {this.activeChain === 'shibarium' ? 'Shibarium' : 'Ethereum'}
        </button>
      </div>
    ) : !this.provider || this.error ? (
      <div style={{display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px", gap: "16px", color: "var(--text-primary, #ffffff)", fontFamily: "'Inter', 'Poppins', Roboto, Arial, sans-serif"}}>
        <>
          <p>Connect MetaMask to swap on {this.activeChain === 'shibarium' ? 'Shibarium' : 'Ethereum'}</p>
          <button
            onClick={() => this.connectWallet()}
            className="swap-connect-btn"
            style={{
              padding: "12px 24px",
              background: "var(--primary, #ea801e)",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "16px",
              fontFamily: "'Inter', 'Poppins', Roboto, Arial, sans-serif"
            }}
          >
            Connect Wallet
          </button>
        </>
      </div>
    ) : this.activeChain === 'shibarium' ? (
      <div style={{display : "flex" , alignContent: "center" , justifyContent:"center", fontFamily: "'Inter', 'Poppins', Roboto, Arial, sans-serif", paddingTop: 16}}>
        <WidgetErrorBoundary onError={this.handleWidgetError}>
          <ChewySwapWidget provider={this.provider} />
        </WidgetErrorBoundary>
      </div>
    ) : (
      <div style={{display : "flex" , alignContent: "center" , justifyContent:"center", fontFamily: "'Inter', 'Poppins', Roboto, Arial, sans-serif"}}>
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
