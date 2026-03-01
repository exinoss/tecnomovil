export interface Usuario {
  idUsuario: number;
  nombres: string;
  correo?: string;
  identificacion: string;
  tipoIdentificacion: string;
  rol: string;
  activo: boolean;
}

export interface UsuarioDto {
  nombres: string;
  correo?: string;
  identificacion: string;
  tipoIdentificacion: string;
  password?: string;
  rol: string;
  activo: boolean;
}

export interface CambiarPasswordDto {
  nuevaPassword: string;
}
