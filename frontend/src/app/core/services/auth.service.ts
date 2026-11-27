import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthSessionDto, EjemplarSeleccionado } from '../models/biblioteca.models';

const STORAGE_KEY = 'biblioteca_urp_session';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly sessionSignal = signal<AuthSessionDto | null>(this.cargarSesion());
  private readonly pendientePrestarSignal = signal<EjemplarSeleccionado | null>(null);

  readonly session = this.sessionSignal.asReadonly();
  readonly pendientePrestar = this.pendientePrestarSignal.asReadonly();
  readonly esEncargado = computed(() => this.sessionSignal()?.rol === 'Encargado');
  readonly esLector = computed(() => {
    const rol = this.sessionSignal()?.rol;
    return rol === 'Alumno' || rol === 'Docente';
  });

  loginLector(usuario: string, clave: string): Observable<AuthSessionDto> {
    return this.http
      .post<AuthSessionDto>(`${environment.apiUrl}/auth/login-lector`, { usuario, clave })
      .pipe(tap((s) => this.guardarSesion(s)));
  }

  loginEncargado(password: string): Observable<AuthSessionDto> {
    return this.http
      .post<AuthSessionDto>(`${environment.apiUrl}/auth/login-encargado`, { password })
      .pipe(tap((s) => this.guardarSesion(s)));
  }

  logout(): void {
    this.sessionSignal.set(null);
    this.pendientePrestarSignal.set(null);
    sessionStorage.removeItem(STORAGE_KEY);
  }

  establecerPendientePrestar(item: EjemplarSeleccionado | null): void {
    this.pendientePrestarSignal.set(item);
  }

  consumirPendientePrestar(): EjemplarSeleccionado | null {
    const actual = this.pendientePrestarSignal();
    this.pendientePrestarSignal.set(null);
    return actual;
  }

  private guardarSesion(s: AuthSessionDto): void {
    this.sessionSignal.set(s);
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  }

  private cargarSesion(): AuthSessionDto | null {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as AuthSessionDto) : null;
    } catch {
      return null;
    }
  }
}
