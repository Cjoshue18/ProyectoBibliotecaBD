import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { DeudaDetalleDto, PagoDto, extraerMensajeError } from '../../core/models/biblioteca.models';
import { AuthService } from '../../core/services/auth.service';
import { CirculacionApiService } from '../../core/services/circulacion-api.service';
import { ComprobanteDialogComponent } from '../../shared/components/comprobante-dialog/comprobante-dialog.component';

interface PagoConLibro {
  pago: PagoDto;
  deuda: DeudaDetalleDto | null;
  tituloLibro: string;
}

@Component({
  selector: 'app-mis-comprobantes',
  imports: [FormsModule, MatTableModule, MatPaginatorModule, CurrencyPipe, DatePipe],
  templateUrl: './mis-comprobantes.component.html',
})
export class MisComprobantesComponent implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly circulacionApi = inject(CirculacionApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);

  readonly pagos = signal<PagoDto[]>([]);
  readonly deudas = signal<DeudaDetalleDto[]>([]);
  readonly busqueda = signal('');
  readonly filtroIdDeuda = signal<number | null>(null);
  readonly pageIndex = signal(0);
  readonly pageSize = signal(5);
  readonly cargando = signal(true);
  readonly errorMensaje = signal('');

  readonly columnas = ['numeroRecibo', 'fechaPago', 'montoPagado', 'tituloLibro', 'acciones'];

  readonly registros = computed<PagoConLibro[]>(() => {
    const mapaDeudas = new Map(this.deudas().map((d) => [d.idDeuda, d]));
    return this.pagos().map((pago) => {
      const deuda = mapaDeudas.get(pago.idDeuda) ?? null;
      return {
        pago,
        deuda,
        tituloLibro: deuda?.tituloLibro ?? `Deuda #${pago.idDeuda}`,
      };
    });
  });

  readonly filtrados = computed(() => {
    const q = this.busqueda().trim().toLowerCase();
    const idFiltro = this.filtroIdDeuda();
    return this.registros().filter((r) => {
      if (idFiltro !== null && r.pago.idDeuda !== idFiltro) return false;
      if (!q) return true;
      return (
        r.pago.numeroRecibo.toLowerCase().includes(q) ||
        r.tituloLibro.toLowerCase().includes(q)
      );
    });
  });

  readonly paginados = computed(() => {
    const start = this.pageIndex() * this.pageSize();
    return this.filtrados().slice(start, start + this.pageSize());
  });

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      const id = params['idDeuda'] ? Number(params['idDeuda']) : null;
      this.filtroIdDeuda.set(id && !Number.isNaN(id) ? id : null);
      this.pageIndex.set(0);
    });

    const idLector = this.auth.session()?.idLector;
    if (!idLector) {
      this.cargando.set(false);
      return;
    }

    forkJoin({
      pagos: this.circulacionApi.listarPagos(idLector),
      deudas: this.circulacionApi.listarDeudas(idLector),
    }).subscribe({
      next: ({ pagos, deudas }) => {
        this.pagos.set(pagos);
        this.deudas.set(deudas);
        this.cargando.set(false);
      },
      error: (err) => {
        this.errorMensaje.set(extraerMensajeError(err));
        this.cargando.set(false);
      },
    });
  }

  onBusquedaChange(valor: string): void {
    this.busqueda.set(valor);
    this.pageIndex.set(0);
  }

  quitarFiltro(): void {
    this.router.navigate([], { relativeTo: this.route, queryParams: {} });
  }

  verComprobante(item: PagoConLibro): void {
    this.dialog.open(ComprobanteDialogComponent, {
      data: {
        pago: item.pago,
        tituloLibro: item.tituloLibro,
        nombreLector: item.deuda?.nombreLector,
        diasRetraso: item.deuda?.diasRetraso,
        tarifaDiaria: item.deuda?.tarifaDiaria,
      },
      width: '620px',
      maxWidth: '95vw',
    });
  }

  verDeudaOrigen(idDeuda: number): void {
    this.router.navigate(['/lector/deudas'], { queryParams: { idDeuda } });
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
  }
}
