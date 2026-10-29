import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService, mensajeError } from '../../core/api.service';
import { AvisoService } from '../../core/aviso.service';
import { SesionService } from '../../core/sesion.service';

@Component({
  selector: 'app-perfil',
  standalone: false,
  template: `
    <ion-content>
      <div class="formulario" style="padding-top: 16px">
        <div class="perfil-cabecera">
          <img src="assets/logo.svg" alt="Logo de Jokoa" />
          <div>
            <h1 class="titulo">Tu perfil</h1>
            <div class="email">{{ email }}</div>
          </div>
        </div>

        <button class="btn coral" type="button" style="margin-top: 20px" (click)="soporte()">
          <ion-icon name="headset"></ion-icon>Soporte técnico
        </button>

        <div class="campo" style="margin-top: 20px" [class.error]="errores['nombre']">
          <input id="nombre" name="nombre" [(ngModel)]="nombre" placeholder=" " />
          <label for="nombre">Nombre</label>
        </div>
        @if (errores['nombre']) { <div class="error-texto">{{ errores['nombre'] }}</div> }
        <div class="campo" [class.error]="errores['apellidos']">
          <input id="apellidos" name="apellidos" [(ngModel)]="apellidos" placeholder=" " />
          <label for="apellidos">Apellidos</label>
        </div>
        @if (errores['apellidos']) { <div class="error-texto">{{ errores['apellidos'] }}</div> }
        <div class="campo">
          <input id="telefono" name="telefono" type="tel" [(ngModel)]="telefono" placeholder=" " />
          <label for="telefono">Teléfono</label>
        </div>

        <p class="subtitulo">Cambiar contraseña (opcional)</p>
        <div class="campo con-ojo" [class.error]="errores['actual']">
          <input id="actual" name="actual" [type]="ver ? 'text' : 'password'" [(ngModel)]="actual" placeholder=" " autocomplete="current-password" />
          <label for="actual">Contraseña actual</label>
          <button type="button" class="ojo" (click)="ver = !ver" aria-label="Mostrar u ocultar las contraseñas"><ion-icon [name]="ver ? 'eye-off' : 'eye'"></ion-icon></button>
        </div>
        @if (errores['actual']) { <div class="error-texto">{{ errores['actual'] }}</div> }
        <div class="campo con-ojo" [class.error]="errores['nueva']">
          <input id="nueva" name="nueva" [type]="ver ? 'text' : 'password'" [(ngModel)]="nueva" placeholder=" " autocomplete="new-password" />
          <label for="nueva">Contraseña nueva</label>
          <button type="button" class="ojo" (click)="ver = !ver" aria-label="Mostrar u ocultar las contraseñas"><ion-icon [name]="ver ? 'eye-off' : 'eye'"></ion-icon></button>
        </div>
        @if (errores['nueva']) { <div class="error-texto">{{ errores['nueva'] }}</div> }

        <button class="btn" type="button" style="margin-top: 20px" [disabled]="guardando" (click)="guardar()">Guardar cambios</button>
        <button class="btn contorno" type="button" style="margin-top: 12px" (click)="salir()">Cerrar sesión</button>
      </div>
    </ion-content>
  `,
})
export class PerfilPage implements OnInit {
  email = '';
  nombre = '';
  apellidos = '';
  telefono = '';
  actual = '';
  nueva = '';
  ver = false;
  guardando = false;
  errores: Record<string, string> = {};
  private readonly cd = inject(ChangeDetectorRef);

  constructor(private api: ApiService, private sesion: SesionService, private router: Router, private aviso: AvisoService) {}

  async ngOnInit(): Promise<void> {
    this.email = this.sesion.email;
    try {
      const u = await this.api.get<any>('/perfil');
      this.email = u.email;
      this.nombre = u.nombre ?? '';
      this.apellidos = u.apellidos ?? '';
      this.telefono = u.telefono ?? '';
    } catch {
      this.aviso.mostrar('No se pudo cargar tu perfil');
    }
    this.cd.markForCheck();
  }

  soporte(): void {
    this.router.navigateByUrl('/soporte');
  }

  async guardar(): Promise<void> {
    this.errores = {};
    if (!this.nombre.trim()) this.errores['nombre'] = 'Escribe tu nombre';
    if (!this.apellidos.trim()) this.errores['apellidos'] = 'Escribe tus apellidos';
    const cambiaClave = !!(this.actual || this.nueva);
    if (cambiaClave && !this.actual) this.errores['actual'] = 'Escribe la contraseña actual';
    if (cambiaClave && this.nueva.length < 6) this.errores['nueva'] = 'Escribe al menos 6 caracteres';
    if (Object.keys(this.errores).length) {
      return;
    }
    const cuerpo: Record<string, string> = { nombre: this.nombre.trim(), apellidos: this.apellidos.trim(), telefono: this.telefono.trim() };
    if (cambiaClave) {
      cuerpo['password_actual'] = this.actual;
      cuerpo['password_nueva'] = this.nueva;
    }
    this.guardando = true;
    try {
      await this.api.put('/perfil/update', cuerpo);
      this.actual = '';
      this.nueva = '';
      this.aviso.mostrar('Perfil guardado');
    } catch (e) {
      this.aviso.mostrar(mensajeError(e, 'No se pudo guardar el perfil'));
    } finally {
      this.guardando = false;
      this.cd.markForCheck();
    }
  }

  salir(): void {
    this.sesion.cerrar();
    this.router.navigateByUrl('/login', { replaceUrl: true });
  }
}
