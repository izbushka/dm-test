import {Injectable} from '@angular/core';
import {LocalStorageService, SessionStorageService} from 'ngx-webstorage';

interface StorageItem {
  value: any;
  expire: string;
}


@Injectable({
  providedIn: 'root'
})
export class AppStorageService {

  constructor(
    private localStorage: LocalStorageService,
    private sessionStorage: SessionStorageService,
  ) { }

  get(storageType: string, key: string): any {
    let res = null;
    const stringValue = this.storageApi(storageType).retrieve(key);
    if (stringValue !== null) {
      const value: StorageItem = JSON.parse(stringValue);
      if (!value.expire || new Date(value.expire) > new Date()) {
        res = value.value;
      } else {
        this.storageApi(storageType).clear(key);
      }
    }
    return res;
  }

// add into session
  set(storageType: string, key, val, expirationInSec = null) {
    let expirationDate: any = '';
    if (expirationInSec) {
      expirationDate = new Date(new Date().getTime() + (1000 * expirationInSec));
    } else {
      expirationDate = new Date('2100-01-01 00:00:00');
    }
    const newValue: StorageItem = {
      value: val,
      expire: expirationDate.toISOString()
    };
    this.storageApi(storageType).store(key, JSON.stringify(newValue));
  }

  private storageApi(storageType: string): any {
    if (storageType === 'session') {
      return this.sessionStorage;
    } else if (storageType === 'local') {
      return this.localStorage;
    } else {
      return null;
    }
  }

}
