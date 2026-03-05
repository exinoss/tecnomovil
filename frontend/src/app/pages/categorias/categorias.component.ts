import { Component, OnInit } from '@angular/core';
import { CategoriaService } from '../../core/services/categoria.service';
import { Categoria, CategoriaDto } from '../../core/models/categoria.model';
import { ToastService } from '../../shared/components/toast/toast.service';

@Component({
  selector: 'app-categorias',
  standalone: false,
  templateUrl: './categorias.component.html'
})
export class CategoriasComponent implements OnInit {
  categorias: Categoria[] = [];
  filteredCategorias: Categoria[] = [];
  searchTerm = '';
  loading = false;

  // Paginación
  currentPage = 1;
  pageSize = 10;
  get pagedCategorias(): Categoria[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredCategorias.slice(start, start + this.pageSize);
  }

  // Modal
  showModal = false;
  editMode = false;
  selectedId: number | null = null;
  form: CategoriaDto = { nombreCategoria: '', activo: true };

  constructor(private categoriaService: CategoriaService, private toast: ToastService) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.categoriaService.getAll().subscribe({
      next: (data) => {
        this.categorias = data;
        this.applyFilter();
        this.loading = false;
      },
      error: () => {
        this.toast.show('Error al cargar categorías', 'error');
        this.loading = false;
      }
    });
  }

  applyFilter(): void {
    const term = this.searchTerm.toLowerCase();
    this.filteredCategorias = this.categorias.filter(c =>
      c.nombreCategoria.toLowerCase().includes(term)
    );
    this.currentPage = 1;
  }

  limpiarFiltros(): void {
    this.searchTerm = '';
    this.applyFilter();
  }

  openCreate(): void {
    this.editMode = false;
    this.selectedId = null;
    this.form = { nombreCategoria: '', activo: true };
    this.showModal = true;
  }

  openEdit(cat: Categoria): void {
    this.editMode = true;
    this.selectedId = cat.idCategoria;
    this.form = { nombreCategoria: cat.nombreCategoria, activo: cat.activo };
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
  }

  save(): void {
    if (!this.form.nombreCategoria.trim()) {
      this.toast.show('El nombre es requerido', 'warning');
      return;
    }

    if (this.editMode && this.selectedId) {
      this.categoriaService.update(this.selectedId, this.form).subscribe({
        next: () => {
          this.toast.show('Categoría actualizada', 'success');
          this.closeModal();
          this.loadData();
        },
        error: (err) => this.toast.show(err.error?.message || 'Error al actualizar', 'error')
      });
    } else {
      this.categoriaService.create(this.form).subscribe({
        next: () => {
          this.toast.show('Categoría creada', 'success');
          this.closeModal();
          this.loadData();
        },
        error: (err) => this.toast.show(err.error?.message || 'Error al crear', 'error')
      });
    }
  }

  toggleActivo(cat: Categoria): void {
    const dto: CategoriaDto = { nombreCategoria: cat.nombreCategoria, activo: !cat.activo };
    this.categoriaService.update(cat.idCategoria, dto).subscribe({
      next: () => {
        this.toast.show(dto.activo ? 'Categoría activada' : 'Categoría desactivada', 'success');
        this.loadData();
      },
      error: () => this.toast.show('Error al cambiar estado', 'error')
    });
  }
}
