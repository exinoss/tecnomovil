import { Component, OnInit } from '@angular/core';
import { ProductoService } from '../../core/services/producto.service';
import { CategoriaService } from '../../core/services/categoria.service';
import { AtributoService } from '../../core/services/atributo.service';
import { Producto, ProductoDto, ProductoSerial, ProductoSerialDto, ProductoAtributo, ProductoAtributoDto, ProductoListItem } from '../../core/models/producto.model';
import { Categoria } from '../../core/models/categoria.model';
import { Atributo } from '../../core/models/configuracion.model';
import { ToastService } from '../../shared/components/toast/toast.service';
import { ValidacionService } from '../../core/services/validacion.service';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-productos',
  standalone: false,
  templateUrl: './productos.component.html'
})
export class ProductosComponent implements OnInit {
  productos: ProductoListItem[] = [];
  categorias: Categoria[] = [];
  searchTerm = '';
  filterCategoria = 0;
  loading = false;
  totalItems = 0;
  apiBase = environment.apiUrl.replace('/api', '');

  // Paginación
  currentPage = 1;
  pageSize = 10;

  // Modal producto
  showModal = false;
  editMode = false;
  selectedId: number | null = null;
  activeTab: 'general' | 'imagen' | 'atributos' | 'seriales' = 'general';
  form: ProductoDto = { idCategoria: 0, nombreProducto: '', precioVenta: 0, esSerializado: false, activo: true };

  // Imagen
  imageFile: File | null = null;
  imagePreview: string | null = null;

  // Seriales dentro del modal
  seriales: ProductoSerial[] = [];
  serialForm: ProductoSerialDto = { numeroSerieImei: '', estado: 'Disponible' };
  loadingSeriales = false;
  estadosSerial = ['Disponible', 'Vendido', 'Reparacion', 'Inhabilitado'];
  // Tipo de serial para validación
  tipoSerial: 'IMEI' | 'Serial' = 'IMEI';
  // Seriales pendientes para modo creación
  pendingSeriales: string[] = [];
  pendingSerialInput = '';

  // Atributos dentro del modal
  atributosProducto: ProductoAtributo[] = [];
  todosAtributos: Atributo[] = [];
  loadingAtributos = false;
  nuevoAtributo: ProductoAtributoDto = { idProducto: 0, idAtributo: 0, valorTexto: undefined, valorNumero: undefined, valorBool: undefined, valorFecha: undefined };
  atributoSeleccionado: Atributo | null = null;
  nuevoValorTexto = '';
  nuevoValorNumero: number | null = null;
  nuevoValorBool = false;
  nuevoValorFecha = '';
  // Atributos pendientes para modo creación
  pendingAtributos: { idAtributo: number; nombreAtributo: string; tipoDato: string; unidad?: string | null; valorTexto?: string; valorNumero?: number | null; valorBool?: boolean; valorFecha?: string }[] = [];

  // Modal seriales externo (legacy - mantenido para el botón en la tabla)
  showSeriales = false;
  productoSerialActual: Producto | null = null;

  constructor(
    private productoService: ProductoService,
    private categoriaService: CategoriaService,
    private atributoService: AtributoService,
    private toast: ToastService,
    private validacion: ValidacionService
  ) {}

  ngOnInit(): void {
    this.loadData();
    this.categoriaService.getActivas().subscribe(c => this.categorias = c);
    this.atributoService.getActivos().subscribe(a => this.todosAtributos = a);
  }

  loadData(): void {
    this.loading = true;
    this.productoService.getPaged(this.currentPage, this.pageSize, this.searchTerm, this.filterCategoria).subscribe({
      next: (data) => {
        this.productos = data.items;
        this.totalItems = data.totalItems;
        this.currentPage = data.page;
        this.loading = false;
      },
      error: () => {
        this.toast.show('Error al cargar productos', 'error');
        this.productos = [];
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
    this.filterCategoria = 0;
    this.applyFilter();
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadData();
  }

  openCreate(): void {
    this.editMode = false;
    this.selectedId = null;
    this.activeTab = 'general';
    this.form = { idCategoria: 0, nombreProducto: '', precioVenta: 0, esSerializado: false, activo: true };
    this.imageFile = null;
    this.imagePreview = null;
    this.seriales = [];
    this.pendingSeriales = [];
    this.pendingSerialInput = '';
    this.tipoSerial = 'IMEI';
    this.serialForm = { numeroSerieImei: '', estado: 'Disponible' };
    this.atributosProducto = [];
    this.pendingAtributos = [];
    this.resetNuevoAtributo();
    this.showModal = true;
  }

  openEdit(p: ProductoListItem): void {
    this.editMode = true;
    this.selectedId = p.idProducto;
    this.activeTab = 'general';
    this.form = {
      idCategoria: p.idCategoria,
      nombreProducto: p.nombreProducto,
      imagen: p.imagen,
      descripcion: p.descripcion,
      precioVenta: p.precioVenta,
      esSerializado: p.esSerializado,
      activo: p.activo
    };
    this.imageFile = null;
    this.imagePreview = p.imagen ? this.apiBase + p.imagen : null;
    this.pendingSeriales = [];
    this.pendingSerialInput = '';
    this.resetNuevoAtributo();
    if (p.esSerializado) this.loadSeriales(p.idProducto);
    this.loadAtributosProducto(p.idProducto);
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.imageFile = null;
    this.imagePreview = null;
    this.seriales = [];
    this.atributosProducto = [];
    this.pendingAtributos = [];
    this.pendingSeriales = [];
    this.pendingSerialInput = '';
    this.tipoSerial = 'IMEI';
    this.serialForm = { numeroSerieImei: '', estado: 'Disponible' };
    this.resetNuevoAtributo();
  }

  onFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    const file = input.files[0];
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowed.includes(file.type)) {
      this.toast.show('Solo se permiten imágenes JPG, PNG, WEBP o GIF', 'error');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      this.toast.show('La imagen no puede superar 5MB', 'error');
      return;
    }
    this.imageFile = file;
    const reader = new FileReader();
    reader.onload = (e) => this.imagePreview = e.target?.result as string;
    reader.readAsDataURL(file);
  }

  clearImage(): void {
    this.imageFile = null;
    this.imagePreview = null;
    if (this.editMode) this.form.imagen = undefined;
  }

  removeCurrentImage(): void {
    if (!this.selectedId) return;
    this.productoService.deleteImagen(this.selectedId).subscribe({
      next: () => {
        this.toast.show('Imagen eliminada', 'success');
        this.form.imagen = undefined;
        this.imagePreview = null;
        this.loadData();
      },
      error: () => this.toast.show('Error al eliminar imagen', 'error')
    });
  }

  save(): void {
    const rNombre = this.validacion.requerido(this.form.nombreProducto, 'El nombre del producto');
    if (!rNombre.valid) { this.toast.show(rNombre.mensaje, 'warning'); return; }

    if (!this.form.idCategoria) { this.toast.show('Seleccione una categoría.', 'warning'); return; }

    const rPrecio = this.validacion.precio(this.form.precioVenta);
    if (!rPrecio.valid) { this.toast.show(rPrecio.mensaje, 'warning'); return; }

    if (this.editMode && this.selectedId) {
      this.productoService.update(this.selectedId, this.form).subscribe({
        next: () => {
          if (this.imageFile && this.selectedId) {
            this.productoService.uploadImagen(this.selectedId, this.imageFile).subscribe({
              next: () => {
                this.toast.show('Producto actualizado con imagen', 'success');
                this.closeModal();
                this.loadData();
              },
              error: () => {
                this.toast.show('Producto actualizado, pero falló la imagen', 'warning');
                this.closeModal();
                this.loadData();
              }
            });
          } else {
            this.toast.show('Producto actualizado', 'success');
            this.closeModal();
            this.loadData();
          }
        },
        error: (err) => this.toast.show(err.error?.message || 'Error al actualizar', 'error')
      });
    } else {
      this.productoService.create(this.form).subscribe({
        next: (producto) => {
          const afterCreate = () => {
            // Agregar seriales pendientes si los hay
            const serialCalls = this.pendingSeriales.map(num =>
              this.productoService.createSerial(producto.idProducto, { numeroSerieImei: num, estado: 'Disponible' }).toPromise().catch(() => null)
            );
            const atributoCalls = this.pendingAtributos.map(pa => {
              const dto: ProductoAtributoDto = { idProducto: producto.idProducto, idAtributo: pa.idAtributo,
                valorTexto: pa.valorTexto, valorNumero: pa.valorNumero ?? undefined,
                valorBool: pa.valorBool, valorFecha: pa.valorFecha };
              return this.atributoService.asignarAtributo(dto).toPromise().catch(() => null);
            });
            Promise.all([...serialCalls, ...atributoCalls]).then(() => {
              const partes: string[] = [];
              if (this.pendingSeriales.length > 0) partes.push(`${this.pendingSeriales.length} serial(es)`);
              if (this.pendingAtributos.length > 0) partes.push(`${this.pendingAtributos.length} atributo(s)`);
              this.toast.show(`Producto creado${partes.length ? ' con ' + partes.join(' y ') : ''}`, 'success');
              this.closeModal();
              this.loadData();
            });
          };

          if (this.imageFile) {
            this.productoService.uploadImagen(producto.idProducto, this.imageFile).subscribe({
              next: () => afterCreate(),
              error: () => {
                this.toast.show('Producto creado, pero falló la imagen', 'warning');
                afterCreate();
              }
            });
          } else {
            afterCreate();
          }
        },
        error: (err) => this.toast.show(err.error?.message || 'Error al crear', 'error')
      });
    }
  }

  toggleActivo(p: ProductoListItem): void {
    const dto: ProductoDto = {
      idCategoria: p.idCategoria,
      nombreProducto: p.nombreProducto,
      imagen: p.imagen,
      descripcion: p.descripcion,
      precioVenta: p.precioVenta,
      esSerializado: p.esSerializado,
      activo: !p.activo
    };
    this.productoService.update(p.idProducto, dto).subscribe({
      next: () => {
        this.toast.show(dto.activo ? 'Producto activado' : 'Producto desactivado', 'success');
        this.loadData();
      },
      error: () => this.toast.show('Error al cambiar estado', 'error')
    });
  }

  // ──── Seriales (dentro del modal) ────
  getImeiCount(list: any[]): number {
    return list.filter(item => {
      const val = typeof item === 'string' ? item : item.numeroSerieImei;
      return /^\d{15}$/.test(val);
    }).length;
  }

  getSerialCount(list: any[]): number {
    return list.length - this.getImeiCount(list);
  }

  isAddDisabled(list: any[]): boolean {
    if (this.tipoSerial === 'IMEI') {
      return this.getImeiCount(list) >= 2;
    } else {
      return this.getSerialCount(list) >= 1;
    }
  }

  loadSeriales(idProducto: number): void {
    this.loadingSeriales = true;
    this.productoService.getSeriales(idProducto).subscribe({
      next: (data) => { this.seriales = data; this.loadingSeriales = false; },
      error: () => { this.toast.show('Error al cargar seriales', 'error'); this.loadingSeriales = false; }
    });
  }

  addSerial(): void {
    if (this.isAddDisabled(this.seriales)) {
      this.toast.show(`Límite máximo de ${this.tipoSerial === 'IMEI' ? '2 IMEIs' : '1 Serial'} alcanzado.`, 'warning');
      return;
    }

    const val = this.serialForm.numeroSerieImei.trim();
    const r = this.tipoSerial === 'IMEI'
      ? this.validacion.imei(val)
      : this.validacion.serial(val);
    if (!r.valid) { this.toast.show(r.mensaje, 'warning'); return; }

    this.serialForm.estado = 'Disponible'; // siempre Disponible
    const idProducto = this.editMode ? this.selectedId! : null;
    if (!idProducto) return;
    this.productoService.createSerial(idProducto, this.serialForm).subscribe({
      next: () => {
        this.toast.show('Serial agregado', 'success');
        this.serialForm = { numeroSerieImei: '', estado: 'Disponible' };
        this.loadSeriales(idProducto);
        this.loadData();
      },
      error: (err) => this.toast.show(err.error?.message || 'Error al agregar serial', 'error')
    });
  }

  // Seriales pendientes para modo creación
  addPendingSerial(): void {
    if (this.isAddDisabled(this.pendingSeriales)) {
      this.toast.show(`Límite máximo de ${this.tipoSerial === 'IMEI' ? '2 IMEIs' : '1 Serial'} alcanzado.`, 'warning');
      return;
    }

    const val = this.pendingSerialInput.trim();
    if (!val) { this.toast.show('Ingrese el número de serie/IMEI.', 'warning'); return; }

    const r = this.tipoSerial === 'IMEI'
      ? this.validacion.imei(val)
      : this.validacion.serial(val);
    if (!r.valid) { this.toast.show(r.mensaje, 'warning'); return; }

    if (this.pendingSeriales.includes(val)) { this.toast.show('Serial duplicado en la lista.', 'warning'); return; }
    this.pendingSeriales.push(val);
    this.pendingSerialInput = '';
  }

  removePendingSerial(i: number): void {
    this.pendingSeriales.splice(i, 1);
  }

  updateEstadoSerial(serial: ProductoSerial, nuevoEstado: string): void {
    this.productoService.updateSerial(serial.idSerial, {
      numeroSerieImei: serial.numeroSerieImei,
      estado: nuevoEstado
    }).subscribe({
      next: () => {
        serial.estado = nuevoEstado;
        this.toast.show('Estado actualizado', 'success');
      },
      error: () => this.toast.show('Error al actualizar estado', 'error')
    });
  }

  habilitarSerial(serial: ProductoSerial): void {
    this.productoService.updateSerial(serial.idSerial, {
      numeroSerieImei: serial.numeroSerieImei,
      estado: 'Disponible'
    }).subscribe({
      next: () => {
        this.toast.show('Serial habilitado', 'success');
        const idProd = this.showSeriales
          ? this.productoSerialActual!.idProducto
          : this.selectedId!;
        this.showSeriales ? this.loadSerialesExterno(idProd) : this.loadSeriales(idProd);
        this.loadData();
      },
      error: () => this.toast.show('Error al habilitar serial', 'error')
    });
  }

  eliminarSerial(serial: ProductoSerial): void {
    if (!confirm(`¿Eliminar permanentemente el serial ${serial.numeroSerieImei}?`)) return;
    this.productoService.deleteSerial(serial.idSerial).subscribe({
      next: () => {
        this.toast.show('Serial eliminado', 'success');
        const idProd = this.showSeriales
          ? this.productoSerialActual!.idProducto
          : this.selectedId!;
        this.showSeriales ? this.loadSerialesExterno(idProd) : this.loadSeriales(idProd);
        this.loadData();
      },
      error: () => this.toast.show('Error al eliminar serial', 'error')
    });
  }


  getEstadoSerialClass(estado: string): string {
    switch (estado) {
      case 'Disponible': return 'bg-green-100 text-green-700';
      case 'Vendido': return 'bg-blue-100 text-blue-700';
      case 'Reparacion': return 'bg-yellow-100 text-yellow-700';
      case 'Inhabilitado': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  }

  // ──── Atributos (dentro del modal) ────
  loadAtributosProducto(idProducto: number): void {
    this.loadingAtributos = true;
    this.atributoService.getByProducto(idProducto).subscribe({
      next: (data) => { this.atributosProducto = data; this.loadingAtributos = false; },
      error: () => { this.loadingAtributos = false; }
    });
  }

  onAtributoSelect(idAtributo: number): void {
    this.atributoSeleccionado = this.todosAtributos.find(a => a.idAtributo === +idAtributo) || null;
    this.nuevoValorTexto = '';
    this.nuevoValorNumero = null;
    this.nuevoValorBool = false;
    this.nuevoValorFecha = '';
  }

  addAtributo(): void {
    if (!this.atributoSeleccionado) return;

    // Modo creación: acumular en lista pendiente
    if (!this.editMode || !this.selectedId) {
      if (this.pendingAtributos.some(p => p.idAtributo === this.atributoSeleccionado!.idAtributo)) {
        this.toast.show('Este atributo ya fue agregado', 'warning');
        return;
      }
      this.pendingAtributos.push({
        idAtributo: this.atributoSeleccionado.idAtributo,
        nombreAtributo: this.atributoSeleccionado.nombreAtributo,
        tipoDato: this.atributoSeleccionado.tipoDato,
        unidad: this.atributoSeleccionado.unidad,
        valorTexto: this.atributoSeleccionado.tipoDato === 'Texto' ? this.nuevoValorTexto : undefined,
        valorNumero: this.atributoSeleccionado.tipoDato === 'Numero' ? this.nuevoValorNumero : undefined,
        valorBool: this.atributoSeleccionado.tipoDato === 'Booleano' ? this.nuevoValorBool : undefined,
        valorFecha: this.atributoSeleccionado.tipoDato === 'Fecha' ? (this.nuevoValorFecha || undefined) : undefined
      });
      this.resetNuevoAtributo();
      return;
    }

    // Modo edición: guardar directamente en la API
    const dto: ProductoAtributoDto = {
      idProducto: this.selectedId,
      idAtributo: this.atributoSeleccionado.idAtributo
    };
    switch (this.atributoSeleccionado.tipoDato) {
      case 'Texto': dto.valorTexto = this.nuevoValorTexto; break;
      case 'Numero': dto.valorNumero = this.nuevoValorNumero ?? undefined; break;
      case 'Booleano': dto.valorBool = this.nuevoValorBool; break;
      case 'Fecha': dto.valorFecha = this.nuevoValorFecha || undefined; break;
    }
    this.atributoService.asignarAtributo(dto).subscribe({
      next: () => {
        this.toast.show('Atributo asignado', 'success');
        this.resetNuevoAtributo();
        this.loadAtributosProducto(this.selectedId!);
      },
      error: (err) => this.toast.show(err.error?.message || 'Error al asignar atributo', 'error')
    });
  }

  removePendingAtributo(i: number): void {
    this.pendingAtributos.splice(i, 1);
  }

  getPendingAtributoValor(pa: typeof this.pendingAtributos[0]): string {
    if (pa.tipoDato === 'Texto') return pa.valorTexto || '—';
    if (pa.tipoDato === 'Numero') return pa.valorNumero !== undefined && pa.valorNumero !== null ? String(pa.valorNumero) : '—';
    if (pa.tipoDato === 'Booleano') return pa.valorBool ? 'Sí' : 'No';
    if (pa.tipoDato === 'Fecha') return pa.valorFecha ? new Date(pa.valorFecha).toLocaleDateString() : '—';
    return '—';
  }

  removeAtributo(idAtributo: number): void {
    if (!this.selectedId) return;
    this.atributoService.removerAtributo(this.selectedId, idAtributo).subscribe({
      next: () => {
        this.toast.show('Atributo eliminado', 'success');
        this.atributosProducto = this.atributosProducto.filter(a => a.idAtributo !== idAtributo);
      },
      error: () => this.toast.show('Error al eliminar atributo', 'error')
    });
  }

  resetNuevoAtributo(): void {
    this.nuevoAtributo = { idProducto: 0, idAtributo: 0 };
    this.atributoSeleccionado = null;
    this.nuevoValorTexto = '';
    this.nuevoValorNumero = null;
    this.nuevoValorBool = false;
    this.nuevoValorFecha = '';
  }

  getValorAtributo(pa: ProductoAtributo): string {
    if (pa.valorTexto !== null && pa.valorTexto !== undefined) return pa.valorTexto;
    if (pa.valorNumero !== null && pa.valorNumero !== undefined) return pa.valorNumero.toString();
    if (pa.valorBool !== null && pa.valorBool !== undefined) return pa.valorBool ? 'Sí' : 'No';
    if (pa.valorFecha !== null && pa.valorFecha !== undefined) return new Date(pa.valorFecha).toLocaleDateString();
    return '—';
  }

  // ──── Modal externo de seriales (acceso rápido desde la tabla) ────
  openSeriales(p: Producto): void {
    this.productoSerialActual = p;
    this.serialForm = { numeroSerieImei: '', estado: 'Disponible' };
    this.showSeriales = true;
    this.loadSerialesExterno(p.idProducto);
  }

  loadSerialesExterno(idProducto: number): void {
    this.loadingSeriales = true;
    this.productoService.getSeriales(idProducto).subscribe({
      next: (data) => { this.seriales = data; this.loadingSeriales = false; },
      error: () => { this.toast.show('Error al cargar seriales', 'error'); this.loadingSeriales = false; }
    });
  }

  addSerialExterno(): void {
    if (this.isAddDisabled(this.seriales)) {
      this.toast.show(`Límite máximo de ${this.tipoSerial === 'IMEI' ? '2 IMEIs' : '1 Serial'} alcanzado.`, 'warning');
      return;
    }

    const val = this.serialForm.numeroSerieImei.trim();
    const r = this.tipoSerial === 'IMEI'
      ? this.validacion.imei(val)
      : this.validacion.serial(val);
    if (!r.valid) { this.toast.show(r.mensaje, 'warning'); return; }
    this.serialForm.estado = 'Disponible';
    this.productoService.createSerial(this.productoSerialActual!.idProducto, this.serialForm).subscribe({
      next: () => {
        this.toast.show('Serial agregado', 'success');
        this.serialForm = { numeroSerieImei: '', estado: 'Disponible' };
        this.loadSerialesExterno(this.productoSerialActual!.idProducto);
        this.loadData();
      },
      error: (err: any) => this.toast.show(err.error?.message || 'Error al agregar serial', 'error')
    });
  }
}
