import { Component, OnInit } from '@angular/core';
import { ConfiguracionService } from '../../core/services/configuracion.service';
import { Configuracion } from '../../core/models/configuracion.model';
import { ToastService } from '../../shared/components/toast/toast.service';

@Component({
  selector: 'app-configuracion',
  standalone: false,
  templateUrl: './configuracion.component.html'
})
export class ConfiguracionComponent implements OnInit {
  config: Configuracion = { ivaPorcentaje: 0 };
  loading = true;
  saving = false;

  constructor(
    private configuracionService: ConfiguracionService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.configuracionService.get().subscribe({
      next: (data) => {
        this.config = data;
        this.loading = false;
      },
      error: () => {
        this.toast.show('Error al cargar configuración', 'error');
        this.loading = false;
      }
    });
  }

  save(): void {
    if (this.config.ivaPorcentaje < 0 || this.config.ivaPorcentaje > 100) {
      this.toast.show('El IVA debe estar entre 0 y 100', 'error');
      return;
    }
    this.saving = true;
    this.configuracionService.update(this.config).subscribe({
      next: () => {
        this.toast.show('Configuración actualizada', 'success');
        this.saving = false;
      },
      error: () => {
        this.toast.show('Error al guardar configuración', 'error');
        this.saving = false;
      }
    });
  }
}
