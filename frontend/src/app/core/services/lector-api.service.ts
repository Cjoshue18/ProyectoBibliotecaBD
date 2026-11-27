import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LectorResumenDto } from '../models/biblioteca.models';

export interface RegistrarAlumnoPayload {
  tipoDoc: string;
  numeroDoc: string;
  nombres: string;
  apellidoPaterno: string;
  apellidoMaterno?: string | null;
  correoInstitucional: string;
  telefono?: string | null;
  direccion?: string | null;
  idFacultad: number;
  codigoAlumno: string;
  ciclo: number;
}

export interface RegistrarDocentePayload {
  tipoDoc: string;
  numeroDoc: string;
  nombres: string;
  apellidoPaterno: string;
  apellidoMaterno?: string | null;
  correoInstitucional: string;
  telefono?: string | null;
  direccion?: string | null;
  idFacultad: number;
  categoriaDocente: string;
}

@Injectable({ providedIn: 'root' })
export class LectorApiService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/lectores`;

  listar(q?: string): Observable<LectorResumenDto[]> {
    let params = new HttpParams();
    if (q?.trim()) params = params.set('q', q.trim());
    return this.http.get<LectorResumenDto[]>(this.base, { params });
  }

  registrarAlumno(payload: RegistrarAlumnoPayload): Observable<unknown> {
    return this.http.post(`${this.base}/alumnos`, payload);
  }

  registrarDocente(payload: RegistrarDocentePayload): Observable<unknown> {
    return this.http.post(`${this.base}/docentes`, payload);
  }

  cambiarEstado(idLector: number, nuevoEstado: 'Activo' | 'Inactivo'): Observable<void> {
    return this.http.patch<void>(`${this.base}/${idLector}/estado`, { nuevoEstado });
  }
}
