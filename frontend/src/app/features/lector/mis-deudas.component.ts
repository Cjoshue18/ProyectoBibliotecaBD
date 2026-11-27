import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { DeudaDetalleDto, PagoDto, extraerMensajeError } from '../../core/models/biblioteca.models';
import { AuthService } from '../../core/services/auth.service';
import { CirculacionApiService } from '../../core/services/circulacion-api.service';

@Component({
  selector: 'app-mis-deudas',
  imports: [FormsModule, MatTableModule, MatPaginatorModule, CurrencyPipe, DatePipe],
  templateUrl: './mis-deudas.component.html',
})
export class MisDeudasComponent implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly circulacionApi = inject(CirculacionApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly deudas = signal<DeudaDetalleDto[]>([]);
  readonly pagos = signal<PagoDto[]>([]);
  readonly busqueda = signal('');
  readonly filtroIdDeuda = signal<number | null>(null);
  readonly pageIndex = signal(0);
  readonly pageSize = signal(5);
  readonly cargando = signal(true);
  readonly errorMensaje = signal('');

  readonly columnas = [
    'idDeuda',
    'tituloLibro',
    'montoCalculado',
    'fechaFinSuspension',
    'estadoDeuda',
    'trazabilidad',
  ];

  readonly idsConPago = computed(() => new Set(this.pagos().map((pg) => pg.idDeuda)));

  readonly filtradas = computed(() => {
    const q = this.busqueda().trim().toLowerCase();
    const idFiltro = this.filtroIdDeuda();
    return this.deudas().filter((d) => {
      if (idFiltro !== null && d.idDeuda !== idFiltro) return false;
      if (!q) return true;
      return (
        d.tituloLibro.toLowerCase().includes(q) ||
        d.estadoDeuda.toLowerCase().includes(q) ||
        String(d.idDeuda).includes(q)
      );
    });
  });

  readonly paginadas = computed(() => {
    const start = this.pageIndex() * this.pageSize();
    return this.filtradas().slice(start, start + this.pageSize());
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
      deudas: this.circulacionApi.listarDeudas(idLector),
      pagos: this.circulacionApi.listarPagos(idLector),
    }).subscribe({
      next: ({ deudas, pagos }) => {
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

  onBusquedaChange(valor: string): void {
    this.busqueda.set(valor);
    this.pageIndex.set(0);
  }

  quitarFiltro(): void {
    this.router.navigate([], { relativeTo: this.route, queryParams: {} });
  }

  verPrestamo(idPrestamo: number): void {
    this.router.navigate(['/lector/prestamos'], { queryParams: { idPrestamo } });
  }

  verPago(idDeuda: number): void {
    this.router.navigate(['/lector/comprobantes'], { queryParams: { idDeuda } });
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
  }
}
