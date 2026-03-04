import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Factura, FacturaDto, FacturaResponse, DetalleFacturaDto, FacturaPagedResponse } from '../models/factura.model';

@Injectable({ providedIn: 'root' })
export class FacturaService {
  private apiUrl = `${environment.apiUrl}/facturas`;

  constructor(private http: HttpClient) {}

  getAll(page: number, pageSize: number, search?: string): Observable<FacturaPagedResponse> {
    let params = new HttpParams()
      .set('page', page)
      .set('pageSize', pageSize);

    if (search && search.trim().length > 0) {
      params = params.set('search', search.trim());
    }

    return this.http.get<FacturaPagedResponse>(this.apiUrl, { params });
  }

  getById(id: number): Observable<FacturaResponse> {
    return this.http.get<FacturaResponse>(`${this.apiUrl}/${id}`);
  }

  getByCliente(idCliente: number): Observable<Factura[]> {
    return this.http.get<Factura[]>(`${this.apiUrl}/cliente/${idCliente}`);
  }

  getByFecha(desde: string, hasta: string): Observable<Factura[]> {
    return this.http.get<Factura[]>(`${this.apiUrl}/fecha?desde=${desde}&hasta=${hasta}`);
  }

  create(dto: FacturaDto): Observable<Factura> {
    return this.http.post<Factura>(this.apiUrl, dto);
  }

  addDetalle(idFactura: number, dto: DetalleFacturaDto): Observable<any> {
    return this.http.post(`${this.apiUrl}/${idFactura}/detalles`, dto);
  }

  deleteDetalle(idDetalle: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/detalles/${idDetalle}`);
  }
}
