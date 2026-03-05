import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import {
  AnalisisIAResponseDTO,
  AnalisisIAResumenDTO,
  GenerarAnalisisResponse
} from '../models/analisis-ia';
import { ToastService } from '../../shared/components/toast/toast.service';

@Injectable({
  providedIn: 'root'
})
export class AnalisisIAService {
  private apiUrl = `${environment.apiUrl}/analisis`;

  private generandoSubject = new BehaviorSubject<boolean>(false);
  public generando$ = this.generandoSubject.asObservable();

  private nuevoAnalisisSubject = new Subject<number>();
  public nuevoAnalisis$ = this.nuevoAnalisisSubject.asObservable();

  constructor(private http: HttpClient, private toastService: ToastService) {}

  generarAnalisis(): Observable<GenerarAnalisisResponse> {
    return this.http.post<GenerarAnalisisResponse>(`${this.apiUrl}/generar`, {});
  }

  generarAnalisisBackground(): void {
    if (this.generandoSubject.value) return; // Evitar duplicados

    this.generandoSubject.next(true);
    this.http.post<GenerarAnalisisResponse>(`${this.apiUrl}/generar`, {}).subscribe({
      next: (response) => {
        this.toastService.show('Análisis de IA completado exitosamente', 'success');
        this.generandoSubject.next(false);
        this.nuevoAnalisisSubject.next(response.idAnalisis);
      },
      error: (error) => {
        console.error('Error generando análisis', error);
        this.toastService.show('Error al generar el análisis: ' + error.message, 'error');
        this.generandoSubject.next(false);
      }
    });
  }

  getUltimoAnalisis(): Observable<AnalisisIAResponseDTO> {
    return this.http.get<AnalisisIAResponseDTO>(`${this.apiUrl}/ultimo`);
  }

  getHistorialAnalisis(): Observable<AnalisisIAResumenDTO[]> {
    return this.http.get<AnalisisIAResumenDTO[]>(`${this.apiUrl}/historial`);
  }

  getAnalisisById(id: number): Observable<AnalisisIAResponseDTO> {
    return this.http.get<AnalisisIAResponseDTO>(`${this.apiUrl}/${id}`);
  }
}
