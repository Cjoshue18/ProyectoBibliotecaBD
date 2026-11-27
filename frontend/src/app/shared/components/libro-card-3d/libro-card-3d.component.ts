import { Component, computed, input, output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { LibroCatalogoDto } from '../../../core/models/biblioteca.models';
import { contarEjemplaresLibro, obtenerAutoresTexto } from '../../utils/catalogo.helpers';

@Component({
  selector: 'app-libro-card-3d',
  imports: [MatIconModule],
  templateUrl: './libro-card-3d.component.html',
  styleUrl: './libro-card-3d.component.css',
})
export class LibroCard3dComponent {
  readonly libro = input.required<LibroCatalogoDto>();
  readonly seleccionar = output<LibroCatalogoDto>();

  readonly resumen = computed(() => contarEjemplaresLibro(this.libro()));
  readonly autoresTexto = computed(() => obtenerAutoresTexto(this.libro()));

  onClick(): void {
    this.seleccionar.emit(this.libro());
  }
}
