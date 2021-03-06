import { Injectable } from '@angular/core';
import { WalletService } from '@service/wallet.service';
import { EthereumService } from '@service/ethereum.service';
import { Network } from '@model/network.model';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {

  onNetworkChange: Subject<any> = new Subject<any>()

  networks: Array<string> = [
    Network.mainnet,
    Network.testnet
  ]

  constructor(
    private wallet: WalletService,
    private eth: EthereumService) { }

  setNetwork(network: string = Network.mainnet) {

    this.wallet.setNetwork(network)
    this.wallet.setProviderByNetwork(network)
    this.eth.setEtherScanURLByNetwork()

    if (this.wallet.isUnlocked()) {
      this.wallet.getAccountBalance()
    }

    this.onNetworkChange.next(true)
  }
}
