import { Injectable } from '@angular/core';

// Sesión guardada en el dispositivo: token JWT y email. El token caduca (8 h): si ha caducado no cuenta como sesión
@Injectable({ providedIn: 'root' })
export class SesionService {
  private readonly claveToken = 'jokoa_token';
  private readonly claveEmail = 'jokoa_email';

  get token(): string | null {
    return localStorage.getItem(this.claveToken);
  }

  get email(): string {
    return localStorage.getItem(this.claveEmail) ?? '';
  }

  iniciada(): boolean {
    const token = this.token;
    if (!token) {
      return false;
    }
    try {
      const carga = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
      return !carga.exp || carga.exp * 1000 > Date.now();
    } catch {
      return false;
    }
  }

  guardar(token: string, email: string): void {
    localStorage.setItem(this.claveToken, token);
    localStorage.setItem(this.claveEmail, email);
  }

  cerrar(): void {
    localStorage.removeItem(this.claveToken);
    localStorage.removeItem(this.claveEmail);
  }
}
