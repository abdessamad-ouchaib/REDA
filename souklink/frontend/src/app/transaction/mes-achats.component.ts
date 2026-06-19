/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║  MES ACHATS COMPONENT — Historique des transactions           ║
 * ║  Auteur : Abdessamad Ouchaib                                  ║
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TransactionService } from '../shared/transaction.service';
import { TransactionResponse } from '../shared/models';

@Component({
  selector: 'app-mes-achats',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <h1 class="text-2xl font-bold text-gray-900 mb-6">Mes achats</h1>

      <div *ngIf="chargement" class="space-y-3">
        <div *ngFor="let _ of [1,2,3]" class="h-24 bg-gray-100 rounded-2xl animate-pulse"></div>
      </div>

      <div *ngIf="!chargement && transactions.length === 0"
           class="bg-white rounded-2xl border border-gray-200 p-12 text-center">
        <p class="text-4xl mb-3">🛒</p>
        <p class="font-semibold text-gray-700">Aucun achat pour le moment</p>
        <a routerLink="/catalogue"
           class="inline-block mt-4 bg-primary-600 hover:bg-primary-700 text-white font-semibold px-6 py-2 rounded-xl text-sm transition">
          Parcourir le catalogue
        </a>
      </div>

      <div *ngIf="!chargement && transactions.length > 0" class="space-y-3">
        <div *ngFor="let t of transactions" class="bg-white rounded-2xl border border-gray-200 p-5">
          <div class="flex items-start justify-between gap-4">
            <div>
              <h3 class="font-semibold text-gray-900">{{ t.annonceTitre }}</h3>
              <p class="text-primary-600 font-bold text-lg">{{ t.montant | number:'1.0-0' }} MAD</p>
              <p class="text-xs text-gray-400 mt-1">{{ t.dateCreation | date:'dd/MM/yyyy HH:mm' }}</p>
            </div>
            <span [class]="'text-xs font-semibold px-3 py-1.5 rounded-full shrink-0 ' + badgeStatut(t.statutPaiement)">
              {{ libelleStatut(t.statutPaiement) }}
            </span>
          </div>
          <div class="mt-3 flex gap-2">
            <a [routerLink]="['/annonces', t.annonceId]"
               class="text-xs text-primary-600 border border-primary-200 px-3 py-1.5 rounded-lg hover:bg-primary-50 transition">
              Voir l'annonce
            </a>
          </div>
        </div>
      </div>
    </div>
  `
})
export class MesAchatsComponent implements OnInit {
  transactions: TransactionResponse[] = [];
  chargement = true;

  constructor(private transactionService: TransactionService) {}

  ngOnInit(): void {
    this.transactionService.mesTransactions().subscribe({
      next: t => { this.transactions = t; this.chargement = false; },
      error: () => this.chargement = false
    });
  }

  badgeStatut(statut: string): string {
    switch (statut) {
      case 'PAYE': return 'bg-green-100 text-green-700';
      case 'EN_ATTENTE': return 'bg-yellow-100 text-yellow-700';
      case 'ANNULE': return 'bg-gray-100 text-gray-600';
      case 'ECHOUE': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-600';
    }
  }

  libelleStatut(statut: string): string {
    switch (statut) {
      case 'PAYE': return '✓ Payé';
      case 'EN_ATTENTE': return '⏳ En attente';
      case 'ANNULE': return '✗ Annulé';
      case 'ECHOUE': return '✗ Échoué';
      default: return statut;
    }
  }
}
