import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { JsonRpcProvider } from 'ethers';
import { WalletService } from 'src/app/provider/walletprovider';
import { ChainService } from 'src/app/Service/chain.service';
import { ChainKey } from 'src/app/Service/chain.constants';
import { formatEther } from 'ethers';

@Component({
  selector: 'app-wallet-info',
  templateUrl: './wallet-info.component.html',
  styleUrls: ['./wallet-info.component.css'],
})
export class WalletInfoComponent implements OnInit, OnDestroy {
  address = '';
  balance = '';
  chainName = '';
  connected = false;
  loading = false;

  searchAddress = '';
  searchBalance = '';
  searchLoading = false;
  searchError = '';

  activeChain: ChainKey = this.chainService.getActiveChain();
  activeChainMeta = this.chainService.getActiveChainMeta();

  private chainSub?: Subscription;

  constructor(
    private wallet: WalletService,
    private chainService: ChainService
  ) {}

  ngOnInit(): void {
    this.activeChain = this.chainService.getActiveChain();
    this.activeChainMeta = this.chainService.getChainMeta(this.activeChain);

    this.refresh();

    this.chainSub = this.chainService.chain$.subscribe(async (chain) => {
      this.activeChain = chain;
      this.activeChainMeta = this.chainService.getChainMeta(chain);
      this.refresh();
    });
  }

  ngOnDestroy(): void {
    this.chainSub?.unsubscribe();
  }

  private async refresh() {
    this.connected = this.wallet.isWalletConnected();
    this.address = this.wallet.address;
    this.balance = '';
    if (this.connected && this.address) {
      await this.loadBalance(this.address);
    }
  }

  private async loadBalance(addr: string) {
    this.loading = true;
    try {
      const provider = new JsonRpcProvider(this.activeChainMeta.rpcUrl, undefined);
      const bal = await provider.getBalance(addr);
      this.balance = `${parseFloat(formatEther(bal)).toFixed(4)} ${this.activeChainMeta.gasSymbol}`;
    } catch {
      this.balance = '—';
    } finally {
      this.loading = false;
    }
  }

  async connect() {
    const addr = await this.wallet.connectWallet();
    if (addr) {
      this.address = addr;
      this.connected = true;
      this.loadBalance(addr);
    }
  }

  async searchLookup() {
    const addr = this.searchAddress.trim();
    if (!addr) return;
    this.searchLoading = true;
    this.searchError = '';
    this.searchBalance = '';
    try {
      const provider = new JsonRpcProvider(this.activeChainMeta.rpcUrl, undefined);
      const bal = await provider.getBalance(addr);
      this.searchBalance = `${parseFloat(formatEther(bal)).toFixed(4)} ${this.activeChainMeta.gasSymbol}`;
    } catch {
      this.searchError = 'Could not fetch balance. Check the address and try again.';
    } finally {
      this.searchLoading = false;
    }
  }

  truncated(addr: string): string {
    if (!addr) return '';
    return addr.slice(0, 6) + '...' + addr.slice(-4);
  }
}
