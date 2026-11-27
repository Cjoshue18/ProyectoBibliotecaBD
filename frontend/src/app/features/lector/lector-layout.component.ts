import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-lector-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './lector-layout.component.html',
})
export class LectorLayoutComponent {}
