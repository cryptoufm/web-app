import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SharedService {

  onMobileMenu: Subject<any> = new Subject<any>()

  onCrowdsaleShowModal: Subject<any> = new Subject<any>()

  isMobileMenuOn: boolean = false

  constructor() { }

  displayCrowdsaleShowModal() {
    this.onCrowdsaleShowModal.next({
      display: true,
      onQrCode: true,
    })
  }

  toggleMobileMenu() {
    this.isMobileMenuOn = !this.isMobileMenuOn
    this.onMobileMenu.next({
      display: this.isMobileMenuOn
    })
  }

  updateCopyTrigger(trigger) {
    trigger.innerHTML = '<i class="icon-checkmark-circle"></i>'
    trigger.classList.add('btn-success')
    trigger.classList.remove('btn-outline-white')
    setTimeout(() => {
      trigger.innerHTML = 'copy'
      trigger.classList.remove('copied')
      trigger.classList.add('btn-outline-white')
      trigger.classList.remove('btn-success')
    }, 2000);
  }

}
