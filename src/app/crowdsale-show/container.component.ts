import { Component, OnInit, NgZone } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EthereumService } from '@service/ethereum.service';
import { WalletService } from '@service/wallet.service';
import { SharedService } from '@service/shared.service';
import { SimpleCrowdsale } from '@model/simplecrowdsale.model';
import { SimpleToken } from '@model/simpletoken.model';

declare var require: any

const ethers = require('ethers')
const clipboard = require('clipboard')

@Component({
  selector: 'app-container',
  templateUrl: './container.component.html',
  styleUrls: ['./container.component.css']
})

export class ContainerComponent implements OnInit {

  crowdsaleAddress: string

  ethRaised: string = '0.0'

  crowdsale: SimpleCrowdsale

  token: SimpleToken

  txHistory: Array<any> = []

  constructor(
    private route: ActivatedRoute,
    public eth: EthereumService,
    public shared: SharedService,
    private zone: NgZone,
    private wallet: WalletService) {}

  ngOnInit() {
    this.route.params.subscribe(({ crowdsaleAddress }) => {
      this.crowdsaleAddress = crowdsaleAddress

      this.crowdsale = new SimpleCrowdsale(this.wallet.getInstance())
      this.crowdsale.connect()
      this.crowdsale.setAddress(this.crowdsaleAddress)
      console.log(this.crowdsale)
      this.subscribe()

      this.token = new SimpleToken(this.wallet.getInstance())
      this.token.connect()

      this.getCrowdsaleData()
      this.getTokenData()
    })
  }

  ngAfterViewInit(){
    let self = this

    new clipboard(`.copy-crowdsale-address`, {
      text: function(trigger) {

        self.updateCopyTrigger(trigger)

        return self.crowdsale.getAddress()
      }
    })
  }

  updateCopyTrigger(trigger){
    trigger.innerHTML = '<i class="icon-checkmark-circle"></i>'
    trigger.classList.add('copied')
    setTimeout(() => {
      trigger.innerHTML = '<i class="icon-copy"></i>'
      trigger.classList.remove('copied')
    }, 2000);
  }

  refresh(){
    this.crowdsale.getEthRaised()
    this.crowdsale.getAvailableTokens(this.token)
  }

  subscribe(){
    this.crowdsale.subscribeToEvents()
      .on('data', event => {
        console.log(event)
        this.crowdsale.getEthRaised()
        this.crowdsale.getAvailableTokens(this.token)

        this.getTransaction(event.transactionHash)
      }).on('error', error => {
        console.log(error)
      })
  }

  async getTransaction(hash: string){
    try {
      let tx = await this.crowdsale.web3.eth.getTransaction(hash)

      console.log(tx)

      this.txHistory.unshift({
        hash: tx.hash,
        from: tx.from,
        to: tx.to,
        value: `ETH ${ethers.utils.formatEther(tx.value)}`
      })

      this.zone.run(() => console.log('Updated txHistory'))
    } catch (error) {
      console.log(error)
    }
  }

  async getCrowdsaleData(){
    this.crowdsale.getEthRaised()

    this.crowdsale.web3.eth.getPastLogs({
      fromBlock: '0x0',
      address: this.crowdsale.address
    }).then(res => {
      console.log(res)
      res.forEach(rec => {
        this.getTransaction(rec.transactionHash)
      })
    }).catch(err => console.log)

    this.getTokenData()
  }

  async getTokenData(){
    let tokenAddress = await this.crowdsale.instance.methods.token().call()
    this.token.setAddress(tokenAddress)

    this.crowdsale.getAvailableTokens(this.token)

    this.token.getName()
    this.token.getSymbol()
  }
}