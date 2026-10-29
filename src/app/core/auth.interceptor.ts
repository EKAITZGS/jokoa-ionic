import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, catchError, throwError, timeout } from 'rxjs';
import { environment } from '../../environments/environment';
import { AvisoService } from './aviso.service';
import { SesionService } from './sesion.service';

// Añade Authorization: Bearer <token>. Un 401 con sesión guardada es un token caducado: vuelve al login
@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private sesion: SesionService, private router: Router, private aviso: AvisoService) {}

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const token = this.sesion.token;
    const peticion =
      token && req.url.startsWith(environment.apiUrl)
        ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
        : req;
    return next.handle(peticion).pipe(
      // Sin respuesta en 15 s se da por fallida: el botón no se queda bloqueado si el servidor está apagado
      timeout(15000),
      catchError((e) => {
        if (e instanceof HttpErrorResponse && e.status === 401 && token) {
          this.sesion.cerrar();
          this.aviso.mostrar('Tu sesión ha caducado, inicia sesión otra vez');
          this.router.navigateByUrl('/login');
        }
        return throwError(() => e);
      }),
    );
  }
}
