import { Injectable } from '@angular/core';
import { ApiService, mensajeError } from './api.service';
import { AvisoService } from './aviso.service';

// Ids de los productos con corazón del usuario; el corazón cambia al instante y se deshace si el servidor falla
@Injectable({ providedIn: 'root' })
export class FavoritosService {
  private ids = new Set<number>();

  constructor(private api: ApiService, private aviso: AvisoService) {}

  es(id: number): boolean {
    return this.ids.has(id);
  }

  async cargar(): Promise<void> {
    try {
      this.ids = new Set(await this.api.get<number[]>('/favoritos'));
    } catch {
      /* sin conexión: se conserva lo que había */
    }
  }

  async alternar(id: number): Promise<void> {
    const era = this.ids.has(id);
    this.poner(id, !era);
    try {
      if (era) await this.api.borrar(`/favoritos/${id}`);
      else await this.api.put(`/favoritos/${id}`);
    } catch (e) {
      this.poner(id, era);
      this.aviso.mostrar(mensajeError(e, 'No se pudo actualizar tus favoritos'));
    }
  }

  private poner(id: number, marcado: boolean): void {
    const copia = new Set(this.ids);
    if (marcado) copia.add(id);
    else copia.delete(id);
    this.ids = copia;
  }
}
