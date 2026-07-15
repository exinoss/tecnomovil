export interface LoginDto {
  identificacion: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  token?: string;
  usuario?: UsuarioInfo;
}

export interface UsuarioInfo {
  idUsuario: number;
  nombres: string;
  correo?: string;
  rol: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
}

export interface SolicitarCodigoDto {
  correo: string;
}

export interface VerificarCodigoDto {
  correo: string;
  codigo: string;
}

export interface ResetearContraseniaDto {
  correo: string;
  codigo: string;
  nuevaPassword: string;
}
