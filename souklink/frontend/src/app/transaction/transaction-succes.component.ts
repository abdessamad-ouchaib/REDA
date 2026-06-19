/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║  TRANSACTION SUCCES COMPONENT — Page de confirmation paiement ║
 * ║  Auteur : Abdessamad Ouchaib                                  ║
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TransactionService } from '../shared/transaction.service';
import { AvisService } from '../shared/avis.service';
import { TransactionResponse } from '../shared/models';

@Component({
  selector: 'app-transaction-succes',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="max-w-lg mx-auto px-4 py-16 text-center">
      <div class="bg-white rounded-2xl border border-gray-200 p-10">

        <div class="text-6xl mb-4">🎉</div>
        <h1 class="text-2xl font-bold text-gray-900 mb-2">Paiement confirmé !</h1>
        <p class="text-gray-500 text-sm mb-6">
          Ton paiement a été traité avec succès. Le vendeur sera notifié.
        </p>

        <!-- Laisser un avis -->
        <div *ngIf="transaction && !avisDejaLaisse" class="mt-6 border-t border-gray-100 pt-6">
          <h2 class="font-semibold text-gray-800 mb-1">Évalue ce vendeur</h2>
          <p class="text-xs text-gray-400 mb-4">Partage ton expérience pour aider la communauté</p>

          <!-- Étoiles -->
          <div class="flex justify-center gap-2 mb-4">
            <button *ngFor="let i of [1,2,3,4,5]" (click)="note = i"
                    class="text-3xl hover:scale-110 transition-transform">
              {{ i <= note ? '⭐' : '☆' }}
            </button>
          </div>

          <textarea [(ngModel)]="commentaire" rows="3" placeholder="Un commentaire ? (optionnel)"
                    class="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 transition resize-none mb-4"></textarea>

          <button (click)="soumettreAvis()" [disabled]="note === 0 || avisEnCours"
                  class="w-full bg-accent-500 hover:bg-accent-600 disabled:opacity-60 text-white font-semibold py-3 rounded-xl text-sm transition">
            {{ avisEnCours ? 'Envoi...' : 'Laisser mon avis' }}
          </button>
        </div>

        <div *ngIf="avisDejaLaisse" class="mt-4 text-sm text-green-600 font-medium">
          ✓ Merci pour ton avis !
        </div>

        <div class="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <a routerLink="/catalogue"
             class="border border-gray-300 text-gray-700 font-semibold px-6 py-3 rounded-xl text-sm hover:bg-gray-50 transition">
            Retour au catalogue
          </a>
          <a routerLink="/mes-achats"
             class="bg-primary-600 hover:bg-primary-700 text-white font-semibold px-6 py-3 rounded-xl text-sm transition">
            Voir mes achats
          </a>
        </div>
      </div>
    </div>
  `
})
export class TransactionSuccesComponent implements OnInit {
  transaction: TransactionResponse | null = null;
  note = 0;
  commentaire = '';
  avisEnCours = false;
  avisDejaLaisse = false;

  constructor(
    private route: ActivatedRoute,
    private transactionService: TransactionService,
    private avisService: AvisService
  ) {}

  ngOnInit(): void {
    // On cherche la transaction récente pour permettre de laisser un avis
    this.transactionService.mesTransactions().subscribe(transactions => {
      const payees = transactions.filter(t => t.statutPaiement === 'PAYE');
      if (payees.length > 0) this.transaction = payees[0];
    });
  }

  soumettreAvis(): void {
    if (!this.transaction || this.note === 0) return;
    this.avisEnCours = true;
    this.avisService.laisser({
      transactionId: this.transaction.id,
      note: this.note,
      commentaire: this.commentaire
    }).subscribe({
      next: () => { this.avisDejaLaisse = true; this.avisEnCours = false; },
      error: () => { this.avisDejaLaisse = true; this.avisEnCours = false; }
    });
  }
}
