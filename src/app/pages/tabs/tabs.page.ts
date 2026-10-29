import { Component } from '@angular/core';

@Component({
  selector: 'app-tabs',
  standalone: false,
  template: `
    <ion-tabs>
      <ion-tab-bar slot="bottom">
        <ion-tab-button tab="juegos"><span class="pildora"><ion-icon name="game-controller"></ion-icon></span><ion-label>Juegos</ion-label></ion-tab-button>
        <ion-tab-button tab="moviles"><span class="pildora"><ion-icon name="phone-portrait"></ion-icon></span><ion-label>Móviles</ion-label></ion-tab-button>
        <ion-tab-button tab="tiendas"><span class="pildora"><ion-icon name="location"></ion-icon></span><ion-label>Tiendas</ion-label></ion-tab-button>
        <ion-tab-button tab="pedidos"><span class="pildora"><ion-icon name="cart"></ion-icon></span><ion-label>Pedidos</ion-label></ion-tab-button>
        <ion-tab-button tab="perfil"><span class="pildora"><ion-icon name="person"></ion-icon></span><ion-label>Perfil</ion-label></ion-tab-button>
      </ion-tab-bar>
    </ion-tabs>
  `,
})
export class TabsPage {}
