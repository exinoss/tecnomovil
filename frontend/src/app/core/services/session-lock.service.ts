import { Injectable } from '@angular/core';
import { App } from '@capacitor/app';
import { Router } from '@angular/router';
import { BiometricService } from './biometric.service';

/** Minutos que la app puede estar en segundo plano antes de exigir volver a autenticarse. */
const MINUTOS_INACTIVIDAD = 5;

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
