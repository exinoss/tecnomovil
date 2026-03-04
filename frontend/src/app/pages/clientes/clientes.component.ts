import { Component, OnInit } from '@angular/core';
import { ClienteService } from '../../core/services/cliente.service';
import { Cliente, ClienteDto } from '../../core/models/cliente.model';
import { ToastService } from '../../shared/components/toast/toast.service';
import { ValidacionService } from '../../core/services/validacion.service';

@Component({
  selector: 'app-clientes',
  standalone: false,
  templateUrl: './clientes.component.html'
})
export class ClientesComponent implements OnInit {
  clientes: Cliente[] = [];
  filteredClientes: Cliente[] = [];
  searchTerm = '';
  loading = false;

  showModal = false;
  editMode = false;
  selectedId: number | null = null;
  form: ClienteDto = { nombres: '', identificacion: '', tipoIdentificacion: 'Cedula', activo: true };

  tiposIdentificacion = ['Cedula', 'RUC', 'Pasaporte'];

  constructor(
    private clienteService: ClienteService,
    private toast: ToastService,
    private validacion: ValidacionService
  ) {}

  ngOnInit(): void { this.loadData(); }

  loadData(): void {
    this.loading = true;
    this.clienteService.getAll().subscribe({
      next: (data) => { this.clientes = data; this.applyFilter(); this.loading = false; },
      error: () => { this.toast.show('Error al cargar clientes', 'error'); this.loading = false; }
    });
  }

  applyFilter(): void {
    const term = this.searchTerm.toLowerCase();
    this.filteredClientes = this.clientes.filter(c =>
      c.nombres.toLowerCase().includes(term) ||
      c.identificacion.includes(term) ||
      (c.telefono?.includes(term) ?? false) ||
      (c.email?.toLowerCase().includes(term) ?? false)
    );
  }

  openCreate(): void {
    this.editMode = false;
    this.selectedId = null;
    this.form = { nombres: '', identificacion: '', tipoIdentificacion: 'Cedula', activo: true };
    this.showModal = true;
  }

  openEdit(c: Cliente): void {
    this.editMode = true;
    this.selectedId = c.idCliente;
    this.form = { nombres: c.nombres, telefono: c.telefono, email: c.email, identificacion: c.identificacion, tipoIdentificacion: c.tipoIdentificacion, activo: c.activo };
    this.showModal = true;
  }

  closeModal(): void { this.showModal = false; }

  save(): void {
    const rNombre = this.validacion.requerido(this.form.nombres, 'El nombre');
    if (!rNombre.valid) { this.toast.show(rNombre.mensaje, 'warning'); return; }

    const rId = this.validacion.identificacion(this.form.identificacion, this.form.tipoIdentificacion);
    if (!rId.valid) { this.toast.show(rId.mensaje, 'warning'); return; }

    const rTel = this.validacion.telefono(this.form.telefono);
    if (!rTel.valid) { this.toast.show(rTel.mensaje, 'warning'); return; }

    const rEmail = this.validacion.email(this.form.email);
    if (!rEmail.valid) { this.toast.show(rEmail.mensaje, 'warning'); return; }

    if (this.editMode && this.selectedId) {
      this.clienteService.update(this.selectedId, this.form).subscribe({
        next: () => {
          this.toast.show('Cliente actualizado', 'success');
          this.closeModal();
          this.loadData();
        },
        error: (err) => this.toast.show(err.error?.message || 'Error al actualizar', 'error')
      });
    } else {
      this.clienteService.create(this.form).subscribe({
        next: () => {
          this.toast.show('Cliente creado', 'success');
          this.closeModal();
          this.loadData();
        },
        error: (err) => this.toast.show(err.error?.message || 'Error al crear', 'error')
      });
    }
  }

  toggleActivo(c: Cliente): void {
    const dto: ClienteDto = {
      nombres: c.nombres,
      telefono: c.telefono,
      email: c.email,
      identificacion: c.identificacion,
      tipoIdentificacion: c.tipoIdentificacion,
      activo: !c.activo
    };
    this.clienteService.update(c.idCliente, dto).subscribe({
      next: () => {
        this.toast.show(dto.activo ? 'Cliente activado' : 'Cliente desactivado', 'success');
        this.loadData();
      },
      error: () => this.toast.show('Error al cambiar estado', 'error')
    });
  }
}
