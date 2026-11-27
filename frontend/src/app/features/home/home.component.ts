import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { FacultadDto, LibroCatalogoDto } from '../../core/models/biblioteca.models';
import { CatalogoApiService } from '../../core/services/catalogo-api.service';
import { FichaLibroDialogComponent } from '../../shared/components/ficha-libro-dialog/ficha-libro-dialog.component';
import { LibroCard3dComponent } from '../../shared/components/libro-card-3d/libro-card-3d.component';
import {
  contarEjemplaresLibro,
  obtenerAutoresTexto,
  obtenerImagenFacultad,
} from '../../shared/utils/catalogo.helpers';

interface LibroTopFacultad {
  libro: LibroCatalogoDto;
  autores: string;
  disponibles: number;
  total: number;
}

@Component({
  selector: 'app-home',
  imports: [LibroCard3dComponent, MatIconModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent implements OnInit {
  private readonly catalogoApi = inject(CatalogoApiService);
  private readonly dialog = inject(MatDialog);
  private readonly router = inject(Router);

  readonly libros = signal<LibroCatalogoDto[]>([]);
  readonly facultades = signal<FacultadDto[]>([]);
  readonly facultadIdx = signal(0);
  readonly cargando = signal(true);
  readonly errorCarga = signal('');

  readonly destacados = computed(() => this.libros().slice(0, 5));

  readonly facultadActual = computed(() => {
    const facs = this.facultades();
    if (!facs.length) return null;
    return facs[this.facultadIdx() % facs.length];
  });

  readonly fondoFacultadActual = computed(() => {
    const fac = this.facultadActual();
    if (!fac) return '';
    return `linear-gradient(150deg, rgba(14,36,47,0.82), rgba(25,66,87,0.72)), url('${obtenerImagenFacultad(fac.nombreFacultad)}') center/cover`;
  });

  readonly topLibrosFacultad = computed<LibroTopFacultad[]>(() => {
    const fac = this.facultadActual();
    if (!fac) return [];

    return this.libros()
      .filter((l) =>
        l.ediciones.some((ed) => ed.ejemplares.some((ej) => ej.idFacultad === fac.idFacultad)),
      )
      .slice(0, 4)
      .map((l) => {
        let total = 0;
        let disponibles = 0;
        for (const ed of l.ediciones) {
          for (const ej of ed.ejemplares) {
            if (ej.idFacultad === fac.idFacultad) {
              total++;
              if (ej.disponible && ej.tipoEstadoFisico !== 'En Reparacion') {
                disponibles++;
              }
            }
          }
        }
        if (total === 0) {
          const calc = contarEjemplaresLibro(l);
          total = calc.total;
          disponibles = calc.disponibles;
        }
        return {
          libro: l,
          autores: obtenerAutoresTexto(l),
          disponibles,
          total,
        };
      });
  });

  ngOnInit(): void {
    forkJoin({
      libros: this.catalogoApi.listarLibros(),
      facultades: this.catalogoApi.listarFacultades(),
    }).subscribe({
      next: ({ libros, facultades }) => {
        this.libros.set(libros);
        this.facultades.set(facultades);
        this.cargando.set(false);
      },
      error: () => {
        this.errorCarga.set('No se pudo cargar el catálogo bibliográfico.');
        this.cargando.set(false);
      },
    });
  }

  cambiarFacultad(delta: number): void {
    const total = this.facultades().length;
    if (!total) return;
    this.facultadIdx.update((i) => (i + delta + total) % total);
  }

  seleccionarFacultad(idx: number): void {
    this.facultadIdx.set(idx);
  }

  verCatalogoDeFacultad(): void {
    const fac = this.facultadActual();
    if (!fac) return;
    this.router.navigate(['/catalogo'], { queryParams: { facultad: fac.idFacultad } });
  }

  abrirFicha(libro: LibroCatalogoDto): void {
    this.dialog.open(FichaLibroDialogComponent, {
      data: libro,
      width: '720px',
      maxWidth: '95vw',
    });
  }
}
