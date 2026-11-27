import { Routes } from '@angular/router';
import { encargadoGuard, lectorGuard } from './core/guards/role.guard';

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
      {
        path: 'registrar-pago',
        loadComponent: () =>
          import('./features/encargado/registrar-pago.component').then(
            (m) => m.RegistrarPagoComponent,
          ),
      },
      {
        path: 'prestamos',
        loadComponent: () =>
          import('./features/encargado/lista-prestamos.component').then(
            (m) => m.ListaPrestamosComponent,
          ),
      },
      {
        path: 'lectores',
        loadComponent: () =>
          import('./features/encargado/lista-lectores.component').then(
            (m) => m.ListaLectoresComponent,
          ),
      },
      {
        path: 'catalogo',
        loadComponent: () =>
          import('./features/encargado/gestion-catalogo.component').then(
            (m) => m.GestionCatalogoComponent,
          ),
      },
      {
        path: 'autores-editoriales',
        loadComponent: () =>
          import('./features/encargado/gestion-autores-editoriales.component').then(
            (m) => m.GestionAutoresEditorialesComponent,
          ),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
