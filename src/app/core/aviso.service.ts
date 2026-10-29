import { Injectable } from '@angular/core';
import { ToastController } from '@ionic/angular/lazy';

@Injectable({ providedIn: 'root' })
export class AvisoService {
  constructor(private toasts: ToastController) {}

  async mostrar(mensaje: string): Promise<void> {
    const toast = await this.toasts.create({ message: mensaje, duration: 2800, position: 'bottom', cssClass: 'aviso-jokoa' });
    await toast.present();
  }
}
