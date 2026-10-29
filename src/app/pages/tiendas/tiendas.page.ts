import { ChangeDetectorRef, Component, OnDestroy, inject } from '@angular/core';
import * as L from 'leaflet';
import { ApiService } from '../../core/api.service';
import { AvisoService } from '../../core/aviso.service';

interface Tienda {
  id: number;
  nombre: string;
  direccion: string;
  telefono: string;
  horario: string;
  latitud: number;
  longitud: number;
}

// Mapa con las tiendas de Jokoa (GET /tiendas): pin azul por tienda, el seleccionado en coral y su tarjeta abajo
@Component({
  selector: 'app-tiendas',
  standalone: false,
  template: `
    <ion-content [scrollY]="false">
      <div class="mapa-caja" style="position: absolute; inset: 0; height: auto">
        <div id="mapa"></div>
        <div class="mapa-titulo"><img src="assets/logo.svg" alt="Logo de Jokoa" />Tiendas</div>
        @if (sel) {
          <div class="tarjeta tienda-tarjeta">
            <h3><img src="assets/logo.svg" alt="" />{{ sel.nombre }}</h3>
            <div class="dato"><ion-icon name="location"></ion-icon>{{ sel.direccion }}</div>
            <div class="dato"><ion-icon name="time"></ion-icon>{{ sel.horario }}</div>
            <div class="dato"><ion-icon name="call"></ion-icon>Tel. {{ sel.telefono }}</div>
            <a class="btn compacto" style="width: 100%" [href]="ruta(sel)" target="_blank" rel="noopener"><ion-icon name="navigate"></ion-icon>Cómo llegar</a>
          </div>
        }
      </div>
    </ion-content>
  `,
})
export class TiendasPage implements OnDestroy {
  sel?: Tienda;
  private mapa?: L.Map;
  private tiendas: Tienda[] = [];
  private marcadores: L.Marker[] = [];
  private readonly cd = inject(ChangeDetectorRef);

  constructor(private api: ApiService, private aviso: AvisoService) {}

  async ionViewDidEnter(): Promise<void> {
    if (!this.mapa) {
      this.mapa = L.map('mapa', { zoomControl: false, attributionControl: true }).setView([43.29, -2.96], 11);
      // Mosaicos grises de Esri: dejan destacar los pines
      L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 16,
        attribution: 'Tiles © Esri',
      }).addTo(this.mapa);
      await this.cargar();
    }
    this.mapa.invalidateSize();
  }

  ngOnDestroy(): void {
    this.mapa?.remove();
  }

  ruta(t: Tienda): string {
    return `https://www.google.com/maps/dir/?api=1&destination=${t.latitud},${t.longitud}`;
  }

  private icono(seleccionado: boolean): L.DivIcon {
    return L.divIcon({
      className: 'pin-tienda',
      html: `<img src="assets/${seleccionado ? 'pin-sel' : 'pin'}.svg" width="40" height="52" alt="" />`,
      iconSize: [40, 52],
      iconAnchor: [20, 52],
    });
  }

  private async cargar(): Promise<void> {
    try {
      this.tiendas = await this.api.get<Tienda[]>('/tiendas');
    } catch {
      this.aviso.mostrar('No se pudieron cargar las tiendas');
      return;
    }
    this.tiendas.forEach((t, i) => {
      const marcador = L.marker([t.latitud, t.longitud], { icon: this.icono(false), keyboard: false }).addTo(this.mapa!);
      marcador.on('click', () => this.seleccionar(i));
      this.marcadores.push(marcador);
    });
    if (this.tiendas.length > 1) {
      // Se ajusta el zoom para que se vean todas las tiendas, sin que las tape la tarjeta de abajo
      this.mapa!.fitBounds(L.latLngBounds(this.tiendas.map((t) => [t.latitud, t.longitud] as [number, number])), {
        paddingTopLeft: [50, 90],
        paddingBottomRight: [50, 260],
      });
    }
    if (this.tiendas.length) {
      this.seleccionar(0);
    }
  }

  private seleccionar(i: number): void {
    this.marcadores.forEach((m, j) => {
      m.setIcon(this.icono(i === j));
      m.setZIndexOffset(i === j ? 1000 : 0);
    });
    this.sel = this.tiendas[i];
    this.cd.markForCheck();
  }
}
