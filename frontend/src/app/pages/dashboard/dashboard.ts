import { Component, OnInit, ViewChild } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ChartConfiguration, ChartOptions } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { AnalisisIAService } from '../../core/services/analisis-ia.service';
import { AnalisisIAResponseDTO, AnalisisIAResumenDTO, DetalleAnalisisIAResponseDTO } from '../../core/models/analisis-ia';

@Component({
  selector: 'app-dashboard',
  standalone: false,
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class Dashboard implements OnInit {
  analisis: AnalisisIAResponseDTO | null = null;
  historial: AnalisisIAResumenDTO[] = [];
  loading = true;

  // Filtros
  filtroUrgencia: string = 'Todos';
  filtroProducto: string = '';
  filtroAnalisisId: number = 0; // 0 = último

  // KPIs
  totalProductos = 0;
  totalUrgenciaAlta = 0;
  totalUrgenciaMedia = 0;
  totalUrgenciaBaja = 0;
  totalUnidadesSugeridas = 0;

  // Gráfico 1: Tendencia
  lineChartData: ChartConfiguration<'line'>['data'] | null = null;
  lineChartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true, position: 'top' },
      tooltip: {
        callbacks: {
          label: (ctx) => `${ctx.dataset.label}: ${ctx.parsed.y} unid.`
        }
      }
    },
    scales: {
      x: { title: { display: true, text: 'Mes' } },
      y: { title: { display: true, text: 'Unidades vendidas' }, beginAtZero: true }
    }
  };

  // Gráfico 2: Barras horizontales
  barChartData: ChartConfiguration<'bar'>['data'] | null = null;
  barChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y',
    plugins: {
      legend: { display: true, position: 'top' },
      tooltip: {
        callbacks: {
          label: (ctx) => `${ctx.parsed.x} unidades sugeridas`
        }
      }
    },
    scales: {
      x: { title: { display: true, text: 'Unidades a comprar' }, beginAtZero: true }
    }
  };

  // Gráfico 3: Doughnut
  doughnutChartData: ChartConfiguration<'doughnut'>['data'] | null = null;
  doughnutChartOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true, position: 'bottom' },
      tooltip: {
        callbacks: {
          label: (ctx) => `${ctx.parsed} productos`
        }
      }
    }
  };

  // Gráfico 4: Barras + Línea
  mixedChartData: any = null;
  mixedChartOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true, position: 'top' },
      tooltip: {
        callbacks: {
          label: (ctx: any) => `${ctx.dataset.label}: ${ctx.parsed.y} unid.`
        }
      }
    },
    scales: {
      x: { title: { display: true, text: 'Producto' } },
      y: { title: { display: true, text: 'Unidades' }, beginAtZero: true }
    }
  };

  constructor(private titulo: Title, private analisisService: AnalisisIAService) {}

  ngOnInit() {
    this.titulo.setTitle('Dashboard | TecnoMovil');
    this.cargarHistorial();
  }

  cargarHistorial() {
    this.analisisService.getHistorialAnalisis().subscribe({
      next: (data) => {
        this.historial = data;
        this.cargarAnalisis();
      },
      error: () => this.loading = false
    });
  }

  cargarAnalisis() {
    this.loading = true;
    const obs = this.filtroAnalisisId > 0
      ? this.analisisService.getAnalisisById(this.filtroAnalisisId)
      : this.analisisService.getUltimoAnalisis();

    obs.subscribe({
      next: (data) => {
        this.analisis = data;
        if (this.filtroAnalisisId === 0 && data) {
          this.filtroAnalisisId = data.idAnalisis;
        }
        this.recalcular();
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  onCambioAnalisis() {
    this.filtroProducto = '';
    this.filtroUrgencia = 'Todos';
    this.cargarAnalisis();
  }

  recalcular() {
    if (!this.analisis) return;
    const detalles = this.getDetallesFiltrados();
    this.calcularKPIs(detalles);
    this.prepararGraficoLineas(detalles);
    this.prepararGraficoBarras(detalles);
    this.prepararGraficoMixto(detalles);
    this.prepararGraficoDoughnut(this.analisis);
  }

  getDetallesFiltrados(): DetalleAnalisisIAResponseDTO[] {
    if (!this.analisis) return [];
    let lista = this.analisis.detalles;
    if (this.filtroUrgencia !== 'Todos') {
      lista = lista.filter(d => d.nivelUrgencia === this.filtroUrgencia);
    }
    if (this.filtroProducto.trim()) {
      const term = this.filtroProducto.toLowerCase().trim();
      lista = lista.filter(d => d.nombreProducto.toLowerCase().includes(term));
    }
    return lista;
  }

  calcularKPIs(detalles: DetalleAnalisisIAResponseDTO[]) {
    this.totalProductos = detalles.length;
    this.totalUrgenciaAlta = detalles.filter(d => d.nivelUrgencia === 'Alta').length;
    this.totalUrgenciaMedia = detalles.filter(d => d.nivelUrgencia === 'Media').length;
    this.totalUrgenciaBaja = detalles.filter(d => d.nivelUrgencia === 'Baja').length;
    this.totalUnidadesSugeridas = detalles.reduce((sum, d) => sum + d.sugerenciaCompra, 0);
  }

  prepararGraficoLineas(detalles: DetalleAnalisisIAResponseDTO[]) {
    const top5 = detalles.slice(0, 5);
    if (!top5.length || !top5[0].ventasMensuales?.length) { this.lineChartData = null; return; }

    const labels = [...top5[0].ventasMensuales.map(v => v.mes), 'Proyección'];
    const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6'];

    const datasets = top5.map((prod, i) => {
      const d = [...prod.ventasMensuales.map(v => v.cantidadVendida), prod.proyeccionProximoMes];
      return {
        data: d,
        label: prod.nombreProducto,
        fill: false,
        tension: 0.4,
        borderColor: colors[i % colors.length],
        backgroundColor: colors[i % colors.length],
        pointBackgroundColor: colors[i % colors.length],
        pointBorderColor: '#fff',
        pointRadius: 4,
        segment: {
          borderDash: (ctx: any) => ctx.p0DataIndex >= d.length - 2 ? [5, 5] : undefined
        }
      };
    });

    this.lineChartData = { labels, datasets };
  }

  prepararGraficoBarras(detalles: DetalleAnalisisIAResponseDTO[]) {
    const sorted = [...detalles].sort((a, b) => b.sugerenciaCompra - a.sugerenciaCompra).slice(0, 10);
    if (!sorted.length) { this.barChartData = null; return; }

    this.barChartData = {
      labels: sorted.map(d => d.nombreProducto),
      datasets: [{
        data: sorted.map(d => d.sugerenciaCompra),
        label: 'Unidades sugeridas',
        backgroundColor: sorted.map(d => {
          if (d.nivelUrgencia === 'Alta') return 'rgba(239,68,68,0.7)';
          if (d.nivelUrgencia === 'Media') return 'rgba(245,158,11,0.7)';
          return 'rgba(16,185,129,0.7)';
        }),
        borderColor: sorted.map(d => {
          if (d.nivelUrgencia === 'Alta') return '#ef4444';
          if (d.nivelUrgencia === 'Media') return '#f59e0b';
          return '#10b981';
        }),
        borderWidth: 1
      }]
    };
  }

  prepararGraficoDoughnut(data: AnalisisIAResponseDTO) {
    const alta = data.detalles.filter(d => d.nivelUrgencia === 'Alta').length;
    const media = data.detalles.filter(d => d.nivelUrgencia === 'Media').length;
    const baja = data.detalles.filter(d => d.nivelUrgencia === 'Baja').length;

    this.doughnutChartData = {
      labels: ['Alta — Compra urgente', 'Media — Oportunidad', 'Baja — Stock estable'],
      datasets: [{
        data: [alta, media, baja],
        backgroundColor: ['rgba(239,68,68,0.75)', 'rgba(245,158,11,0.75)', 'rgba(16,185,129,0.75)'],
        borderColor: ['#ef4444', '#f59e0b', '#10b981'],
        borderWidth: 1
      }]
    };
  }

  prepararGraficoMixto(detalles: DetalleAnalisisIAResponseDTO[]) {
    const top8 = [...detalles].sort((a, b) => b.proyeccionProximoMes - a.proyeccionProximoMes).slice(0, 8);
    if (!top8.length) { this.mixedChartData = null; return; }

    this.mixedChartData = {
      labels: top8.map(d => d.nombreProducto),
      datasets: [
        {
          type: 'bar',
          data: top8.map(d => d.stockActual),
          label: 'Stock actual',
          backgroundColor: 'rgba(59,130,246,0.65)',
          borderColor: '#3b82f6',
          borderWidth: 1,
          borderRadius: 4,
          order: 2
        },
        {
          type: 'line',
          data: top8.map(d => d.proyeccionProximoMes),
          label: 'Proyección de ventas',
          borderColor: '#ef4444',
          backgroundColor: 'transparent',
          tension: 0.3,
          fill: false,
          pointBackgroundColor: '#ef4444',
          pointBorderColor: '#fff',
          pointRadius: 6,
          pointHoverRadius: 8,
          borderWidth: 2,
          order: 1
        }
      ]
    };
  }
}
