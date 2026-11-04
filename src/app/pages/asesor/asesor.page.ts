import { ChangeDetectorRef, Component, ElementRef, ViewChild, inject } from '@angular/core';
import { ApiService, mensajeError } from '../../core/api.service';
import { AsesorService, Tarjeta, Turno } from '../../core/asesor.service';
import { euros } from '../../core/modelos';

const RUTA_DETALLE: Record<string, string> = { videojuego: 'videojuegos', movil: 'moviles', articulo: 'articulos' };

// Chat con el asesor de compra: el servidor consulta el catálogo real y devuelve texto y productos recomendados
@Component({
  selector: 'app-asesor',
  standalone: false,
  template: `
    <ion-header>
      <ion-toolbar>
        <div class="cabecera">
          <img src="assets/logo.svg" alt="Logo de Jokoa" />
          <h1 class="titulo">Asesor</h1>
        </div>
        @if (modelo.pensando) { <div class="barra-carga"></div> } @else { <div style="height: 4px; background: var(--jokoa-azul-claro)"></div> }
      </ion-toolbar>
    </ion-header>
    <ion-content #contenido>
      <div class="hilo">
        @for (t of modelo.turnos; track $index) {
          <div class="burbuja" [class.yo]="t.delUsuario" [class.bot]="!t.delUsuario">{{ t.texto }}</div>
          @if (t.productos.length) {
            <div class="tarjetas-asesor">
              @for (p of t.productos; track p.id) {
                <a class="tarjeta tarjeta-asesor" [routerLink]="['/detalle', ruta(p), p.id]">
                  @if (p.imagen) { <img [src]="p.imagen" [alt]="p.nombre" /> }
                  <b>{{ p.nombre }}</b>
                  <span>{{ euros(p.precio) }}</span>
                </a>
              }
            </div>
          }
        }
        @if (modelo.pensando) { <div class="burbuja bot pulso">Pensando…</div> }
        @if (error) { <div class="error-texto">{{ error }}</div> }
      </div>
    </ion-content>
    <ion-footer>
      <form class="barra-asesor" (ngSubmit)="enviar()">
        <div class="campo">
          <input id="mensaje" name="mensaje" [(ngModel)]="texto" placeholder=" " autocomplete="off" enterkeyhint="send" />
          <label for="mensaje">Escribe tu mensaje</label>
        </div>
        <button class="enviar" type="submit" aria-label="Enviar" [disabled]="modelo.pensando || !texto.trim()"><ion-icon name="send"></ion-icon></button>
      </form>
    </ion-footer>
  `,
})
export class AsesorPage {
  texto = '';
  error = '';
  euros = euros;
  @ViewChild('contenido') contenido?: ElementRef<HTMLIonContentElement>;
  private readonly cd = inject(ChangeDetectorRef);

  constructor(private api: ApiService, public modelo: AsesorService) {}

  ionViewDidEnter(): void {
    this.bajar();
  }

  ruta(p: Tarjeta): string {
    return RUTA_DETALLE[p.tipo] ?? 'articulos';
  }

  private bajar(): void {
    setTimeout(() => this.contenido?.nativeElement.scrollToBottom?.(200), 50);
  }

  async enviar(): Promise<void> {
    const texto = this.texto.trim();
    if (!texto || this.modelo.pensando) return;
    this.modelo.turnos.push({ delUsuario: true, texto, productos: [] });
    this.texto = '';
    this.error = '';
    this.modelo.pensando = true;
    this.bajar();
    // La bienvenida no se manda: el servidor exige que la conversación empiece por el cliente
    const mensajes = this.modelo.turnos.slice(1).map((t) => ({ role: t.delUsuario ? 'user' : 'assistant', content: t.texto }));
    try {
      const r = await this.api.post<{ respuesta: string; productos?: any[] }>('/asistente', { mensajes });
      const turno: Turno = {
        delUsuario: false,
        texto: r.respuesta,
        productos: (r.productos ?? []).map((p) => ({ id: p.id, nombre: p.nombre, tipo: p.tipo, precio: Number(p.precio), imagen: p.imagen ?? '' })),
      };
      this.modelo.turnos.push(turno);
    } catch (e) {
      this.error = mensajeError(e, 'No se pudo consultar al asesor');
    } finally {
      this.modelo.pensando = false;
      this.cd.markForCheck();
      this.bajar();
    }
  }
}
