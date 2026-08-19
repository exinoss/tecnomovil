import { Injectable } from '@angular/core';
import { App } from '@capacitor/app';
import { Router } from '@angular/router';
import { BiometricService } from './biometric.service';

/** Minutos que la app puede estar en segundo plano antes de exigir volver a autenticarse. */
const MINUTOS_INACTIVIDAD = 5;

/**
 * Exige volver a pasar por /auth cuando la app nativa estuvo en segundo plano más de
 * MINUTOS_INACTIVIDAD, o al reabrirla desde cero (proceso matado, celular reiniciado) —
 * no en cada cambio de primer/segundo plano, para no cerrar la sesión solo por minimizar
 * un momento. Cerrar sesión, borrar datos de la app o matar el proceso también la exigen,
 * de forma natural, sin código adicional: en esos casos no queda token o sesión válida.
 * En web de escritorio queda inactivo.
 */
@Injectable({ providedIn: 'root' })
export class SessionLockService {
  private desbloqueada: boolean;
  private inicializado = false;
  private momentoSegundoPlano: number | null = null;

  constructor(
    private biometricService: BiometricService,
    private router: Router
  ) {
    this.desbloqueada = !this.biometricService.isNative();
  }

  init(): void {
    if (this.inicializado || !this.biometricService.isNative()) return;
    this.inicializado = true;

    App.addListener('appStateChange', (state) => {
      if (state.isActive) {
        this.alVolverAPrimerPlano();
      } else {
        this.momentoSegundoPlano = Date.now();
      }
    });
  }

  private alVolverAPrimerPlano(): void {
    if (this.momentoSegundoPlano === null) return;
    const minutosTranscurridos = (Date.now() - this.momentoSegundoPlano) / 60000;
    this.momentoSegundoPlano = null;

    if (minutosTranscurridos >= MINUTOS_INACTIVIDAD) {
      this.bloquear();
    }
  }

  private bloquear(): void {
    this.desbloqueada = false;
    if (!this.router.url.startsWith('/auth')) {
      this.router.navigate(['/auth']);
    }
  }

  desbloquear(): void {
    this.desbloqueada = true;
  }

  estaDesbloqueada(): boolean {
    return this.desbloqueada;
  }
}
