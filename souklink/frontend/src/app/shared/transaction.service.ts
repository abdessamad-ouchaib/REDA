/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║  TRANSACTION SERVICE — Tunnel de paiement Stripe Checkout    ║
 * ║  Auteur : Abdessamad Ouchaib                                  ║
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { CheckoutResponse, TransactionResponse } from './models';

const API = environment.apiUrl;

@Injectable({ providedIn: 'root' })
export class TransactionService {

  constructor(private http: HttpClient) {}

  creerCheckout(annonceId: number): Observable<CheckoutResponse> {
    return this.http.post<CheckoutResponse>(`${API}/transactions/checkout`, { annonceId });
  }

  mesTransactions(): Observable<TransactionResponse[]> {
    return this.http.get<TransactionResponse[]>(`${API}/transactions`);
  }

  obtenirParId(id: number): Observable<TransactionResponse> {
    return this.http.get<TransactionResponse>(`${API}/transactions/${id}`);
  }

  /** Redirige le navigateur vers la page de paiement sécurisée Stripe. */
  redirigerVersCheckout(checkoutUrl: string): void {
    window.location.href = checkoutUrl;
  }
}
