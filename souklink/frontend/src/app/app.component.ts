/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║  APP COMPONENT — Shell racine avec navbar responsive          ║
 * ║  Auteur : Abdessamad Ouchaib                                  ║
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthService } from './shared/auth.service';
import { ChatService } from './shared/chat.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="min-h-screen bg-gray-50 flex flex-col">

      <!-- ── Barre de navigation ──────────────────────────────── -->
      <header class="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <nav class="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">

          <a routerLink="/catalogue" class="flex items-center gap-2 shrink-0">
            <span class="text-2xl font-extrabold text-primary-600">Souk<span class="text-accent-600">Link</span></span>
          </a>

          <!-- Liens desktop -->
          <div class="hidden md:flex items-center gap-1">
            <a routerLink="/catalogue" routerLinkActive="bg-primary-50 text-primary-700"
               class="px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition">
              Catalogue
            </a>
            <ng-container *ngIf="estConnecte">
              <a routerLink="/mes-annonces" routerLinkActive="bg-primary-50 text-primary-700"
                 class="px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition">
                Mes annonces
              </a>
              <a routerLink="/messagerie" routerLinkActive="bg-primary-50 text-primary-700"
                 class="relative px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition">
                Messages
              </a>
              <a routerLink="/mes-achats" routerLinkActive="bg-primary-50 text-primary-700"
                 class="px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition">
                Mes achats
              </a>
              <a *ngIf="estAdmin" routerLink="/admin" routerLinkActive="bg-primary-50 text-primary-700"
                 class="px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition">
                Admin
              </a>
            </ng-container>
          </div>

          <!-- Actions à droite -->
          <div class="hidden md:flex items-center gap-3">
            <ng-container *ngIf="estConnecte; else boutonsConnexion">
              <a routerLink="/creer-annonce"
                 class="bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition">
                + Publier
              </a>
              <a routerLink="/profil" class="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition">
                <span class="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-semibold text-sm">
                  {{ initiale }}
                </span>
              </a>
              <button (click)="seDeconnecter()"
                      class="text-sm text-gray-500 hover:text-gray-700 font-medium">
                Déconnexion
              </button>
            </ng-container>
            <ng-template #boutonsConnexion>
              <a routerLink="/connexion"
                 class="bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition">
                Connexion
              </a>
            </ng-template>
          </div>

          <!-- Bouton menu mobile -->
          <button (click)="menuMobileOuvert = !menuMobileOuvert"
                  class="md:hidden p-2 rounded-lg hover:bg-gray-100" aria-label="Menu">
            <svg *ngIf="!menuMobileOuvert" class="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            <svg *ngIf="menuMobileOuvert" class="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </nav>

        <!-- Menu mobile déroulant -->
        <div *ngIf="menuMobileOuvert" class="md:hidden border-t border-gray-200 px-4 py-3 space-y-1 bg-white">
          <a routerLink="/catalogue" (click)="menuMobileOuvert = false"
             class="block px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100">Catalogue</a>

          <ng-container *ngIf="estConnecte">
            <a routerLink="/creer-annonce" (click)="menuMobileOuvert = false"
               class="block px-3 py-2 rounded-lg text-sm font-semibold text-primary-700 bg-primary-50">+ Publier une annonce</a>
            <a routerLink="/mes-annonces" (click)="menuMobileOuvert = false"
               class="block px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100">Mes annonces</a>
            <a routerLink="/messagerie" (click)="menuMobileOuvert = false"
               class="block px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100">Messages</a>
            <a routerLink="/mes-achats" (click)="menuMobileOuvert = false"
               class="block px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100">Mes achats</a>
            <a routerLink="/profil" (click)="menuMobileOuvert = false"
               class="block px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100">Mon profil</a>
            <a *ngIf="estAdmin" routerLink="/admin" (click)="menuMobileOuvert = false"
               class="block px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100">Administration</a>
            <button (click)="seDeconnecter()"
                    class="block w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50">
              Déconnexion
            </button>
          </ng-container>

          <a *ngIf="!estConnecte" routerLink="/connexion" (click)="menuMobileOuvert = false"
             class="block px-3 py-2 rounded-lg text-sm font-semibold text-primary-700 bg-primary-50">Connexion / Inscription</a>
        </div>
      </header>

      <!-- ── Contenu de la page ──────────────────────────────── -->
      <main class="flex-1">
        <router-outlet></router-outlet>
      </main>

      <!-- ── Pied de page ────────────────────────────────────── -->
      <footer class="bg-white border-t border-gray-200 py-6 mt-auto">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 text-center text-sm text-gray-500">
          SoukLink — Marketplace de vente entre particuliers · Projet portfolio par Abdessamad Ouchaib
        </div>
      </footer>
    </div>
  `
})
export class AppComponent implements OnInit {
  menuMobileOuvert = false;
  estConnecte = false;
  estAdmin = false;
  initiale = '';

  constructor(
    private authService: AuthService,
    private chatService: ChatService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.rafraichirEtat();
    this.router.events.subscribe(() => this.rafraichirEtat());
  }

  private rafraichirEtat(): void {
    this.estConnecte = this.authService.estConnecte();
    this.estAdmin = this.authService.estAdmin();
    const nom = this.authService.getNom();
    this.initiale = nom ? nom.charAt(0).toUpperCase() : '?';
  }

  seDeconnecter(): void {
    this.menuMobileOuvert = false;
    this.chatService.deconnecter();
    this.authService.deconnecter();
  }
}
