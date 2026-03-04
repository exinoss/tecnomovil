import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Producto, ProductoDto, ProductoSerial, ProductoSerialDto, ProductoPagedResponse } from '../models/producto.model';

@Injectable({ providedIn: 'root' })
export class ProductoService {
  private apiUrl = `${environment.apiUrl}/productos`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Producto[]> {
    return this.http.get<Producto[]>(this.apiUrl);
  }

  getPaged(page: number, pageSize: number, search?: string, idCategoria?: number): Observable<ProductoPagedResponse> {
    let params = new HttpParams()
      .set('page', page)
      .set('pageSize', pageSize);

    if (search && search.trim().length > 0) {
      params = params.set('search', search.trim());
    }

    if (idCategoria && idCategoria > 0) {
      params = params.set('idCategoria', idCategoria);
    }

    return this.http.get<ProductoPagedResponse>(`${this.apiUrl}/paged`, { params });
  }

  getActivos(): Observable<Producto[]> {
    return this.http.get<Producto[]>(`${this.apiUrl}/activos`);
  }

  getById(id: number): Observable<Producto> {
    return this.http.get<Producto>(`${this.apiUrl}/${id}`);
  }

  getByCategoria(idCategoria: number): Observable<Producto[]> {
    return this.http.get<Producto[]>(`${this.apiUrl}/categoria/${idCategoria}`);
  }

  buscar(termino: string): Observable<Producto[]> {
    return this.http.get<Producto[]>(`${this.apiUrl}/buscar?termino=${termino}`);
  }

  create(dto: ProductoDto): Observable<Producto> {
    return this.http.post<Producto>(this.apiUrl, dto);
  }

  update(id: number, dto: ProductoDto): Observable<Producto> {
    return this.http.put<Producto>(`${this.apiUrl}/${id}`, dto);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  // Seriales
  getSeriales(idProducto: number): Observable<ProductoSerial[]> {
    return this.http.get<ProductoSerial[]>(`${this.apiUrl}/${idProducto}/seriales`);
  }

  getSerialesDisponibles(idProducto: number): Observable<ProductoSerial[]> {
    return this.http.get<ProductoSerial[]>(`${this.apiUrl}/${idProducto}/seriales/disponibles`);
  }

  createSerial(idProducto: number, dto: ProductoSerialDto): Observable<ProductoSerial> {
    return this.http.post<ProductoSerial>(`${this.apiUrl}/${idProducto}/seriales`, dto);
  }

  updateSerial(idSerial: number, dto: ProductoSerialDto): Observable<ProductoSerial> {
    return this.http.put<ProductoSerial>(`${this.apiUrl}/seriales/${idSerial}`, dto);
  }

  // Imagen
  uploadImagen(id: number, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('archivo', file);
    return this.http.post(`${this.apiUrl}/${id}/upload-imagen`, formData);
  }

  deleteImagen(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}/imagen`);
  }
}
