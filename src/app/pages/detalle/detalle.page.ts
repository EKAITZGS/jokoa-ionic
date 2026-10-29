import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NavController } from '@ionic/angular/lazy';
import { ApiService, mensajeError } from '../../core/api.service';
import { AvisoService } from '../../core/aviso.service';
import { Producto, aProducto, euros } from '../../core/modelos';

// Ficha grande de un móvil o videojuego, con compra y (en juegos) alquiler
@Component({
  selector: 'app-detalle',
  standalone: false,
  template: `
    <ion-content [fullscreen]="true">
      <div class="pagina ficha-pagina">
        <div class="ficha-arriba">
          <button class="atras" type="button" (click)="atras()" aria-label="Volver"><ion-icon name="arrow-back"></ion-icon></button>
          @if (p) {
            <img class="portada" [class.cuadrada]="p.esMovil" [src]="p.imagen" [alt]="p.nombre" />
          } @else if (!error) {
            <div class="portada pulso" style="background: #fff"></div>
          }
        </div>

        <div class="hoja">
          @if (p) {
            <h1>{{ p.nombre }}</h1>
            <div class="chips">
              <span class="chip">{{ p.etiquetas[0] }}</span>
              <span class="chip">{{ p.etiquetas[1] }}</span>
              <span class="chip" [class.contorno]="!p.esMovil">{{ p.etiquetas[2] }}</span>
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
            <div class="botones">
              <button class="btn" type="button" [disabled]="p.stock <= 0 || ocupado" (click)="comprar()">Comprar</button>
              @if (!p.esMovil) {
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
    </ion-content>
  `,
})
export class DetallePage implements OnInit {
  p?: Producto;
  error = false;
  ocupado = false;
  dias = false;
  euros = euros;
  readonly opcionesDias = [1, 3, 7];
  private tipo = 'videojuegos';
  private id = 0;
  private readonly cd = inject(ChangeDetectorRef);

  constructor(private route: ActivatedRoute, private api: ApiService, private nav: NavController, private aviso: AvisoService) {}

  ngOnInit(): void {
    this.tipo = this.route.snapshot.paramMap.get('tipo') ?? 'videojuegos';
    this.id = Number(this.route.snapshot.paramMap.get('id'));
    this.cargar();
  }

  atras(): void {
    this.nav.back();
  }

  async cargar(): Promise<void> {
    this.error = false;
    try {
      this.p = aProducto(await this.api.get<any>(`/${this.tipo}/${this.id}`), this.tipo === 'moviles');
    } catch {
      this.error = true;
    }
    this.cd.markForCheck();
  }

  async comprar(): Promise<void> {
    if (!this.p) return;
    this.ocupado = true;
    try {
      await this.api.post('/compras/add', { lineas: [{ producto_id: this.p.id, cantidad: 1 }] });
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
