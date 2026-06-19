/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║  ADMIN GUARD — Protège les routes réservées aux ADMIN        ║
 * ║  Auteur : Abdessamad Ouchaib                                  ║
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../shared/auth.service';

export const adminGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.estConnecte() && authService.estAdmin()) {
    return true;
  }

  router.navigate(['/catalogue']);
  return false;
};
