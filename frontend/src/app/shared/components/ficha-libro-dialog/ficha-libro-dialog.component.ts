import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { LibroCatalogoDto } from '../../../core/models/biblioteca.models';
import { AuthService } from '../../../core/services/auth.service';
import { obtenerAutoresTexto } from '../../utils/catalogo.helpers';

@Component({
  selector: 'app-ficha-libro-dialog',
  imports: [MatDialogModule, MatButtonModule],
  templateUrl: './ficha-libro-dialog.component.html',
  styleUrl: './ficha-libro-dialog.component.css',
})
export class FichaLibroDialogComponent {
  readonly libro = inject<LibroCatalogoDto>(MAT_DIALOG_DATA);
  private readonly dialogRef = inject(MatDialogRef<FichaLibroDialogComponent>);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  get autoresTexto(): string {
    return obtenerAutoresTexto(this.libro);
  }

  prestarEjemplar(isbn: string, numeroCopia: number): void {
    this.auth.establecerPendientePrestar({
      isbn,
      numeroCopia,
      tituloLibro: this.libro.titulo,
    });
    this.dialogRef.close();
    if (this.auth.esEncargado()) {
      this.router.navigate(['/encargado/registrar-prestamo']);
    } else {
      this.router.navigate(['/login'], { queryParams: { modo: 'encargado' } });
    }
  }
}
