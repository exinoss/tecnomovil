import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../shared/components/toast/toast.service';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.component.html'
})
export class LoginComponent {
  identificacion = '';
  password = '';
  loading = false;
  showPassword = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private toast: ToastService
  ) {
    if (this.authService.isAuthenticated()) {
      this.router.navigate([this.authService.getHomeRoute()]);
    }
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
    if (!this.identificacion || !this.password) {
      this.toast.show('Complete todos los campos', 'warning');
      return;
    }

    this.loading = true;
    this.authService.login({ identificacion: this.identificacion, password: this.password })
      .subscribe({
        next: (res) => {
          this.loading = false;
          if (res.success) {
            this.toast.show('Bienvenido ' + res.usuario?.nombres, 'success');
            this.router.navigate([this.authService.getHomeRoute()]);
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
}
