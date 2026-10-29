// Producto de la tienda (móvil o videojuego) tal como lo devuelve la API
export interface Producto {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  stock: number;
  imagen: string;
  esMovil: boolean;
  alquilerDia: number;
  etiquetas: string[]; // plataforma/género/PEGI (juego) o marca/almacenamiento/RAM (móvil)
}

export function aProducto(j: any, esMovil: boolean): Producto {
  const etiquetas = esMovil
    ? [j.marca, `${j.almacenamiento_gb} GB`, `${j.ram_gb} GB RAM`]
    : [j.plataforma, j.genero, `PEGI ${j.pegi}`];
  return {
    id: j.id,
    nombre: j.nombre,
    descripcion: j.descripcion ?? '',
    precio: Number(j.precio),
    stock: Number(j.stock),
    imagen: Array.isArray(j.imagenes) && j.imagenes.length ? j.imagenes[0] : '',
    esMovil,
    alquilerDia: Number(j.precio_alquiler_dia ?? 0),
    etiquetas,
  };
}

export function euros(valor: number): string {
  return valor.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
}
