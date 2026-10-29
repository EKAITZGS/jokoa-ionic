import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { ApiService, mensajeError } from '../../core/api.service';
import { AvisoService } from '../../core/aviso.service';
import { euros } from '../../core/modelos';

interface Fila {
  id: number;
  titulo: string;
  derecha: string;
  detalle: string;
  devuelto: boolean;
  puedeDevolver: boolean;
}

// Historial del usuario: pestaña de compras y pestaña de alquileres (con botón Devolver)
@Component({
  selector: 'app-pedidos',
  standalone: false,
  template: `
    <ion-header>
      <ion-toolbar>
        <div class="cabecera">
          <img src="assets/logo.svg" alt="Logo de Jokoa" />
          <h1 class="titulo">Mis pedidos</h1>
        </div>
        <div class="pestanas" role="tablist">
          <button type="button" role="tab" [class.activa]="compras" (click)="elegir(true)">Compras</button>
          <button type="button" role="tab" [class.activa]="!compras" (click)="elegir(false)">Alquileres</button>
        </div>
        @if (cargando) { <div class="barra-carga"></div> } @else { <div style="height: 4px; background: var(--jokoa-azul-claro)"></div> }
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <div style="padding: 12px 16px 8px">
        @if (!cargando && !filas.length) {
          <div class="estado-centro">
            <div class="circulo"><ion-icon name="cart"></ion-icon></div>
            <p class="suave">{{ compras ? 'Todavía no has comprado nada' : 'Todavía no has alquilado nada' }}</p>
          </div>
        }
        @for (f of filas; track f.id; let i = $index) {
          <div class="tarjeta fila entra" [style.--i]="i">
            <div class="arriba">
              <h3>{{ f.titulo }}</h3>
              <span class="derecha">{{ f.derecha }}</span>
            </div>
            <div class="txt">{{ f.detalle }}</div>
            @if (f.devuelto) {
              <span class="chip exito"><ion-icon name="checkmark"></ion-icon>Devuelto</span>
            }
            @if (f.puedeDevolver) {
              <div class="accion"><button class="btn coral compacto" type="button" (click)="devolver(f)">Devolver</button></div>
            }
          </div>
        }
      </div>
    </ion-content>
  `,
})
export class PedidosPage implements OnInit {
  compras = true;
  filas: Fila[] = [];
  cargando = true;
  private cargadoUnaVez = false;
  private readonly cd = inject(ChangeDetectorRef);

  constructor(private api: ApiService, private aviso: AvisoService) {}

  ngOnInit(): void {
    this.cargar();
  }

  ionViewWillEnter(): void {
    if (this.cargadoUnaVez) {
      this.cargar(true);
    }
  }

  elegir(compras: boolean): void {
    if (this.compras !== compras) {
      this.compras = compras;
      this.filas = [];
      this.cargar();
    }
  }

  async cargar(silencioso = false): Promise<void> {
    const sonCompras = this.compras;
    this.cargando = !silencioso;
    try {
      const datos = await this.api.get<any[]>(sonCompras ? '/compras' : '/alquileres');
      if (sonCompras !== this.compras) {
        return; // se cambió de pestaña mientras llegaba la respuesta
      }
      this.filas = sonCompras ? datos.map((c) => this.fila_compra(c)) : datos.map((a) => this.fila_alquiler(a));
      this.cargadoUnaVez = true;
    } catch (e) {
      if (!silencioso) {
        this.aviso.mostrar(mensajeError(e, 'No se pudieron cargar los datos'));
      }
    } finally {
      this.cargando = false;
      this.cd.markForCheck();
    }
  }

  async devolver(f: Fila): Promise<void> {
    try {
      await this.api.put(`/alquileres/devolver/${f.id}`);
      this.aviso.mostrar('Juego devuelto');
      this.cargar(true);
    } catch (e) {
      this.aviso.mostrar(mensajeError(e, 'No se pudo devolver'));
    }
  }

  private fila_compra(c: any): Fila {
    return {
      id: c.id,
      titulo: `Compra #${c.id} · ${String(c.fecha).substring(0, 10)}`,
      derecha: euros(Number(c.total)),
      detalle: (c.lineas ?? []).map((l: any) => `${l.cantidad} × ${l.nombre}`).join('\n'),
      devuelto: false,
      puedeDevolver: false,
    };
  }

  private fila_alquiler(a: any): Fila {
    const devuelto = !!a.fecha_devolucion;
    return {
      id: a.id,
      titulo: a.videojuego,
      derecha: `${euros(Number(a.precio_dia))}/día`,
      detalle: `Del ${a.fecha_inicio} al ${a.fecha_fin}` + (devuelto ? `\nDevuelto el ${a.fecha_devolucion}` : ''),
      devuelto,
      puedeDevolver: !devuelto,
    };
  }
}
