/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║  MES ANNONCES COMPONENT — Tableau de bord vendeur            ║
 * ║  Auteur : Abdessamad Ouchaib                                  ║
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AnnonceService } from '../shared/annonce.service';
import { AnnonceResponse } from '../shared/models';

@Component({
  selector: 'app-mes-annonces',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-bold text-gray-900">Mes annonces</h1>
        <a routerLink="/creer-annonce"
           class="bg-primary-600 hover:bg-primary-700 text-white font-semibold px-4 py-2 rounded-xl text-sm transition">
          + Nouvelle annonce
        </a>
      </div>

      <!-- Chargement -->
      <div *ngIf="chargement" class="space-y-3">
        <div *ngFor="let _ of [1,2,3]" class="h-24 bg-gray-100 rounded-2xl animate-pulse"></div>
      </div>

      <!-- Vide -->
      <div *ngIf="!chargement && annonces.length === 0"
           class="bg-white rounded-2xl border border-gray-200 p-12 text-center">
        <p class="text-4xl mb-3">📦</p>
        <p class="font-semibold text-gray-700">Tu n'as pas encore d'annonces</p>
        <a routerLink="/creer-annonce"
           class="inline-block mt-4 bg-primary-600 hover:bg-primary-700 text-white font-semibold px-6 py-2 rounded-xl text-sm transition">
          Publier ma première annonce
        </a>
      </div>

      <!-- Liste -->
      <div *ngIf="!chargement && annonces.length > 0" class="space-y-3">
        <div *ngFor="let annonce of annonces"
             class="bg-white rounded-2xl border border-gray-200 p-4 flex gap-4 items-start">

          <!-- Photo miniature -->
          <div class="w-20 h-20 rounded-xl bg-gray-100 overflow-hidden shrink-0">
            <img *ngIf="annonce.photos.length > 0"
                 [src]="annonce.photos[0].urlStockage" [alt]="annonce.titre"
                 class="w-full h-full object-cover">
            <div *ngIf="annonce.photos.length === 0"
                 class="w-full h-full flex items-center justify-center text-2xl">📦</div>
          </div>

          <!-- Infos -->
          <div class="flex-1 min-w-0">
            <h3 class="font-semibold text-gray-900 truncate">{{ annonce.titre }}</h3>
            <p class="text-primary-600 font-bold text-lg">{{ annonce.prix | number:'1.0-0' }} MAD</p>
            <div class="flex items-center gap-2 mt-1">
              <span [class]="'text-xs font-semibold px-2 py-0.5 rounded-full ' + badgeStatut(annonce.statut)">
                {{ libelleStatut(annonce.statut) }}
              </span>
              <span class="text-xs text-gray-400">{{ annonce.dateCreation | date:'dd/MM/yyyy' }}</span>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex flex-col gap-2 shrink-0">
            <a [routerLink]="['/annonces', annonce.id]"
               class="text-xs text-gray-600 border border-gray-300 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition text-center">
              Voir
            </a>
            <a [routerLink]="['/modifier-annonce', annonce.id]"
               class="text-xs text-primary-600 border border-primary-300 px-3 py-1.5 rounded-lg hover:bg-primary-50 transition text-center">
              Modifier
            </a>
            <button (click)="supprimer(annonce)"
                    class="text-xs text-red-600 border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-50 transition">
              Supprimer
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class MesAnnoncesComponent implements OnInit {
  annonces: AnnonceResponse[] = [];
  chargement = true;

  constructor(private annonceService: AnnonceService) {}

  ngOnInit(): void {
    this.annonceService.mesAnnonces().subscribe({
      next: a => { this.annonces = a; this.chargement = false; },
      error: () => this.chargement = false
    });
  }

  supprimer(annonce: AnnonceResponse): void {
    if (!confirm(`Supprimer l'annonce "${annonce.titre}" ?`)) return;
    this.annonceService.supprimer(annonce.id).subscribe(() => {
      this.annonces = this.annonces.filter(a => a.id !== annonce.id);
    });
  }

  badgeStatut(statut: string): string {
    switch (statut) {
      case 'DISPONIBLE': return 'bg-green-100 text-green-700';
      case 'VENDU': return 'bg-red-100 text-red-700';
      case 'SUSPENDU': return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  }

  libelleStatut(statut: string): string {
    switch (statut) {
      case 'DISPONIBLE': return '✓ Disponible';
      case 'VENDU': return '✗ Vendue';
      case 'SUSPENDU': return '⚠ Suspendue';
      default: return statut;
    }
  }
}
