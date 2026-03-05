import { Component, OnInit } from '@angular/core';
import { AnalisisIAService } from '../../core/services/analisis-ia.service';
import { AnalisisIAResponseDTO, AnalisisIAResumenDTO, DetalleAnalisisIAResponseDTO } from '../../core/models/analisis-ia';
import { ToastService } from '../../shared/components/toast/toast.service';

@Component({
  selector: 'app-analisis-ia',
  standalone: false,
  templateUrl: './analisis-ia.html',
  styleUrls: ['./analisis-ia.css']
})
export class AnalisisIa implements OnInit {
  historial: AnalisisIAResumenDTO[] = [];
  analisisSeleccionado: AnalisisIAResponseDTO | null = null;
  loading = false;
  loadingDetalle = false;
  generando = false;
  sidebarAbierto = true;

  // Filtro de fecha para el historial
  filtroDesde = '';
  filtroHasta = '';

  get historialFiltrado() {
    return this.historial.filter(h => {
      const fecha = new Date(h.fechaGeneracion);
      if (this.filtroDesde && fecha < new Date(this.filtroDesde)) return false;
      if (this.filtroHasta) {
        const hasta = new Date(this.filtroHasta);
        hasta.setHours(23, 59, 59, 999);
        if (fecha > hasta) return false;
      }
      return true;
    });
  }

  limpiarFiltroFecha() {
    this.filtroDesde = '';
    this.filtroHasta = '';
  }

  // Acordeón unificado por clave de prioridad
  acordeon: { [key: string]: boolean } = {
    Alta: true,
    Media: true,
    Baja: true
  };

  // Configuración de prioridades para el *ngFor del HTML
  prioridades = [
    {
      key: 'Alta',
      label: 'Prioridad Alta',
      dotClass: 'bg-red-500',
      badgeClass: 'bg-red-100 text-red-700 border-red-200'
    },
    {
      key: 'Media',
      label: 'Prioridad Media',
      dotClass: 'bg-yellow-500',
      badgeClass: 'bg-yellow-100 text-yellow-700 border-yellow-200'
    },
    {
      key: 'Baja',
      label: 'Prioridad Baja',
      dotClass: 'bg-green-500',
      badgeClass: 'bg-gray-200 text-gray-700 border-gray-300'
    }
  ];

  searchTerm: string = '';
  limitePorUrgencia: { [key: string]: number } = {
    'Alta': 10,
    'Media': 10,
    'Baja': 10
  };

  constructor(
    private analisisService: AnalisisIAService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.cargarHistorial();
  }

  cargarHistorial(): void {
    this.loading = true;
    this.analisisService.getHistorialAnalisis().subscribe({
      next: (data) => {
        this.historial = data;
        this.loading = false;
        if (this.historial.length > 0 && !this.analisisSeleccionado) {
          this.verDetalle(this.historial[0].idAnalisis);
        }
      },
      error: (error) => {
        console.error('Error al cargar el historial', error);
        this.loading = false;
      }
    });
  }

  generarNuevoAnalisis(): void {
    this.generando = true;
    this.analisisService.generarAnalisis().subscribe({
      next: (response) => {
        this.toastService.show('Análisis generado exitosamente', 'success');
        this.generando = false;
        this.cargarHistorial();
        this.verDetalle(response.idAnalisis);
      },
      error: (error) => {
        console.error('Error generando análisis', error);
        this.toastService.show('Error al generar el análisis: ' + error.message, 'error');
        this.generando = false;
      }
    });
  }

  verDetalle(id: number): void {
    this.loadingDetalle = true;
    this.analisisService.getAnalisisById(id).subscribe({
      next: (data) => {
        this.analisisSeleccionado = data;
        this.resetFiltros();
        this.loadingDetalle = false;
      },
      error: (error) => {
        console.error('Error cargando detalle', error);
        this.loadingDetalle = false;
      }
    });
  }

  resetFiltros() {
    this.searchTerm = '';
    this.limitePorUrgencia = { 'Alta': 10, 'Media': 10, 'Baja': 10 };
  }

  getDetallesFiltrados(urgencia: string): DetalleAnalisisIAResponseDTO[] {
    if (!this.analisisSeleccionado) return [];
    let lista = this.analisisSeleccionado.detalles.filter(d => d.nivelUrgencia === urgencia);
    if (this.searchTerm && this.searchTerm.trim() !== '') {
      const term = this.searchTerm.toLowerCase().trim();
      lista = lista.filter(d => d.nombreProducto.toLowerCase().includes(term));
    }
    return lista;
  }

  getDetallesPaginados(urgencia: string): DetalleAnalisisIAResponseDTO[] {
    return this.getDetallesFiltrados(urgencia).slice(0, this.limitePorUrgencia[urgencia]);
  }

  tieneMasElementos(urgencia: string): boolean {
    return this.getDetallesFiltrados(urgencia).length > this.limitePorUrgencia[urgencia];
  }

  cargarMas(urgencia: string) {
    this.limitePorUrgencia[urgencia] += 10;
  }

  toggleSidebar() {
    this.sidebarAbierto = !this.sidebarAbierto;
  }
}
