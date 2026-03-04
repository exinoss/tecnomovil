import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Reparacion, ReparacionDto, ReparacionRepuesto, ReparacionRepuestoDto, AprobacionDto, ReparacionPagedResponse } from '../models/reparacion.model';

@Injectable({ providedIn: 'root' })
export class ReparacionService {
  private apiUrl = `${environment.apiUrl}/reparaciones`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Reparacion[]> {
    return this.http.get<Reparacion[]>(this.apiUrl);
  }

  getPaged(page: number, pageSize: number, search?: string, estado?: string): Observable<ReparacionPagedResponse> {
    let params = new HttpParams()
      .set('page', page)
      .set('pageSize', pageSize);

    if (search && search.trim().length > 0) {
      params = params.set('search', search.trim());
    }

    if (estado && estado.trim().length > 0) {
      params = params.set('estado', estado.trim());
    }

    return this.http.get<ReparacionPagedResponse>(`${this.apiUrl}/paged`, { params });
  }

  getById(id: number): Observable<Reparacion> {
    return this.http.get<Reparacion>(`${this.apiUrl}/${id}`);
  }

  getByCliente(idCliente: number): Observable<Reparacion[]> {
    return this.http.get<Reparacion[]>(`${this.apiUrl}/cliente/${idCliente}`);
  }

  getByTecnico(idUsuario: number): Observable<Reparacion[]> {
    return this.http.get<Reparacion[]>(`${this.apiUrl}/tecnico/${idUsuario}`);
  }

  getByEstado(estado: string): Observable<Reparacion[]> {
    return this.http.get<Reparacion[]>(`${this.apiUrl}/estado/${estado}`);
  }

  create(dto: ReparacionDto): Observable<Reparacion> {
    return this.http.post<Reparacion>(this.apiUrl, dto);
  }

  update(id: number, dto: ReparacionDto): Observable<Reparacion> {
    return this.http.put<Reparacion>(`${this.apiUrl}/${id}`, dto);
  }

  cambiarEstado(id: number, estado: string): Observable<Reparacion> {
    return this.http.put<Reparacion>(`${this.apiUrl}/${id}/estado`, { estado });
  }

  aprobar(id: number, dto: AprobacionDto): Observable<Reparacion> {
    return this.http.put<Reparacion>(`${this.apiUrl}/${id}/aprobar`, dto);
  }

  // Repuestos
  getRepuestos(id: number): Observable<ReparacionRepuesto[]> {
    return this.http.get<ReparacionRepuesto[]>(`${this.apiUrl}/${id}/repuestos`);
  }

  addRepuesto(id: number, dto: ReparacionRepuestoDto): Observable<ReparacionRepuesto> {
    return this.http.post<ReparacionRepuesto>(`${this.apiUrl}/${id}/repuestos`, dto);
  }

  deleteRepuesto(idRepuesto: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/repuestos/${idRepuesto}`);
  }
}
