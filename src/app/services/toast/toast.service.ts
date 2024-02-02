import { Injectable } from '@angular/core';
import { ToastController, AlertController } from "@ionic/angular";
import { TranslateService } from '@ngx-translate/core';


@Injectable({
  providedIn: 'root'
})
export class ToastService {

  private toastVisible: boolean;
  private toastText: string;

  constructor(
    private translate: TranslateService,
    private toastCtrl: ToastController,
    private alertCtrl: AlertController,

  ) { }

  public confirm (action: any, header: any, msg: any, cancel?: any) {
    var headerText = this.translate.instant(header);
    var msgText = this.translate.instant(msg);
    this.translate.get([
      "BTN_CANCEL",
      "BTN_OK"
    ]).subscribe(
      async (values) => {
        this.alertCtrl.create({
          header: headerText,
          message: msgText,
          buttons: [
            { text: values.BTN_CANCEL, role: 'cancel', handler: () => {  cancel(); } },
            { text: values.BTN_OK, handler: () => { action(); } }
          ]
        }).then( (alert: any) => {
          alert.present();
        });
      }
    );
  };

  public showMessage(messageId: string, header: string, useTranslation: boolean, css?: string, duration?: number) {
    var message = useTranslation ? this.translate.instant(messageId) : messageId;
    var headerText = useTranslation && header !== '' ? this.translate.instant(header) : header;

    if (!this.toastVisible && message !== this.toastText) {
      try {
        this.toastCtrl.dismiss().then(() => {
        }).catch(() => {
        }).finally(() => {
          this.toastVisible = false;
          this.toastText = '';
        });
      } catch (e) { }

      var dur: number = 3000;
      if(duration) {
        dur = duration;
      }

      this.toastCtrl.create({
        header: headerText,
        message: message,
        duration: dur,
        position: 'middle',
        cssClass: css !== undefined ? css : "alerttoast",

      }).then((toast: any) => {
        this.toastVisible = true;
        this.toastText = message;
        toast.present();
      });
    }
  }
}
