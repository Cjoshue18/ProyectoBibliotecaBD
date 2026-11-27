import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import {
  DeudaDetalleDto,
  LectorResumenDto,
  PagoDto,
  PrestamoDetalleDto,
  extraerMensajeError,
} from '../../core/models/biblioteca.models';
import { AuthService } from '../../core/services/auth.service';
import { CirculacionApiService } from '../../core/services/circulacion-api.service';
import { LectorApiService } from '../../core/services/lector-api.service';

@Component({
  selector: 'app-resumen-lector',
  imports: [RouterLink, MatTableModule, CurrencyPipe, DatePipe],
  templateUrl: './resumen-lector.component.html',
  styleUrl: './resumen-lector.component.css',
})
export class ResumenLectorComponent implements OnInit {
  readonly auth = inject(AuthService);
  private readonly lectorApi = inject(LectorApiService);
  private readonly circulacionApi = inject(CirculacionApiService);

  readonly perfil = signal<LectorResumenDto | null>(null);
  readonly prestamos = signal<PrestamoDetalleDto[]>([]);
  readonly deudas = signal<DeudaDetalleDto[]>([]);
  readonly pagos = signal<PagoDto[]>([]);
  readonly cargando = signal(true);
  readonly errorMensaje = signal('');

  readonly colsPrestamos = ['idPrestamo', 'tituloLibro', 'tipoPrestamo', 'fechaVencimiento', 'estado'];
  readonly colsDeudas = ['idDeuda', 'tarifaDiaria', 'fechaFinSuspension', 'estadoDeuda'];
  readonly colsPagos = ['numeroRecibo', 'fechaPago', 'montoPagado', 'idDeuda'];

  readonly ultimosPrestamos = computed(() => this.prestamos().slice(0, 5));
  readonly ultimasDeudas = computed(() => this.deudas().slice(0, 5));
  readonly ultimosPagos = computed(() => this.pagos().slice(0, 5));

  readonly activosCount = computed(
    () => this.prestamos().filter((p) => !p.fechaDevolucionReal).length,
  );

  readonly cupoMaximo = computed(() => (this.auth.session()?.rol === 'Docente' ? 5 : 3));

  ngOnInit(): void {
    const idLector = this.auth.session()?.idLector;
    if (!idLector) {
      this.cargando.set(false);
      return;
    }

    forkJoin({
      lectores: this.lectorApi.listar(),
      prestamos: this.circulacionApi.listarPrestamos(undefined, idLector),
      deudas: this.circulacionApi.listarDeudas(idLector),
      pagos: this.circulacionApi.listarPagos(idLector),
    }).subscribe({
      next: ({ lectores, prestamos, deudas, pagos }) => {
        this.perfil.set(lectores.find((l) => l.idLector === idLector) ?? null);
        this.prestamos.set(prestamos);
        this.deudas.set(deudas);
        this.pagos.set(pagos);
        this.cargando.set(false);
      },
      error: (err) => {
        this.errorMensaje.set(extraerMensajeError(err));
        this.cargando.set(false);
      },
    });
  }
}
