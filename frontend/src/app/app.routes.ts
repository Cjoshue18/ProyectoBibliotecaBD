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
  {
    path: 'catalogo',
    loadComponent: () => import('./features/catalogo/catalogo.component').then((m) => m.CatalogoComponent),
  },
  {
    path: 'sobre-biblioteca',
    loadComponent: () => import('./features/sobre/sobre.component').then((m) => m.SobreComponent),
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'lector',
    canActivate: [lectorGuard],
    loadComponent: () =>
      import('./features/lector/lector-layout.component').then((m) => m.LectorLayoutComponent),
    children: [
      { path: '', redirectTo: 'resumen', pathMatch: 'full' },
      {
        path: 'resumen',
        loadComponent: () =>
          import('./features/lector/resumen-lector.component').then((m) => m.ResumenLectorComponent),
      },
      {
        path: 'prestamos',
        loadComponent: () =>
          import('./features/lector/mis-prestamos.component').then((m) => m.MisPrestamosComponent),
      },
      {
        path: 'deudas',
        loadComponent: () =>
          import('./features/lector/mis-deudas.component').then((m) => m.MisDeudasComponent),
      },
      {
        path: 'comprobantes',
        loadComponent: () =>
          import('./features/lector/mis-comprobantes.component').then((m) => m.MisComprobantesComponent),
      },
    ],
  },
  {
    path: 'encargado',
    canActivate: [encargadoGuard],
    loadComponent: () =>
      import('./features/encargado/encargado-layout.component').then(
        (m) => m.EncargadoLayoutComponent,
      ),
    children: [
      { path: '', redirectTo: 'acciones', pathMatch: 'full' },
      {
        path: 'acciones',
        loadComponent: () =>
          import('./features/encargado/acciones-rapidas.component').then(
            (m) => m.AccionesRapidasComponent,
          ),
      },
      {
        path: 'registrar-prestamo',
        loadComponent: () =>
          import('./features/encargado/registrar-prestamo.component').then(
            (m) => m.RegistrarPrestamoComponent,
          ),
      },
      { path: 'registrar-pago', component: RutaEnConstruccionComponent },
      { path: 'prestamos', component: RutaEnConstruccionComponent },
      { path: 'lectores', component: RutaEnConstruccionComponent },
      { path: 'catalogo', component: RutaEnConstruccionComponent },
      { path: 'autores-editoriales', component: RutaEnConstruccionComponent },
    ],
  },
  { path: '**', redirectTo: '' },
];
