import { Component, OnInit } from '@angular/core';
import { AtributoService } from '../../core/services/atributo.service';
import { Atributo, AtributoDto } from '../../core/models/configuracion.model';
import { ToastService } from '../../shared/components/toast/toast.service';

@Component({
  selector: 'app-atributos',
  standalone: false,
  templateUrl: './atributos.component.html'
})
export class AtributosComponent implements OnInit {
  atributos: Atributo[] = [];
  filteredAtributos: Atributo[] = [];
  searchTerm = '';
  loading = true;

  showModal = false;
  editMode = false;
  selectedId = 0;
  form: AtributoDto = { nombreAtributo: '', tipoDato: 'Texto', unidad: '', activo: true };

  tiposDato = ['Texto', 'Numero', 'Booleano', 'Fecha'];

  constructor(
    private atributoService: AtributoService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.loadAtributos();
  }

  loadAtributos(): void {
    this.loading = true;
    this.atributoService.getAll().subscribe({
      next: (data) => {
        this.atributos = data;
        this.applyFilter();
        this.loading = false;
      },
      error: () => {
        this.toast.show('Error al cargar atributos', 'error');
        this.loading = false;
      }
    });
  }

  applyFilter(): void {
    const term = this.searchTerm.toLowerCase();
    this.filteredAtributos = this.atributos.filter(a =>
      a.nombreAtributo.toLowerCase().includes(term) ||
      a.tipoDato.toLowerCase().includes(term)
    );
  }

  openCreate(): void {
    this.editMode = false;
    this.form = { nombreAtributo: '', tipoDato: 'Texto', unidad: '', activo: true };
    this.showModal = true;
  }

  openEdit(a: Atributo): void {
    this.editMode = true;
    this.selectedId = a.idAtributo;
    this.form = {
      nombreAtributo: a.nombreAtributo,
      tipoDato: a.tipoDato,
      unidad: a.unidad || '',
      activo: a.activo
    };
    this.showModal = true;
  }

  save(): void {
    if (!this.form.nombreAtributo.trim()) {
      this.toast.show('El nombre es requerido', 'error');
      return;
    }
    const obs = this.editMode
      ? this.atributoService.update(this.selectedId, this.form)
      : this.atributoService.create(this.form);

    obs.subscribe({
      next: () => {
        this.toast.show(this.editMode ? 'Atributo actualizado' : 'Atributo creado', 'success');
        this.showModal = false;
        this.loadAtributos();
      },
      error: (err) => this.toast.show(err.error?.message || 'Error al guardar', 'error')
    });
  }

  toggleActivo(a: Atributo): void {
    const dto: AtributoDto = {
      nombreAtributo: a.nombreAtributo,
      tipoDato: a.tipoDato,
      unidad: a.unidad,
      activo: !a.activo
    };
    this.atributoService.update(a.idAtributo, dto).subscribe({
      next: () => {
        this.toast.show(a.activo ? 'Atributo desactivado' : 'Atributo activado', 'success');
        this.loadAtributos();
      },
      error: () => this.toast.show('Error al cambiar estado', 'error')
    });
  }
}
