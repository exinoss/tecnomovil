import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Platform } from '@ionic/angular';
import { App } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import { AuthService } from './auth.service';
import { ToastService } from '../../shared/components/toast/toast.service';

const VENTANA_DOBLE_TOQUE_MS = 2000;

/** Ionic usa 0 para el pop de navegación y 99/100 para menú/overlays; debe quedar entre ambos. */
const PRIORIDAD = 10;

@Injectable({ providedIn: 'root' })
export class BackButtonService {
  private inicializado = false;
  private ultimoToque = 0;

  constructor(
    private platform: Platform,
    private router: Router,
    private authService: AuthService,
    private toast: ToastService
  ) {}

  init(): void {
    if (this.inicializado || !Capacitor.isNativePlatform()) return;
    this.inicializado = true;

    this.platform.backButton.subscribeWithPriority(PRIORIDAD, () => {
      if (!this.authService.isAuthenticated() || this.router.url.startsWith('/auth')) {
        App.minimizeApp();
        return;
      }

      const ahora = Date.now();
      if (ahora - this.ultimoToque < VENTANA_DOBLE_TOQUE_MS) {
        this.ultimoToque = 0;
        this.authService.logout();
        return;
      }

      this.ultimoToque = ahora;
      this.toast.show('Toca otra vez para cerrar sesión', 'info');
    });
  }
}
