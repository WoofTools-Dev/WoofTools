import { Injectable } from '@angular/core';
import { BrowserProvider, JsonRpcSigner } from 'ethers';
import { ChainService } from '../Service/chain.service';
import { ChainKey, getChainMetaByChainId } from '../Service/chain.constants';

@Injectable({ providedIn: 'root' })
export class WalletService {
  private _provider: BrowserProvider | null = null;
  private _signer: JsonRpcSigner | null = null;
  private _listenersAttached = false;
  address: string = '';
  connected: boolean = false;

  constructor(private chainService: ChainService) {}

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

  private setupEventListeners(eth: any): void {
    if (this._listenersAttached || !eth) return;
    this._listenersAttached = true;

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

    eth.on('chainChanged', (chainIdHex: string) => {
      const chainId = Number.parseInt(chainIdHex, 16);
      if (isNaN(chainId)) return;
      const meta = getChainMetaByChainId(chainId);
      if (meta && meta.key !== this.chainService.getActiveChain()) {
        this.chainService.selectChain(meta.key as ChainKey);
      }
    });
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
      this.setupEventListeners(eth);

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
        this.setupEventListeners(eth);
      }
    } catch {
      // ignore
    }
  }

  async disconnectWallet(): Promise<void> {
    this.address = '';
    this.connected = false;
    this._signer = null;
    const eth = (window as any).ethereum;
    if (!eth || typeof eth.request !== 'function') return;
    try {
      await eth.request({
        method: 'wallet_revokePermissions',
        params: [{ eth_accounts: {} }],
      });
    } catch {
      // ignore — some wallets may not support revoking
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

  async switchNetwork(chainId: number): Promise<boolean> {
    const eth = (window as any).ethereum;
    if (!eth) return false;
    try {
      await eth.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x' + chainId.toString(16) }],
      });
      return true;
    } catch (error: any) {
      if (error?.code === 4902) {
        return false;
      }
      console.warn('Switch network failed', error);
      return false;
    }
  }

  async addNetwork(params: {
    chainId: number;
    chainName: string;
    rpcUrl: string;
    symbol: string;
    explorerUrl: string;
  }): Promise<boolean> {
    const eth = (window as any).ethereum;
    if (!eth) return false;
    try {
      await eth.request({
        method: 'wallet_addEthereumChain',
        params: [
          {
            chainId: '0x' + params.chainId.toString(16),
            chainName: params.chainName,
            nativeCurrency: { name: params.symbol, symbol: params.symbol, decimals: 18 },
            rpcUrls: [params.rpcUrl],
            blockExplorerUrls: [params.explorerUrl],
          },
        ],
      });
      return true;
    } catch {
      return false;
    }
  }

  async ensureNetwork(chainId: number): Promise<boolean> {
    const eth = (window as any).ethereum;
    if (!eth) return false;
    const switched = await this.switchNetwork(chainId);
    if (switched) return true;
    const chainMeta = await this.getNetworkParamsByChainId(chainId);
    if (!chainMeta) return false;
    const added = await this.addNetwork(chainMeta);
    if (added) {
      return this.switchNetwork(chainId);
    }
    return false;
  }

  private async getNetworkParamsByChainId(chainId: number) {
    const { CHAINS, SUPPORTED_CHAIN_IDS } = await import('../Service/chain.constants');
    const key = SUPPORTED_CHAIN_IDS.includes(chainId)
      ? (chainId === 109 ? 'shibarium' : 'ethereum')
      : null;
    if (!key) return null;
    const meta = CHAINS[key as 'ethereum' | 'shibarium'];
    return {
      chainId,
      chainName: meta.name,
      rpcUrl: meta.rpcUrl,
      symbol: meta.gasSymbol,
      explorerUrl: meta.explorerUrl,
    };
  }

  async getConnectedWalletAddress(): Promise<string | null> {
    if (this.address) return this.address;
    return null;
  }
}
