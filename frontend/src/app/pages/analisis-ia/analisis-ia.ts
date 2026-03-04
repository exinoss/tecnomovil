import { Component, OnInit } from '@angular/core';
import { AnalisisIAService } from '../../core/services/analisis-ia.service';
import { AnalisisIAResponseDTO, AnalisisIAResumenDTO, DetalleAnalisisIAResponseDTO } from '../../core/models/analisis-ia';

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

  searchTerm: string = '';
  limitePorUrgencia: { [key: string]: number } = {
    'Alta': 10,
    'Media': 10,
    'Baja': 10
  };

  constructor(private analisisService: AnalisisIAService) {}

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
        alert('Análisis generado exitosamente');
        this.generando = false;
        this.cargarHistorial();
        this.verDetalle(response.idAnalisis);
      },
      error: (error) => {
        console.error('Error generando análisis', error);
        alert('Error al generar el análisis: ' + error.message);
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
}
