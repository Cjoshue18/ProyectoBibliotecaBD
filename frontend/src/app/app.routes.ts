import { Component } from '@angular/core';
import { Routes } from '@angular/router';
import { encargadoGuard, lectorGuard } from './core/guards/role.guard';

@Component({
  selector: 'app-ruta-en-construccion',
  template: `<div class="app-page"><div class="container"><div class="card-flat"><p>Módulo en preparación.</p></div></div></div>`,
})
export class RutaEnConstruccionComponent {}

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/home/home.component').then((m) => m.HomeComponent),
  },
  { path: 'catalogo', component: RutaEnConstruccionComponent },
  { path: 'sobre-biblioteca', component: RutaEnConstruccionComponent },
  { path: 'login', component: RutaEnConstruccionComponent },
  { path: 'lector', canActivate: [lectorGuard], component: RutaEnConstruccionComponent },
  { path: 'encargado', canActivate: [encargadoGuard], component: RutaEnConstruccionComponent },
  { path: '**', redirectTo: '' },
];
