import { Component } from '@angular/core';

@Component({
  selector: 'app-tabs',
  standalone: false,
  template: `
    <ion-tabs>
      <ion-tab-bar slot="bottom">
        <ion-tab-button tab="tienda"><span class="pildora"><ion-icon name="storefront"></ion-icon></span><ion-label>Tienda</ion-label></ion-tab-button>
        <ion-tab-button tab="asesor"><span class="pildora"><ion-icon name="sparkles"></ion-icon></span><ion-label>Asesor</ion-label></ion-tab-button>
        <ion-tab-button tab="tiendas"><span class="pildora"><ion-icon name="location"></ion-icon></span><ion-label>Tiendas</ion-label></ion-tab-button>
        <ion-tab-button tab="pedidos"><span class="pildora"><ion-icon name="cart"></ion-icon></span><ion-label>Pedidos</ion-label></ion-tab-button>
        <ion-tab-button tab="perfil"><span class="pildora"><ion-icon name="person"></ion-icon></span><ion-label>Perfil</ion-label></ion-tab-button>
      </ion-tab-bar>
    </ion-tabs>
  `,
})
export class TabsPage {}
