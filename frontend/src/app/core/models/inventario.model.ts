export interface MovimientoInventario {
  idMovimiento: number;
  fecha: string;
  idProducto: number;

  tipo: string;
  cantidad: number;
  referenciaTabla?: string;
  referenciaId?: number;
  detalle?: string;
  producto?: { idProducto: number; nombreProducto: string; stockActual: number };

}

export interface MovimientoInventarioDto {
  idProducto: number;

  tipo: string;
  cantidad: number;
  referenciaTabla?: string;
  referenciaId?: number;
  detalle?: string;
}

export const TIPOS_MOVIMIENTO = ['Compra', 'Venta', 'Ajuste', 'Devolucion'];
