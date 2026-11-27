import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  DeudaDetalleDto,
  DevolucionResultadoDto,
  PagoDto,
  PrestamoDetalleDto
} from '../models/biblioteca.models';

@Injectable({ providedIn: 'root' })
export class CirculacionApiService {
  private readonly http = inject(HttpClient);
  private readonly api = environment.apiUrl;

  listarPrestamos(soloActivos?: boolean, idLector?: number): Observable<PrestamoDetalleDto[]> {
    let params = new HttpParams();
    if (soloActivos !== undefined) params = params.set('soloActivos', String(soloActivos));
    if (idLector !== undefined) params = params.set('idLector', String(idLector));
    return this.http.get<PrestamoDetalleDto[]>(`${this.api}/prestamos`, { params });
  }

  registrarPrestamo(payload: { idLector: number; isbn: string; numeroCopia: number; tipoPrestamo: string }): Observable<unknown> {
    return this.http.post(`${this.api}/prestamos`, payload);
  }

  registrarDevolucion(idPrestamo: number): Observable<DevolucionResultadoDto> {
    return this.http.post<DevolucionResultadoDto>(`${this.api}/prestamos/${idPrestamo}/devolucion`, {});
  }

  listarDeudas(idLector?: number, estado?: string): Observable<DeudaDetalleDto[]> {
    let params = new HttpParams();
    if (idLector !== undefined) params = params.set('idLector', String(idLector));
    if (estado?.trim()) params = params.set('estado', estado.trim());
    return this.http.get<DeudaDetalleDto[]>(`${this.api}/deudas`, { params });
  }

  anularDeuda(idDeuda: number): Observable<void> {
    return this.http.patch<void>(`${this.api}/deudas/${idDeuda}/anular`, {});
  }

  listarPagos(idLector?: number): Observable<PagoDto[]> {
    let params = new HttpParams();
    if (idLector !== undefined) params = params.set('idLector', String(idLector));
    return this.http.get<PagoDto[]>(`${this.api}/pagos`, { params });
  }

  registrarPago(idDeuda: number, numeroRecibo: string): Observable<PagoDto> {
    return this.http.post<PagoDto>(`${this.api}/pagos`, { idDeuda, numeroRecibo });
  }
}
