/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║  ANNONCE DETAIL COMPONENT                                    ║
 * ║  Auteur : Abdessamad Ouchaib                                  ║
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AnnonceService } from '../shared/annonce.service';
import { ChatService } from '../shared/chat.service';
import { TransactionService } from '../shared/transaction.service';
import { AvisService } from '../shared/avis.service';
import { AnnonceResponse, AvisResponse } from '../shared/models';
import { AuthService } from '../shared/auth.service';

@Component({
  selector: 'app-annonce-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="max-w-5xl mx-auto px-4 sm:px-6 py-8">

      <!-- Chargement -->
      <div *ngIf="chargement" class="space-y-4">
        <div class="h-8 bg-gray-200 rounded animate-pulse w-1/2"></div>
        <div class="h-96 bg-gray-200 rounded-2xl animate-pulse"></div>
      </div>

      <div *ngIf="!chargement && annonce" class="grid grid-cols-1 lg:grid-cols-3 gap-8">

        <!-- Colonne gauche : photos + infos -->
        <div class="lg:col-span-2 space-y-6">

          <!-- Photo principale -->
          <div class="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div class="aspect-[4/3] bg-gray-100">
              <img *ngIf="photoActive" [src]="photoActive" [alt]="annonce.titre"
                   class="w-full h-full object-contain" (error)="onImgError($event)">
              <div *ngIf="!photoActive"
                   class="w-full h-full flex items-center justify-center text-6xl bg-gray-50">📦</div>
            </div>
            <!-- Miniatures -->
            <div *ngIf="annonce.photos.length > 1" class="flex gap-2 p-3 overflow-x-auto">
              <button *ngFor="let p of annonce.photos" (click)="photoActive = p.urlStockage"
                      [class]="'shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition ' +
                                (photoActive === p.urlStockage ? 'border-primary-500' : 'border-transparent')">
                <img [src]="p.urlStockage" class="w-full h-full object-cover">
              </button>
            </div>
          </div>

          <!-- Description -->
          <div class="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 class="font-semibold text-gray-900 mb-3">Description</h2>
            <p class="text-gray-600 text-sm whitespace-pre-line">{{ annonce.description || 'Aucune description fournie.' }}</p>
          </div>

          <!-- Avis sur le vendeur -->
          <div *ngIf="avis.length > 0" class="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 class="font-semibold text-gray-900 mb-4">Avis sur ce vendeur ({{ avis.length }})</h2>
            <div class="space-y-3">
              <div *ngFor="let a of avis.slice(0, 3)"
                   class="border-b border-gray-100 pb-3 last:border-b-0">
                <div class="flex items-center gap-2 mb-1">
                  <span class="text-yellow-500">{{ etoiles(a.note) }}</span>
                  <span class="text-sm font-medium text-gray-700">{{ a.evaluateurNom }}</span>
                </div>
                <p *ngIf="a.commentaire" class="text-sm text-gray-500">{{ a.commentaire }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Colonne droite : prix, vendeur, actions -->
        <div class="space-y-4">
          <div class="bg-white rounded-2xl border border-gray-200 p-6 sticky top-24">

            <!-- Titre et badges -->
            <div class="mb-4">
              <span [class]="'inline-block text-xs font-semibold px-2 py-0.5 rounded-full mb-2 ' +
                              (annonce.etat === 'NEUF' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600')">
                {{ annonce.etat === 'NEUF' ? 'Neuf' : 'Occasion' }}
              </span>
              <h1 class="text-xl font-bold text-gray-900">{{ annonce.titre }}</h1>
              <p *ngIf="annonce.categorieNom" class="text-sm text-gray-400 mt-1">{{ annonce.categorieNom }}</p>
            </div>

            <!-- Prix -->
            <p class="text-3xl font-extrabold text-primary-600 mb-4">{{ annonce.prix | number:'1.0-0' }} MAD</p>

            <!-- Statut vendu -->
            <div *ngIf="annonce.statut === 'VENDU'"
                 class="mb-4 bg-red-50 border border-red-200 rounded-xl p-3 text-center">
              <p class="text-red-700 font-semibold text-sm">❌ Cette annonce est déjà vendue</p>
            </div>

            <!-- Actions (si connecté et pas le vendeur) -->
            <ng-container *ngIf="estConnecte && !estLeVendeur && annonce.statut === 'DISPONIBLE'">
              <button (click)="contacterVendeur()" [disabled]="actionEnCours"
                      class="w-full bg-accent-500 hover:bg-accent-600 disabled:opacity-60 text-white font-semibold py-3 rounded-xl mb-3 transition text-sm">
                💬 Contacter le vendeur
              </button>
              <button (click)="acheter()" [disabled]="actionEnCours"
                      class="w-full bg-primary-600 hover:bg-primary-700 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition text-sm">
                🛒 {{ actionEnCours ? 'Chargement...' : 'Acheter maintenant' }}
              </button>
            </ng-container>

            <!-- Actions propriétaire -->
            <ng-container *ngIf="estLeVendeur">
              <a [routerLink]="['/modifier-annonce', annonce.id]"
                 class="block text-center w-full border-2 border-primary-600 text-primary-600 font-semibold py-3 rounded-xl mb-3 hover:bg-primary-50 transition text-sm">
                ✏️ Modifier l'annonce
              </a>
              <button (click)="marquerVendu()" *ngIf="annonce.statut === 'DISPONIBLE'"
                      class="w-full bg-gray-900 text-white font-semibold py-3 rounded-xl transition text-sm hover:bg-gray-700">
                Marquer comme vendue
              </button>
            </ng-container>

            <!-- Non connecté -->
            <ng-container *ngIf="!estConnecte">
              <a routerLink="/connexion"
                 class="block text-center w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 rounded-xl transition text-sm">
                Connectez-vous pour acheter
              </a>
            </ng-container>

            <!-- Infos vendeur -->
            <div class="mt-6 pt-5 border-t border-gray-100">
              <h3 class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Vendeur</h3>
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center font-bold text-primary-700">
                  {{ annonce.vendeurNom.charAt(0) }}
                </div>
                <div>
                  <a [routerLink]="['/profil', annonce.vendeurId]"
                     class="font-semibold text-gray-900 hover:text-primary-600 text-sm">
                    {{ annonce.vendeurNom }}
                  </a>
                  <p *ngIf="annonce.vendeurNoteMoyenne" class="text-xs text-gray-400">
                    ⭐ {{ annonce.vendeurNoteMoyenne | number:'1.1-1' }} / 5
                  </p>
                </div>
              </div>
            </div>

            <!-- Favori -->
            <button *ngIf="estConnecte" (click)="basculerFavori()"
                    class="mt-4 w-full text-sm text-gray-500 hover:text-red-500 transition text-center py-1">
              {{ annonce.estFavori ? '❤️ Retiré des favoris' : '🤍 Ajouter aux favoris' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Message erreur -->
      <div *ngIf="erreur" class="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm text-center">
        {{ erreur }}
      </div>
    </div>
  `
})
export class AnnonceDetailComponent implements OnInit {
  annonce: AnnonceResponse | null = null;
  avis: AvisResponse[] = [];
  photoActive = '';
  chargement = true;
  actionEnCours = false;
  erreur = '';
  estConnecte = false;
  estLeVendeur = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private annonceService: AnnonceService,
    private chatService: ChatService,
    private transactionService: TransactionService,
    private avisService: AvisService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.estConnecte = this.authService.estConnecte();
    const id = Number(this.route.snapshot.paramMap.get('id'));

    this.annonceService.obtenirParId(id).subscribe({
      next: a => {
        this.annonce = a;
        this.photoActive = a.photos[0]?.urlStockage || '';
        this.estLeVendeur = this.estConnecte && this.authService.getUserId() === a.vendeurId;
        this.chargement = false;
        this.avisService.listerPourUtilisateur(a.vendeurId).subscribe(av => this.avis = av);
      },
      error: () => { this.chargement = false; this.erreur = 'Annonce introuvable'; }
    });
  }

  contacterVendeur(): void {
    if (!this.annonce) return;
    this.actionEnCours = true;
    this.chatService.ouvrirConversation(this.annonce.id).subscribe({
      next: conv => {
        this.actionEnCours = false;
        this.router.navigate(['/messagerie', conv.id]);
      },
      error: () => { this.actionEnCours = false; this.erreur = 'Impossible d\'ouvrir la conversation'; }
    });
  }

  acheter(): void {
    if (!this.annonce) return;
    this.actionEnCours = true;
    this.transactionService.creerCheckout(this.annonce.id).subscribe({
      next: res => {
        this.actionEnCours = false;
        this.transactionService.redirigerVersCheckout(res.checkoutUrl);
      },
      error: (e) => {
        this.actionEnCours = false;
        this.erreur = e.error?.message || 'Erreur lors de la création du paiement';
      }
    });
  }

  marquerVendu(): void {
    if (!this.annonce) return;
    this.annonceService.changerStatut(this.annonce.id, 'VENDU').subscribe({
      next: a => { this.annonce = a; }
    });
  }

  basculerFavori(): void {
    if (!this.annonce) return;
    this.annonceService.basculerFavori(this.annonce.id).subscribe(r => {
      if (this.annonce) this.annonce.estFavori = r.estFavori;
    });
  }

  etoiles(note: number): string {
    return '⭐'.repeat(note) + '☆'.repeat(5 - note);
  }

  onImgError(event: Event): void {
    (event.target as HTMLImageElement).style.display = 'none';
  }
}
