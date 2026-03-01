export interface MovimientoInventario {
  idMovimiento: number;
  fecha: string;
  idProducto: number;
  idSerial?: number;
  tipo: string;
  cantidad: number;
  referenciaTabla?: string;
  referenciaId?: number;
  detalle?: string;
  producto?: { idProducto: number; nombreProducto: string; stockActual: number };
  serial?: { idSerial: number; numeroSerieImei: string };
}

export interface MovimientoInventarioDto {
  idProducto: number;
  idSerial?: number;
  tipo: string;
  cantidad: number;
  referenciaTabla?: string;
  referenciaId?: number;
  detalle?: string;
}

export const TIPOS_MOVIMIENTO = ['Compra', 'Venta', 'ConsumoReparacion', 'Ajuste', 'Devolucion'];
