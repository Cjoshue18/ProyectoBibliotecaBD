import { DatePipe } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import {
  DeudaDetalleDto,
  PagoDto,
  PrestamoDetalleDto,
  extraerMensajeError,
} from '../../core/models/biblioteca.models';
import { CirculacionApiService } from '../../core/services/circulacion-api.service';
import { ComprobanteDialogComponent } from '../../shared/components/comprobante-dialog/comprobante-dialog.component';
import { DeudaDetalleDialogComponent } from '../../shared/components/deuda-detalle-dialog/deuda-detalle-dialog.component';

@Component({
  selector: 'app-lista-prestamos',
  imports: [FormsModule, RouterLink, MatTableModule, MatPaginatorModule, DatePipe],
  templateUrl: './lista-prestamos.component.html',
})
export class ListaPrestamosComponent implements OnInit {
  private readonly circulacionApi = inject(CirculacionApiService);
  private readonly dialog = inject(MatDialog);

  readonly prestamos = signal<PrestamoDetalleDto[]>([]);
  readonly deudas = signal<DeudaDetalleDto[]>([]);
  readonly pagos = signal<PagoDto[]>([]);
  readonly busqueda = signal('');
  readonly pageIndex = signal(0);
  readonly pageSize = signal(6);

  readonly cargando = signal(true);
  readonly procesando = signal(false);
  readonly feedbackExito = signal('');
  readonly feedbackError = signal('');

  readonly columnas = [
    'idPrestamo',
    'nombreLector',
    'tituloLibro',
    'tipoPrestamo',
    'fechaVencimiento',
    'estado',
    'trazabilidad',
    'acciones',
  ];

  readonly deudaPorPrestamo = computed(
    () => new Map(this.deudas().map((d) => [d.idPrestamo, d])),
  );

  readonly pagoPorDeuda = computed(() => new Map(this.pagos().map((p) => [p.idDeuda, p])));

  readonly filtrados = computed(() => {
    const q = this.busqueda().trim().toLowerCase();
    return this.prestamos().filter((p) => {
      if (!q) return true;
      return (
        p.nombreLector.toLowerCase().includes(q) ||
        p.tituloLibro.toLowerCase().includes(q) ||
        p.isbn.toLowerCase().includes(q) ||
        String(p.idPrestamo).includes(q)
      );
    });
  });

  readonly paginados = computed(() => {
    const start = this.pageIndex() * this.pageSize();
    return this.filtrados().slice(start, start + this.pageSize());
  });

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.cargando.set(true);
    forkJoin({
      prestamos: this.circulacionApi.listarPrestamos(),
      deudas: this.circulacionApi.listarDeudas(),
      pagos: this.circulacionApi.listarPagos(),
    }).subscribe({
      next: ({ prestamos, deudas, pagos }) => {
        this.prestamos.set(prestamos);
        this.deudas.set(deudas);
        this.pagos.set(pagos);
        this.cargando.set(false);
      },
      error: (err) => {
        this.feedbackError.set(extraerMensajeError(err));
        this.cargando.set(false);
      },
    });
  }

  onBusquedaChange(val: string): void {
    this.busqueda.set(val);
    this.pageIndex.set(0);
  }

  devolver(p: PrestamoDetalleDto): void {
    this.procesando.set(true);
    this.feedbackExito.set('');
    this.feedbackError.set('');

    this.circulacionApi.registrarDevolucion(p.idPrestamo).subscribe({
      next: (res) => {
        this.procesando.set(false);
        const extraMora =
          res.diasRetraso > 0
            ? ` Con ${res.diasRetraso} día(s) de retraso (Multa S/ ${(res.montoGenerado ?? 0).toFixed(2)}).`
            : ' Entregado sin retraso.';
        this.feedbackExito.set(`Devolución registrada para el préstamo #${res.idPrestamo}.${extraMora}`);
        this.cargar();
      },
      error: (err) => {
        this.procesando.set(false);
        this.feedbackError.set(extraerMensajeError(err));
      },
    });
  }

  verDeuda(idPrestamo: number): void {
    const deuda = this.deudaPorPrestamo().get(idPrestamo);
    if (!deuda) return;
    const pago = this.pagoPorDeuda().get(deuda.idDeuda) ?? null;
    this.dialog.open(DeudaDetalleDialogComponent, {
      data: { deuda, pago },
      width: '620px',
      maxWidth: '95vw',
    });
  }

  verComprobante(idPrestamo: number): void {
    const deuda = this.deudaPorPrestamo().get(idPrestamo);
    if (!deuda) return;
    const pago = this.pagoPorDeuda().get(deuda.idDeuda);
    if (!pago) return;
    this.dialog.open(ComprobanteDialogComponent, {
      data: {
        pago,
        tituloLibro: deuda.tituloLibro,
        nombreLector: deuda.nombreLector,
        diasRetraso: deuda.diasRetraso,
        tarifaDiaria: deuda.tarifaDiaria,
      },
      width: '620px',
      maxWidth: '95vw',
    });
  }

  onPageChange(e: PageEvent): void {
    this.pageIndex.set(e.pageIndex);
    this.pageSize.set(e.pageSize);
  }
}
