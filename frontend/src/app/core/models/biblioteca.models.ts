export interface FacultadDto {
  idFacultad: number;
  nombreFacultad: string;
}

export interface EditorialDto {
  idEditorial: number;
  nombreEditorial: string;
  paisOrigen: string;
}

export interface AutorDto {
  idAutor: number;
  nombreAutor: string;
}

export interface EjemplarDto {
  numeroCopia: number;
  tipoEstadoFisico: string;
  idFacultad: number;
  nombreFacultad: string;
  disponible: boolean;
}

export interface EdicionCatalogoDto {
  isbn: string;
  numeroEdicion: number;
  anioPublicacion: number;
  idEditorial: number;
  nombreEditorial: string;
  ejemplares: EjemplarDto[];
}

export interface LibroCatalogoDto {
  idLibro: number;
  titulo: string;
  autores: AutorDto[];
  ediciones: EdicionCatalogoDto[];
}

export interface LectorResumenDto {
  idLector: number;
  tipoDoc: string;
  numeroDoc: string;
  nombreCompleto: string;
  correoInstitucional: string;
  tipoLector: string;
  estadoLector: string;
  nombreFacultad: string;
  codigoAlumno: string | null;
  ciclo: number | null;
  categoriaDocente: string | null;
}

export interface AuthSessionDto {
  rol: 'Alumno' | 'Docente' | 'Encargado';
  idLector: number | null;
  nombreCompleto: string;
  estadoLector: string | null;
}

export interface PrestamoDetalleDto {
  idPrestamo: number;
  fechaPrestamo: string;
  fechaVencimiento: string;
  fechaDevolucionReal: string | null;
  tipoPrestamo: string;
  estadoDerivado: string;
  idLector: number;
  nombreLector: string;
  isbn: string;
  numeroCopia: number;
  tituloLibro: string;
}

export interface DevolucionResultadoDto {
  idPrestamo: number;
  fechaDevolucionReal: string;
  diasRetraso: number;
  idDeuda: number | null;
  montoGenerado: number | null;
  fechaFinSuspension: string | null;
}

export interface DeudaDetalleDto {
  idDeuda: number;
  idPrestamo: number;
  idLector: number;
  nombreLector: string;
  tituloLibro: string;
  tarifaDiaria: number;
  diasRetraso: number;
  montoCalculado: number;
  fechaFinSuspension: string | null;
  estadoDeuda: string;
}

export interface PagoDto {
  idPago: number;
  numeroRecibo: string;
  fechaPago: string;
  montoPagado: number;
  idDeuda: number;
}

export interface EjemplarSeleccionado {
  isbn: string;
  numeroCopia: number;
  tituloLibro: string;
}

export function extraerMensajeError(err: unknown): string {
  const e = err as { error?: { detail?: string; title?: string } | string };
  if (e?.error && typeof e.error === 'object') {
    return e.error.detail || e.error.title || 'Ocurrió un error al procesar la solicitud.';
  }
  if (typeof e?.error === 'string' && e.error.trim()) {
    return e.error;
  }
  return 'No se pudo conectar con el servidor.';
}
