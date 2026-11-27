import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const lectorGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (auth.esLector()) return true;
  return router.createUrlTree(['/login'], { queryParams: { modo: 'lector' } });
};

export const encargadoGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (auth.esEncargado()) return true;
  return router.createUrlTree(['/login'], { queryParams: { modo: 'encargado' } });
};
