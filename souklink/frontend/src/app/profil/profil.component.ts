/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║  PROFIL COMPONENT — Profil utilisateur public et privé       ║
 * ║  Auteur : Abdessamad Ouchaib                                  ║
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { UtilisateurService } from '../shared/utilisateur.service';
import { AnnonceService } from '../shared/annonce.service';
import { AvisService } from '../shared/avis.service';
import { UtilisateurResponse, AnnonceResponse, AvisResponse } from '../shared/models';
import { AuthService } from '../shared/auth.service';

@Component({
  selector: 'app-profil',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="max-w-4xl mx-auto px-4 sm:px-6 py-8">

      <!-- Chargement -->
      <div *ngIf="chargement" class="h-32 bg-gray-200 rounded-2xl animate-pulse"></div>

      <div *ngIf="!chargement && utilisateur">

        <!-- Carte profil -->
        <div class="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 mb-6">
          <div class="flex items-start gap-5">
            <div class="w-16 h-16 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-2xl font-bold shrink-0">
              {{ utilisateur.nom.charAt(0) }}
            </div>
            <div class="flex-1">
              <h1 class="text-xl font-bold text-gray-900">{{ utilisateur.nom }}</h1>
              <p *ngIf="utilisateur.noteMoyenne" class="text-gray-500 text-sm">
                ⭐ {{ utilisateur.noteMoyenne | number:'1.1-1' }} / 5 · {{ avis.length }} avis
              </p>
              <p *ngIf="!utilisateur.noteMoyenne" class="text-gray-400 text-sm">Aucun avis reçu</p>
              <p class="text-gray-400 text-xs mt-1">
                Membre depuis {{ utilisateur.dateInscription | date:'MMMM yyyy':'':'fr' }}
              </p>
            </div>
            <span *ngIf="utilisateur.suspendu"
                  class="bg-red-100 text-red-700 text-xs font-semibold px-3 py-1 rounded-full">
              Compte suspendu
            </span>
          </div>
        </div>

        <!-- Annonces du vendeur -->
        <div class="mb-6">
          <h2 class="text-lg font-bold text-gray-900 mb-4">
            Annonces de {{ estMonProfil ? 'moi' : utilisateur.nom }} ({{ annonces.length }})
          </h2>

          <div *ngIf="annonces.length === 0" class="bg-white rounded-2xl border border-gray-200 p-8 text-center text-gray-400">
            <p class="text-2xl mb-2">📦</p>
            <p class="text-sm">Aucune annonce publiée</p>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <a *ngFor="let a of annonces.slice(0, 6)" [routerLink]="['/annonces', a.id]"
               class="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all block">
              <div class="aspect-[4/3] bg-gray-100">
                <img *ngIf="a.photos.length > 0" [src]="a.photos[0].urlStockage" [alt]="a.titre"
                     class="w-full h-full object-cover">
                <div *ngIf="a.photos.length === 0" class="w-full h-full flex items-center justify-center text-3xl bg-gray-50">📦</div>
              </div>
              <div class="p-3">
                <p class="font-semibold text-sm text-gray-900 truncate">{{ a.titre }}</p>
                <p class="text-primary-600 font-bold">{{ a.prix | number:'1.0-0' }} MAD</p>
              </div>
            </a>
          </div>
        </div>

        <!-- Avis reçus -->
        <div *ngIf="avis.length > 0">
          <h2 class="text-lg font-bold text-gray-900 mb-4">Avis reçus</h2>
          <div class="space-y-3">
            <div *ngFor="let a of avis" class="bg-white rounded-2xl border border-gray-200 p-4">
              <div class="flex items-center gap-2 mb-1">
                <span class="text-yellow-500">{{ etoiles(a.note) }}</span>
                <span class="font-medium text-sm text-gray-700">{{ a.evaluateurNom }}</span>
                <span class="text-xs text-gray-400 ml-auto">{{ a.dateAvis | date:'dd/MM/yyyy' }}</span>
              </div>
              <p *ngIf="a.commentaire" class="text-sm text-gray-600">{{ a.commentaire }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ProfilComponent implements OnInit {
  utilisateur: UtilisateurResponse | null = null;
  annonces: AnnonceResponse[] = [];
  avis: AvisResponse[] = [];
  chargement = true;
  estMonProfil = false;

  constructor(
    private route: ActivatedRoute,
    private utilisateurService: UtilisateurService,
    private annonceService: AnnonceService,
    private avisService: AvisService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    const userId = idParam ? Number(idParam) : this.authService.getUserId();
    this.estMonProfil = !idParam || Number(idParam) === this.authService.getUserId();

    this.utilisateurService.obtenirParId(userId).subscribe({
      next: u => {
        this.utilisateur = u;
        this.chargement = false;
        this.annonceService.listerParVendeur(userId).subscribe(a => this.annonces = a);
        this.avisService.listerPourUtilisateur(userId).subscribe(av => this.avis = av);
      },
      error: () => this.chargement = false
    });
  }

  etoiles(note: number): string {
    return '⭐'.repeat(note) + '☆'.repeat(5 - note);
  }
}
