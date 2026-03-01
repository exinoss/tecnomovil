import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { MovimientoInventario, MovimientoInventarioDto } from '../models/inventario.model';

@Injectable({ providedIn: 'root' })
export class InventarioService {
  private apiUrl = `${environment.apiUrl}/inventario`;

  constructor(private http: HttpClient) {}

  getAll(limite?: number): Observable<MovimientoInventario[]> {
    const url = limite ? `${this.apiUrl}?limite=${limite}` : this.apiUrl;
    return this.http.get<MovimientoInventario[]>(url);
  }

  getByProducto(idProducto: number): Observable<MovimientoInventario[]> {
    return this.http.get<MovimientoInventario[]>(`${this.apiUrl}/producto/${idProducto}`);
  }

  getByTipo(tipo: string): Observable<MovimientoInventario[]> {
    return this.http.get<MovimientoInventario[]>(`${this.apiUrl}/tipo/${tipo}`);
  }

  getByFecha(desde: string, hasta: string): Observable<MovimientoInventario[]> {
    return this.http.get<MovimientoInventario[]>(`${this.apiUrl}/fecha?desde=${desde}&hasta=${hasta}`);
  }

  getStockBajo(minimo?: number): Observable<any[]> {
    const url = minimo ? `${this.apiUrl}/stock-bajo?minimo=${minimo}` : `${this.apiUrl}/stock-bajo`;
    return this.http.get<any[]>(url);
  }

  create(dto: MovimientoInventarioDto): Observable<MovimientoInventario> {
    return this.http.post<MovimientoInventario>(this.apiUrl, dto);
  }
}
