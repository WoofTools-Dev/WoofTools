import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { WalletInfoComponent } from './wallet-info.component';
import { ChainService } from 'src/app/Service/chain.service';
import { WalletService } from 'src/app/provider/walletprovider';

describe('WalletInfoComponent', () => {
  let component: WalletInfoComponent;
  let fixture: ComponentFixture<WalletInfoComponent>;

  beforeEach(() => {
    const walletSpy = jasmine.createSpyObj('WalletService', [
      'isWalletConnected', 'connectWallet', 'address', 'connected',
    ]);
    walletSpy.isWalletConnected.and.returnValue(false);
    walletSpy.address = '';
    walletSpy.connected = false;
    walletSpy.connectWallet.and.returnValue(Promise.resolve(null));

    TestBed.configureTestingModule({
      declarations: [WalletInfoComponent],
      imports: [FormsModule, NoopAnimationsModule],
      providers: [
        ChainService,
        { provide: WalletService, useValue: walletSpy },
      ],
    });
    fixture = TestBed.createComponent(WalletInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should default to shibarium chain', () => {
    expect(component.activeChain).toBe('shibarium');
    expect(component.activeChainMeta.gasSymbol).toBe('BONE');
  });

  it('should truncate long addresses', () => {
    expect(component.truncated('0x1234567890abcdef1234')).toBe('0x1234...1234');
  });

  it('should not set balance when disconnected', () => {
    expect(component.connected).toBe(false);
    expect(component.balance).toBe('');
  });
});
