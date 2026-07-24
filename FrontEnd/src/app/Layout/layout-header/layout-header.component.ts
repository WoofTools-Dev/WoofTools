import { Component, EventEmitter, Output } from '@angular/core';
import { Router } from '@angular/router';
import { WalletService } from 'src/app/provider/walletprovider';

@Component({
  selector: 'app-layout-header',
  templateUrl: './layout-header.component.html',
  styleUrls: ['./layout-header.component.css'],
})
export class LayoutHeaderComponent {
  selectedBlockChain: String = "Ethereum";
  isToggledBlockChainButton: boolean = false;
  walletAddress: string = '';
  @Output() toggleDrawer = new EventEmitter<void>();

  constructor(public router: Router, public wallet: WalletService) {}

  ngOnInit(): void {
    this.wallet.tryReconnect().then(() => {
      if (this.wallet.isWalletConnected()) {
        this.walletAddress = this.wallet.getTruncatedAddress();
      }
    });
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
}

