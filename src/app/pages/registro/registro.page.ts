import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { NavController } from '@ionic/angular/lazy';
import { ApiService, mensajeError } from '../../core/api.service';
import { AvisoService } from '../../core/aviso.service';

@Component({
  selector: 'app-registro',
  standalone: false,
  template: `
    <ion-content [fullscreen]="true">
      <div class="formulario" style="padding-top: 8px">
        <button class="icono-atras" type="button" (click)="volver()" aria-label="Volver"><ion-icon name="arrow-back"></ion-icon></button>
        <div class="registro-titulo">
          <img src="assets/logo.svg" alt="Logo de Jokoa" />
          <h1>Crear cuenta</h1>
        </div>

        <form (ngSubmit)="crear()" novalidate style="margin-top: 12px">
          <div class="campo" [class.error]="errores['nombre']">
            <input id="nombre" name="nombre" [(ngModel)]="nombre" placeholder=" " autocomplete="given-name" />
            <label for="nombre">Nombre</label>
          </div>
          @if (errores['nombre']) { <div class="error-texto">{{ errores['nombre'] }}</div> }

          <div class="campo" [class.error]="errores['apellidos']">
            <input id="apellidos" name="apellidos" [(ngModel)]="apellidos" placeholder=" " autocomplete="family-name" />
            <label for="apellidos">Apellidos</label>
          </div>
          @if (errores['apellidos']) { <div class="error-texto">{{ errores['apellidos'] }}</div> }

          <div class="campo">
            <input id="telefono" name="telefono" type="tel" [(ngModel)]="telefono" placeholder=" " autocomplete="tel" />
            <label for="telefono">Teléfono (opcional)</label>
          </div>

          <div class="campo" [class.error]="errores['email']">
            <input id="email" name="email" type="email" [(ngModel)]="email" placeholder=" " autocomplete="email" />
            <label for="email">Email</label>
          </div>
          @if (errores['email']) { <div class="error-texto">{{ errores['email'] }}</div> }

          <div class="campo con-ojo" [class.error]="errores['password']">
            <input id="password" name="password" [type]="ver ? 'text' : 'password'" [(ngModel)]="password" placeholder=" " autocomplete="new-password" />
            <label for="password">Contraseña (mínimo 6)</label>
            <button type="button" class="ojo" (click)="ver = !ver" aria-label="Mostrar u ocultar la contraseña">
              <ion-icon [name]="ver ? 'eye-off' : 'eye'"></ion-icon>
            </button>
          </div>
          @if (errores['password']) { <div class="error-texto">{{ errores['password'] }}</div> }

          <button class="btn" type="submit" style="margin-top: 20px" [disabled]="cargando">Crear cuenta</button>
        </form>
        <button class="enlace" type="button" (click)="volver()">Ya tengo cuenta</button>
      </div>
    </ion-content>
  `,
})
export class RegistroPage {
  nombre = '';
  apellidos = '';
  telefono = '';
  email = '';
  password = '';
  ver = false;
  cargando = false;
  errores: Record<string, string> = {};
  private readonly cd = inject(ChangeDetectorRef);

  constructor(private api: ApiService, private router: Router, private nav: NavController, private aviso: AvisoService) {}

  volver(): void {
    this.router.navigateByUrl('/login', { replaceUrl: true });
  }

  async crear(): Promise<void> {
    this.errores = {};
    if (!this.nombre.trim()) this.errores['nombre'] = 'Escribe tu nombre';
    if (!this.apellidos.trim()) this.errores['apellidos'] = 'Escribe tus apellidos';
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(this.email.trim())) this.errores['email'] = 'Email no válido';
    if (this.password.length < 6) this.errores['password'] = 'Escribe al menos 6 caracteres';
    if (Object.keys(this.errores).length) {
      return;
    }
    this.cargando = true;
    try {
      await this.api.post('/registro', {
        nombre: this.nombre.trim(),
        apellidos: this.apellidos.trim(),
        telefono: this.telefono.trim(),
        email: this.email.trim(),
        password: this.password,
      });
      this.aviso.mostrar('Cuenta creada: ya puedes entrar');
      this.volver();
    } catch (e) {
      this.aviso.mostrar(mensajeError(e, 'No se pudo crear la cuenta'));
    } finally {
      this.cargando = false;
      this.cd.markForCheck();
    }
  }
}
