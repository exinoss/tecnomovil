import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Configuracion } from '../models/configuracion.model';

@Injectable({ providedIn: 'root' })
export class ConfiguracionService {
  private apiUrl = `${environment.apiUrl}/configuracion`;

  constructor(private http: HttpClient) {}

  get(): Observable<Configuracion> {
    return this.http.get<Configuracion>(this.apiUrl);
  }

  update(dto: Configuracion): Observable<any> {
    return this.http.put(this.apiUrl, dto);
  }
}
