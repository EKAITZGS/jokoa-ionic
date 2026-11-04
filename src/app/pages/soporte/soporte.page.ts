import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { NavController } from '@ionic/angular/lazy';
import { ApiService, mensajeError } from '../../core/api.service';
import { AvisoService } from '../../core/aviso.service';
import { euros } from '../../core/modelos';

interface Ticket {
  id: number;
  asunto: string;
  departamento: string;
  dispositivo: string;
  descripcion: string;
  estado: string;
  fecha_apertura: string;
  tipo: string; // soporte | reparacion
  presupuesto: number | null;
  presupuesto_aceptado: boolean | null;
}

// Etiquetas de estado de las reparaciones
const ETIQUETAS: Record<string, string> = {
  recibido: 'Recibido',
  presupuestado: 'Presupuesto listo',
  en_reparacion: 'En reparación',
  listo: 'Listo para recoger',
  cerrado: 'Cerrado',
};

// Soporte técnico: tickets del usuario y alta de uno nuevo en un departamento
@Component({
  selector: 'app-soporte',
  standalone: false,
  template: `
    <ion-header>
      <ion-toolbar>
        <div class="cabecera-atras">
          <button class="icono-atras" type="button" (click)="atras()" aria-label="Volver"><ion-icon name="arrow-back"></ion-icon></button>
          <h1 class="titulo">Soporte técnico</h1>
        </div>
        @if (cargando) { <div class="barra-carga"></div> } @else { <div style="height: 4px; background: var(--jokoa-azul-claro)"></div> }
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <div style="padding: 12px 16px 96px">
        @if (!cargando && !tickets.length) {
          <div class="estado-centro">
            <div class="circulo"><ion-icon name="headset"></ion-icon></div>
            <p class="suave">No tienes tickets abiertos</p>
          </div>
        }
        @for (t of tickets; track t.id; let i = $index) {
          <div class="tarjeta fila entra" [style.--i]="i">
            <div class="arriba">
              <h3>{{ t.asunto }}</h3>
              @switch (t.estado) {
                @case ('cerrado') { <span class="chip exito"><ion-icon name="checkmark"></ion-icon>Cerrado</span> }
                @case ('listo') { <span class="chip exito"><ion-icon name="checkmark"></ion-icon>{{ etiqueta(t) }}</span> }
                @case ('en_proceso') { <span class="chip"><span class="punto redondo"></span>En curso</span> }
                @case ('en_reparacion') { <span class="chip"><span class="punto redondo"></span>{{ etiqueta(t) }}</span> }
                @case ('recibido') { <span class="chip coral"><span class="punto"></span>{{ etiqueta(t) }}</span> }
                @case ('presupuestado') { <span class="chip coral"><span class="punto"></span>{{ etiqueta(t) }}</span> }
                @default { <span class="chip coral"><span class="punto"></span>Abierto</span> }
              }
            </div>
            <div class="sub">{{ t.tipo === 'reparacion' ? 'Reparación · ' : '' }}{{ t.departamento }} · {{ t.dispositivo }}</div>
            <div class="txt">{{ t.descripcion }}{{ extra(t) }}</div>
            <div class="nota">Abierto el {{ t.fecha_apertura.substring(0, 10) }}</div>
            @if (t.estado === 'presupuestado' && t.presupuesto !== null) {
              <div class="accion"><button class="btn coral compacto" type="button" (click)="presupuesto = t">Responder al presupuesto</button></div>
            }
          </div>
        }
      </div>
      <button class="fab" type="button" (click)="abrir()"><ion-icon name="add"></ion-icon>Nuevo ticket</button>

      @if (dialogo) {
        <div class="dialogo-fondo" (click)="dialogo = false">
          <div class="dialogo" (click)="$event.stopPropagation()" role="dialog" aria-label="Nuevo ticket">
            <h2>Nuevo ticket</h2>
            <div class="campo" style="margin-top: 4px">
              <select id="tipo" name="tipo" [(ngModel)]="tipo">
                <option value="soporte">Una consulta o incidencia</option>
                <option value="reparacion">Reparar un equipo</option>
              </select>
              <label for="tipo">¿Qué necesitas?</label>
            </div>
            <div class="campo">
              <select id="dep" name="dep" [(ngModel)]="departamentoId">
                @for (d of departamentos; track d.id) { <option [ngValue]="d.id">{{ d.nombre }}</option> }
              </select>
              <label for="dep">Departamento</label>
            </div>
            <div class="campo" [class.error]="errores['asunto']">
              <input id="asunto" name="asunto" [(ngModel)]="asunto" placeholder=" " />
              <label for="asunto">Asunto</label>
            </div>
            <div class="campo" [class.error]="errores['dispositivo']">
              <input id="dispositivo" name="dispositivo" [(ngModel)]="dispositivo" placeholder=" " />
              <label for="dispositivo">Dispositivo (ej. PS5, Galaxy S24)</label>
            </div>
            <div class="campo" [class.error]="errores['descripcion']">
              <textarea id="descripcion" name="descripcion" [(ngModel)]="descripcion" placeholder=" "></textarea>
              <label for="descripcion">Describe el problema</label>
            </div>
            @if (errores['campos']) { <div class="error-texto">{{ errores['campos'] }}</div> }
            <div class="acciones">
              <button class="btn-texto" type="button" (click)="dialogo = false">Cancelar</button>
              <button class="btn compacto" type="button" [disabled]="enviando" (click)="enviar()">Enviar</button>
            </div>
          </div>
        </div>
      }
      @if (presupuesto) {
        <div class="dialogo-fondo" (click)="presupuesto = null">
          <div class="dialogo" (click)="$event.stopPropagation()" role="dialog" aria-label="Presupuesto de la reparación">
            <h2>Presupuesto de la reparación</h2>
            <p class="txt" style="margin: 0">El arreglo cuesta {{ euros(presupuesto.presupuesto ?? 0) }}. Si lo aceptas, empezamos a repararlo.</p>
            <div class="acciones">
              <button class="btn-texto" type="button" (click)="presupuesto = null">Más tarde</button>
              <button class="btn-texto" type="button" (click)="responder(false)">Rechazar</button>
              <button class="btn compacto" type="button" (click)="responder(true)">Aceptar</button>
            </div>
          </div>
        </div>
      }
    </ion-content>
  `,
})
export class SoportePage implements OnInit {
  tipo = 'soporte';
  presupuesto: Ticket | null = null;
  euros = euros;
  tickets: Ticket[] = [];
  departamentos: { id: number; nombre: string }[] = [];
  cargando = true;
  dialogo = false;
  enviando = false;
  departamentoId = 0;
  asunto = '';
  dispositivo = '';
  descripcion = '';
  errores: Record<string, string> = {};
  private readonly cd = inject(ChangeDetectorRef);

  constructor(private api: ApiService, private nav: NavController, private aviso: AvisoService) {}

  ngOnInit(): void {
    this.api.get<any[]>('/departamentos').then((d) => {
      this.departamentos = d;
      this.departamentoId = d.length ? d[0].id : 0;
      this.cd.markForCheck();
    });
    this.cargar();
  }

  atras(): void {
    this.nav.back();
  }

  async cargar(): Promise<void> {
    this.cargando = true;
    try {
      this.tickets = await this.api.get<Ticket[]>('/tickets');
    } catch (e) {
      this.aviso.mostrar(mensajeError(e, 'No se pudieron cargar los tickets'));
    } finally {
      this.cargando = false;
      this.cd.markForCheck();
    }
  }

  etiqueta(t: Ticket): string {
    return ETIQUETAS[t.estado] ?? t.estado;
  }

  // Líneas extra de una reparación: presupuesto y avisos de estado
  extra(t: Ticket): string {
    let texto = '';
    if (t.tipo === 'reparacion' && t.presupuesto !== null) texto += `\nPresupuesto: ${euros(t.presupuesto)}`;
    if (t.estado === 'listo') texto += '\nTu equipo está listo: puedes recogerlo en tu tienda Jokoa.';
    if (t.estado === 'cerrado' && t.presupuesto_aceptado === false) texto += '\nRechazaste el presupuesto.';
    return texto;
  }

  // El cliente acepta o rechaza el presupuesto: aceptado empieza la reparación, rechazado cierra el ticket
  async responder(aceptado: boolean): Promise<void> {
    if (!this.presupuesto) return;
    const id = this.presupuesto.id;
    this.presupuesto = null;
    try {
      await this.api.put(`/tickets/presupuesto/${id}`, { aceptado });
      this.aviso.mostrar(aceptado ? 'Presupuesto aceptado: empezamos la reparación' : 'Presupuesto rechazado');
      this.cargar();
    } catch (e) {
      this.aviso.mostrar(mensajeError(e, 'No se pudo responder al presupuesto'));
    }
  }

  abrir(): void {
    if (!this.departamentos.length) {
      this.aviso.mostrar('Cargando departamentos, inténtalo de nuevo');
      return;
    }
    this.errores = {};
    this.dialogo = true;
  }

  async enviar(): Promise<void> {
    this.errores = {};
    if (!this.asunto.trim()) this.errores['asunto'] = '1';
    if (!this.dispositivo.trim()) this.errores['dispositivo'] = '1';
    if (!this.descripcion.trim()) this.errores['descripcion'] = '1';
    if (Object.keys(this.errores).length) {
      this.errores['campos'] = 'Rellena todos los campos';
      return;
    }
    this.enviando = true;
    try {
      await this.api.post('/tickets/add', {
        tipo: this.tipo,
        departamento_id: this.departamentoId,
        asunto: this.asunto.trim(),
        dispositivo: this.dispositivo.trim(),
        descripcion: this.descripcion.trim(),
      });
      this.dialogo = false;
      this.asunto = this.dispositivo = this.descripcion = '';
      this.aviso.mostrar('Ticket enviado');
      this.cargar();
    } catch (e) {
      this.aviso.mostrar(mensajeError(e, 'No se pudo enviar el ticket'));
    } finally {
      this.enviando = false;
      this.cd.markForCheck();
    }
  }
}
