import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import {
  AutorDto,
  EditorialDto,
  FacultadDto,
  LibroCatalogoDto,
  extraerMensajeError,
} from '../../core/models/biblioteca.models';
import { CatalogoApiService } from '../../core/services/catalogo-api.service';
import { obtenerAutoresTexto } from '../../shared/utils/catalogo.helpers';
import {
  CrearLibroDialogComponent,
  CrearLibroDialogResult,
} from './crear-libro-dialog.component';

interface EjemplarGestionRow {
  idLibro: number;
  titulo: string;
  autores: string;
  isbn: string;
  numeroCopia: number;
  nombreFacultad: string;
  tipoEstadoFisico: string;
  disponible: boolean;
}

const TRANSICIONES_ESTADO: Record<string, string[]> = {
  Bueno: ['Regular', 'Dañado'],
  Regular: ['Dañado'],
  Dañado: ['En Reparacion'],
  'En Reparacion': ['Bueno', 'Regular'],
};

@Component({
  selector: 'app-gestion-catalogo',
  imports: [FormsModule, MatTableModule, MatPaginatorModule],
  templateUrl: './gestion-catalogo.component.html',
})
export class GestionCatalogoComponent implements OnInit {
  private readonly catalogoApi = inject(CatalogoApiService);
  private readonly dialog = inject(MatDialog);
  private readonly router = inject(Router);

  readonly libros = signal<LibroCatalogoDto[]>([]);
  readonly autores = signal<AutorDto[]>([]);
  readonly editoriales = signal<EditorialDto[]>([]);
  readonly facultades = signal<FacultadDto[]>([]);

  readonly busqueda = signal('');
  readonly pageIndex = signal(0);
  readonly pageSize = signal(6);

  readonly editandoLibro = signal<{ idLibro: number; titulo: string } | null>(null);
  readonly mostrarExtra = signal<'none' | 'edicion' | 'ejemplar'>('none');

  // Form nueva edición / nuevo ejemplar
  edIdLibro = 0;
  edIsbn = '';
  edNumero = 1;
  edAnio = new Date().getFullYear();
  edIdEditorial = 0;

  ejIsbn = '';
  ejNumeroCopia = 1;
  ejIdFacultad = 1;

  readonly cargando = signal(true);
  readonly procesando = signal(false);
  readonly feedbackExito = signal('');
  readonly feedbackError = signal('');

  readonly columnas = ['libro', 'isbnCopia', 'nombreFacultad', 'estado', 'acciones'];

  readonly filas = computed<EjemplarGestionRow[]>(() => {
    const q = this.busqueda().trim().toLowerCase();
    const out: EjemplarGestionRow[] = [];

    for (const libro of this.libros()) {
      const autoresTxt = obtenerAutoresTexto(libro);
      for (const ed of libro.ediciones) {
        for (const ej of ed.ejemplares) {
          if (
            q &&
            !libro.titulo.toLowerCase().includes(q) &&
            !autoresTxt.toLowerCase().includes(q) &&
            !ed.isbn.toLowerCase().includes(q)
          ) {
            continue;
          }
          out.push({
            idLibro: libro.idLibro,
            titulo: libro.titulo,
            autores: autoresTxt,
            isbn: ed.isbn,
            numeroCopia: ej.numeroCopia,
            nombreFacultad: ej.nombreFacultad,
            tipoEstadoFisico: ej.tipoEstadoFisico,
            disponible: ej.disponible,
          });
        }
      }
    }
    return out;
  });

  readonly paginadas = computed(() => {
    const start = this.pageIndex() * this.pageSize();
    return this.filas().slice(start, start + this.pageSize());
  });

  readonly edicionesPlanas = computed(() =>
    this.libros().flatMap((l) =>
      l.ediciones.map((ed) => ({ isbn: ed.isbn, label: `${l.titulo} — ISBN ${ed.isbn}` })),
    ),
  );

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.cargando.set(true);
    forkJoin({
      libros: this.catalogoApi.listarLibros(),
      autores: this.catalogoApi.listarAutores(),
      editoriales: this.catalogoApi.listarEditoriales(),
      facultades: this.catalogoApi.listarFacultades(),
    }).subscribe({
      next: ({ libros, autores, editoriales, facultades }) => {
        this.libros.set(libros);
        this.autores.set(autores);
        this.editoriales.set(editoriales);
        this.facultades.set(facultades);
        if (libros.length && !this.edIdLibro) this.edIdLibro = libros[0].idLibro;
        if (editoriales.length && !this.edIdEditorial) this.edIdEditorial = editoriales[0].idEditorial;
        if (facultades.length && !this.ejIdFacultad) this.ejIdFacultad = facultades[0].idFacultad;
        if (!this.ejIsbn && this.edicionesPlanas().length) {
          this.ejIsbn = this.edicionesPlanas()[0].isbn;
        }
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

  transicionesDisponibles(estadoActual: string): string[] {
    return TRANSICIONES_ESTADO[estadoActual] ?? [];
  }

  abrirCrearLibro(): void {
    const ref = this.dialog.open<
      CrearLibroDialogComponent,
      { autores: AutorDto[] },
      CrearLibroDialogResult
    >(CrearLibroDialogComponent, {
      data: { autores: this.autores() },
      width: '620px',
      maxWidth: '95vw',
    });

    ref.afterClosed().subscribe((res) => {
      if (res?.irAAutores) {
        this.router.navigate(['/encargado/autores-editoriales']);
        return;
      }
      if (res?.creado) {
        this.feedbackExito.set('Libro creado correctamente. Puedes agregarle una edición y copias.');
        this.cargar();
      }
    });
  }

  iniciarEdicionTitulo(row: EjemplarGestionRow): void {
    this.editandoLibro.set({ idLibro: row.idLibro, titulo: row.titulo });
    this.feedbackError.set('');
  }

  guardarTitulo(): void {
    const edit = this.editandoLibro();
    if (!edit || !edit.titulo.trim()) return;

    this.procesando.set(true);
    this.catalogoApi.actualizarLibro(edit.idLibro, edit.titulo.trim()).subscribe({
      next: () => {
        this.procesando.set(false);
        this.feedbackExito.set(`Título actualizado a '${edit.titulo.trim()}'.`);
        this.editandoLibro.set(null);
        this.cargar();
      },
      error: (err) => {
        this.procesando.set(false);
        this.feedbackError.set(extraerMensajeError(err));
      },
    });
  }

  cambiarEstado(row: EjemplarGestionRow, nuevoEstado: string): void {
    this.procesando.set(true);
    this.feedbackExito.set('');
    this.feedbackError.set('');

    this.catalogoApi.cambiarEstadoEjemplar(row.isbn, row.numeroCopia, nuevoEstado).subscribe({
      next: () => {
        this.procesando.set(false);
        this.feedbackExito.set(
          `Ejemplar ${row.isbn} (#${row.numeroCopia}) pasó a '${nuevoEstado}'.`,
        );
        this.cargar();
      },
      error: (err) => {
        this.procesando.set(false);
        this.feedbackError.set(extraerMensajeError(err));
      },
    });
  }

  registrarEdicion(): void {
    this.procesando.set(true);
    this.feedbackExito.set('');
    this.feedbackError.set('');

    this.catalogoApi
      .crearEdicion({
        isbn: this.edIsbn.trim(),
        numeroEdicion: Number(this.edNumero),
        anioPublicacion: Number(this.edAnio),
        idEditorial: Number(this.edIdEditorial),
        idLibro: Number(this.edIdLibro),
      })
      .subscribe({
        next: () => {
          this.procesando.set(false);
          this.feedbackExito.set(`Edición ISBN ${this.edIsbn.trim()} registrada.`);
          this.ejIsbn = this.edIsbn.trim();
          this.edIsbn = '';
          this.mostrarExtra.set('none');
          this.cargar();
        },
        error: (err) => {
          this.procesando.set(false);
          this.feedbackError.set(extraerMensajeError(err));
        },
      });
  }

  registrarEjemplar(): void {
    this.procesando.set(true);
    this.feedbackExito.set('');
    this.feedbackError.set('');

    this.catalogoApi
      .crearEjemplar({
        isbn: this.ejIsbn,
        numeroCopia: Number(this.ejNumeroCopia),
        idFacultad: Number(this.ejIdFacultad),
      })
      .subscribe({
        next: () => {
          this.procesando.set(false);
          this.feedbackExito.set(
            `Copia #${this.ejNumeroCopia} del ISBN ${this.ejIsbn} registrada.`,
          );
          this.mostrarExtra.set('none');
          this.cargar();
        },
        error: (err) => {
          this.procesando.set(false);
          this.feedbackError.set(extraerMensajeError(err));
        },
      });
  }

  onPageChange(e: PageEvent): void {
    this.pageIndex.set(e.pageIndex);
    this.pageSize.set(e.pageSize);
  }
}
