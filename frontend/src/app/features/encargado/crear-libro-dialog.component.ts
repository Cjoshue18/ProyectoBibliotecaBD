import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { AutorDto, extraerMensajeError } from '../../core/models/biblioteca.models';
import { CatalogoApiService } from '../../core/services/catalogo-api.service';
import {
  AutorPickerDialogComponent,
  AutorPickerDialogResult,
} from './autor-picker-dialog.component';

export interface CrearLibroDialogData {
  autores: AutorDto[];
}

export interface CrearLibroDialogResult {
  creado?: boolean;
  irAAutores?: boolean;
}

@Component({
  selector: 'app-crear-libro-dialog',
  imports: [FormsModule, MatDialogModule, MatIconModule],
  templateUrl: './crear-libro-dialog.component.html',
  styleUrl: './crear-libro-dialog.component.css',
})
export class CrearLibroDialogComponent {
  readonly data = inject<CrearLibroDialogData>(MAT_DIALOG_DATA);
  private readonly dialogRef = inject(
    MatDialogRef<CrearLibroDialogComponent, CrearLibroDialogResult>,
  );
  private readonly dialog = inject(MatDialog);
  private readonly catalogoApi = inject(CatalogoApiService);

  titulo = '';
  readonly idsAutores = signal<number[]>([]);
  readonly guardando = signal(false);
  readonly errorMensaje = signal('');

  readonly autoresSeleccionados = computed(() => {
    const mapa = new Map(this.data.autores.map((a) => [a.idAutor, a]));
    return this.idsAutores()
      .map((id) => mapa.get(id))
      .filter((a): a is AutorDto => Boolean(a));
  });

  abrirMatchcodeAutores(): void {
    const ref = this.dialog.open<
      AutorPickerDialogComponent,
      { autores: AutorDto[]; seleccionadosIds: number[] },
      AutorPickerDialogResult
    >(AutorPickerDialogComponent, {
      data: {
        autores: this.data.autores,
        seleccionadosIds: this.idsAutores(),
      },
      width: '620px',
      maxWidth: '95vw',
    });

    ref.afterClosed().subscribe((res) => {
      if (!res) return;
      this.idsAutores.set(res.seleccionadosIds);
      if (res.irACrearAutor) {
        this.dialogRef.close({ irAAutores: true });
      }
    });
  }

  guardar(): void {
    const tit = this.titulo.trim();
    const ids = this.idsAutores();
    if (!tit || ids.length === 0) {
      this.errorMensaje.set('Ingresa el título del libro y selecciona al menos un autor.');
      return;
    }

    this.guardando.set(true);
    this.errorMensaje.set('');
    this.catalogoApi.crearLibro(tit, ids).subscribe({
      next: () => {
        this.guardando.set(false);
        this.dialogRef.close({ creado: true });
      },
      error: (err) => {
        this.guardando.set(false);
        this.errorMensaje.set(extraerMensajeError(err));
      },
    });
  }
}
