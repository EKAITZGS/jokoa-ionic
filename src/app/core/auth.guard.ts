import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SesionService } from './sesion.service';

export const authGuard: CanActivateFn = () => {
  const router = inject(Router);
  return inject(SesionService).iniciada() ? true : router.createUrlTree(['/login']);
};
