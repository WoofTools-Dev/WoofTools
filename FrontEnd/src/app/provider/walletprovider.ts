import { Injectable } from '@angular/core';
import { BrowserProvider, JsonRpcSigner } from 'ethers';

@Injectable({ providedIn: 'root' })
export class WalletService {
  private _provider: BrowserProvider | null = null;
  private _signer: JsonRpcSigner | null = null;
  address: string = '';
  connected: boolean = false;

  private initProvider(): BrowserProvider | null {
    if (this._provider) return this._provider;
    if (typeof window !== 'undefined' && (window as any).ethereum) {
      try {
        this._provider = new BrowserProvider((window as any).ethereum);
      } catch {
        this._provider = null;
      }
    }
    return this._provider;
  }

  async connectWallet(): Promise<string | null> {
    try {
      const eth = (window as any).ethereum;
      if (!eth) {
        console.warn('MetaMask not installed');
        return null;
      }
      const provider = this.initProvider();
      if (!provider) return null;

      await provider.send('eth_requestAccounts', []);
      this._signer = await provider.getSigner();
      this.address = await this._signer.getAddress();
      this.connected = true;

      eth.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length === 0) {
          this.address = '';
          this.connected = false;
          this._signer = null;
        } else {
          this.address = accounts[0];
          this.connected = true;
        }
      });

      return this.address;
    } catch (e) {
      console.warn('Wallet connection failed', e);
      return null;
    }
  }

  async tryReconnect(): Promise<void> {
    try {
      const eth = (window as any).ethereum;
      if (!eth) return;
      const accounts = await eth.request({ method: 'eth_accounts' });
      if (accounts && accounts.length > 0) {
        this.address = accounts[0];
        this.connected = true;
        const provider = this.initProvider();
        if (provider) {
          this._signer = await provider.getSigner();
        }

        eth.on('accountsChanged', (accs: string[]) => {
          if (accs.length === 0) {
            this.address = '';
            this.connected = false;
            this._signer = null;
          } else {
            this.address = accs[0];
            this.connected = true;
          }
        });
      }
    } catch {
      // ignore
    }
  }

  async getSigner(): Promise<JsonRpcSigner | null> {
    if (this._signer) return this._signer;
    await this.connectWallet();
    return this._signer;
  }

  async getProvider(): Promise<BrowserProvider | null> {
    return this.initProvider();
  }

  isWalletConnected(): boolean {
    return this.connected && !!this.address;
  }

  getTruncatedAddress(): string {
    if (!this.address) return '';
    return this.address.slice(0, 6) + '...' + this.address.slice(-4);
  }

  async getBalance(): Promise<bigint | null> {
    const provider = this.initProvider();
    if (!provider || !this.address) return null;
    try {
      return await provider.getBalance(this.address);
    } catch {
      return null;
    }
  }

  async getChainId(): Promise<number | null> {
    const provider = this.initProvider();
    if (!provider) return null;
    try {
      return Number((await provider.getNetwork()).chainId);
    } catch {
      return null;
    }
  }

  async getConnectedWalletAddress(): Promise<string | null> {
    if (this.address) return this.address;
    return null;
  }
}
