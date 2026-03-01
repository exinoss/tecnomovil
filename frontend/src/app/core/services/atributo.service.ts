import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Atributo, AtributoDto } from '../models/configuracion.model';
import { ProductoAtributo, ProductoAtributoDto } from '../models/producto.model';

@Injectable({ providedIn: 'root' })
export class AtributoService {
  private apiUrl = `${environment.apiUrl}/atributos`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Atributo[]> {
    return this.http.get<Atributo[]>(this.apiUrl);
  }

  getActivos(): Observable<Atributo[]> {
    return this.http.get<Atributo[]>(`${this.apiUrl}/activos`);
  }

  getById(id: number): Observable<Atributo> {
    return this.http.get<Atributo>(`${this.apiUrl}/${id}`);
  }

  create(dto: AtributoDto): Observable<Atributo> {
    return this.http.post<Atributo>(this.apiUrl, dto);
  }

  update(id: number, dto: AtributoDto): Observable<Atributo> {
    return this.http.put<Atributo>(`${this.apiUrl}/${id}`, dto);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  // Producto Atributos
  getByProducto(idProducto: number): Observable<ProductoAtributo[]> {
    return this.http.get<ProductoAtributo[]>(`${this.apiUrl}/producto/${idProducto}`);
  }

  asignarAtributo(dto: ProductoAtributoDto): Observable<ProductoAtributo> {
    return this.http.post<ProductoAtributo>(`${this.apiUrl}/producto`, dto);
  }

  removerAtributo(idProducto: number, idAtributo: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/producto/${idProducto}/${idAtributo}`);
  }
}
