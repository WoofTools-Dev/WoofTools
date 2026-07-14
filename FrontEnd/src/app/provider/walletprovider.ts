
import { Injectable } from '@angular/core';
import { ethers } from 'ethers';
@Injectable({
  providedIn: 'root' 
})
export class WalletService {

   walletProvider: any = null;

   address: String = ""

  constructor() {

    //@ts-ignore
    this.walletProvider = new ethers.BrowserProvider(window.ethereum);

  }

  async connectWallet() {
    // @ts-ignore
    if(typeof window != "undefined" && typeof window.ethereum != "undefined"){
        // @ts-ignore
        await this.walletProvider.send("eth_requestAccounts", []);
        const signer  =  await this.walletProvider.getSigner()
        this.address = signer.address
        console.log(signer.address)
        alert("Metamask connected");
    
        //@ts-check
        // setWalletConnected(true)
      }
      else{
        console.log("Please install metamask")
      }
  }

  isWalletConnected() {
    // @ts-ignore
    if (typeof window.ethereum !== 'undefined' && window.ethereum.isConnected()) {
       return true
      } else {
        // Wallet is not connected
       return false
      }
  }

  async getConnectedWalletAddress() {
    // @ts-ignore
    if(typeof window != "undefined" && typeof window.ethereum != "undefined"){
      // @ts-ignore
      await this.walletProvider.send("eth_requestAccounts", []);
      const signer  =  await this.walletProvider.getSigner()
      return signer.address
    }
    else{
      return null
    }
  }


  async getBalance () {
    // @ts-ignore
    if(typeof window != "undefined" && typeof window.ethereum != "undefined"){
      // @ts-ignore
      await this.walletProvider.send("eth_requestAccounts", []);
      const signer  =  await this.walletProvider.getSigner();

      const balance = await this.walletProvider.getBalance(signer.address);
      return balance
    }
    else{
      return null
    }
    
  }
}