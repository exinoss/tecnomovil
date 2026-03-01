export interface Cliente {
  idCliente: number;
  nombres: string;
  telefono?: string;
  email?: string;
  identificacion: string;
  tipoIdentificacion: string;
  activo: boolean;
}

export interface ClienteDto {
  nombres: string;
  telefono?: string;
  email?: string;
  identificacion: string;
  tipoIdentificacion: string;
  activo: boolean;
}
