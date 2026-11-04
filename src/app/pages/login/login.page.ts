import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService, mensajeError } from '../../core/api.service';
import { AvisoService } from '../../core/aviso.service';
import { SesionService } from '../../core/sesion.service';

@Component({
  selector: 'app-login',
  standalone: false,
  template: `
    <ion-content [fullscreen]="true">
      <div class="pagina" style="position: relative">
        <app-decorado />
        <div class="formulario login">
          <img src="assets/logo.svg" alt="Logo de Jokoa" />
          <h1>Jokoa</h1>
          <p class="lema">Entra en tu cuenta, jokalari</p>

          <form (ngSubmit)="entrar()" novalidate>
            <div class="campo" [class.error]="errEmail">
              <input id="email" name="email" type="email" [(ngModel)]="email" placeholder=" " autocomplete="username" />
              <label for="email">Email</label>
            </div>
            @if (errEmail) {
              <div class="error-texto">{{ errEmail }}</div>
            }
            <div class="campo con-ojo" [class.error]="errPassword">
              <input id="password" name="password" [type]="ver ? 'text' : 'password'" [(ngModel)]="password" placeholder=" " autocomplete="current-password" />
              <label for="password">Contraseña</label>
              <button type="button" class="ojo" (click)="ver = !ver" aria-label="Mostrar u ocultar la contraseña">
                <ion-icon [name]="ver ? 'eye-off' : 'eye'"></ion-icon>
              </button>
            </div>
            @if (errPassword) {
              <div class="error-texto">{{ errPassword }}</div>
            }
            <button class="btn" type="submit" style="margin-top: 20px" [disabled]="cargando">Entrar</button>
          </form>
          <button class="enlace" type="button" (click)="irRegistro()">¿No tienes cuenta? Regístrate</button>
        </div>
      </div>
    </ion-content>
  `,
})
export class LoginPage {
  email = '';
  password = '';
  ver = false;
  cargando = false;
  errEmail = '';
  errPassword = '';
  private readonly cd = inject(ChangeDetectorRef);

  constructor(private api: ApiService, private sesion: SesionService, private router: Router, private aviso: AvisoService) {}

  ionViewWillEnter(): void {
    // Si ya hay una sesión válida se salta el login
    if (this.sesion.iniciada()) {
      this.router.navigateByUrl('/tabs/tienda', { replaceUrl: true });
    }
  }

  async entrar(): Promise<void> {
    const email = this.email.trim();
    this.errEmail = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) ? '' : 'Email no válido';
    this.errPassword = this.password ? '' : 'Escribe la contraseña';
    if (this.errEmail || this.errPassword) {
      return;
    }
    this.cargando = true;
    try {
      const respuesta = await this.api.post<{ token: string }>('/login', { email, password: this.password });
      this.sesion.guardar(respuesta.token, email);
      this.password = '';
      await this.router.navigateByUrl('/tabs/tienda', { replaceUrl: true });
    } catch (e: any) {
      this.aviso.mostrar(e?.status === 401 ? 'Email o contraseña incorrectos' : 'No se pudo conectar con el servidor');
    } finally {
      this.cargando = false;
      this.cd.markForCheck();
    }
  }

  irRegistro(): void {
    this.router.navigateByUrl('/registro');
  }
}
