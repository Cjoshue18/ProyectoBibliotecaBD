import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { PagoDto } from '../../../core/models/biblioteca.models';

export interface ComprobanteDialogData {
  pago: PagoDto;
  tituloLibro?: string;
  nombreLector?: string;
  diasRetraso?: number;
  tarifaDiaria?: number;
}

@Component({
  selector: 'app-comprobante-dialog',
  imports: [MatDialogModule, CurrencyPipe, DatePipe],
  templateUrl: './comprobante-dialog.component.html',
  styleUrl: './comprobante-dialog.component.css',
})
export class ComprobanteDialogComponent {
  readonly data = inject<ComprobanteDialogData>(MAT_DIALOG_DATA);
}
