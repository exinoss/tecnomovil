import { Component, OnInit } from '@angular/core';
import { UsuarioService } from '../../core/services/usuario.service';
import { Usuario, UsuarioDto } from '../../core/models/usuario.model';
import { ToastService } from '../../shared/components/toast/toast.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-usuarios',
  standalone: false,
  templateUrl: './usuarios.component.html'
})
export class UsuariosComponent implements OnInit {
  usuarios: Usuario[] = [];
  filteredUsuarios: Usuario[] = [];
  searchTerm = '';
  loading = false;

  showModal = false;
  editMode = false;
  selectedId: number | null = null;
  form: UsuarioDto = { nombres: '', identificacion: '', tipoIdentificacion: 'Cedula', rol: 'Vendedor', activo: true };

  showPasswordModal = false;
  passwordUserId: number | null = null;
  nuevaPassword = '';

  roles = ['Admin', 'Tecnico', 'Vendedor'];
  tiposId = ['Cedula', 'RUC'];
  currentUserId = 0;

  constructor(
    private usuarioService: UsuarioService,
    private toast: ToastService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.currentUserId = this.authService.getUsuario()?.idUsuario ?? 0;
    this.loadData();
  }

  canToggle(u: Usuario): boolean {
    // No se puede deshabilitar a sí mismo ni a otro Admin
    return u.idUsuario !== this.currentUserId && u.rol !== 'Admin';
  }

  loadData(): void {
    this.loading = true;
    this.usuarioService.getAll().subscribe({
      next: (data) => {
        this.usuarios = data;
        this.applyFilter();
        this.loading = false;
      },
      error: () => {
        this.toast.show('Error al cargar usuarios', 'error');
        this.loading = false;
      }
    });
  }

  applyFilter(): void {
    const term = this.searchTerm.toLowerCase();
    this.filteredUsuarios = this.usuarios.filter(u =>
      u.nombres.toLowerCase().includes(term) ||
      u.identificacion.includes(term) ||
      u.rol.toLowerCase().includes(term)
    );
  }

  openCreate(): void {
    this.editMode = false;
    this.selectedId = null;
    this.form = { nombres: '', identificacion: '', tipoIdentificacion: 'Cedula', rol: 'Vendedor', activo: true, password: '' };
    this.showModal = true;
  }

  openEdit(u: Usuario): void {
    this.editMode = true;
    this.selectedId = u.idUsuario;
    this.form = {
      nombres: u.nombres,
      correo: u.correo,
      identificacion: u.identificacion,
      tipoIdentificacion: u.tipoIdentificacion,
      rol: u.rol,
      activo: u.activo
    };
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
  }

  save(): void {
    if (!this.form.nombres.trim() || !this.form.identificacion.trim()) {
      this.toast.show('Nombre e identificación son requeridos', 'warning');
      return;
    }

    if (!this.editMode && !this.form.password) {
      this.toast.show('La contraseña es requerida', 'warning');
      return;
    }

    if (this.editMode && this.selectedId) {
      this.usuarioService.update(this.selectedId, this.form).subscribe({
        next: () => {
          this.toast.show('Usuario actualizado', 'success');
          this.closeModal();
          this.loadData();
        },
        error: (err) => this.toast.show(err.error?.message || 'Error al actualizar', 'error')
      });
    } else {
      this.usuarioService.create(this.form).subscribe({
        next: () => {
          this.toast.show('Usuario creado', 'success');
          this.closeModal();
          this.loadData();
        },
        error: (err) => this.toast.show(err.error?.message || 'Error al crear', 'error')
      });
    }
  }

  toggleActivo(u: Usuario): void {
    if (!this.canToggle(u)) return;
    const dto: UsuarioDto = {
      nombres: u.nombres,
      correo: u.correo,
      identificacion: u.identificacion,
      tipoIdentificacion: u.tipoIdentificacion,
      rol: u.rol,
      activo: !u.activo
    };
    this.usuarioService.update(u.idUsuario, dto).subscribe({
      next: () => {
        this.toast.show(dto.activo ? 'Usuario activado' : 'Usuario desactivado', 'success');
        this.loadData();
      },
      error: () => this.toast.show('Error al cambiar estado', 'error')
    });
  }

  openChangePassword(u: Usuario): void {
    this.passwordUserId = u.idUsuario;
    this.nuevaPassword = '';
    this.showPasswordModal = true;
  }

  cambiarPassword(): void {
    if (!this.nuevaPassword || this.nuevaPassword.length < 6) {
      this.toast.show('La contraseña debe tener al menos 6 caracteres', 'warning');
      return;
    }

    if (this.passwordUserId) {
      this.usuarioService.cambiarPassword(this.passwordUserId, { nuevaPassword: this.nuevaPassword }).subscribe({
        next: () => {
          this.toast.show('Contraseña actualizada', 'success');
          this.showPasswordModal = false;
        },
        error: () => this.toast.show('Error al cambiar contraseña', 'error')
      });
    }
  }
}
