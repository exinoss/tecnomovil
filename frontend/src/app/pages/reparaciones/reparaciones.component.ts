import { Component, OnInit } from '@angular/core';
import { ReparacionService } from '../../core/services/reparacion.service';
import { ClienteService } from '../../core/services/cliente.service';
import { UsuarioService } from '../../core/services/usuario.service';
import { ProductoService } from '../../core/services/producto.service';
import { Reparacion, ReparacionDto, ReparacionRepuesto, ReparacionRepuestoDto, ESTADOS_REPARACION } from '../../core/models/reparacion.model';
import { Cliente } from '../../core/models/cliente.model';
import { Producto } from '../../core/models/producto.model';
import { ToastService } from '../../shared/components/toast/toast.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-reparaciones',
  standalone: false,
  templateUrl: './reparaciones.component.html'
})
export class ReparacionesComponent implements OnInit {
  reparaciones: Reparacion[] = [];
  filteredReparaciones: Reparacion[] = [];
  searchTerm = '';
  filterEstado = '';
  loading = false;
  estados = ESTADOS_REPARACION;

  clientes: Cliente[] = [];
  tecnicos: any[] = [];
  productos: Producto[] = [];

  // Modal crear/editar
  showModal = false;
  editMode = false;
  selectedId: number | null = null;
  form: ReparacionDto = { idCliente: 0, idUsuario: 0, modeloEquipo: '', serieImeiIngreso: '', costoManoObra: 0, estado: 'Recibido' };

  // Modal detalle
  showDetalle = false;
  reparacionDetalle: Reparacion | null = null;
  repuestos: ReparacionRepuesto[] = [];

  // Modal repuesto
  showRepuestoModal = false;
  repuestoForm: ReparacionRepuestoDto = { idProducto: 0, cantidad: 1 };

  // Modal aprobar
  showAprobarModal = false;
  aprobarId: number | null = null;
  motivoRechazo = '';

  // Modal cambiar estado
  showEstadoModal = false;
  estadoId: number | null = null;
  nuevoEstado = '';

  userRol = '';

  constructor(
    private reparacionService: ReparacionService,
    private clienteService: ClienteService,
    private usuarioService: UsuarioService,
    private productoService: ProductoService,
    private toast: ToastService,
    private auth: AuthService
  ) {
    this.userRol = this.auth.getRol();
  }

  ngOnInit(): void {
    this.loadData();
    this.clienteService.getActivos().subscribe(c => this.clientes = c);
    this.usuarioService.getTecnicos().subscribe(t => this.tecnicos = t);
    this.productoService.getActivos().subscribe(p => this.productos = p);
  }

  loadData(): void {
    this.loading = true;
    this.reparacionService.getAll().subscribe({
      next: (data) => {
        this.reparaciones = data;
        this.applyFilter();
        this.loading = false;
      },
      error: () => {
        this.toast.show('Error al cargar reparaciones', 'error');
        this.loading = false;
      }
    });
  }

  applyFilter(): void {
    const term = this.searchTerm.toLowerCase();
    this.filteredReparaciones = this.reparaciones.filter(r => {
      const matchTerm = r.modeloEquipo.toLowerCase().includes(term) ||
                        r.serieImeiIngreso.toLowerCase().includes(term) ||
                        (r.cliente?.nombres?.toLowerCase().includes(term) ?? false);
      const matchEstado = !this.filterEstado || r.estado === this.filterEstado;
      return matchTerm && matchEstado;
    });
  }

  openCreate(): void {
    this.editMode = false;
    this.selectedId = null;
    this.form = { idCliente: 0, idUsuario: 0, modeloEquipo: '', serieImeiIngreso: '', costoManoObra: 0, estado: 'Recibido' };
    this.showModal = true;
  }

  openEdit(r: Reparacion): void {
    this.editMode = true;
    this.selectedId = r.idReparacion;
    this.form = {
      idCliente: r.idCliente,
      idUsuario: r.idUsuario,
      modeloEquipo: r.modeloEquipo,
      serieImeiIngreso: r.serieImeiIngreso,
      descripcionFalla: r.descripcionFalla,
      diagnosticoFinal: r.diagnosticoFinal,
      costoManoObra: r.costoManoObra,
      estado: r.estado
    };
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
  }

  save(): void {
    if (!this.form.idCliente || !this.form.idUsuario || !this.form.modeloEquipo.trim() || !this.form.serieImeiIngreso.trim()) {
      this.toast.show('Complete los campos requeridos', 'warning');
      return;
    }

    if (this.editMode && this.selectedId) {
      this.reparacionService.update(this.selectedId, this.form).subscribe({
        next: () => {
          this.toast.show('Reparación actualizada', 'success');
          this.closeModal();
          this.loadData();
        },
        error: (err) => this.toast.show(err.error?.message || 'Error al actualizar', 'error')
      });
    } else {
      this.reparacionService.create(this.form).subscribe({
        next: () => {
          this.toast.show('Reparación creada', 'success');
          this.closeModal();
          this.loadData();
        },
        error: (err) => this.toast.show(err.error?.message || 'Error al crear', 'error')
      });
    }
  }

  // Detalle
  openDetalle(r: Reparacion): void {
    this.reparacionService.getById(r.idReparacion).subscribe({
      next: (data) => {
        this.reparacionDetalle = data;
        this.repuestos = data.repuestos || [];
        this.showDetalle = true;
      },
      error: () => this.toast.show('Error al cargar detalle', 'error')
    });
  }

  closeDetalle(): void {
    this.showDetalle = false;
    this.reparacionDetalle = null;
  }

  // Repuestos
  openRepuestoModal(): void {
    this.repuestoForm = { idProducto: 0, cantidad: 1 };
    this.showRepuestoModal = true;
  }

  addRepuesto(): void {
    if (!this.repuestoForm.idProducto || this.repuestoForm.cantidad <= 0) {
      this.toast.show('Seleccione producto y cantidad', 'warning');
      return;
    }
    if (this.reparacionDetalle) {
      this.reparacionService.addRepuesto(this.reparacionDetalle.idReparacion, this.repuestoForm).subscribe({
        next: () => {
          this.toast.show('Repuesto agregado', 'success');
          this.showRepuestoModal = false;
          this.openDetalle(this.reparacionDetalle!);
        },
        error: (err) => this.toast.show(err.error?.message || 'Error al agregar repuesto', 'error')
      });
    }
  }

  deleteRepuesto(id: number): void {
    this.reparacionService.deleteRepuesto(id).subscribe({
      next: () => {
        this.toast.show('Repuesto eliminado', 'success');
        this.openDetalle(this.reparacionDetalle!);
      },
      error: () => this.toast.show('Error al eliminar repuesto', 'error')
    });
  }

  // Estado
  openEstadoModal(r: Reparacion): void {
    this.estadoId = r.idReparacion;
    this.nuevoEstado = r.estado;
    this.showEstadoModal = true;
  }

  cambiarEstado(): void {
    if (this.estadoId && this.nuevoEstado) {
      this.reparacionService.cambiarEstado(this.estadoId, this.nuevoEstado).subscribe({
        next: () => {
          this.toast.show('Estado actualizado', 'success');
          this.showEstadoModal = false;
          this.loadData();
        },
        error: () => this.toast.show('Error al cambiar estado', 'error')
      });
    }
  }

  // Aprobar
  openAprobarModal(r: Reparacion): void {
    this.aprobarId = r.idReparacion;
    this.motivoRechazo = '';
    this.showAprobarModal = true;
  }

  aprobar(aprobado: boolean): void {
    if (this.aprobarId !== null) {
      this.reparacionService.aprobar(this.aprobarId, {
        aprobado,
        motivoRechazo: aprobado ? undefined : this.motivoRechazo
      }).subscribe({
        next: () => {
          this.toast.show(aprobado ? 'Reparación aprobada' : 'Reparación rechazada', 'success');
          this.showAprobarModal = false;
          this.loadData();
        },
        error: () => this.toast.show('Error al procesar aprobación', 'error')
      });
    }
  }

  getEstadoClass(estado: string): string {
    const clases: Record<string, string> = {
      'Recibido': 'bg-gray-100 text-gray-700',
      'Cotizado': 'bg-yellow-100 text-yellow-700',
      'Aprobado': 'bg-blue-100 text-blue-700',
      'En Proceso': 'bg-blue-100 text-blue-700',
      'Reparado': 'bg-green-100 text-green-700',
      'Entregado': 'bg-green-100 text-green-700',
      'Rechazado': 'bg-red-100 text-red-700',
      'Cancelado': 'bg-red-100 text-red-700'
    };
    return clases[estado] || 'bg-gray-100 text-gray-700';
  }
}
