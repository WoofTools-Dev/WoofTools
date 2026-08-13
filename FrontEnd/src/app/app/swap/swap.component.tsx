import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnChanges, OnDestroy, Output, SimpleChanges, ViewChild, ViewEncapsulation } from "@angular/core";
import * as React from "react";
import { createRoot, Root } from "react-dom/client";
import { Widget } from "@kyberswap/widgets";
import { ActivatedRoute } from "@angular/router";
import { WalletService } from "src/app/provider/walletprovider";
import { BrowserProvider } from "ethers";
import { ChainService } from "src/app/Service/chain.service";
import {
  SwapNetwork,
  SwapTokenMeta,
  getTokenMeta,
  isTokenAvailable,
} from "src/app/Service/swap-availability";
import ShibaSwapWidget from "./shiba-swap.widget";
import SecurityPanel from "./security-panel";

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
  template: `<span class="${containerElementRef}" #${containerElementRef}></span>`,
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
  private routeSub: { unsubscribe: () => void } | null = null;
  private preselectToken: string | null = null;
  private preselectMeta: SwapTokenMeta | null = null;
  private tokenUnavailable = false;
  private checkingAvailability = false;

  @ViewChild(containerElementRef, { static: true }) containerRef!: ElementRef;

  @Input() public counter = 10;
  @Output() public componentClick = new EventEmitter<void>();

  constructor(
    private wallet: WalletService,
    private chainService: ChainService,
    private route: ActivatedRoute
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
    this.routeSub = this.route.queryParams.subscribe((params) => {
      this.handleRouteParams(params);
    });
    await this.connectWallet();
  }

  ngOnDestroy() {
    this.chainSub?.unsubscribe();
    this.routeSub?.unsubscribe();
    if (this.root) {
      this.root.unmount();
      this.root = null;
    }
    this.provider = null;
  }

  private async handleRouteParams(params: Record<string, any>) {
    const network = params['network'] as string | undefined;
    const token = (params['token'] as string | undefined)?.trim();

    if (!network || !token) {
      this.preselectToken = null;
      this.preselectMeta = null;
      this.tokenUnavailable = false;
      this.checkingAvailability = false;
      return;
    }

    this.checkingAvailability = true;
    this.tokenUnavailable = false;
    this.preselectToken = token;
    this.preselectMeta = null;

    if (network !== this.activeChain) {
      this.chainService.selectChain(network);
    }
    this.render();

    const available = await isTokenAvailable(network as SwapNetwork, token);
    this.checkingAvailability = false;
    this.tokenUnavailable = available === false;
    if (available) {
      this.preselectMeta = await getTokenMeta(network as SwapNetwork, token);
    }
    this.render();
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

    if (this.tokenUnavailable) {
      this.root.render(
        <React.StrictMode>
          <div className="swap-zone">
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "48px 24px", gap: "10px", maxWidth: 440, margin: "0 auto", textAlign: "center", color: "var(--text-primary, #ffffff)", fontFamily: "'Inter', 'Poppins', Roboto, Arial, sans-serif" }}>
            <span style={{ fontSize: 34 }}>⚠️</span>
            <p style={{ margin: 0, fontWeight: 600 }}>El token no está disponible en estos momentos</p>
            <p style={{ margin: 0, fontSize: 13, color: "var(--text-secondary, #9b9b9b)" }}>
              {this.preselectToken} no se puede operar en el swapper de {this.activeChain === 'shibarium' ? 'Shibarium' : 'Ethereum'}.
            </p>
            </div>
          </div>
        </React.StrictMode>
      );
      return;
    }

    if (this.checkingAvailability) {
      this.root.render(
        <React.StrictMode>
          <div className="swap-zone">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "40px", color: "var(--text-primary, #ffffff)", fontFamily: "'Inter', 'Poppins', Roboto, Arial, sans-serif" }}>
              <p>Verificando disponibilidad del token…</p>
            </div>
          </div>
        </React.StrictMode>
      );
      return;
    }

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
          <ShibaSwapWidget provider={this.provider} initialTokenSymbol={this.preselectToken ?? undefined} />
          <SecurityPanel chainId={this.chainId!} mode="simulation" />
        </WidgetErrorBoundary>
      </div>
    ) : (
      <div style={{display : "flex" , flexDirection: "column", alignContent: "center" , justifyContent:"center", fontFamily: "'Inter', 'Poppins', Roboto, Arial, sans-serif"}}>
        <WidgetErrorBoundary onError={this.handleWidgetError}>
          <SecurityPanel chainId={this.chainId!} />
          <Widget
              client="WoofTools"
              enableRoute={true}
              enableDexes="kyberswap-elastic,uniswapv3,uniswap"
              provider={this.provider}
              title={<div>Swap</div>}
              defaultTokenIn={this.preselectMeta?.symbol}
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
        <div className="swap-zone">
          {content}
        </div>
      </React.StrictMode>
    );
  }
}
