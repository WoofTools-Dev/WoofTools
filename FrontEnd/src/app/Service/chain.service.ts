import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import {
  ChainKey,
  ChainMeta,
  CHAINS,
  SUPPORTED_CHAIN_KEYS,
} from './chain.constants';

const STORAGE_KEY = 'wooftools_active_chain';

@Injectable({ providedIn: 'root' })
export class ChainService {
  private _chain$ = new BehaviorSubject<ChainKey>(this.loadInitial());
  chain$ = this._chain$.asObservable();

  private loadInitial(): ChainKey {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === 'ethereum' || saved === 'shibarium') {
        return saved;
      }
    } catch {
      // ignore storage errors
    }
    return 'shibarium';
  }

  selectChain(key: string): void {
    const valid = SUPPORTED_CHAIN_KEYS.find((k) => k === key);
    if (!valid) return;
    this._chain$.next(valid);
    try {
      localStorage.setItem(STORAGE_KEY, valid);
    } catch {
      // ignore storage errors
    }
  }

  getActiveChain(): ChainKey {
    return this._chain$.value;
  }

  getActiveChainMeta(): ChainMeta {
    return CHAINS[this._chain$.value];
  }

  getChainMeta(key: ChainKey): ChainMeta {
    return CHAINS[key];
  }
}
