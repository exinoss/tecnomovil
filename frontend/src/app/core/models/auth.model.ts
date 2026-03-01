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
