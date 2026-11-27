import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { DeudaDetalleDto, PagoDto } from '../../../core/models/biblioteca.models';

export interface DeudaDetalleDialogData {
  deuda: DeudaDetalleDto;
  pago?: PagoDto | null;
}

@Component({
  selector: 'app-deuda-detalle-dialog',
  imports: [MatDialogModule, CurrencyPipe, DatePipe],
  templateUrl: './deuda-detalle-dialog.component.html',
  styleUrl: './deuda-detalle-dialog.component.css',
})
export class DeudaDetalleDialogComponent {
  readonly data = inject<DeudaDetalleDialogData>(MAT_DIALOG_DATA);
}
