export interface Factura {
  idFactura: number;
  idCliente: number;
  idUsuario: number;
  fecha: string;
  ivaPorcentaje: number;
  subtotal: number;
  iva: number;
  total: number;
  cliente?: { idCliente: number; nombres: string; identificacion: string };
  vendedor?: { idUsuario: number; nombres: string };
  detalles?: DetalleFactura[];
}

export interface FacturaResponse {
  idFactura: number;
  fecha: string;
  clienteNombre: string;
  vendedorNombre: string;
  ivaPorcentaje: number;
  subtotal: number;
  iva: number;
  total: number;
  detalles: DetalleFacturaDto[];
}

export interface DetalleFactura {
  idDetalle: number;
  idFactura: number;
  idProducto?: number;
  idSerial?: number;
  idReparacion?: number;
  descripcionItem?: string;
  cantidad: number;
  precioUnitario: number;
  tipoItem: string;
  producto?: { idProducto: number; nombreProducto: string };
}

export interface FacturaDto {
  idCliente: number;
  detalles: DetalleFacturaDto[];
  reparacionIds?: number[];
}

export interface DetalleFacturaDto {
  idDetalle?: number;
  idProducto?: number;
  idSerial?: number;
  idReparacion?: number;
  descripcionItem?: string;
  cantidad: number;
  precioUnitario: number;
  tipoItem: string;
}
