import { Contract } from '@model/contract.model';
import { Wallet } from '@model/wallet.model';

declare var require: any

const SimpleTokenInterface = require('@abi/simpletoken.abi.json')

export class SimpleToken extends Contract {

  name: string

  symbol: string

  decimals: number = 18

  supply: any

  price: any

  web3: any

  truffleContract: any

  txObject: any

  bytecode = SimpleTokenInterface.bytecode

  address: string

  crowdsale: string

  constructor(
    wallet: Wallet,
    name?: string,
    symbol?: string,
    supply?: number,
    price?: number) {

    super(wallet)

    this.name = name
    this.symbol = symbol
    this.supply = supply
    this.price = price

    this.web3 = wallet.web3
  }

  setAddress(address: string){
    this.instance.options.address = address
    this.instance._address = address
    this.address = address

    return this
  }

  getAddress(){
    return this.address
  }

  async getName(){
    this.name = await this.instance.methods.name().call()
  }

  async getSymbol(){
    this.symbol = await this.instance.methods.symbol().call()
  }

  onTransfer(){
    this.truffleContract.Transfer().watch((error, result) => {
      if (error) console.log(error)

      console.log(result)
    })
  }

  connect(){
    let _contract = new this.web3.eth.Contract(SimpleTokenInterface.abi)

    this.instance = _contract

    console.log(this.instance)

    return this
  }

  async deploy(){

    try {
      return this.instance.deploy({
        data: SimpleTokenInterface.bytecode,
        arguments: [this.name, this.symbol, this.decimals, this.supply]
      })
    } catch (error) {
      console.log(error)
    }

  }

}
