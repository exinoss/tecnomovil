export interface Reparacion {
  idReparacion: number;
  idCliente: number;
  idUsuario: number;
  modeloEquipo: string;
  serieImeiIngreso: string;
  descripcionFalla?: string;
  diagnosticoFinal?: string;
  costoManoObra: number;
  estado: string;
  aprobado?: boolean;
  fechaAprobacion?: string;
  motivoRechazo?: string;
  fechaIngreso: string;
  cliente?: { idCliente: number; nombres: string; identificacion: string };
  tecnico?: { idUsuario: number; nombres: string };
  repuestos?: ReparacionRepuesto[];
}

export interface ReparacionDto {
  idCliente: number;
  idUsuario: number;
  modeloEquipo: string;
  serieImeiIngreso: string;
  descripcionFalla?: string;
  diagnosticoFinal?: string;
  costoManoObra: number;
  estado: string;
  aprobado?: boolean;
  motivoRechazo?: string;
}

export interface ReparacionRepuesto {
  idReparacionRepuesto: number;
  idReparacion: number;
  idProducto: number;
  idSerial?: number;
  cantidad: number;
  costoUnitario?: number;
  precioCobrado?: number;
  producto?: { idProducto: number; nombreProducto: string };
  serial?: { idSerial: number; numeroSerieImei: string };
}

export interface ReparacionRepuestoDto {
  idProducto: number;
  idSerial?: number;
  cantidad: number;
  costoUnitario?: number;
  precioCobrado?: number;
}

export interface AprobacionDto {
  aprobado: boolean;
  motivoRechazo?: string;
}

export const ESTADOS_REPARACION = [
  'Recibido', 'Cotizado', 'Aprobado', 'En Proceso', 'Reparado', 'Entregado', 'Rechazado', 'Cancelado'
];
