import { Injectable } from '@angular/core';
import { Producto } from './modelos';

// Productos elegidos para comparar (hasta 3), compartidos entre fichas
@Injectable({ providedIn: 'root' })
export class CompararService {
  readonly max = 3;
  items: Producto[] = [];

  es(id: number): boolean {
    return this.items.some((p) => p.id === id);
  }

  // Devuelve false si ya hay 3 y no se pudo añadir
  alternar(p: Producto): boolean {
    if (this.es(p.id)) {
      this.items = this.items.filter((x) => x.id !== p.id);
      return true;
    }
    if (this.items.length >= this.max) return false;
    this.items = [...this.items, p];
    return true;
  }

  // Filas de la ficha técnica de todos los productos, sin repetir
  claves(): string[] {
    return [...new Set(this.items.flatMap((p) => p.ficha.map((d) => d[0])))];
  }

  dato(p: Producto, clave: string): string {
    return p.ficha.find((d) => d[0] === clave)?.[1] ?? '-';
  }
}
