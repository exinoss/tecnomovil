import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../shared/components/toast/toast.service';

type Paso = 'correo' | 'codigo' | 'password';

@Component({
  selector: 'app-forgot-password',
  standalone: false,
  templateUrl: './forgot-password.component.html'
})
export class ForgotPasswordComponent {
  paso: Paso = 'correo';
  loading = false;

  correo = '';
  codigo = '';
  nuevaPassword = '';
  confirmarPassword = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private toast: ToastService
  ) {}

  solicitarCodigo(): void {
    if (!this.correo) {
      this.toast.show('Ingrese su correo', 'warning');
      return;
    }

    this.loading = true;
    this.authService.solicitarCodigo(this.correo).subscribe({
      next: (res) => {
        this.loading = false;
        this.toast.show(res.message, res.success ? 'success' : 'error');
        if (res.success) {
          this.paso = 'codigo';
        }
      },
      error: () => {
        this.loading = false;
        this.toast.show('Error de conexión con el servidor', 'error');
      }
    });
  }

  verificarCodigo(): void {
    if (!this.codigo || this.codigo.length !== 6) {
      this.toast.show('Ingrese el código de 6 dígitos', 'warning');
      return;
    }

    this.loading = true;
    this.authService.verificarCodigo(this.correo, this.codigo).subscribe({
      next: (res) => {
        this.loading = false;
        this.toast.show(res.message, res.success ? 'success' : 'error');
        if (res.success) {
          this.paso = 'password';
        }
      },
      error: () => {
        this.loading = false;
        this.toast.show('Error de conexión con el servidor', 'error');
      }
    });
  }

  resetearContrasenia(): void {
    if (!this.nuevaPassword || !this.confirmarPassword) {
      this.toast.show('Complete todos los campos', 'warning');
      return;
    }

    if (this.nuevaPassword !== this.confirmarPassword) {
      this.toast.show('Las contraseñas no coinciden', 'warning');
      return;
    }

    this.loading = true;
    this.authService
      .resetearContrasenia({ correo: this.correo, codigo: this.codigo, nuevaPassword: this.nuevaPassword })
      .subscribe({
        next: (res) => {
          this.loading = false;
          this.toast.show(res.message, res.success ? 'success' : 'error');
          if (res.success) {
            this.router.navigate(['/auth']);
          }
        },
        error: () => {
          this.loading = false;
          this.toast.show('Error de conexión con el servidor', 'error');
        }
      });
  }
}
