import { EdicionCatalogoDto, LibroCatalogoDto } from '../../core/models/biblioteca.models';

const FACULTAD_IMAGENES: Array<{ match: string; file: string }> = [
  { match: 'arquitectura', file: 'arquitectura.jpg' },
  { match: 'biolog', file: 'ciencias_biologicas.jpg' },
  { match: 'econ', file: 'ciencias_economicas.jpg' },
  { match: 'derecho', file: 'derecho.jpg' },
  { match: 'humanidad', file: 'humanidades.jpg' },
  { match: 'ingenier', file: 'ingenieria.jpg' },
  { match: 'medicina', file: 'medicina_humana.jpg' },
  { match: 'psicolog', file: 'psicologia.jpg' },
];

export function obtenerImagenFacultad(nombreFacultad: string): string {
  const normalizado = nombreFacultad
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
  const found = FACULTAD_IMAGENES.find((item) => normalizado.includes(item.match));
  return `assets/img/facultades/${found ? found.file : 'ingenieria.jpg'}`;
}

export function obtenerAutoresTexto(libro: LibroCatalogoDto): string {
  if (!libro.autores?.length) return 'Autor no registrado';
  return libro.autores.map((a) => a.nombreAutor).join(', ');
}

export interface ResumenLibroCalculado {
  total: number;
  disponibles: number;
  edicionPrincipal: EdicionCatalogoDto | null;
  facultadPrincipal: string;
}

export function contarEjemplaresLibro(libro: LibroCatalogoDto): ResumenLibroCalculado {
  const ediciones = libro.ediciones ?? [];
  let total = 0;
  let disponibles = 0;
  let facultadPrincipal = 'Biblioteca Central';

  for (const ed of ediciones) {
    for (const ej of ed.ejemplares ?? []) {
      if (total === 0 && ej.nombreFacultad) {
        facultadPrincipal = ej.nombreFacultad.replace(/^Facultad de\s+/i, '');
      }
      total++;
      if (ej.disponible && ej.tipoEstadoFisico !== 'En Reparacion') {
        disponibles++;
      }
    }
  }

  return {
    total,
    disponibles,
    edicionPrincipal: ediciones[0] ?? null,
    facultadPrincipal,
  };
}
