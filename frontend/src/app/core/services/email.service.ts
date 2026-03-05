import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface ArchivoAdjuntoDto {
  nombre: string;
  base64: string;
  contentType: string;
}

export interface EnviarEmailDto {
  destinatario: string;
  nombreDestinatario?: string;
  asunto: string;
  cuerpo: string;
  /** Si es true, el cuerpo se trata como texto plano */
  esTextoPlano?: boolean;
  adjuntos?: ArchivoAdjuntoDto[];
}

export interface EmailResponse {
  message: string;
}

@Injectable({ providedIn: 'root' })
export class EmailService {
  private apiUrl = `${environment.apiUrl}/email`;

  constructor(private http: HttpClient) {}

  /** Envía un correo con cuerpo HTML o texto plano. */
  enviar(dto: EnviarEmailDto): Observable<EmailResponse> {
    return this.http.post<EmailResponse>(`${this.apiUrl}/enviar`, dto);
  }

  /** Shorthand: envía un HTML rápido. */
  enviarHtml(destinatario: string, asunto: string, cuerpoHtml: string, nombre?: string): Observable<EmailResponse> {
    return this.enviar({ destinatario, asunto, cuerpo: cuerpoHtml, nombreDestinatario: nombre });
  }

  /** Shorthand: envía texto plano. */
  enviarTexto(destinatario: string, asunto: string, texto: string, nombre?: string): Observable<EmailResponse> {
    return this.enviar({ destinatario, asunto, cuerpo: texto, esTextoPlano: true, nombreDestinatario: nombre });
  }
}
