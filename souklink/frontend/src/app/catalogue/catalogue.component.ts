/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║  CATALOGUE COMPONENT — Recherche, filtres, liste d'annonces   ║
 * ║  Auteur : Abdessamad Ouchaib                                  ║
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AnnonceService, CritereRecherche } from '../shared/annonce.service';
import { CategorieService } from '../shared/categorie.service';
import { AnnonceResponse, CategorieResponse, PageResponse } from '../shared/models';
import { AuthService } from '../shared/auth.service';

@Component({
  selector: 'app-catalogue',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 py-8">

      <!-- Titre -->
      <div class="mb-6">
        <h1 class="text-2xl sm:text-3xl font-bold text-gray-900">Catalogue</h1>
        <p class="text-gray-500 mt-1">{{ page?.totalElements ?? 0 }} annonces trouvées</p>
      </div>

      <!-- Barre de recherche -->
      <div class="flex flex-col sm:flex-row gap-3 mb-6">
        <input type="text" [(ngModel)]="q" (keyup.enter)="rechercher()"
               placeholder="Rechercher une annonce..."
               class="flex-1 border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 transition">
        <button (click)="rechercher()"
                class="bg-primary-600 hover:bg-primary-700 text-white font-semibold px-6 py-3 rounded-xl text-sm transition shrink-0">
          Rechercher
        </button>
      </div>

      <div class="flex flex-col lg:flex-row gap-6">

        <!-- Filtres (sidebar desktop / collapsible mobile) -->
        <aside class="lg:w-64 shrink-0">
          <div class="bg-white rounded-2xl border border-gray-200 p-5">
            <div class="flex items-center justify-between mb-4">
              <h2 class="font-semibold text-gray-900">Filtres</h2>
              <button (click)="filtresOuverts = !filtresOuverts"
                      class="lg:hidden text-xs text-primary-600 font-medium">
                {{ filtresOuverts ? 'Masquer' : 'Afficher' }}
              </button>
            </div>

            <div [class.hidden]="!filtresOuverts" class="lg:block space-y-5">
              <!-- Catégorie -->
              <div>
                <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Catégorie</label>
                <select [(ngModel)]="categorieId" (change)="rechercher()"
                        class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400">
                  <option [ngValue]="undefined">Toutes</option>
                  <option *ngFor="let cat of categories" [ngValue]="cat.id">{{ cat.nom }}</option>
                </select>
              </div>

              <!-- Prix -->
              <div>
                <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Prix (MAD)</label>
                <div class="flex gap-2 items-center">
                  <input type="number" [(ngModel)]="prixMin" placeholder="Min" min="0"
                         class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400">
                  <span class="text-gray-400 shrink-0">–</span>
                  <input type="number" [(ngModel)]="prixMax" placeholder="Max" min="0"
                         class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400">
                </div>
              </div>

              <button (click)="rechercher()"
                      class="w-full bg-gray-900 hover:bg-gray-700 text-white text-sm font-semibold py-2 rounded-lg transition">
                Appliquer
              </button>
              <button (click)="reinitialiser()"
                      class="w-full text-sm text-gray-500 hover:text-gray-700 py-1">
                Réinitialiser les filtres
              </button>
            </div>
          </div>
        </aside>

        <!-- Grille d'annonces -->
        <div class="flex-1">

          <!-- Chargement -->
          <div *ngIf="chargement" class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            <div *ngFor="let _ of [1,2,3,4,5,6]" class="bg-white rounded-2xl border border-gray-200 h-64 animate-pulse"></div>
          </div>

          <!-- Aucun résultat -->
          <div *ngIf="!chargement && (!page || page.content.length === 0)"
               class="bg-white rounded-2xl border border-gray-200 p-12 text-center">
            <p class="text-4xl mb-3">🔍</p>
            <p class="text-gray-700 font-semibold">Aucune annonce trouvée</p>
            <p class="text-gray-400 text-sm mt-1">Essaie d'autres mots-clés ou filtres</p>
            <button (click)="reinitialiser()" class="mt-4 text-primary-600 text-sm font-medium hover:underline">
              Voir toutes les annonces
            </button>
          </div>

          <!-- Grille -->
          <div *ngIf="!chargement && page && page.content.length > 0"
               class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            <a *ngFor="let annonce of page.content" [routerLink]="['/annonces', annonce.id]"
               class="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all block group">

              <!-- Photo -->
              <div class="aspect-[4/3] bg-gray-100 overflow-hidden">
                <img *ngIf="annonce.photos.length > 0"
                     [src]="annonce.photos[0].urlStockage" [alt]="annonce.titre"
                     class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                     (error)="onImgError($event)">
                <div *ngIf="annonce.photos.length === 0"
                     class="w-full h-full flex items-center justify-center text-4xl bg-gray-50">📦</div>
              </div>

              <!-- Infos -->
              <div class="p-4">
                <div class="flex items-start justify-between gap-2">
                  <h3 class="font-semibold text-gray-900 text-sm line-clamp-2 flex-1">{{ annonce.titre }}</h3>
                  <span *ngIf="annonce.etat === 'NEUF'"
                        class="shrink-0 bg-green-100 text-green-700 text-xs font-semibold px-2 py-0.5 rounded-full">Neuf</span>
                  <span *ngIf="annonce.etat === 'OCCASION'"
                        class="shrink-0 bg-gray-100 text-gray-600 text-xs font-semibold px-2 py-0.5 rounded-full">Occasion</span>
                </div>
                <p class="text-primary-600 font-bold text-lg mt-2">{{ annonce.prix | number:'1.0-0' }} MAD</p>
                <div class="flex items-center justify-between mt-3">
                  <span class="text-xs text-gray-400">{{ annonce.vendeurNom }}</span>
                  <span *ngIf="annonce.categorieNom"
                        class="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{{ annonce.categorieNom }}</span>
                </div>
                <button *ngIf="estConnecte" (click)="basculerFavori($event, annonce)"
                        class="mt-3 text-gray-400 hover:text-red-500 transition text-sm">
                  {{ annonce.estFavori ? '❤️' : '🤍' }} {{ annonce.estFavori ? 'Favori' : 'Ajouter aux favoris' }}
                </button>
              </div>
            </a>
          </div>

          <!-- Pagination -->
          <div *ngIf="page && page.totalPages > 1" class="flex justify-center gap-2 mt-8">
            <button (click)="allerPage(pageActuelle - 1)" [disabled]="page.first"
                    class="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium disabled:opacity-40 hover:bg-gray-100 transition">
              ← Précédent
            </button>
            <span class="px-4 py-2 text-sm text-gray-600">
              Page {{ pageActuelle + 1 }} / {{ page.totalPages }}
            </span>
            <button (click)="allerPage(pageActuelle + 1)" [disabled]="page.last"
                    class="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium disabled:opacity-40 hover:bg-gray-100 transition">
              Suivant →
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class CatalogueComponent implements OnInit {
  categories: CategorieResponse[] = [];
  page: PageResponse<AnnonceResponse> | null = null;
  chargement = true;
  filtresOuverts = false;

  q = '';
  categorieId?: number;
  prixMin?: number;
  prixMax?: number;
  pageActuelle = 0;

  estConnecte = false;

  constructor(
    private annonceService: AnnonceService,
    private categorieService: CategorieService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.estConnecte = this.authService.estConnecte();
    this.categorieService.listerToutes().subscribe(cats => this.categories = cats);
    this.rechercher();
  }

  rechercher(): void {
    this.chargement = true;
    this.pageActuelle = 0;
    const criteres: CritereRecherche = {
      q: this.q || undefined,
      categorie: this.categorieId,
      prixMin: this.prixMin,
      prixMax: this.prixMax,
      page: 0,
      taille: 12
    };
    this.annonceService.rechercher(criteres).subscribe({
      next: p => { this.page = p; this.chargement = false; },
      error: () => this.chargement = false
    });
  }

  allerPage(p: number): void {
    this.chargement = true;
    this.pageActuelle = p;
    this.annonceService.rechercher({
      q: this.q || undefined, categorie: this.categorieId,
      prixMin: this.prixMin, prixMax: this.prixMax, page: p, taille: 12
    }).subscribe({ next: res => { this.page = res; this.chargement = false; }, error: () => this.chargement = false });
  }

  reinitialiser(): void {
    this.q = '';
    this.categorieId = undefined;
    this.prixMin = undefined;
    this.prixMax = undefined;
    this.rechercher();
  }

  basculerFavori(event: Event, annonce: AnnonceResponse): void {
    event.preventDefault();
    this.annonceService.basculerFavori(annonce.id).subscribe(r => annonce.estFavori = r.estFavori);
  }

  onImgError(event: Event): void {
    (event.target as HTMLImageElement).style.display = 'none';
  }
}
