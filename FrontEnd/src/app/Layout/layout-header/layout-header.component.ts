import { Component, EventEmitter, Output } from '@angular/core';
import { Router } from '@angular/router';
import { WalletService } from 'src/app/provider/walletprovider';
import { SearchService } from 'src/app/Service/search.service';

@Component({
  selector: 'app-layout-header',
  templateUrl: './layout-header.component.html',
  styleUrls: ['./layout-header.component.css'],
})
export class LayoutHeaderComponent {
  selectedBlockChain: String = "Ethereum";
  isToggledBlockChainButton: boolean = false;
  walletAddress: string = '';
  searchValue: string = '';
  @Output() toggleDrawer = new EventEmitter<void>();

  constructor(
    public router: Router,
    public wallet: WalletService,
    private search: SearchService
  ) {}

  ngOnInit(): void {
    this.wallet.tryReconnect().then(() => {
      if (this.wallet.isWalletConnected()) {
        this.walletAddress = this.wallet.getTruncatedAddress();
      }
    });
    this.search.query$.subscribe(q => this.searchValue = q);
  }

  async connectWallet() {
    const addr = await this.wallet.connectWallet();
    if (addr) {
      this.walletAddress = this.wallet.getTruncatedAddress();
    }
  }

  toggleButton() {
    this.isToggledBlockChainButton = !this.isToggledBlockChainButton;
  }

  selectChain(value: string) {
    this.selectedBlockChain = value;
    this.toggleButton();
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

