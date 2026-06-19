/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║  AUTH INTERCEPTOR — Ajoute le JWT à chaque requête sortante   ║
 * ║  Auteur : Abdessamad Ouchaib                                  ║
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('token');

  if (token) {
    const requeteAvecToken = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
    return next(requeteAvecToken);
  }

  return next(req);
};
