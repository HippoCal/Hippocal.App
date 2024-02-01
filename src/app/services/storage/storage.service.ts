import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  private _storage: Storage | null = null;

  constructor(private ionicStorage: Storage) {
      this.isReady = false;
   }

   init(callback?: any) {
    this.ionicStorage.create().then( (dataStorage) => {
      this._storage = dataStorage;
      this.isReady = true;
      if(callback) {
        callback();
      }
    }) ;
  }

  public isReady: boolean;

  public async set(key: string, value: any){
    await this._storage?.set(key, value);
  }

  public async get(key: string){
    var result = await this._storage?.get(key);
    return result;
  }

  public async remove(key: string){
    return await this._storage?.remove(key);
  }

  public async clear(){
    return await this._storage?.clear();
  }

  public async keys(){
    return await this._storage?.keys();
  }
}
