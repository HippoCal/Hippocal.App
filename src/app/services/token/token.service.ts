import { Injectable } from '@angular/core';
import { TokenViewmodel } from "../../viewmodels/viewmodels";
import * as moment from 'moment';
import { StorageService } from '../services';

@Injectable()
export class TokenService {

  private TOKEN_KEY: string = '_token';
  public token: TokenViewmodel;
  private expiry: any;

  constructor(public storage: StorageService) {
    this.getToken();
  }

  resetToken() {
    this.setExpiry(-100);
  }

  saveToken(token: TokenViewmodel) {
    this.setExpiry(token.Expires);
    this.token = token;
    return this.storage.set(this.TOKEN_KEY, token);
  }

  async loadToken(): Promise<TokenViewmodel> {
    if(this.token === undefined || this.token.Token === '')
    {
      await this.getToken();
    }
    return new Promise((resolve, reject) => {
      resolve(this.token);
    });

  }

  async getToken() {
    await this.storage.get(this.TOKEN_KEY).then(data => {
      if (data !== undefined && data !== null) {
        this.token = data !== undefined && data !== null ? 
        new TokenViewmodel(data.UserKey, data.UserPin, data.Token, data.EMail, data.Expires) : 
        new TokenViewmodel('', '', '', '', 0);
      }
    });
  }

  private setExpiry(minutes: number) {
    this.expiry = moment().add(minutes, 'minutes');
  }

  get Expired(): boolean {
    var now = moment();
    return now.isAfter(this.expiry);
  }

}
