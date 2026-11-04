export type Tipo = 'videojuegos' | 'moviles' | 'articulos';

// Producto de la tienda (videojuego, móvil o artículo: ordenador, tablet, gaming) tal como lo devuelve la API
export interface Producto {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  stock: number;
  imagen: string;
  tipo: Tipo;
  cuadrada: boolean; // los juegos llevan portada vertical; el resto, foto cuadrada que se ve entera
  categoria: string; // solo artículos: portatil, tablet, consola...
  alquilerDia: number; // solo videojuegos
  etiquetas: string[]; // plataforma/género/PEGI, marca/almacenamiento/RAM o marca y datos clave (sin vacías)
  garantias: { meses: number; precio: number }[]; // garantía ampliada por unidad (móviles, tablets y ordenadores)
  ficha: [string, string][]; // ficha técnica de los artículos: pares [nombre, valor]
}

// Qué datos se resumen en las píldoras de cada categoría (igual que la web y Android)
const RESUMEN: Record<string, string[]> = {
  portatil: ['procesador', 'ram_gb'], sobremesa: ['procesador', 'ram_gb'], pc_gaming: ['grafica', 'ram_gb'],
  tablet: ['pantalla', 'almacenamiento_gb'], consola: ['almacenamiento', 'resolucion'], mando: ['compatible'],
  auriculares: ['tipo', 'compatible'], teclado: ['formato', 'tipo'], raton: ['conexion', 'peso_g'],
  monitor: ['tamano', 'frecuencia_hz'], silla: ['material', 'reposabrazos'],
};

const NOMBRES: Record<string, string> = {
  ram_gb: 'RAM', almacenamiento_gb: 'Almacenamiento', peso_kg: 'Peso', peso_g: 'Peso', peso_max_kg: 'Peso máximo',
  frecuencia_hz: 'Frecuencia', dpi_max: 'DPI máximo', tamano: 'Tamaño', grafica: 'Gráfica', bateria: 'Batería',
  conexion: 'Conexión', microfono: 'Micrófono', iluminacion: 'Iluminación', resolucion: 'Resolución', lapiz: 'Lápiz',
  ideal_para: 'Ideal para', cinco_g: '5G', camara: 'Cámara', subgenero: 'Subgénero',
};

const UNIDADES: Record<string, string> = { ram_gb: ' GB', almacenamiento_gb: ' GB', peso_kg: ' kg', peso_g: ' g', peso_max_kg: ' kg', frecuencia_hz: ' Hz' };

function nombreDato(clave: string): string {
  return NOMBRES[clave] ?? clave.charAt(0).toUpperCase() + clave.slice(1).replace(/_/g, ' ');
}

function valor(clave: string, v: unknown): string {
  if (typeof v === 'boolean') return v ? 'Sí' : 'No';
  if (Array.isArray(v)) return v.join(', ');
  return typeof v === 'number' && UNIDADES[clave] ? v + UNIDADES[clave] : String(v);
}

export function aProducto(j: any, tipo: Tipo): Producto {
  const car: Record<string, unknown> | null = j.caracteristicas && typeof j.caracteristicas === 'object' ? j.caracteristicas : null;
  const categoria: string = j.categoria ?? '';
  let etiquetas: string[];
  const ficha: [string, string][] = [];
  if (tipo === 'moviles') {
    etiquetas = [j.marca, `${j.almacenamiento_gb} GB`, `${j.ram_gb} GB RAM`];
  } else if (tipo === 'articulos') {
    const resumen = (RESUMEN[categoria] ?? []).slice(0, 2).map((k) => (car && k in car ? valor(k, car[k]) : ''));
    etiquetas = [j.marca ?? '', ...resumen];
    for (const k of Object.keys(car ?? {})) {
      if (k !== 'etiquetas') ficha.push([nombreDato(k), valor(k, car![k])]);
    }
  } else {
    etiquetas = [j.plataforma, j.genero, `PEGI ${j.pegi}`];
  }
  return {
    id: j.id,
    nombre: j.nombre,
    descripcion: j.descripcion ?? '',
    precio: Number(j.precio),
    stock: Number(j.stock),
    imagen: Array.isArray(j.imagenes) && j.imagenes.length ? j.imagenes[0] : '',
    tipo,
    cuadrada: tipo !== 'videojuegos',
    categoria,
    alquilerDia: Number(j.precio_alquiler_dia ?? 0),
    etiquetas: etiquetas.filter((e) => !!e),
    garantias: Array.isArray(j.garantias) ? j.garantias.map((g: any) => ({ meses: Number(g.meses), precio: Number(g.precio) })) : [],
    ficha,
  };
}

export function euros(valorNumero: number): string {
  return valorNumero.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
}
