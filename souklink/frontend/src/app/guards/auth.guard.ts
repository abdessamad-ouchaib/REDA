/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║  AUTH GUARD — Protège les routes nécessitant une connexion   ║
 * ║  Auteur : Abdessamad Ouchaib                                  ║
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../shared/auth.service';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.estConnecte()) {
    return true;
  }

  router.navigate(['/connexion']);
  return false;
};
