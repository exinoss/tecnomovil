import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  LoginDto,
  LoginResponse,
  UsuarioInfo,
  AuthResponse,
  SolicitarCodigoDto,
  VerificarCodigoDto,
  ResetearContraseniaDto
} from '../models/auth.model';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;
  private usuarioSubject = new BehaviorSubject<UsuarioInfo | null>(this.getStoredUser());
  usuario$ = this.usuarioSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {}

  login(dto: LoginDto): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, dto).pipe(
      tap(res => {
        if (res.success && res.token && res.usuario) {
          this.restaurarSesion(res.token, res.usuario);
        }
      })
    );
  }

  /** Guarda una sesión ya emitida por el backend (login normal o desbloqueo biométrico). */
  restaurarSesion(token: string, usuario: UsuarioInfo): void {
    localStorage.setItem('token', token);
    localStorage.setItem('usuario', JSON.stringify(usuario));
    this.usuarioSubject.next(usuario);
  }

  solicitarCodigo(correo: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/solicitar-codigo`, { correo } as SolicitarCodigoDto);
  }

  verificarCodigo(correo: string, codigo: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/verificar-codigo`, { correo, codigo } as VerificarCodigoDto);
  }

  resetearContrasenia(dto: ResetearContraseniaDto): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/resetear-contrasenia`, dto);
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    this.usuarioSubject.next(null);
    this.router.navigate(['/auth']);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  getUsuario(): UsuarioInfo | null {
    return this.usuarioSubject.value;
  }

  getRol(): string {
    return this.getUsuario()?.rol ?? '';
  }

  hasRole(roles: string[]): boolean {
    return roles.includes(this.getRol());
  }

  getHomeRoute(): string {
    const rol = this.getRol();
    if (rol === 'Admin' || rol === 'Vendedor' || rol === 'Tecnico') return '/dashboard';
    // Rol desconocido: forzar logout
    this.logout();


    return '/auth';
  }

  private getStoredUser(): UsuarioInfo | null {
    const stored = localStorage.getItem('usuario');
    return stored ? JSON.parse(stored) : null;
  }
}
