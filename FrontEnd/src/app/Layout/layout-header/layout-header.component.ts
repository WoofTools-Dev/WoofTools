import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { WalletService } from 'src/app/provider/walletprovider';
import { SearchService } from 'src/app/Service/search.service';
import { ChainService } from 'src/app/Service/chain.service';
import { ChainKey } from 'src/app/Service/chain.constants';

@Component({
  selector: 'app-layout-header',
  templateUrl: './layout-header.component.html',
  styleUrls: ['./layout-header.component.css'],
})
export class LayoutHeaderComponent implements OnInit {
  selectedBlockChain: string = 'Shibarium';
  activeChainIcon: string = 'assets/shib.png';
  isToggledBlockChainButton: boolean = false;
  walletAddress: string = '';
  searchValue: string = '';
  @Output() toggleDrawer = new EventEmitter<void>();

  constructor(
    public router: Router,
    public wallet: WalletService,
    private search: SearchService,
    private chainService: ChainService
  ) {}

  ngOnInit(): void {
    this.syncFromChainService();
    this.wallet.tryReconnect().then(() => {
      if (this.wallet.isWalletConnected()) {
        this.walletAddress = this.wallet.getTruncatedAddress();
      }
    });
    this.search.query$.subscribe(q => this.searchValue = q);
    this.chainService.chain$.subscribe(() => this.syncFromChainService());
  }

  private syncFromChainService() {
    const meta = this.chainService.getActiveChainMeta();
    this.selectedBlockChain = meta.name;
    this.activeChainIcon = meta.icon;
  }

  async connectWallet() {
    const addr = await this.wallet.connectWallet();
    if (addr) {
      this.walletAddress = this.wallet.getTruncatedAddress();
      await this.ensureWalletOnActiveChain();
    }
  }

  toggleButton() {
    this.isToggledBlockChainButton = !this.isToggledBlockChainButton;
  }

  async selectChain(value: string) {
    this.chainService.selectChain(value as ChainKey);
    this.syncFromChainService();
    this.toggleButton();
    try {
      await this.ensureWalletOnActiveChain();
    } catch {
      // wallet may have rejected the switch; app chain stays selected
    }
  }

  private async ensureWalletOnActiveChain() {
    if (!this.wallet.isWalletConnected()) return;
    const meta = this.chainService.getActiveChainMeta();
    const currentChainId = await this.wallet.getChainId();
    if (currentChainId === meta.chainId) return;
    await this.wallet.ensureNetwork(meta.chainId);
  }

  onToggleDrawer() {
    this.toggleDrawer.emit();
  }

  onSearchInput(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.search.setQuery(value);
    if (this.router.url !== '/woofboard') {
      this.router.navigate(['/woofboard']);
    }
  }
}
