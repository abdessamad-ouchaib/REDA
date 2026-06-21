/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║  ROUTES — Configuration du routage Angular                   ║
 * ║  Auteur : Abdessamad Ouchaib                                 ║
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { adminGuard } from './guards/admin.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'catalogue', pathMatch: 'full' },

  {
    path: 'connexion',
    loadComponent: () => import('./auth/auth.component').then(m => m.AuthComponent)
  },
  {
    path: 'catalogue',
    loadComponent: () => import('./catalogue/catalogue.component').then(m => m.CatalogueComponent)
  },
  {
    path: 'annonces/:id',
    loadComponent: () => import('./annonce-detail/annonce-detail.component').then(m => m.AnnonceDetailComponent)
  },
  {
    path: 'mes-annonces',
    loadComponent: () => import('./mes-annonces/mes-annonces.component').then(m => m.MesAnnoncesComponent),
    canActivate: [authGuard]
  },
  {
    path: 'creer-annonce',
    loadComponent: () => import('./creer-annonce/creer-annonce.component').then(m => m.CreerAnnonceComponent),
    canActivate: [authGuard]
  },
  {
    path: 'modifier-annonce/:id',
    loadComponent: () => import('./creer-annonce/creer-annonce.component').then(m => m.CreerAnnonceComponent),
    canActivate: [authGuard]
  },
  {
    path: 'messagerie',
    loadComponent: () => import('./messagerie/messagerie.component').then(m => m.MessagerieComponent),
    canActivate: [authGuard]
  },
  {
    path: 'messagerie/:id',
    loadComponent: () => import('./messagerie/messagerie.component').then(m => m.MessagerieComponent),
    canActivate: [authGuard]
  },
  {
    path: 'profil',
    loadComponent: () => import('./profil/profil.component').then(m => m.ProfilComponent),
    canActivate: [authGuard]
  },
  {
    path: 'profil/:id',
    loadComponent: () => import('./profil/profil.component').then(m => m.ProfilComponent)
  },
  {
    path: 'transaction/succes',
    loadComponent: () => import('./transaction/transaction-succes.component').then(m => m.TransactionSuccesComponent),
    canActivate: [authGuard]
  },
  {
    path: 'mes-achats',
    loadComponent: () => import('./transaction/mes-achats.component').then(m => m.MesAchatsComponent),
    canActivate: [authGuard]
  },
  {
    path: 'admin',
    loadComponent: () => import('./admin/admin.component').then(m => m.AdminComponent),
    canActivate: [adminGuard]
  },

  { path: '**', redirectTo: 'catalogue' }
];
