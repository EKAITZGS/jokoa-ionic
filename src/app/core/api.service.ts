import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';

// Peticiones a la API de Symfony (la misma base de datos que Android). El token lo añade el interceptor
@Injectable({ providedIn: 'root' })
export class ApiService {
  constructor(private http: HttpClient) {}

  get<T>(ruta: string): Promise<T> {
    return firstValueFrom(this.http.get<T>(environment.apiUrl + ruta));
  }

  post<T>(ruta: string, cuerpo: unknown): Promise<T> {
    return firstValueFrom(this.http.post<T>(environment.apiUrl + ruta, cuerpo));
  }

  put<T>(ruta: string, cuerpo: unknown = {}): Promise<T> {
    return firstValueFrom(this.http.put<T>(environment.apiUrl + ruta, cuerpo));
  }

  archivo(ruta: string): Promise<Blob> {
    return firstValueFrom(this.http.get(environment.apiUrl + ruta, { responseType: 'blob' }));
  }

  borrar<T>(ruta: string): Promise<T> {
    return firstValueFrom(this.http.delete<T>(environment.apiUrl + ruta));
  }
}

// Texto "mensaje" que devuelve la API en un error (409 sin stock, 403 contraseña...), o el de por defecto
export function mensajeError(e: unknown, porDefecto: string): string {
  if (e instanceof HttpErrorResponse && e.error && typeof e.error.mensaje === 'string') {
    return e.error.mensaje;
  }
  return porDefecto;
}
