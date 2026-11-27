import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { AutorDto } from '../../core/models/biblioteca.models';

export interface AutorPickerDialogData {
  autores: AutorDto[];
  seleccionadosIds: number[];
}

export interface AutorPickerDialogResult {
  seleccionadosIds: number[];
  irACrearAutor: boolean;
}

@Component({
  selector: 'app-autor-picker-dialog',
  imports: [FormsModule, MatDialogModule, MatTableModule, MatPaginatorModule],
  templateUrl: './autor-picker-dialog.component.html',
  styleUrl: './autor-picker-dialog.component.css',
})
export class AutorPickerDialogComponent {
  readonly data = inject<AutorPickerDialogData>(MAT_DIALOG_DATA);
  private readonly dialogRef = inject(
    MatDialogRef<AutorPickerDialogComponent, AutorPickerDialogResult>,
  );

  readonly seleccionados = signal<Set<number>>(new Set(this.data.seleccionadosIds));
  readonly busqueda = signal('');
  readonly pageIndex = signal(0);

  readonly columnas = ['nombreAutor', 'accion'];

  readonly filtrados = computed(() => {
    const q = this.busqueda().trim().toLowerCase();
    return this.data.autores.filter((a) => !q || a.nombreAutor.toLowerCase().includes(q));
  });

  readonly paginados = computed(() => {
    const start = this.pageIndex() * 6;
    return this.filtrados().slice(start, start + 6);
  });

  onBusquedaChange(val: string): void {
    this.busqueda.set(val);
    this.pageIndex.set(0);
  }

  toggleAutor(idAutor: number): void {
    const next = new Set(this.seleccionados());
    if (next.has(idAutor)) next.delete(idAutor);
    else next.add(idAutor);
    this.seleccionados.set(next);
  }

  confirmar(): void {
    this.dialogRef.close({
      seleccionadosIds: [...this.seleccionados()],
      irACrearAutor: false,
    });
  }

  irACrearAutor(): void {
    this.dialogRef.close({
      seleccionadosIds: [...this.seleccionados()],
      irACrearAutor: true,
    });
  }

  onPageChange(e: PageEvent): void {
    this.pageIndex.set(e.pageIndex);
  }
}
