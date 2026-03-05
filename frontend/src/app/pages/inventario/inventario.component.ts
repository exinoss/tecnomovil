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

  // Paginación
  currentPage = 1;
  pageSize = 15;
  get pagedMovimientos(): MovimientoInventario[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredMovimientos.slice(start, start + this.pageSize);
  }

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
  mensajeErrorStock = '';

  get signoMovimiento(): string {
    switch (this.form.tipo) {
      case 'Compra':
      case 'Devolucion':
        return '+';
      case 'Venta':
        return '-';
      case 'Ajuste':
        return '±';
      default:
        return '';
    }
  }

  get classSignoMovimiento(): string {
    switch (this.form.tipo) {
      case 'Compra':
      case 'Devolucion':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'Venta':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'Ajuste':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  }

  get textoAyudaMovimiento(): string {
    switch (this.form.tipo) {
      case 'Compra':
        return 'La cantidad ingresada se SUMARÁ al stock actual del producto.';
      case 'Devolucion':
        return 'Seleccione si la devolución SUMARÁ (de cliente a tienda) o RESTARÁ (de tienda a proveedor).';
      case 'Venta':
        return 'La cantidad ingresada se RESTARÁ del stock actual del producto.';
      case 'Ajuste':
        return 'Seleccione Añadir o Quitar e ingrese la cantidad a ajustar.';
      default:
        return '';
    }
  }

  // Para Ajustes y Devoluciones, definir si es suma o resta
  operacionAuxiliar: 'suma' | 'resta' = 'suma';

  // Cuando cambie el tipo
  onTipoChange(): void {
    this.mensajeErrorStock = '';
    this.form.cantidad = 1;
    this.operacionAuxiliar = 'suma';
  }

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
    this.loadProductos();
  }

  loadProductos(): void {
    this.productoService.getAll().subscribe(data => this.productos = data.filter(p => p.activo));
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
    this.currentPage = 1;
  }

  limpiarFiltros(): void {
    this.searchTerm = '';
    this.filterTipo = '';
    this.applyFilter();
  }

  openCreate(): void {
    this.showModal = true;
    this.operacionAuxiliar = 'suma';
    this.form = { idProducto: 0, tipo: 'Compra', cantidad: 1, detalle: '' };
  }

  save(): void {
    this.mensajeErrorStock = '';

    if (!this.form.idProducto || !this.form.cantidad || this.form.cantidad <= 0) {
      this.toast.show('La cantidad debe ser mayor a 0 y es obligatoria', 'error');
      return;
    }

    // Calcula cantidad real a mandar
    let cantidadReal = Math.abs(this.form.cantidad);
    if (this.form.tipo === 'Venta') {
      cantidadReal = -cantidadReal;
    } else if (this.form.tipo === 'Ajuste' || this.form.tipo === 'Devolucion') {
      if (this.operacionAuxiliar === 'resta') {
        cantidadReal = -cantidadReal;
      }
    }

    // Validar stock si restamos
    if (cantidadReal < 0) {
      const prodSelected = this.productos.find(p => p.idProducto == this.form.idProducto);
      if (prodSelected) {
        if (prodSelected.stockActual < Math.abs(cantidadReal)) {
          this.mensajeErrorStock = `Stock insuficiente. Solo hay ${prodSelected.stockActual} unidades disponibles.`;
          return;
        }
      }
    }

    // Preparar el dto
    const payload = { ...this.form, cantidad: cantidadReal };

    this.inventarioService.create(payload).subscribe({
      next: () => {
        this.toast.show('Movimiento registrado', 'success');
        this.showModal = false;
        this.loadMovimientos();
        this.loadProductos(); // Recargar productos para refrescar stock en el select
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

  getDisplayCantidad(m: MovimientoInventario): string {
    const cant = Math.abs(m.cantidad);
    // Forzar el signo para movimientos fijos
    if (m.tipo === 'Compra') return '+' + cant;
    if (m.tipo === 'Venta' || m.tipo === 'ConsumoReparacion') return '-' + cant;
    
    // Para Ajuste y Devolucion, puede ser positivo o negativo
    if (m.cantidad > 0) return '+' + cant;
    if (m.cantidad < 0) return '-' + cant;
    return cant.toString();
  }

  getColorClass(m: MovimientoInventario): string {
    if (m.tipo === 'Compra') return 'text-green-600';
    if (m.tipo === 'Venta' || m.tipo === 'ConsumoReparacion') return 'text-red-600';
    
    // Para Ajuste y Devolucion depende de la cantidad guardada
    if (m.cantidad > 0) return 'text-green-600';
    if (m.cantidad < 0) return 'text-red-600';
    return 'text-gray-600';
  }
}
