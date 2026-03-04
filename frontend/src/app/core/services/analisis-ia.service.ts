import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import {
  AnalisisIAResponseDTO,
  AnalisisIAResumenDTO,
  GenerarAnalisisResponse
} from '../models/analisis-ia';

@Injectable({
  providedIn: 'root'
})
export class AnalisisIAService {
  private apiUrl = `${environment.apiUrl}/analisis`;

  constructor(private http: HttpClient) {}

  generarAnalisis(): Observable<GenerarAnalisisResponse> {
    return this.http.post<GenerarAnalisisResponse>(`${this.apiUrl}/generar`, {});
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
