import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { BiometricService } from '../../core/services/biometric.service';
import { PinService } from '../../core/services/pin.service';
import { SesionGuardada } from '../../core/models/auth.model';
import { ToastService } from '../../shared/components/toast/toast.service';

@Component({
  selector: 'app-seguridad',
  standalone: false,
  templateUrl: './seguridad.component.html'
})
export class SeguridadComponent implements OnInit {
  loading = true;
  esNativo = false;

  biometriaDisponible = false;
  biometriaActiva = false;
  cambiandoBiometria = false;

  pinDisponible = false;
  pinActivo = false;
  cambiandoPin = false;

  constructor(
    private authService: AuthService,
    private biometricService: BiometricService,
    private pinService: PinService,
    private toast: ToastService
  ) {}

  async ngOnInit(): Promise<void> {
    this.esNativo = this.biometricService.isNative();
    if (this.esNativo) {
      this.biometriaDisponible = await this.biometricService.isAvailable();
      this.biometriaActiva = await this.biometricService.isEnabled();
      this.pinDisponible = await this.pinService.isAvailable();
      this.pinActivo = await this.pinService.isEnabled();
    }
    this.loading = false;
  }

  private obtenerSesionActual(): SesionGuardada | null {
    const token = this.authService.getToken();
    const usuario = this.authService.getUsuario();
    return token && usuario ? { token, usuario } : null;
  }

  async toggleBiometria(): Promise<void> {
    this.cambiandoBiometria = true;
    try {
      if (this.biometriaActiva) {
        await this.biometricService.disable();
        this.biometriaActiva = false;
        this.toast.show('Acceso con huella desactivado', 'success');
        return;
      }

      const sesion = this.obtenerSesionActual();
      if (!sesion) {
        this.toast.show('Vuelve a iniciar sesión para activar esta opción', 'warning');
        return;
      }
      await this.biometricService.enable(sesion);
      this.biometriaActiva = true;
      this.toast.show('Acceso con huella activado', 'success');
    } catch {
      this.toast.show('No se pudo cambiar la configuración', 'error');
    } finally {
      this.cambiandoBiometria = false;
    }
  }

  async togglePin(): Promise<void> {
    this.cambiandoPin = true;
    try {
      if (this.pinActivo) {
        await this.pinService.disable();
        this.pinActivo = false;
        this.toast.show('Acceso con PIN desactivado', 'success');
        return;
      }

      const sesion = this.obtenerSesionActual();
      if (!sesion) {
        this.toast.show('Vuelve a iniciar sesión para activar esta opción', 'warning');
        return;
      }
      await this.pinService.enable(sesion);
      this.pinActivo = true;
      this.toast.show('Acceso con PIN activado', 'success');
    } catch {
      this.toast.show('No se pudo cambiar la configuración', 'error');
    } finally {
      this.cambiandoPin = false;
    }
  }
}
