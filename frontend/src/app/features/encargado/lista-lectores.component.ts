import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { forkJoin } from 'rxjs';
import {
  FacultadDto,
  LectorResumenDto,
  extraerMensajeError,
} from '../../core/models/biblioteca.models';
import { CatalogoApiService } from '../../core/services/catalogo-api.service';
import { LectorApiService } from '../../core/services/lector-api.service';

@Component({
  selector: 'app-lista-lectores',
  imports: [FormsModule, MatTableModule, MatPaginatorModule, MatTabsModule],
  templateUrl: './lista-lectores.component.html',
})
export class ListaLectoresComponent implements OnInit {
  private readonly lectorApi = inject(LectorApiService);
  private readonly catalogoApi = inject(CatalogoApiService);

  readonly lectores = signal<LectorResumenDto[]>([]);
  readonly facultades = signal<FacultadDto[]>([]);
  readonly busqueda = signal('');
  readonly pageIndex = signal(0);
  readonly pageSize = signal(6);
  readonly mostrarRegistro = signal(false);

  readonly cargando = signal(true);
  readonly procesando = signal(false);
  readonly feedbackExito = signal('');
  readonly feedbackError = signal('');

  readonly columnas = ['idLector', 'nombreCompleto', 'docCodigo', 'tipoLector', 'nombreFacultad', 'estado', 'accion'];

  // Formulario Alumno
  aluTipoDoc = 'DNI';
  aluNumeroDoc = '';
  aluNombres = '';
  aluApellidoPaterno = '';
  aluApellidoMaterno = '';
  aluCorreo = '';
  aluIdFacultad = 1;
  aluCodigo = '';
  aluCiclo = 5;

  // Formulario Docente
  docTipoDoc = 'DNI';
  docNumeroDoc = '';
  docNombres = '';
  docApellidoPaterno = '';
  docApellidoMaterno = '';
  docCorreo = '';
  docIdFacultad = 1;
  docCategoria = 'Auxiliar';

  readonly filtrados = computed(() => {
    const q = this.busqueda().trim().toLowerCase();
    return this.lectores().filter(
      (l) =>
        !q ||
        l.nombreCompleto.toLowerCase().includes(q) ||
        l.numeroDoc.toLowerCase().includes(q) ||
        (l.codigoAlumno && l.codigoAlumno.toLowerCase().includes(q)),
    );
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
      lectores: this.lectorApi.listar(),
      facultades: this.catalogoApi.listarFacultades(),
    }).subscribe({
      next: ({ lectores, facultades }) => {
        this.lectores.set(lectores);
        this.facultades.set(facultades);
        if (facultades.length && !this.aluIdFacultad) {
          this.aluIdFacultad = facultades[0].idFacultad;
          this.docIdFacultad = facultades[0].idFacultad;
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

  alternarEstado(l: LectorResumenDto): void {
    const nuevoEstado = l.estadoLector === 'Activo' ? 'Inactivo' : 'Activo';
    this.procesando.set(true);
    this.feedbackExito.set('');
    this.feedbackError.set('');

    this.lectorApi.cambiarEstado(l.idLector, nuevoEstado).subscribe({
      next: () => {
        this.procesando.set(false);
        this.feedbackExito.set(`Estado de ${l.nombreCompleto} actualizado a ${nuevoEstado}.`);
        this.cargar();
      },
      error: (err) => {
        this.procesando.set(false);
        this.feedbackError.set(extraerMensajeError(err));
      },
    });
  }

  registrarAlumno(): void {
    this.procesando.set(true);
    this.feedbackExito.set('');
    this.feedbackError.set('');

    this.lectorApi
      .registrarAlumno({
        tipoDoc: this.aluTipoDoc,
        numeroDoc: this.aluNumeroDoc.trim(),
        nombres: this.aluNombres.trim(),
        apellidoPaterno: this.aluApellidoPaterno.trim(),
        apellidoMaterno: this.aluApellidoMaterno.trim() || null,
        correoInstitucional: this.aluCorreo.trim(),
        idFacultad: Number(this.aluIdFacultad),
        codigoAlumno: this.aluCodigo.trim(),
        ciclo: Number(this.aluCiclo),
      })
      .subscribe({
        next: () => {
          this.procesando.set(false);
          this.feedbackExito.set(`Alumno ${this.aluNombres} ${this.aluApellidoPaterno} registrado.`);
          this.aluNumeroDoc = '';
          this.aluNombres = '';
          this.aluApellidoPaterno = '';
          this.aluApellidoMaterno = '';
          this.aluCorreo = '';
          this.aluCodigo = '';
          this.mostrarRegistro.set(false);
          this.cargar();
        },
        error: (err) => {
          this.procesando.set(false);
          this.feedbackError.set(extraerMensajeError(err));
        },
      });
  }

  registrarDocente(): void {
    this.procesando.set(true);
    this.feedbackExito.set('');
    this.feedbackError.set('');

    this.lectorApi
      .registrarDocente({
        tipoDoc: this.docTipoDoc,
        numeroDoc: this.docNumeroDoc.trim(),
        nombres: this.docNombres.trim(),
        apellidoPaterno: this.docApellidoPaterno.trim(),
        apellidoMaterno: this.docApellidoMaterno.trim() || null,
        correoInstitucional: this.docCorreo.trim(),
        idFacultad: Number(this.docIdFacultad),
        categoriaDocente: this.docCategoria,
      })
      .subscribe({
        next: () => {
          this.procesando.set(false);
          this.feedbackExito.set(`Docente ${this.docNombres} ${this.docApellidoPaterno} registrado.`);
          this.docNumeroDoc = '';
          this.docNombres = '';
          this.docApellidoPaterno = '';
          this.docApellidoMaterno = '';
          this.docCorreo = '';
          this.mostrarRegistro.set(false);
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
