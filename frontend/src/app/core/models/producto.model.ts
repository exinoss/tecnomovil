export interface Producto {
  idProducto: number;
  idCategoria: number;
  nombreProducto: string;
  imagen?: string;
  descripcion?: string;
  stockActual: number;
  precioVenta: number;
  esSerializado: boolean;
  activo: boolean;
  categoria?: { idCategoria: number; nombreCategoria: string };
  seriales?: ProductoSerial[];
  atributos?: ProductoAtributo[];
}

export interface ProductoDto {
  idCategoria: number;
  nombreProducto: string;
  imagen?: string;
  descripcion?: string;
  precioVenta: number;
  esSerializado: boolean;
  activo: boolean;
}

export interface ProductoSerial {
  idSerial: number;
  idProducto: number;
  numeroSerieImei: string;
  estado: string;
}

export interface ProductoSerialDto {
  numeroSerieImei: string;
  estado?: string;
}

export interface ProductoAtributo {
  idProducto: number;
  idAtributo: number;
  valorTexto?: string;
  valorNumero?: number;
  valorBool?: boolean;
  valorFecha?: string;
  atributo?: { idAtributo: number; nombreAtributo: string; tipoDato: string; unidad?: string };
}

export interface ProductoAtributoDto {
  idProducto: number;
  idAtributo: number;
  valorTexto?: string;
  valorNumero?: number;
  valorBool?: boolean;
  valorFecha?: string;
}
