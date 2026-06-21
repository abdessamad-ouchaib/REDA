/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║  ADMIN COMPONENT — Administration : utilisateurs et catégories ║
 * ║  Auteur : Abdessamad Ouchaib                                  ║
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UtilisateurService } from '../shared/utilisateur.service';
import { CategorieService } from '../shared/categorie.service';
import { UtilisateurResponse, CategorieResponse } from '../shared/models';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <h1 class="text-2xl font-bold text-gray-900 mb-6">🛡️ Administration</h1>

      <!-- Onglets -->
      <div class="flex border-b border-gray-200 mb-6 gap-1">
        <button (click)="onglet = 'utilisateurs'"
                [class]="'px-5 py-2.5 text-sm font-semibold rounded-t-lg transition ' +
                          (onglet === 'utilisateurs' ? 'bg-white border border-b-white border-gray-200 -mb-px text-primary-700' : 'text-gray-500 hover:text-gray-700')">
          Utilisateurs
        </button>
        <button (click)="onglet = 'categories'"
                [class]="'px-5 py-2.5 text-sm font-semibold rounded-t-lg transition ' +
                          (onglet === 'categories' ? 'bg-white border border-b-white border-gray-200 -mb-px text-primary-700' : 'text-gray-500 hover:text-gray-700')">
          Catégories
        </button>
      </div>

      <!-- === ONGLET UTILISATEURS === -->
      <div *ngIf="onglet === 'utilisateurs'">
        <div *ngIf="chargementUsers" class="space-y-2">
          <div *ngFor="let _ of [1,2,3]" class="h-16 bg-gray-100 rounded-xl animate-pulse"></div>
        </div>

        <div class="bg-white rounded-2xl border border-gray-200 overflow-hidden" *ngIf="!chargementUsers">
          <table class="w-full text-sm">
            <thead>
              <tr class="bg-gray-50 border-b border-gray-200">
                <th class="text-left px-4 py-3 font-semibold text-gray-700">Utilisateur</th>
                <th class="text-left px-4 py-3 font-semibold text-gray-700">Rôle</th>
                <th class="text-left px-4 py-3 font-semibold text-gray-700">Statut</th>
                <th class="text-right px-4 py-3 font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let u of utilisateurs" class="border-b border-gray-50 hover:bg-gray-50">
                <td class="px-4 py-3">
                  <p class="font-medium text-gray-900">{{ u.nom }}</p>
                  <p class="text-xs text-gray-400">{{ u.email }}</p>
                </td>
                <td class="px-4 py-3">
                  <span [class]="'text-xs font-semibold px-2 py-1 rounded-full ' +
                                  (u.role === 'ADMIN' ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-600')">
                    {{ u.role }}
                  </span>
                </td>
                <td class="px-4 py-3">
                  <span [class]="'text-xs font-semibold px-2 py-1 rounded-full ' +
                                  (u.suspendu ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700')">
                    {{ u.suspendu ? 'Suspendu' : 'Actif' }}
                  </span>
                </td>
                <td class="px-4 py-3 text-right">
                  <button *ngIf="u.role !== 'ADMIN'" (click)="basculerSuspension(u)"
                          [class]="'text-xs font-semibold px-3 py-1.5 rounded-lg border transition ' +
                                    (u.suspendu
                                      ? 'border-green-300 text-green-700 hover:bg-green-50'
                                      : 'border-red-300 text-red-600 hover:bg-red-50')">
                    {{ u.suspendu ? 'Réactiver' : 'Suspendre' }}
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- === ONGLET CATÉGORIES === -->
      <div *ngIf="onglet === 'categories'">
        <!-- Créer une catégorie -->
        <div class="bg-white rounded-2xl border border-gray-200 p-5 mb-5">
          <h3 class="font-semibold text-gray-900 mb-4">Ajouter une catégorie</h3>
          <div class="flex gap-3">
            <input type="text" [(ngModel)]="nouvCategNom" placeholder="Nom de la catégorie"
                   class="flex-1 border border-gray-300 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400">
            <button (click)="ajouterCategorie()" [disabled]="!nouvCategNom.trim()"
                    class="bg-primary-600 hover:bg-primary-700 disabled:opacity-60 text-white font-semibold px-5 py-2 rounded-xl text-sm transition">
              Ajouter
            </button>
          </div>
          <div *ngIf="erreurCategorie" class="mt-2 text-red-600 text-xs">{{ erreurCategorie }}</div>
        </div>

        <!-- Liste des catégories -->
        <div class="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div *ngIf="chargementCats" class="p-4 text-center text-gray-400 text-sm">Chargement...</div>
          <div *ngIf="!chargementCats && categories.length === 0" class="p-8 text-center text-gray-400 text-sm">
            Aucune catégorie créée.
          </div>
          <div *ngFor="let cat of categories; let last = last"
               [class]="'flex items-center justify-between px-5 py-3 ' + (!last ? 'border-b border-gray-100' : '')">
            <span class="font-medium text-gray-800 text-sm">{{ cat.nom }}</span>
            <button (click)="supprimerCategorie(cat)"
                    class="text-xs text-red-600 border border-red-200 px-3 py-1 rounded-lg hover:bg-red-50 transition">
              Supprimer
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class AdminComponent implements OnInit {
  onglet: 'utilisateurs' | 'categories' = 'utilisateurs';
  utilisateurs: UtilisateurResponse[] = [];
  categories: CategorieResponse[] = [];
  chargementUsers = true;
  chargementCats = true;
  nouvCategNom = '';
  erreurCategorie = '';

  constructor(
    private utilisateurService: UtilisateurService,
    private categorieService: CategorieService
  ) {}

  ngOnInit(): void {
    this.utilisateurService.listerTous().subscribe({
      next: u => { this.utilisateurs = u; this.chargementUsers = false; },
      error: () => this.chargementUsers = false
    });
    this.chargerCategories();
  }

  chargerCategories(): void {
    this.categorieService.listerToutes().subscribe({
      next: c => { this.categories = c; this.chargementCats = false; },
      error: () => this.chargementCats = false
    });
  }

  basculerSuspension(u: UtilisateurResponse): void {
    this.utilisateurService.suspendre(u.id, !u.suspendu).subscribe(updated => {
      const idx = this.utilisateurs.findIndex(x => x.id === u.id);
      if (idx >= 0) this.utilisateurs[idx] = updated;
    });
  }

  ajouterCategorie(): void {
    this.erreurCategorie = '';
    this.categorieService.creer({ nom: this.nouvCategNom }).subscribe({
      next: c => {
        this.categories.push(c);
        this.nouvCategNom = '';
      },
      error: (e) => this.erreurCategorie = e.error?.message || 'Erreur lors de la création'
    });
  }

  supprimerCategorie(cat: CategorieResponse): void {
    if (!confirm(`Supprimer la catégorie "${cat.nom}" ?`)) return;
    this.categorieService.supprimer(cat.id).subscribe(() => {
      this.categories = this.categories.filter(c => c.id !== cat.id);
    });
  }
}
