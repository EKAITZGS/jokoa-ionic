import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { Producto, aProducto, euros } from '../../core/modelos';

// Lista de videojuegos o de móviles: la ruta (/videojuegos o /moviles) viene en los datos de la ruta
@Component({
  selector: 'app-productos',
  standalone: false,
  template: `
    <ion-header>
      <ion-toolbar>
        <div class="cabecera">
          <img src="assets/logo.svg" alt="Logo de Jokoa" />
          <h1 class="titulo">{{ titulo }}</h1>
        </div>
        @if (cargando) { <div class="barra-carga"></div> } @else { <div style="height: 4px; background: var(--jokoa-azul-claro)"></div> }
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <div style="padding: 8px 16px">
        @if (cargando && !productos.length) {
          @for (n of [1, 2, 3, 4]; track n) {
            <div class="tarjeta esqueleto pulso">
              <div class="foto"></div>
              <div style="flex: 1; display: flex; flex-direction: column; height: 124px">
                <div class="b" style="width: 150px; height: 14px; margin-top: 4px"></div>
                <div class="b" style="width: 110px; height: 12px; margin-top: 10px"></div>
                <div class="b" style="width: 64px; height: 14px; margin-top: auto; margin-bottom: 8px"></div>
              </div>
            </div>
          }
        }
        @if (error) {
          <div class="estado-centro">
            <div class="circulo"><ion-icon name="cloud-offline"></ion-icon></div>
            <p>No se pudieron cargar los datos</p>
            <button class="btn coral compacto" type="button" (click)="cargar()"><ion-icon name="refresh"></ion-icon>Reintentar</button>
          </div>
        }
        @for (p of productos; track p.id; let i = $index) {
          <a class="tarjeta producto entra" [class.movil]="p.esMovil" [style.--i]="i" [routerLink]="['/detalle', p.esMovil ? 'moviles' : 'videojuegos', p.id]">
            <div class="foto">
              @if (p.imagen) { <img [src]="p.imagen" [alt]="p.nombre" loading="lazy" /> }
            </div>
            <div class="cuerpo">
              <h3>{{ p.nombre }}</h3>
              <div class="detalle">{{ p.etiquetas.join(' · ') }}</div>
              <div class="pie">
                <span class="precio">{{ euros(p.precio) }}</span>
                <span class="ir"><ion-icon name="chevron-forward"></ion-icon></span>
              </div>
            </div>
          </a>
        }
      </div>
    </ion-content>
  `,
})
export class ProductosPage implements OnInit {
  titulo = '';
  productos: Producto[] = [];
  cargando = true;
  error = false;
  euros = euros;
  private ruta = '';
  private esMovil = false;
  private cargadoUnaVez = false;
  private readonly cd = inject(ChangeDetectorRef);

  constructor(private route: ActivatedRoute, private api: ApiService) {}

  ngOnInit(): void {
    const datos = this.route.snapshot.data;
    this.titulo = datos['titulo'];
    this.ruta = datos['ruta'];
    this.esMovil = !!datos['movil'];
    this.cargar();
  }

  ionViewWillEnter(): void {
    // Al volver de la ficha se refresca el stock sin enseñar el esqueleto
    if (this.cargadoUnaVez) {
      this.cargar(true);
    }
  }

  async cargar(silencioso = false): Promise<void> {
    this.error = false;
    this.cargando = !silencioso;
    try {
      const lista = await this.api.get<any[]>(this.ruta);
      this.productos = lista.map((j) => aProducto(j, this.esMovil));
      this.cargadoUnaVez = true;
    } catch {
      if (!silencioso) {
        this.productos = [];
        this.error = true;
      }
    } finally {
      this.cargando = false;
      this.cd.markForCheck();
    }
  }
}
