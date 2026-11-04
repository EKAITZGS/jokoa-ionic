import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NavController } from '@ionic/angular/lazy';
import { ApiService, mensajeError } from '../../core/api.service';
import { AvisoService } from '../../core/aviso.service';
import { CompararService } from '../../core/comparar.service';
import { FavoritosService } from '../../core/favoritos.service';
import { Producto, Tipo, aProducto, euros } from '../../core/modelos';

// Ficha grande de un videojuego, móvil o artículo, con compra, garantía ampliada y (en juegos) alquiler
@Component({
  selector: 'app-detalle',
  standalone: false,
  template: `
    <ion-content [fullscreen]="true">
      <div class="pagina ficha-pagina">
        <div class="ficha-arriba">
          <button class="atras" type="button" (click)="atras()" aria-label="Volver"><ion-icon name="arrow-back"></ion-icon></button>
          @if (p) {
            <button class="favorito" type="button" [class.marcado]="favoritos.es(p.id)" (click)="corazon()"
              [attr.aria-label]="favoritos.es(p.id) ? 'Quitar de favoritos' : 'Añadir a favoritos'" [attr.aria-pressed]="favoritos.es(p.id)">
              <ion-icon [name]="favoritos.es(p.id) ? 'heart' : 'heart-outline'"></ion-icon>
            </button>
            <img class="portada" [class.cuadrada]="p.cuadrada" [src]="p.imagen" [alt]="p.nombre" />
          } @else if (!error) {
            <div class="portada pulso" style="background: #fff"></div>
          }
        </div>

        <div class="hoja">
          @if (p) {
            <h1>{{ p.nombre }}</h1>
            <div class="chips">
              @for (e of p.etiquetas; track $index; let ultima = $last) {
                <span class="chip" [class.contorno]="ultima && p.tipo === 'videojuegos'">{{ e }}</span>
              }
            </div>
            <div class="precio-fila">
              <span class="precio-grande">{{ euros(p.precio) }}</span>
              @if (p.stock > 0) {
                <span class="chip coral">Quedan {{ p.stock }} unidades</span>
              } @else {
                <span class="chip gris">Sin stock</span>
              }
            </div>
            <p class="descripcion">{{ p.descripcion }}</p>
            @if (p.ficha.length) {
              <div class="ficha-tecnica">
                <h2>Ficha técnica</h2>
                @for (d of p.ficha; track d[0]) { <p><b>{{ d[0] }}:</b> {{ d[1] }}</p> }
              </div>
            }
            @if (p.garantias.length) {
              <button class="btn tonal" type="button" (click)="garantiaAbierta = true">{{ textoGarantia() }}</button>
            }
            <button class="btn tonal" type="button" (click)="alternarComparar()">{{ comparar.es(p.id) ? 'Quitar del comparador' : 'Añadir al comparador' }}</button>
            @if (comparar.items.length >= 2) {
              <button class="btn tonal" type="button" (click)="verComparacion = true">Ver comparación ({{ comparar.items.length }})</button>
            }
            <div class="botones">
              <button class="btn" type="button" [disabled]="p.stock <= 0 || ocupado" (click)="abrirTiendas()">{{ textoComprar() }}</button>
              @if (p.tipo === 'videojuegos') {
                <button class="btn coral" type="button" [disabled]="p.stock <= 0 || ocupado" (click)="dias = true">Alquilar · {{ euros(p.alquilerDia) }}/día</button>
              }
            </div>
          } @else if (error) {
            <div class="estado-centro" style="padding-top: 48px">
              <div class="circulo"><ion-icon name="cloud-offline"></ion-icon></div>
              <p>No se pudo cargar el producto</p>
              <button class="btn coral compacto" type="button" (click)="cargar()"><ion-icon name="refresh"></ion-icon>Reintentar</button>
            </div>
          }
        </div>
      </div>

      @if (dias && p) {
        <div class="dialogo-fondo" (click)="dias = false">
          <div class="dialogo lista" (click)="$event.stopPropagation()" role="dialog" aria-label="¿Cuántos días?">
            <h2>¿Cuántos días?</h2>
            @for (d of opcionesDias; track d) {
              <button class="opcion" type="button" (click)="alquilar(d)">
                {{ d }} {{ d === 1 ? 'día' : 'días' }}<ion-icon name="chevron-forward"></ion-icon>
              </button>
            }
            <div class="acciones"><button class="btn-texto" type="button" (click)="dias = false">Cancelar</button></div>
          </div>
        </div>
      }

      @if (tiendasAbierto) {
        <div class="dialogo-fondo" (click)="tiendasAbierto = false">
          <div class="dialogo lista" (click)="$event.stopPropagation()" role="dialog" aria-label="¿Dónde recoges tu pedido?">
            <h2>¿Dónde recoges tu pedido?</h2>
            @for (t of tiendas; track t.id) {
              <button class="opcion" type="button" (click)="comprar(t.id)">{{ t.nombre }}<ion-icon name="chevron-forward"></ion-icon></button>
            }
            <div class="acciones"><button class="btn-texto" type="button" (click)="tiendasAbierto = false">Cancelar</button></div>
          </div>
        </div>
      }

      @if (verComparacion) {
        <div class="dialogo-fondo" (click)="verComparacion = false">
          <div class="dialogo lista" style="width: min(560px, calc(100% - 24px)); overflow: auto" (click)="$event.stopPropagation()" role="dialog" aria-label="Comparador">
            <h2>Comparador</h2>
            <table class="comparador-tabla">
              <tr><th></th>@for (x of comparar.items; track x.id) { <th>{{ x.nombre }}</th> }</tr>
              <tr><th>Precio</th>@for (x of comparar.items; track x.id) { <td>{{ euros(x.precio) }}</td> }</tr>
              <tr><th>Datos</th>@for (x of comparar.items; track x.id) { <td>{{ x.etiquetas.join(' · ') }}</td> }</tr>
              <tr><th>Stock</th>@for (x of comparar.items; track x.id) { <td>{{ x.stock > 0 ? x.stock + ' uds.' : 'Sin stock' }}</td> }</tr>
              @for (c of comparar.claves(); track c) {
                <tr><th>{{ c }}</th>@for (x of comparar.items; track x.id) { <td>{{ comparar.dato(x, c) }}</td> }</tr>
              }
            </table>
            <div class="acciones"><button class="btn-texto" type="button" (click)="verComparacion = false">Cerrar</button></div>
          </div>
        </div>
      }

      @if (garantiaAbierta && p) {
        <div class="dialogo-fondo" (click)="garantiaAbierta = false">
          <div class="dialogo lista" (click)="$event.stopPropagation()" role="dialog" aria-label="Garantía ampliada">
            <h2>Garantía ampliada</h2>
            <button class="opcion" type="button" (click)="elegirGarantia(-1)">Sin garantía ampliada<ion-icon [name]="garantia < 0 ? 'checkmark' : ''"></ion-icon></button>
            @for (g of p.garantias; track g.meses; let i = $index) {
              <button class="opcion" type="button" (click)="elegirGarantia(i)">+{{ g.meses }} meses · {{ euros(g.precio) }}<ion-icon [name]="garantia === i ? 'checkmark' : ''"></ion-icon></button>
            }
            <div class="acciones"><button class="btn-texto" type="button" (click)="garantiaAbierta = false">Cerrar</button></div>
          </div>
        </div>
      }
    </ion-content>
  `,
})
export class DetallePage implements OnInit {
  p?: Producto;
  error = false;
  ocupado = false;
  dias = false;
  tiendasAbierto = false;
  verComparacion = false;
  tiendas: { id: number; nombre: string }[] = [];
  garantiaAbierta = false;
  garantia = -1; // posición elegida en p.garantias, o -1
  euros = euros;
  readonly opcionesDias = [1, 3, 7];
  private tipo: Tipo = 'videojuegos';
  private id = 0;
  private readonly cd = inject(ChangeDetectorRef);

  constructor(
    private route: ActivatedRoute,
    private api: ApiService,
    private nav: NavController,
    private aviso: AvisoService,
    public favoritos: FavoritosService,
    public comparar: CompararService,
  ) {}

  ngOnInit(): void {
    this.tipo = (this.route.snapshot.paramMap.get('tipo') ?? 'videojuegos') as Tipo;
    this.id = Number(this.route.snapshot.paramMap.get('id'));
    this.favoritos.cargar().then(() => this.cd.markForCheck());
    this.cargar();
  }

  atras(): void {
    this.nav.back();
  }

  async corazon(): Promise<void> {
    if (!this.p) return;
    const hecho = this.favoritos.alternar(this.p.id);
    this.cd.markForCheck();
    await hecho;
    this.cd.markForCheck();
  }

  async cargar(): Promise<void> {
    this.error = false;
    try {
      this.p = aProducto(await this.api.get<any>(`/${this.tipo}/${this.id}`), this.tipo);
    } catch {
      this.error = true;
    }
    this.cd.markForCheck();
  }

  elegirGarantia(i: number): void {
    this.garantia = i;
    this.garantiaAbierta = false;
  }

  textoGarantia(): string {
    const g = this.p?.garantias[this.garantia];
    return g ? `Garantía +${g.meses} meses · ${euros(g.precio)}` : 'Garantía ampliada: sin elegir';
  }

  textoComprar(): string {
    if (!this.p) return 'Comprar';
    const g = this.p.garantias[this.garantia];
    return g ? `Comprar · ${euros(this.p.precio + g.precio)}` : 'Comprar';
  }

  alternarComparar(): void {
    if (this.p && !this.comparar.alternar(this.p)) {
      this.aviso.mostrar(`Solo puedes comparar ${this.comparar.max} productos a la vez`);
    }
  }

  // La compra se recoge en tienda: primero se elige cuál
  async abrirTiendas(): Promise<void> {
    try {
      this.tiendas = await this.api.get<{ id: number; nombre: string }[]>('/tiendas');
      this.tiendasAbierto = true;
    } catch (e) {
      this.aviso.mostrar(mensajeError(e, 'No se pudieron cargar las tiendas'));
    }
    this.cd.markForCheck();
  }

  async comprar(tiendaId: number): Promise<void> {
    if (!this.p) return;
    this.tiendasAbierto = false;
    this.ocupado = true;
    try {
      const linea: Record<string, number> = { producto_id: this.p.id, cantidad: 1 };
      const g = this.p.garantias[this.garantia];
      if (g) linea['garantia_meses'] = g.meses;
      await this.api.post('/compras/add', { lineas: [linea], tienda_id: tiendaId });
      this.p.stock--;
      this.aviso.mostrar('¡Compra realizada!');
    } catch (e) {
      this.aviso.mostrar(mensajeError(e, 'No se pudo completar la compra'));
    } finally {
      this.ocupado = false;
      this.cd.markForCheck();
    }
  }

  async alquilar(dias: number): Promise<void> {
    if (!this.p) return;
    this.dias = false;
    this.ocupado = true;
    try {
      await this.api.post('/alquileres/add', { videojuego_id: this.p.id, dias });
      this.p.stock--;
      this.aviso.mostrar(`Alquilado ${dias} día(s)`);
    } catch (e) {
      this.aviso.mostrar(mensajeError(e, 'No se pudo alquilar'));
    } finally {
      this.ocupado = false;
      this.cd.markForCheck();
    }
  }
}
