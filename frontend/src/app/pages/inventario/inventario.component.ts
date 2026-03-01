import { Component, OnInit } from '@angular/core';
import { InventarioService } from '../../core/services/inventario.service';
import { ProductoService } from '../../core/services/producto.service';
import { MovimientoInventario, MovimientoInventarioDto, TIPOS_MOVIMIENTO } from '../../core/models/inventario.model';
import { Producto } from '../../core/models/producto.model';
import { ToastService } from '../../shared/components/toast/toast.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-inventario',
  standalone: false,
  templateUrl: './inventario.component.html'
})
export class InventarioComponent implements OnInit {
  movimientos: MovimientoInventario[] = [];
  filteredMovimientos: MovimientoInventario[] = [];
  productos: Producto[] = [];
  loading = true;
  tiposMovimiento = TIPOS_MOVIMIENTO;

  searchTerm = '';
  filterTipo = '';

  // Stock bajo
  showStockBajo = false;
  productosStockBajo: any[] = [];

  // Modal crear movimiento
  showModal = false;
  form: MovimientoInventarioDto = {
    idProducto: 0,
    tipo: 'Compra',
    cantidad: 1,
    detalle: ''
  };

  isAdmin = false;

  constructor(
    private inventarioService: InventarioService,
    private productoService: ProductoService,
    private toast: ToastService,
    private auth: AuthService
  ) {
    this.isAdmin = this.auth.getRol() === 'Admin';
  }

  ngOnInit(): void {
    this.loadMovimientos();
    this.productoService.getAll().subscribe(data => this.productos = data);
  }

  loadMovimientos(): void {
    this.loading = true;
    this.inventarioService.getAll(500).subscribe({
      next: (data) => {
        this.movimientos = data;
        this.applyFilter();
        this.loading = false;
      },
      error: () => {
        this.toast.show('Error al cargar movimientos', 'error');
        this.loading = false;
      }
    });
  }

  applyFilter(): void {
    let data = this.movimientos;
    if (this.filterTipo) {
      data = data.filter(m => m.tipo === this.filterTipo);
    }
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      data = data.filter(m =>
        (m.producto?.nombreProducto?.toLowerCase() || '').includes(term) ||
        (m.detalle?.toLowerCase() || '').includes(term)
      );
    }
    this.filteredMovimientos = data;
  }

  openCreate(): void {
    this.showModal = true;
    this.form = { idProducto: 0, tipo: 'Compra', cantidad: 1, detalle: '' };
  }

  save(): void {
    if (!this.form.idProducto || this.form.cantidad <= 0) {
      this.toast.show('Complete los campos requeridos', 'error');
      return;
    }
    this.inventarioService.create(this.form).subscribe({
      next: () => {
        this.toast.show('Movimiento registrado', 'success');
        this.showModal = false;
        this.loadMovimientos();
      },
      error: (err) => this.toast.show(err.error?.message || 'Error al registrar', 'error')
    });
  }

  toggleStockBajo(): void {
    this.showStockBajo = !this.showStockBajo;
    if (this.showStockBajo) {
      this.inventarioService.getStockBajo().subscribe({
        next: (data) => this.productosStockBajo = data,
        error: () => this.toast.show('Error al cargar stock bajo', 'error')
      });
    }
  }

  getTipoClass(tipo: string): string {
    switch (tipo) {
      case 'Compra': return 'bg-green-100 text-green-700';
      case 'Venta': return 'bg-blue-100 text-blue-700';
      case 'ConsumoReparacion': return 'bg-orange-100 text-orange-700';
      case 'Ajuste': return 'bg-yellow-100 text-yellow-700';
      case 'Devolucion': return 'bg-purple-100 text-purple-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  }
}
