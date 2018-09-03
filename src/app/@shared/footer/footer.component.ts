import { Component, OnInit } from '@angular/core';
import { WalletService } from 'scui-lib';
import { SettingsService } from '@service/settings.service';
import { Network } from '@model/network.model';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements OnInit {

  currentNetwork: number = 0

  constructor(
    public wallet: WalletService,
    public settings: SettingsService) { }

  ngOnInit() {
  }

  toggleNetwork() {
    this.currentNetwork = Number(!this.currentNetwork)
    this.settings.setNetwork(this.settings.networks[this.currentNetwork])
  }
}
