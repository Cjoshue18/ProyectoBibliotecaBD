import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-encargado-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './encargado-layout.component.html',
})
export class EncargadoLayoutComponent {}
