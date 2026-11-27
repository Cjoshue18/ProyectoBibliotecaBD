import { DatePipe } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { PrestamoDetalleDto, extraerMensajeError } from '../../core/models/biblioteca.models';
import { AuthService } from '../../core/services/auth.service';
import { CirculacionApiService } from '../../core/services/circulacion-api.service';

@Component({
  selector: 'app-mis-prestamos',
  imports: [FormsModule, MatTableModule, MatPaginatorModule, DatePipe],
  templateUrl: './mis-prestamos.component.html',
})
export class MisPrestamosComponent implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly circulacionApi = inject(CirculacionApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly prestamos = signal<PrestamoDetalleDto[]>([]);
  readonly busqueda = signal('');
  readonly filtroIdPrestamo = signal<number | null>(null);
  readonly pageIndex = signal(0);
  readonly pageSize = signal(5);
  readonly cargando = signal(true);
  readonly errorMensaje = signal('');

  readonly columnas = [
    'idPrestamo',
    'tituloLibro',
    'isbnCopia',
    'tipoPrestamo',
    'fechaPrestamo',
    'fechaVencimiento',
    'fechaDevolucionReal',
    'estado',
  ];

  readonly filtrados = computed(() => {
    const q = this.busqueda().trim().toLowerCase();
    const idFiltro = this.filtroIdPrestamo();
    return this.prestamos().filter((p) => {
      if (idFiltro !== null && p.idPrestamo !== idFiltro) return false;
      if (!q) return true;
      return (
        p.tituloLibro.toLowerCase().includes(q) ||
        p.isbn.toLowerCase().includes(q) ||
        p.tipoPrestamo.toLowerCase().includes(q) ||
        String(p.idPrestamo).includes(q)
      );
    });
  });

  readonly paginados = computed(() => {
    const start = this.pageIndex() * this.pageSize();
    return this.filtrados().slice(start, start + this.pageSize());
  });

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      const id = params['idPrestamo'] ? Number(params['idPrestamo']) : null;
      this.filtroIdPrestamo.set(id && !Number.isNaN(id) ? id : null);
      this.pageIndex.set(0);
    });

    const idLector = this.auth.session()?.idLector;
    if (!idLector) {
      this.cargando.set(false);
      return;
    }

    this.circulacionApi.listarPrestamos(undefined, idLector).subscribe({
      next: (lista) => {
        this.prestamos.set(lista);
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

  onPageChange(event: PageEvent): void {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
  }
}
