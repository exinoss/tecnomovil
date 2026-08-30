export interface LoginDto {
  identificacion: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  token?: string;
  usuario?: UsuarioInfo;
  bloqueado?: boolean;
  minutosRestantes?: number;
}

export interface UsuarioInfo {
  idUsuario: number;
  nombres: string;
  correo?: string;
  rol: string;
}

/** Sesión guardada localmente para el acceso rápido por huella o PIN (ver BiometricService/PinService). */
export interface SesionGuardada {
  token: string;
  usuario: UsuarioInfo;
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
