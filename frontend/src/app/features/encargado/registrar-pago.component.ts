import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { forkJoin } from 'rxjs';
import {
  DeudaDetalleDto,
  LectorResumenDto,
  extraerMensajeError,
} from '../../core/models/biblioteca.models';
import { CirculacionApiService } from '../../core/services/circulacion-api.service';
import { LectorApiService } from '../../core/services/lector-api.service';
import { ComprobanteDialogComponent } from '../../shared/components/comprobante-dialog/comprobante-dialog.component';

@Component({
  selector: 'app-registrar-pago',
  imports: [FormsModule, MatTableModule, MatPaginatorModule, CurrencyPipe, DatePipe],
  templateUrl: './registrar-pago.component.html',
})
export class RegistrarPagoComponent implements OnInit {
  private readonly circulacionApi = inject(CirculacionApiService);
  private readonly lectorApi = inject(LectorApiService);
  private readonly dialog = inject(MatDialog);

  readonly deudas = signal<DeudaDetalleDto[]>([]);
  readonly lectores = signal<LectorResumenDto[]>([]);

  readonly buscDoc = signal('');
  readonly buscLector = signal('');
  readonly buscLibro = signal('');
  readonly pageIndex = signal(0);

  readonly deudaSeleccionada = signal<DeudaDetalleDto | null>(null);
  numeroRecibo = '';

  readonly cargando = signal(true);
  readonly procesando = signal(false);
  readonly feedbackExito = signal('');
  readonly feedbackError = signal('');

  readonly columnas = [
    'idDeuda',
    'nombreLector',
    'tituloLibro',
    'montoCalculado',
    'fechaFinSuspension',
    'accion',
  ];

  readonly filtradas = computed(() => {
    const qDoc = this.buscDoc().trim().toLowerCase();
    const qLector = this.buscLector().trim().toLowerCase();
    const qLibro = this.buscLibro().trim().toLowerCase();
    const mapaLectores = new Map(this.lectores().map((l) => [l.idLector, l]));

    return this.deudas().filter((d) => {
      if (d.estadoDeuda !== 'Pendiente') return false;
      const lec = mapaLectores.get(d.idLector);
      if (qDoc) {
        const matchDni = lec?.numeroDoc.toLowerCase().includes(qDoc) ?? false;
        const matchCod = lec?.codigoAlumno?.toLowerCase().includes(qDoc) ?? false;
        if (!matchDni && !matchCod) return false;
      }
      if (qLector && !d.nombreLector.toLowerCase().includes(qLector)) return false;
      if (qLibro && !d.tituloLibro.toLowerCase().includes(qLibro)) return false;
      return true;
    });
  });

  readonly paginadas = computed(() => {
    const start = this.pageIndex() * 5;
    return this.filtradas().slice(start, start + 5);
  });

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.cargando.set(true);
    forkJoin({
      deudas: this.circulacionApi.listarDeudas(undefined, 'Pendiente'),
      lectores: this.lectorApi.listar(),
    }).subscribe({
      next: ({ deudas, lectores }) => {
        this.deudas.set(deudas);
        this.lectores.set(lectores);
        this.cargando.set(false);
      },
      error: (err) => {
        this.feedbackError.set(extraerMensajeError(err));
        this.cargando.set(false);
      },
    });
  }

  onFiltroChange(campo: 'doc' | 'lector' | 'libro', valor: string): void {
    if (campo === 'doc') this.buscDoc.set(valor);
    if (campo === 'lector') this.buscLector.set(valor);
    if (campo === 'libro') this.buscLibro.set(valor);
    this.pageIndex.set(0);
  }

  seleccionarDeuda(d: DeudaDetalleDto): void {
    this.deudaSeleccionada.set(d);
    this.feedbackError.set('');
    this.feedbackExito.set('');
    if (!this.numeroRecibo) {
      this.numeroRecibo = `REC-${new Date().getFullYear()}-${String(d.idDeuda).padStart(4, '0')}`;
    }
  }

  confirmarPago(): void {
    const d = this.deudaSeleccionada();
    const recibo = this.numeroRecibo.trim();
    if (!d || !recibo) {
      this.feedbackError.set('Selecciona una deuda e ingresa el número de recibo.');
      return;
    }

    this.procesando.set(true);
    this.feedbackError.set('');
    this.feedbackExito.set('');

    this.circulacionApi.registrarPago(d.idDeuda, recibo).subscribe({
      next: (pago) => {
        this.procesando.set(false);
        this.feedbackExito.set(
          `Pago registrado con recibo ${pago.numeroRecibo} por S/ ${pago.montoPagado.toFixed(2)}.`,
        );
        this.deudaSeleccionada.set(null);
        this.numeroRecibo = '';
        this.cargarDatos();
        this.dialog.open(ComprobanteDialogComponent, {
          data: {
            pago,
            tituloLibro: d.tituloLibro,
            nombreLector: d.nombreLector,
            diasRetraso: d.diasRetraso,
            tarifaDiaria: d.tarifaDiaria,
          },
          width: '620px',
          maxWidth: '95vw',
        });
      },
      error: (err) => {
        this.procesando.set(false);
        this.feedbackError.set(extraerMensajeError(err));
      },
    });
  }

  anularDeuda(d: DeudaDetalleDto): void {
    this.procesando.set(true);
    this.feedbackError.set('');
    this.feedbackExito.set('');

    this.circulacionApi.anularDeuda(d.idDeuda).subscribe({
      next: () => {
        this.procesando.set(false);
        this.feedbackExito.set(`Deuda #${d.idDeuda} condonada / anulada.`);
        if (this.deudaSeleccionada()?.idDeuda === d.idDeuda) {
          this.deudaSeleccionada.set(null);
        }
        this.cargarDatos();
      },
      error: (err) => {
        this.procesando.set(false);
        this.feedbackError.set(extraerMensajeError(err));
      },
    });
  }

  onPageChange(e: PageEvent): void {
    this.pageIndex.set(e.pageIndex);
  }
}
