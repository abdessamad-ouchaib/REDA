/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║  AUTH COMPONENT — Inscription et connexion                   ║
 * ║  Auteur : Abdessamad Ouchaib                                  ║
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../shared/auth.service';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-primary-50 to-orange-100 flex items-center justify-center p-4">
      <div class="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">

        <!-- Logo -->
        <div class="text-center mb-8">
          <h1 class="text-3xl font-extrabold text-primary-600">
            Souk<span class="text-accent-600">Link</span>
          </h1>
          <p class="text-gray-500 mt-1 text-sm">Achetez et vendez entre particuliers</p>
        </div>

        <!-- Onglets -->
        <div class="flex rounded-xl bg-gray-100 p-1 mb-8">
          <button (click)="modeInscription = false"
                  [class]="!modeInscription ? 'flex-1 py-2 text-sm font-semibold rounded-lg bg-white shadow text-gray-900'
                                             : 'flex-1 py-2 text-sm text-gray-500 hover:text-gray-700'">
            Connexion
          </button>
          <button (click)="modeInscription = true"
                  [class]="modeInscription ? 'flex-1 py-2 text-sm font-semibold rounded-lg bg-white shadow text-gray-900'
                                           : 'flex-1 py-2 text-sm text-gray-500 hover:text-gray-700'">
            Inscription
          </button>
        </div>

        <!-- Message erreur -->
        <div *ngIf="erreur" class="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {{ erreur }}
        </div>

        <!-- CONNEXION -->
        <form *ngIf="!modeInscription" (ngSubmit)="seConnecter()">
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" [(ngModel)]="loginEmail" name="loginEmail" required
                     placeholder="votre@email.com"
                     class="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
              <input type="password" [(ngModel)]="loginPassword" name="loginPassword" required
                     placeholder="••••••••"
                     class="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition">
            </div>
          </div>
          <button type="submit" [disabled]="chargement"
                  class="mt-6 w-full bg-primary-600 hover:bg-primary-700 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition text-sm">
            {{ chargement ? 'Connexion...' : 'Se connecter' }}
          </button>
        </form>

        <!-- INSCRIPTION -->
        <form *ngIf="modeInscription" (ngSubmit)="sInscrire()">
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Nom complet</label>
              <input type="text" [(ngModel)]="regNom" name="regNom" required
                     placeholder="Votre nom"
                     class="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" [(ngModel)]="regEmail" name="regEmail" required
                     placeholder="votre@email.com"
                     class="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
              <input type="password" [(ngModel)]="regPassword" name="regPassword" required minlength="6"
                     placeholder="Minimum 6 caractères"
                     class="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Téléphone <span class="text-gray-400">(optionnel)</span></label>
              <input type="tel" [(ngModel)]="regTel" name="regTel"
                     placeholder="06 00 00 00 00"
                     class="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition">
            </div>
          </div>
          <button type="submit" [disabled]="chargement"
                  class="mt-6 w-full bg-primary-600 hover:bg-primary-700 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition text-sm">
            {{ chargement ? 'Inscription...' : "Créer mon compte" }}
          </button>
        </form>

        <!-- Astuce démo -->
        <p class="mt-6 text-center text-xs text-gray-400">
          Carte de test Stripe : <span class="font-mono font-semibold text-gray-600">4242 4242 4242 4242</span>
        </p>
      </div>
    </div>
  `
})
export class AuthComponent {
  modeInscription = false;
  chargement = false;
  erreur = '';

  loginEmail = '';
  loginPassword = '';

  regNom = '';
  regEmail = '';
  regPassword = '';
  regTel = '';

  constructor(private authService: AuthService, private router: Router) {}

  seConnecter(): void {
    this.erreur = '';
    this.chargement = true;
    this.authService.connecter({ email: this.loginEmail, motDePasse: this.loginPassword })
      .subscribe({
        next: () => this.router.navigate(['/catalogue']),
        error: (e) => {
          this.erreur = e.error?.message || 'Email ou mot de passe incorrect';
          this.chargement = false;
        }
      });
  }

  sInscrire(): void {
    this.erreur = '';
    this.chargement = true;
    this.authService.inscrire({ nom: this.regNom, email: this.regEmail, motDePasse: this.regPassword, telephone: this.regTel })
      .subscribe({
        next: () => this.router.navigate(['/catalogue']),
        error: (e) => {
          this.erreur = e.error?.message || 'Une erreur est survenue lors de l\'inscription';
          this.chargement = false;
        }
      });
  }
}
