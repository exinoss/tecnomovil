import { Component, OnInit } from '@angular/core';
import { ReparacionService } from '../../core/services/reparacion.service';
import { ClienteService } from '../../core/services/cliente.service';
import { UsuarioService } from '../../core/services/usuario.service';
import { ProductoService } from '../../core/services/producto.service';
import { Reparacion, ReparacionDto, ReparacionRepuesto, ReparacionRepuestoDto, ESTADOS_REPARACION, ReparacionListItem } from '../../core/models/reparacion.model';
import { Cliente } from '../../core/models/cliente.model';
import { Producto } from '../../core/models/producto.model';
import { ToastService } from '../../shared/components/toast/toast.service';
import { AuthService } from '../../core/services/auth.service';
import { ValidacionService } from '../../core/services/validacion.service';

@Component({
  selector: 'app-reparaciones',
  standalone: false,
  templateUrl: './reparaciones.component.html'
})
export class ReparacionesComponent implements OnInit {
  reparaciones: ReparacionListItem[] = [];
  searchTerm = '';
  filterEstado = '';
  loading = false;
  totalItems = 0;
  estados = ESTADOS_REPARACION;

  // Paginación
  currentPage = 1;
  pageSize = 10;

  clientes: Cliente[] = [];
  tecnicos: any[] = [];
  productos: Producto[] = [];

  // Modal crear/editar/detalle (Gestión unificada)
  showModal = false;
  editMode = false;
  selectedId: number | null = null;
  form: ReparacionDto = { idCliente: 0, idUsuario: 0, modeloEquipo: '', serieImeiIngreso: '', costoManoObra: 0, estado: 'Recibido' };
  
  // Datos extendidos cuando se edita/ve
  reparacionCompleta: Reparacion | null = null;
  repuestos: ReparacionRepuesto[] = [];
  
  // Acordeones UI
  tabView: string = 'datos';

  // Modal repuesto
  showRepuestoModal = false;
  repuestoForm: ReparacionRepuestoDto = { idProducto: 0, cantidad: 1 };

  // Modal cambiar estado
  showEstadoModal = false;
  estadoId: number | null = null;
  nuevoEstado = '';
  estadoReparacion: Reparacion | null = null;
  showCostoWarning = false;

  userRol = '';

  constructor(
    private reparacionService: ReparacionService,
    private clienteService: ClienteService,
    private usuarioService: UsuarioService,
    private productoService: ProductoService,
    private toast: ToastService,
    private auth: AuthService,
    private validacion: ValidacionService
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
    this.reparacionService.getPaged(this.currentPage, this.pageSize, this.searchTerm, this.filterEstado).subscribe({
      next: (data) => {
        this.reparaciones = data.items;
        this.totalItems = data.totalItems;
        this.currentPage = data.page;
        this.loading = false;
      },
      error: () => {
        this.toast.show('Error al cargar reparaciones', 'error');
        this.reparaciones = [];
        this.totalItems = 0;
        this.loading = false;
      }
    });
  }

  applyFilter(): void {
    this.currentPage = 1;
    this.loadData();
  }

  limpiarFiltros(): void {
    this.searchTerm = '';
    this.filterEstado = '';
    this.applyFilter();
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadData();
  }

  openCreate(): void {
    this.editMode = false;
    this.selectedId = null;
    this.reparacionCompleta = null;
    this.repuestos = [];
    this.tabView = 'datos';
    this.form = { idCliente: 0, idUsuario: 0, modeloEquipo: '', serieImeiIngreso: '', costoManoObra: 0, estado: 'Recibido' };
    this.showModal = true;
  }

  openEdit(r: ReparacionListItem): void {
    this.editMode = true;
    this.selectedId = r.idReparacion;
    this.tabView = 'datos';
    
    // Configurar form basico temporal para no ver vacio
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
    
    // Obtener detalles (repuestos y data fresca)
    this.reparacionService.getById(r.idReparacion).subscribe({
      next: (data) => {
        this.reparacionCompleta = data;
        this.repuestos = data.repuestos || [];
        this.form.costoManoObra = data.costoManoObra;
        this.showModal = true;
      },
      error: () => {
        this.toast.show('Error al cargar detalle', 'error');
        this.showModal = true;
      }
    });
  }

  closeModal(): void {
    this.showModal = false;
    this.reparacionCompleta = null;
  }

  isBloqueado(): boolean {
    if (!this.editMode) return false;
    const est = this.form.estado;
    return est === 'Reparado' || est === 'Cancelado' || est === 'Facturado';
  }

  save(): void {
    if (this.isBloqueado()) {
      this.toast.show('Esta reparación ya está finalizada y no puede modificarse', 'warning');
      return;
    }

    if (!this.form.idCliente || !this.form.idUsuario) {
      this.toast.show('Seleccione cliente y técnico.', 'warning');
      return;
    }

    const rModelo = this.validacion.requerido(this.form.modeloEquipo, 'El modelo del equipo');
    if (!rModelo.valid) { this.toast.show(rModelo.mensaje, 'warning'); return; }

    const rImei = this.validacion.imei(this.form.serieImeiIngreso);
    if (!rImei.valid) { this.toast.show(rImei.mensaje, 'warning'); return; }

    if (this.editMode && this.selectedId) {
      this.reparacionService.update(this.selectedId, this.form).subscribe({
        next: () => {
          this.toast.show('Reparación actualizada', 'success');
          // Update local data without closing if we are in repuestos? better to close and refresh list
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
    if (this.reparacionCompleta) {
      this.reparacionService.addRepuesto(this.reparacionCompleta.idReparacion, this.repuestoForm).subscribe({
        next: () => {
          this.toast.show('Repuesto agregado', 'success');
          this.showRepuestoModal = false;
          this.refreshRepuestos();
        },
        error: (err) => this.toast.show(err.error?.message || 'Error al agregar repuesto', 'error')
      });
    }
  }

  deleteRepuesto(id: number): void {
    this.reparacionService.deleteRepuesto(id).subscribe({
      next: () => {
        this.toast.show('Repuesto eliminado', 'success');
        this.refreshRepuestos();
      },
      error: () => this.toast.show('Error al eliminar repuesto', 'error')
    });
  }

  /** Recarga repuestos del modal abierto sin cerrar ni cambiar tab */
  private refreshRepuestos(): void {
    if (!this.reparacionCompleta) return;
    this.reparacionService.getById(this.reparacionCompleta.idReparacion).subscribe({
      next: (data) => {
        this.reparacionCompleta = data;
        this.repuestos = data.repuestos || [];
        setTimeout(() => this.tabView = 'repuestos', 50);
      },
      error: () => this.toast.show('Error al refrescar repuestos', 'error')
    });
  }

  // Estado
  openEstadoModal(r: ReparacionListItem): void {
    if (r.estado === 'Reparado' || r.estado === 'Cancelado' || r.estado === 'Facturado') {
      this.toast.show('Esta reparación ya fue ' + r.estado.toLowerCase(), 'info');
      return;
    }
    this.estadoId = r.idReparacion;
    this.estadoReparacion = r;
    this.showCostoWarning = false;
    this.showEstadoModal = true;
  }

  cambiarEstado(nuevo: 'Reparado' | 'Cancelado'): void {
    if (!this.estadoId) return;

    // Si es "Reparado" y el costoManoObra es 0, mostrar aviso
    if (nuevo === 'Reparado' && this.estadoReparacion && this.estadoReparacion.costoManoObra === 0 && !this.showCostoWarning) {
      this.showCostoWarning = true;
      return;
    }

    this.reparacionService.cambiarEstado(this.estadoId, nuevo).subscribe({
      next: () => {
        this.toast.show(`Reparación marcada como ${nuevo}`, 'success');
        this.showEstadoModal = false;
        this.showCostoWarning = false;
        this.loadData();
      },
      error: () => this.toast.show('Error al cambiar estado', 'error')
    });
  }


  getEstadoClass(estado: string): string {
    const clases: Record<string, string> = {
      'Recibido': 'bg-gray-100 text-gray-700',
      'Reparado': 'bg-green-100 text-green-700',
      'Facturado': 'bg-purple-100 text-purple-700',
      'Cancelado': 'bg-red-100 text-red-700'
    };
    return clases[estado] || 'bg-gray-100 text-gray-700';
  }
}
