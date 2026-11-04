import { Injectable } from '@angular/core';

export interface Tarjeta {
  id: number;
  nombre: string;
  tipo: string; // videojuego | movil | articulo
  precio: number;
  imagen: string;
}

// Un mensaje de la conversación con el asesor; los del asesor pueden traer productos recomendados
export interface Turno {
  delUsuario: boolean;
  texto: string;
  productos: Tarjeta[];
}

// Guarda la conversación con el asesor mientras la app está abierta (al cambiar de pestaña no se pierde)
@Injectable({ providedIn: 'root' })
export class AsesorService {
  turnos: Turno[] = [
    {
      delUsuario: false,
      texto: '¡Hola! Soy el asesor de Jokoa. Cuéntame qué buscas (un RPG, un móvil con buena cámara, un portátil para estudiar...) y te recomiendo lo que tenemos.',
      productos: [],
    },
  ];
  pensando = false;
}
