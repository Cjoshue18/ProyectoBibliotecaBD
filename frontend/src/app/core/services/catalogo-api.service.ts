import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AutorDto, EditorialDto, FacultadDto, LibroCatalogoDto } from '../models/biblioteca.models';

@Injectable({ providedIn: 'root' })
export class CatalogoApiService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/catalogo`;

  listarFacultades(): Observable<FacultadDto[]> {
    return this.http.get<FacultadDto[]>(`${this.base}/facultades`);
  }

  crearFacultad(nombreFacultad: string): Observable<FacultadDto> {
    return this.http.post<FacultadDto>(`${this.base}/facultades`, { nombreFacultad });
  }

  listarEditoriales(): Observable<EditorialDto[]> {
    return this.http.get<EditorialDto[]>(`${this.base}/editoriales`);
  }

  crearEditorial(nombreEditorial: string, paisOrigen: string): Observable<EditorialDto> {
    return this.http.post<EditorialDto>(`${this.base}/editoriales`, { nombreEditorial, paisOrigen });
  }

  listarAutores(): Observable<AutorDto[]> {
    return this.http.get<AutorDto[]>(`${this.base}/autores`);
  }

  crearAutor(nombreAutor: string): Observable<AutorDto> {
    return this.http.post<AutorDto>(`${this.base}/autores`, { nombreAutor });
  }

  listarLibros(q?: string): Observable<LibroCatalogoDto[]> {
    let params = new HttpParams();
    if (q?.trim()) params = params.set('q', q.trim());
    return this.http.get<LibroCatalogoDto[]>(`${this.base}/libros`, { params });
  }

  crearLibro(titulo: string, idsAutores: number[]): Observable<{ id?: number }> {
    return this.http.post<{ id?: number }>(`${this.base}/libros`, { titulo, idsAutores });
  }

  actualizarLibro(idLibro: number, titulo: string): Observable<void> {
    return this.http.put<void>(`${this.base}/libros/${idLibro}`, { titulo });
  }

  crearEdicion(payload: { isbn: string; numeroEdicion: number; anioPublicacion: number; idEditorial: number; idLibro: number }): Observable<void> {
    return this.http.post<void>(`${this.base}/ediciones`, payload);
  }

  crearEjemplar(payload: { isbn: string; numeroCopia: number; idFacultad: number }): Observable<void> {
    return this.http.post<void>(`${this.base}/ejemplares`, payload);
  }

  cambiarEstadoEjemplar(isbn: string, numeroCopia: number, nuevoEstado: string): Observable<{ tipoEstadoFisico: string }> {
    return this.http.patch<{ tipoEstadoFisico: string }>(
      `${this.base}/ejemplares/${encodeURIComponent(isbn)}/${numeroCopia}/estado`,
      { nuevoEstado }
    );
  }

  trasladarEjemplar(isbn: string, numeroCopia: number, idFacultad: number): Observable<void> {
    return this.http.patch<void>(
      `${this.base}/ejemplares/${encodeURIComponent(isbn)}/${numeroCopia}/facultad`,
      { idFacultad }
    );
  }
}
