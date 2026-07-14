import { Component } from '@angular/core';
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
  walletAddress: any = null
  constructor(public router: Router , public wallet: WalletService) {
   
  }

  ngOnInit(): void {
    this.getWalletAddress();

    this.wallet.getBalance() .then((res) => {
      console.log(res)
    })
  }

 async connectWallet () {
   // @ts-ignore
  this.wallet.connectWallet()
  }

  async getWalletAddress() {
    this.walletAddress = await this.wallet.getConnectedWalletAddress()
  }

  toggleButton() {
     this.isToggledBlockChainButton = !this.isToggledBlockChainButton;
  }

  selectChain(value: string) {
    this.selectedBlockChain = value;
    this.toggleButton()
 }


}

