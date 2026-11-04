import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { ApiService } from '../../core/api.service';
import { FavoritosService } from '../../core/favoritos.service';
import { Producto, Tipo, aProducto, euros } from '../../core/modelos';

interface Seccion {
  nombre: string;
  tipo: Tipo;
  categorias: string[] | null; // los artículos se reparten entre Ordenadores, Tablets y Gaming por categoría
}

const SECCIONES: Seccion[] = [
  { nombre: 'Juegos', tipo: 'videojuegos', categorias: null },
  { nombre: 'Móviles', tipo: 'moviles', categorias: null },
  { nombre: 'Ordenadores', tipo: 'articulos', categorias: ['portatil', 'sobremesa', 'pc_gaming'] },
  { nombre: 'Tablets', tipo: 'articulos', categorias: ['tablet'] },
  { nombre: 'Gaming', tipo: 'articulos', categorias: ['consola', 'mando', 'auriculares', 'teclado', 'raton', 'monitor', 'silla'] },
];

const NOMBRES_CATEGORIA: Record<string, string> = {
  portatil: 'Portátiles', sobremesa: 'Sobremesa', pc_gaming: 'PC gaming Jokoa', tablet: 'Tablets',
  consola: 'Consolas', mando: 'Mandos', auriculares: 'Auriculares', teclado: 'Teclados',
  raton: 'Ratones', monitor: 'Monitores', silla: 'Sillas gaming',
};

const ORDENES = ['Orden: nombre', 'Precio: menor a mayor', 'Precio: mayor a menor'];

// Tienda: Juegos, Móviles, Ordenadores, Tablets y Gaming, con buscador, orden, stock y favoritos
@Component({
  selector: 'app-productos',
  standalone: false,
  template: `
    <ion-header>
      <ion-toolbar>
        <div class="cabecera">
          <img src="assets/logo.svg" alt="Logo de Jokoa" />
          <h1 class="titulo">Tienda</h1>
        </div>
        <div class="campo buscador">
          <input id="buscar" name="buscar" type="search" [ngModel]="texto" (ngModelChange)="texto = $event; filtrar()" placeholder=" " />
          <label for="buscar">Buscar en esta sección</label>
        </div>
        <div class="fila-chips" role="tablist">
          @for (s of secciones; track s.nombre; let i = $index) {
            <button type="button" class="chip-filtro" role="tab" [class.activo]="seccion === i" (click)="elegirSeccion(i)">{{ s.nombre }}</button>
          }
        </div>
        @if (actual.categorias && actual.categorias.length > 1) {
          <div class="fila-chips">
            <button type="button" class="chip-filtro" [class.activo]="categoria === ''" (click)="elegirCategoria('')">Todo</button>
            @for (c of actual.categorias; track c) {
              <button type="button" class="chip-filtro" [class.activo]="categoria === c" (click)="elegirCategoria(c)">{{ nombreCategoria(c) }}</button>
            }
          </div>
        }
        <div class="fila-chips">
          <button type="button" class="chip-filtro suave" (click)="siguienteOrden()">{{ ordenes[orden] }}</button>
          <button type="button" class="chip-filtro" [class.activo]="soloStock" (click)="soloStock = !soloStock; filtrar()">Solo con stock</button>
          <button type="button" class="chip-filtro" [class.activo]="soloFavoritos" (click)="soloFavoritos = !soloFavoritos; filtrar()">Mis favoritos</button>
        </div>
        @if (cargando) { <div class="barra-carga"></div> } @else { <div style="height: 4px; background: var(--jokoa-azul-claro)"></div> }
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <div style="padding: 8px 16px">
        @if (cargando && !fuente.length) {
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
        @if (!cargando && !error && !visibles.length) {
          <div class="estado-centro" style="padding-top: 48px">
            <div class="circulo"><ion-icon name="search"></ion-icon></div>
            <p class="suave">No hay productos con esos filtros</p>
          </div>
        }
        @for (p of visibles; track p.id; let i = $index) {
          <a class="tarjeta producto entra" [class.movil]="p.cuadrada" [style.--i]="i" [routerLink]="['/detalle', p.tipo, p.id]">
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
  secciones = SECCIONES;
  ordenes = ORDENES;
  seccion = 0;
  categoria = ''; // '' = todas las de la sección
  texto = '';
  orden = 0; // 0 nombre, 1 precio ascendente, 2 precio descendente
  soloStock = false;
  soloFavoritos = false;
  visibles: Producto[] = [];
  cargando = true;
  error = false;
  euros = euros;
  // Lo ya descargado de cada fuente: no se vuelve a pedir al cambiar de sección
  private descargado: Partial<Record<Tipo, Producto[]>> = {};
  private readonly cd = inject(ChangeDetectorRef);

  constructor(private api: ApiService, private favoritos: FavoritosService) {}

  get actual(): Seccion {
    return SECCIONES[this.seccion];
  }

  get fuente(): Producto[] {
    return this.descargado[this.actual.tipo] ?? [];
  }

  ngOnInit(): void {
    this.favoritos.cargar().then(() => this.filtrar());
    this.cargar();
  }

  ionViewWillEnter(): void {
    // Al volver de la ficha puede haber cambiado un corazón o el stock
    this.favoritos.cargar().then(() => this.filtrar());
    if (this.descargado[this.actual.tipo]) {
      this.cargar(true);
    }
  }

  nombreCategoria(c: string): string {
    return NOMBRES_CATEGORIA[c] ?? c;
  }

  elegirSeccion(i: number): void {
    this.seccion = i;
    this.categoria = '';
    this.cargar();
  }

  elegirCategoria(c: string): void {
    this.categoria = c;
    this.filtrar();
  }

  siguienteOrden(): void {
    this.orden = (this.orden + 1) % 3;
    this.filtrar();
  }

  async cargar(silencioso = false): Promise<void> {
    const tipo = this.actual.tipo;
    this.error = false;
    if (this.descargado[tipo] && !silencioso) {
      this.cargando = false;
      this.filtrar();
      return;
    }
    this.cargando = !silencioso;
    try {
      const lista = await this.api.get<any[]>('/' + tipo);
      this.descargado[tipo] = lista.map((j) => aProducto(j, tipo));
    } catch {
      if (!silencioso) this.error = true;
    } finally {
      this.cargando = false;
      this.filtrar();
    }
  }

  // Aplica sección, categoría, texto, stock, favoritos y orden a lo descargado
  filtrar(): void {
    const t = this.texto.trim().toLowerCase();
    const permitidas = this.actual.categorias;
    this.visibles = this.fuente
      .filter((p) => !permitidas || (permitidas.includes(p.categoria) && (!this.categoria || p.categoria === this.categoria)))
      .filter((p) => !t || (p.nombre + ' ' + p.etiquetas.join(' ')).toLowerCase().includes(t))
      .filter((p) => !this.soloStock || p.stock > 0)
      .filter((p) => !this.soloFavoritos || this.favoritos.es(p.id))
      .sort((a, b) => (this.orden === 1 ? a.precio - b.precio : this.orden === 2 ? b.precio - a.precio : a.nombre.localeCompare(b.nombre)));
    this.cd.markForCheck();
  }
}
