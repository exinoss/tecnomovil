import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../shared/components/toast/toast.service';
import { BiometricService } from '../../core/services/biometric.service';
import { PinService } from '../../core/services/pin.service';
import { SessionLockService } from '../../core/services/session-lock.service';
import { UsuarioInfo } from '../../core/models/auth.model';

type Vista = 'selector' | 'password';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.component.html'
})
export class LoginComponent {
  vista: Vista = 'password';
  mostrarSelector = false;
  mostrarTileBiometria = false;
  mostrarTilePin = false;
  verificando = false;

  identificacion = '';
  password = '';
  loading = false;
  showPassword = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private toast: ToastService,
    private biometricService: BiometricService,
    private pinService: PinService,
    private sessionLock: SessionLockService,
    private alertController: AlertController
  ) {
    if (this.authService.isAuthenticated() && this.sessionLock.estaDesbloqueada()) {
      this.router.navigate([this.authService.getHomeRoute()]);
    }
  }

  /** ionViewWillEnter (no ngOnInit): se dispara cada vez que se vuelve a esta página, incluida la reutilización de vista del ion-router-outlet tras cerrar sesión. */
  async ionViewWillEnter(): Promise<void> {
    this.identificacion = '';
    this.password = '';

    if (this.biometricService.isNative()) {
      this.mostrarTileBiometria = await this.biometricService.isEnabled();
      this.mostrarTilePin = await this.pinService.isEnabled();
    }

    this.mostrarSelector = this.mostrarTileBiometria || this.mostrarTilePin;
    this.vista = this.mostrarSelector ? 'selector' : 'password';
  }

  irA(vista: Vista): void {
    this.vista = vista;
  }

  volverAlSelector(): void {
    if (this.mostrarSelector) {
      this.vista = 'selector';
    }
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  async intentarBiometria(): Promise<void> {
    this.verificando = true;
    const sesion = await this.biometricService.desbloquear();
    this.verificando = false;
    if (sesion) {
      this.completarSesion(sesion.token, sesion.usuario);
    } else {
      this.toast.show('No se pudo verificar tu identidad', 'error');
    }
  }

  async intentarPin(): Promise<void> {
    this.verificando = true;
    const sesion = await this.pinService.desbloquear();
    this.verificando = false;
    if (sesion) {
      this.completarSesion(sesion.token, sesion.usuario);
    } else {
      this.toast.show('No se pudo verificar tu identidad', 'error');
    }
  }

  onSubmit(): void {
    if (!this.identificacion || !this.password) {
      this.toast.show('Complete todos los campos', 'warning');
      return;
    }

    this.loading = true;
    this.authService.login({ identificacion: this.identificacion, password: this.password })
      .subscribe({
        next: async (res) => {
          this.loading = false;
          if (res.success && res.token && res.usuario) {
            this.toast.show('Bienvenido ' + res.usuario.nombres, 'success');
            this.completarSesion(res.token, res.usuario);
            await this.ofrecerConfigurarAccesosRapidos();
          } else {
            this.toast.show(res.message, 'error');
          }
        },
        error: () => {
          this.loading = false;
          this.toast.show('Error de conexión con el servidor', 'error');
        }
      });
  }

  private completarSesion(token: string, usuario: UsuarioInfo): void {
    this.authService.restaurarSesion(token, usuario);
    this.sessionLock.desbloquear();
    this.router.navigate([this.authService.getHomeRoute()]);
  }

  private async ofrecerConfigurarAccesosRapidos(): Promise<void> {
    if (!this.biometricService.isNative()) return;

    const faltaBiometria = (await this.biometricService.isAvailable()) && !(await this.biometricService.isEnabled());
    const faltaPin = (await this.pinService.isAvailable()) && !(await this.pinService.isEnabled());
    if (!faltaBiometria && !faltaPin) return;

    const alert = await this.alertController.create({
      header: 'Acceso rápido',
      message: 'Puedes configurar el ingreso con huella o con el PIN de tu celular desde Seguridad.',
      buttons: [
        { text: 'Ahora no', role: 'cancel' },
        { text: 'Configurar', handler: () => this.router.navigate(['/seguridad']) }
      ]
    });
    await alert.present();
  }
}
