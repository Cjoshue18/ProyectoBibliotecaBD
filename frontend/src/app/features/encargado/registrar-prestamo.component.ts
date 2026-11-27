import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { forkJoin } from 'rxjs';
import {
  EjemplarSeleccionado,
  LectorResumenDto,
  LibroCatalogoDto,
  extraerMensajeError,
} from '../../core/models/biblioteca.models';
import { AuthService } from '../../core/services/auth.service';
import { CatalogoApiService } from '../../core/services/catalogo-api.service';
import { CirculacionApiService } from '../../core/services/circulacion-api.service';
import { LectorApiService } from '../../core/services/lector-api.service';

interface EjemplarBuscable {
  isbn: string;
  numeroCopia: number;
  tituloLibro: string;
  nombreFacultad: string;
  tipoEstadoFisico: string;
  disponible: boolean;
}

@Component({
  selector: 'app-registrar-prestamo',
  imports: [
    FormsModule,
    MatExpansionModule,
    MatTabsModule,
    MatTableModule,
    MatPaginatorModule,
    MatIconModule,
  ],
  templateUrl: './registrar-prestamo.component.html',
  styleUrl: './registrar-prestamo.component.css',
})
export class RegistrarPrestamoComponent implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly lectorApi = inject(LectorApiService);
  private readonly catalogoApi = inject(CatalogoApiService);
  private readonly circulacionApi = inject(CirculacionApiService);

  readonly lectores = signal<LectorResumenDto[]>([]);
  readonly libros = signal<LibroCatalogoDto[]>([]);

  readonly lectorSeleccionado = signal<LectorResumenDto | null>(null);
  readonly ejemplarSeleccionado = signal<EjemplarSeleccionado | null>(null);
  tipoPrestamo: 'Domicilio' | 'Sala' = 'Domicilio';

  readonly step1Open = signal(true);
  readonly step2Open = signal(false);
  readonly step3Open = signal(false);

  tipoIdBusqueda: 'codigo' | 'dni' = 'codigo';
  valorIdBusqueda = '';
  readonly filtroNombreLector = signal('');
  readonly lectorPageIndex = signal(0);

  readonly filtroEjemplar = signal('');
  readonly ejemplarPageIndex = signal(0);

  readonly procesando = signal(false);
  readonly feedbackExito = signal('');
  readonly feedbackError = signal('');

  readonly colsLectores = ['nombreCompleto', 'identificacion', 'estadoLector', 'accion'];
  readonly colsEjemplares = ['tituloLibro', 'isbnCopia', 'facultad', 'estado', 'accion'];

  readonly lectoresFiltrados = computed(() => {
    const q = this.filtroNombreLector().trim().toLowerCase();
    return this.lectores().filter(
      (l) =>
        !q ||
        l.nombreCompleto.toLowerCase().includes(q) ||
        l.numeroDoc.includes(q) ||
        (l.codigoAlumno && l.codigoAlumno.includes(q)),
    );
  });

  readonly lectoresPaginados = computed(() => {
    const start = this.lectorPageIndex() * 5;
    return this.lectoresFiltrados().slice(start, start + 5);
  });

  readonly ejemplaresDisponibles = computed<EjemplarBuscable[]>(() => {
    const q = this.filtroEjemplar().trim().toLowerCase();
    const lista: EjemplarBuscable[] = [];
    for (const libro of this.libros()) {
      for (const ed of libro.ediciones) {
        for (const ej of ed.ejemplares) {
          if (!ej.disponible || ej.tipoEstadoFisico === 'En Reparacion') continue;
          if (
            q &&
            !libro.titulo.toLowerCase().includes(q) &&
            !ed.isbn.toLowerCase().includes(q)
          ) {
            continue;
          }
          lista.push({
            isbn: ed.isbn,
            numeroCopia: ej.numeroCopia,
            tituloLibro: libro.titulo,
            nombreFacultad: ej.nombreFacultad,
            tipoEstadoFisico: ej.tipoEstadoFisico,
            disponible: ej.disponible,
          });
        }
      }
    }
    return lista;
  });

  readonly ejemplaresPaginados = computed(() => {
    const start = this.ejemplarPageIndex() * 5;
    return this.ejemplaresDisponibles().slice(start, start + 5);
  });

  ngOnInit(): void {
    const pendiente = this.auth.consumirPendientePrestar();
    if (pendiente) {
      this.ejemplarSeleccionado.set(pendiente);
    }
    this.cargarCatalogos();
  }

  private cargarCatalogos(): void {
    forkJoin({
      lectores: this.lectorApi.listar(),
      libros: this.catalogoApi.listarLibros(),
    }).subscribe({
      next: ({ lectores, libros }) => {
        this.lectores.set(lectores);
        this.libros.set(libros);
      },
      error: (err) => this.feedbackError.set(extraerMensajeError(err)),
    });
  }

  validarPorCodigo(): void {
    const val = this.valorIdBusqueda.trim();
    if (!val) {
      this.feedbackError.set('Ingresa un código de alumno o número de documento.');
      return;
    }

    const encontrado = this.lectores().find((l) =>
      this.tipoIdBusqueda === 'codigo' ? l.codigoAlumno === val : l.numeroDoc === val,
    );

    if (!encontrado) {
      this.feedbackError.set('No se encontró ningún lector con esa identificación.');
      return;
    }

    this.elegirLector(encontrado);
  }

  elegirLector(lector: LectorResumenDto): void {
    this.feedbackError.set('');
    this.feedbackExito.set('');
    if (lector.estadoLector !== 'Activo') {
      this.feedbackError.set(
        `El lector ${lector.nombreCompleto} figura como ${lector.estadoLector} y no puede recibir préstamos.`,
      );
      return;
    }

    this.lectorSeleccionado.set(lector);
    this.step1Open.set(false);
    if (this.ejemplarSeleccionado()) {
      this.step2Open.set(false);
      this.step3Open.set(true);
    } else {
      this.step2Open.set(true);
      this.step3Open.set(false);
    }
  }

  elegirEjemplar(item: EjemplarBuscable): void {
    this.feedbackError.set('');
    this.ejemplarSeleccionado.set({
      isbn: item.isbn,
      numeroCopia: item.numeroCopia,
      tituloLibro: item.tituloLibro,
    });
    this.step2Open.set(false);
    this.step3Open.set(true);
  }

  confirmarPrestamo(): void {
    const lector = this.lectorSeleccionado();
    const ej = this.ejemplarSeleccionado();
    if (!lector || !ej) return;

    this.procesando.set(true);
    this.feedbackError.set('');
    this.feedbackExito.set('');

    this.circulacionApi
      .registrarPrestamo({
        idLector: lector.idLector,
        isbn: ej.isbn,
        numeroCopia: ej.numeroCopia,
        tipoPrestamo: this.tipoPrestamo,
      })
      .subscribe({
        next: () => {
          this.procesando.set(false);
          this.feedbackExito.set(
            `Préstamo (${this.tipoPrestamo}) registrado para ${lector.nombreCompleto} (${ej.tituloLibro}, copia #${ej.numeroCopia}).`,
          );
          this.reiniciar(false);
          this.cargarCatalogos();
        },
        error: (err) => {
          this.procesando.set(false);
          this.feedbackError.set(extraerMensajeError(err));
        },
      });
  }

  reiniciar(limpiarMensajes = true): void {
    this.lectorSeleccionado.set(null);
    this.ejemplarSeleccionado.set(null);
    this.valorIdBusqueda = '';
    this.step1Open.set(true);
    this.step2Open.set(false);
    this.step3Open.set(false);
    if (limpiarMensajes) {
      this.feedbackExito.set('');
      this.feedbackError.set('');
    }
  }

  onFiltroNombreChange(val: string): void {
    this.filtroNombreLector.set(val);
    this.lectorPageIndex.set(0);
  }

  onFiltroEjemplarChange(val: string): void {
    this.filtroEjemplar.set(val);
    this.ejemplarPageIndex.set(0);
  }

  onLectorPage(e: PageEvent): void {
    this.lectorPageIndex.set(e.pageIndex);
  }

  onEjemplarPage(e: PageEvent): void {
    this.ejemplarPageIndex.set(e.pageIndex);
  }
}
