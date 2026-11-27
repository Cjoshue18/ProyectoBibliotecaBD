import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { forkJoin } from 'rxjs';
import { AutorDto, EditorialDto, extraerMensajeError } from '../../core/models/biblioteca.models';
import { CatalogoApiService } from '../../core/services/catalogo-api.service';

@Component({
  selector: 'app-gestion-autores-editoriales',
  imports: [FormsModule, MatTableModule, MatPaginatorModule],
  templateUrl: './gestion-autores-editoriales.component.html',
})
export class GestionAutoresEditorialesComponent implements OnInit {
  private readonly catalogoApi = inject(CatalogoApiService);

  readonly autores = signal<AutorDto[]>([]);
  readonly editoriales = signal<EditorialDto[]>([]);

  nuevoAutorNombre = '';
  readonly filtroAutores = signal('');
  readonly autorPageIndex = signal(0);

  nuevaEdNombre = '';
  nuevaEdPais = '';
  readonly filtroEditoriales = signal('');
  readonly edPageIndex = signal(0);

  readonly procesando = signal(false);
  readonly feedbackExito = signal('');
  readonly feedbackError = signal('');

  readonly colsAutores = ['idAutor', 'nombreAutor'];
  readonly colsEditoriales = ['idEditorial', 'nombreEditorial', 'paisOrigen'];

  readonly autoresFiltrados = computed(() => {
    const q = this.filtroAutores().trim().toLowerCase();
    return this.autores().filter((a) => !q || a.nombreAutor.toLowerCase().includes(q));
  });

  readonly autoresPaginados = computed(() => {
    const start = this.autorPageIndex() * 6;
    return this.autoresFiltrados().slice(start, start + 6);
  });

  readonly editorialesFiltradas = computed(() => {
    const q = this.filtroEditoriales().trim().toLowerCase();
    return this.editoriales().filter(
      (e) =>
        !q ||
        e.nombreEditorial.toLowerCase().includes(q) ||
        e.paisOrigen.toLowerCase().includes(q),
    );
  });

  readonly editorialesPaginadas = computed(() => {
    const start = this.edPageIndex() * 6;
    return this.editorialesFiltradas().slice(start, start + 6);
  });

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    forkJoin({
      autores: this.catalogoApi.listarAutores(),
      editoriales: this.catalogoApi.listarEditoriales(),
    }).subscribe({
      next: ({ autores, editoriales }) => {
        this.autores.set(autores);
        this.editoriales.set(editoriales);
      },
      error: (err) => this.feedbackError.set(extraerMensajeError(err)),
    });
  }

  registrarAutor(): void {
    const nom = this.nuevoAutorNombre.trim();
    if (!nom) {
      this.feedbackError.set('Ingresa el nombre del autor.');
      return;
    }

    this.procesando.set(true);
    this.feedbackExito.set('');
    this.feedbackError.set('');
    this.catalogoApi.crearAutor(nom).subscribe({
      next: (a) => {
        this.procesando.set(false);
        this.feedbackExito.set(`Autor '${a.nombreAutor}' registrado.`);
        this.nuevoAutorNombre = '';
        this.cargar();
      },
      error: (err) => {
        this.procesando.set(false);
        this.feedbackError.set(extraerMensajeError(err));
      },
    });
  }

  registrarEditorial(): void {
    const nom = this.nuevaEdNombre.trim();
    const pais = this.nuevaEdPais.trim();
    if (!nom || !pais) {
      this.feedbackError.set('Ingresa el nombre de la editorial y su país de origen.');
      return;
    }

    this.procesando.set(true);
    this.feedbackExito.set('');
    this.feedbackError.set('');
    this.catalogoApi.crearEditorial(nom, pais).subscribe({
      next: (ed) => {
        this.procesando.set(false);
        this.feedbackExito.set(`Editorial '${ed.nombreEditorial}' registrada.`);
        this.nuevaEdNombre = '';
        this.nuevaEdPais = '';
        this.cargar();
      },
      error: (err) => {
        this.procesando.set(false);
        this.feedbackError.set(extraerMensajeError(err));
      },
    });
  }

  onFiltroAutorChange(val: string): void {
    this.filtroAutores.set(val);
    this.autorPageIndex.set(0);
  }

  onFiltroEditorialChange(val: string): void {
    this.filtroEditoriales.set(val);
    this.edPageIndex.set(0);
  }

  onAutorPage(e: PageEvent): void {
    this.autorPageIndex.set(e.pageIndex);
  }

  onEdPage(e: PageEvent): void {
    this.edPageIndex.set(e.pageIndex);
  }
}
