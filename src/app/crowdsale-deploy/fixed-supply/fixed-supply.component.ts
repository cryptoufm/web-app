import { Component, OnInit } from '@angular/core';
import { CrowdsaleDeploymentFactory } from '@factory/crowdsale-deployment.factory';
import { CrowdsaleDeployment } from '@factory/crowdsale-deployment';
import { SimpleToken } from '@token/simpletoken';
import { SimpleCrowdsale } from '@crowdsale/simplecrowdsale';
import { InsufficientFundsError } from '@error/insufficient-funds.error';
import { WalletService } from '@service/wallet.service';
import { EthereumService } from '@service/ethereum.service';
import { SharedService } from '@service/shared.service';

declare var require: any
const ethers = require('ethers')


@Component({
  selector: 'app-fixed-supply',
  templateUrl: './fixed-supply.component.html',
  styleUrls: ['./fixed-supply.component.css']
})
export class FixedSupplyComponent implements OnInit {

  deployer: CrowdsaleDeployment

  token: SimpleToken

  crowdsale: SimpleCrowdsale

  stepCount: number = 0

  supply: string

  steps: any = {
    estimateTxCosts: {
      step: 1,
      isCurrent: true,
      isComplete: false,
      hasError: false,
      estimates: []
    },
    deployToken: {
      step: 2,
      isCurrent: false,
      isComplete: false,
      hasError: false,
      errorMessage: '',
    },
    deployCrowdsale: {
      step: 3,
      isCurrent: false,
      isComplete: false,
      hasError: false,
      errorMessage: '',
    }
  }

  constructor(
    private crowdsaleFactory: CrowdsaleDeploymentFactory,
    private wallet: WalletService,
    public eth: EthereumService,
    public shared: SharedService) {

    this.deployer = crowdsaleFactory.deployer
  }

  ngOnInit() {

    this.token = this.deployer.getToken()
    this.crowdsale = this.deployer.getCrowdsale()

    this.stepCount = Object.keys(this.steps).length

    this.init()

  }

  async init(){
    this.steps.estimateTxCosts.isCurrent = true
    this.steps.estimateTxCosts.isComplete = false
    this.steps.estimateTxCosts.hasError = false
    this.steps.estimateTxCosts.estimates = []

    try {
      await this.estimateTransactionCosts()
    } catch (error) {
      if (error instanceof InsufficientFundsError) {
        this.steps.estimateTxCosts.hasError = true
      }
    }
  }

  async deployToken(){
    this.supply = this.token.supply.toString()

    this.steps.estimateTxCosts.isCurrent = false
    this.steps.deployToken.isCurrent = true

    try {
      await this.deployer.deployToken()
      this.supply = ethers.utils.bigNumberify(this.token.supply).div(1e18.toString()).toString()

      this.steps.deployToken.isComplete = true
    } catch (error) {
      console.log(error)
      this.steps.deployToken.hasError = true
      this.steps.deployToken.errorMessage = 'Something bad happened'
    }
  }

  async deployCrowdsale(){
    this.steps.deployToken.isCurrent = false
    this.steps.deployCrowdsale.isCurrent = true
  }

  async estimateTransactionCosts(){
    this.steps.estimateTxCosts.estimates.push({
      text: 'ERC20 token deployment',
      txCost: '...'
    })
    let txCost = await this.deployer.estimateTokenDeploymentCost()
    this.steps.estimateTxCosts.estimates[0].txCost = txCost.ETH

    this.steps.estimateTxCosts.estimates.push({
      text: 'Crowdsale contract deployment',
      txCost: '...'
    })
    txCost = await this.deployer.estimateCrowdsaleDeploymentCost()
    this.steps.estimateTxCosts.estimates[1].txCost = txCost.ETH

    this.steps.estimateTxCosts.estimates.push({
      text: 'Transfer token supply to crowdsale',
      txCost: '...'
    })
    txCost = await this.deployer.estimateTokenTransferCost()
    let simpleICOCost = await this.deployer.estimateSimpleICOCost()
    let cost = txCost.cost.add(simpleICOCost.cost)
    this.steps.estimateTxCosts.estimates[2].txCost = ethers.utils.formatEther(cost.toString())

    this.steps.estimateTxCosts.estimates.push({
      text: 'TOTAL',
      txCost: this.deployer.txCost.ETH
    })

    let wei = this.deployer.txCost.WEI
    let hasInsufficientFunds = wei.gt(this.wallet.balance)

    console.log(hasInsufficientFunds, wei.toString(), this.wallet.balance)

    if (hasInsufficientFunds) {
      throw new InsufficientFundsError(InsufficientFundsError.MESSAGE)
    }

    this.steps.estimateTxCosts.isComplete = true
  }

}







