import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { ActivatedRoute } from '@angular/router';
import { forkJoin } from 'rxjs';
import { FacultadDto, LibroCatalogoDto } from '../../core/models/biblioteca.models';
import { CatalogoApiService } from '../../core/services/catalogo-api.service';
import { FichaLibroDialogComponent } from '../../shared/components/ficha-libro-dialog/ficha-libro-dialog.component';
import { LibroCard3dComponent } from '../../shared/components/libro-card-3d/libro-card-3d.component';
import { contarEjemplaresLibro, obtenerAutoresTexto } from '../../shared/utils/catalogo.helpers';

@Component({
  selector: 'app-catalogo',
  imports: [FormsModule, MatCheckboxModule, MatPaginatorModule, LibroCard3dComponent],
  templateUrl: './catalogo.component.html',
  styleUrl: './catalogo.component.css',
})
export class CatalogoComponent implements OnInit {
  private readonly catalogoApi = inject(CatalogoApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly dialog = inject(MatDialog);

  readonly libros = signal<LibroCatalogoDto[]>([]);
  readonly facultades = signal<FacultadDto[]>([]);
  readonly busqueda = signal('');
  readonly soloDisponibles = signal(false);
  readonly facultadesSeleccionadas = signal<Set<number>>(new Set());
  readonly pageIndex = signal(0);
  readonly pageSize = signal(6);
  readonly cargando = signal(true);

  readonly filtrados = computed(() => {
    const q = this.busqueda().trim().toLowerCase();
    const soloDisp = this.soloDisponibles();
    const facs = this.facultadesSeleccionadas();

    return this.libros().filter((libro) => {
      if (q) {
        const matchTitulo = libro.titulo.toLowerCase().includes(q);
        const matchAutor = obtenerAutoresTexto(libro).toLowerCase().includes(q);
        const matchIsbn = libro.ediciones.some((ed) => ed.isbn.toLowerCase().includes(q));
        if (!matchTitulo && !matchAutor && !matchIsbn) return false;
      }

      if (soloDisp && contarEjemplaresLibro(libro).disponibles === 0) {
        return false;
      }

      if (facs.size > 0) {
        const tieneFacultad = libro.ediciones.some((ed) =>
          ed.ejemplares.some((ej) => facs.has(ej.idFacultad)),
        );
        if (!tieneFacultad) return false;
      }

      return true;
    });
  });

  readonly paginados = computed(() => {
    const start = this.pageIndex() * this.pageSize();
    return this.filtrados().slice(start, start + this.pageSize());
  });

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      if (params['q'] !== undefined) {
        this.busqueda.set(String(params['q']));
      }
      if (params['facultad']) {
        const idFac = Number(params['facultad']);
        if (!Number.isNaN(idFac) && idFac > 0) {
          this.facultadesSeleccionadas.set(new Set([idFac]));
        }
      }
      this.pageIndex.set(0);
    });

    forkJoin({
      libros: this.catalogoApi.listarLibros(),
      facultades: this.catalogoApi.listarFacultades(),
    }).subscribe({
      next: ({ libros, facultades }) => {
        this.libros.set(libros);
        this.facultades.set(facultades);
        this.cargando.set(false);
      },
      error: () => this.cargando.set(false),
    });
  }

  onBusquedaChange(valor: string): void {
    this.busqueda.set(valor);
    this.pageIndex.set(0);
  }

  onSoloDisponiblesChange(checked: boolean): void {
    this.soloDisponibles.set(checked);
    this.pageIndex.set(0);
  }

  toggleFacultad(idFacultad: number, checked: boolean): void {
    const siguiente = new Set(this.facultadesSeleccionadas());
    if (checked) {
      siguiente.add(idFacultad);
    } else {
      siguiente.delete(idFacultad);
    }
    this.facultadesSeleccionadas.set(siguiente);
    this.pageIndex.set(0);
  }

  limpiarFiltros(): void {
    this.busqueda.set('');
    this.soloDisponibles.set(false);
    this.facultadesSeleccionadas.set(new Set());
    this.pageIndex.set(0);
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
  }

  abrirFicha(libro: LibroCatalogoDto): void {
    this.dialog.open(FichaLibroDialogComponent, {
      data: libro,
      width: '720px',
      maxWidth: '95vw',
    });
  }
}
