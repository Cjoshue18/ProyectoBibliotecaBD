import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import {
  DeudaDetalleDto,
  LectorResumenDto,
  LibroCatalogoDto,
  PrestamoDetalleDto,
  extraerMensajeError,
} from '../../core/models/biblioteca.models';
import { CatalogoApiService } from '../../core/services/catalogo-api.service';
import { CirculacionApiService } from '../../core/services/circulacion-api.service';
import { LectorApiService } from '../../core/services/lector-api.service';

@Component({
  selector: 'app-acciones-rapidas',
  imports: [RouterLink],
  templateUrl: './acciones-rapidas.component.html',
})
export class AccionesRapidasComponent implements OnInit {
  private readonly circulacionApi = inject(CirculacionApiService);
  private readonly lectorApi = inject(LectorApiService);
  private readonly catalogoApi = inject(CatalogoApiService);

  readonly prestamos = signal<PrestamoDetalleDto[]>([]);
  readonly deudas = signal<DeudaDetalleDto[]>([]);
  readonly lectores = signal<LectorResumenDto[]>([]);
  readonly libros = signal<LibroCatalogoDto[]>([]);
  readonly cargando = signal(true);
  readonly errorMensaje = signal('');

  readonly activosCount = computed(
    () => this.prestamos().filter((p) => !p.fechaDevolucionReal).length,
  );
  readonly vencidosCount = computed(
    () => this.prestamos().filter((p) => p.estadoDerivado === 'Vencido').length,
  );
  readonly deudasPendientesCount = computed(
    () => this.deudas().filter((d) => d.estadoDeuda === 'Pendiente').length,
  );

  ngOnInit(): void {
    forkJoin({
      prestamos: this.circulacionApi.listarPrestamos(),
      deudas: this.circulacionApi.listarDeudas(undefined, 'Pendiente'),
      lectores: this.lectorApi.listar(),
      libros: this.catalogoApi.listarLibros(),
    }).subscribe({
      next: ({ prestamos, deudas, lectores, libros }) => {
        this.prestamos.set(prestamos);
        this.deudas.set(deudas);
        this.lectores.set(lectores);
        this.libros.set(libros);
        this.cargando.set(false);
      },
      error: (err) => {
        this.errorMensaje.set(extraerMensajeError(err));
        this.cargando.set(false);
      },
    });
  }
}
