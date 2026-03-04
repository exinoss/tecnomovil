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
}

export interface ReparacionListItem {
  idReparacion: number;
  idCliente: number;
  idUsuario: number;
  modeloEquipo: string;
  serieImeiIngreso: string;
  descripcionFalla?: string;
  diagnosticoFinal?: string;
  costoManoObra: number;
  estado: string;
  fechaIngreso: string;
  clienteNombre: string;
  tecnicoNombre: string;
}

export interface ReparacionPagedResponse {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  items: ReparacionListItem[];
}

export interface ReparacionRepuesto {
  idReparacionRepuesto: number;
  idReparacion: number;
  idProducto: number;

  cantidad: number;
  costoUnitario?: number;
  precioCobrado?: number;
  producto?: { idProducto: number; nombreProducto: string };

}

export interface ReparacionRepuestoDto {
  idProducto: number;

  cantidad: number;
  costoUnitario?: number;
  precioCobrado?: number;
}

export interface AprobacionDto {
  aprobado: boolean;
  motivoRechazo?: string;
}

export const ESTADOS_REPARACION = [
  'Recibido', 'Reparado', 'Facturado', 'Cancelado'
];
