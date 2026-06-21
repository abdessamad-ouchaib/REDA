/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║  AUTH SERVICE — Inscription, connexion, session JWT          ║
 * ║  Auteur : Abdessamad Ouchaib                                  ║
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthResponse, LoginRequest, RegisterRequest } from './models';

const API = environment.apiUrl;

@Injectable({ providedIn: 'root' })
export class AuthService {

  constructor(private http: HttpClient) {}

  inscrire(request: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${API}/auth/register`, request).pipe(
      tap(res => this.sauvegarderSession(res))
    );
  }

  connecter(request: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${API}/auth/login`, request).pipe(
      tap(res => this.sauvegarderSession(res))
    );
  }

  private sauvegarderSession(res: AuthResponse): void {
    localStorage.setItem('token', res.token);
    localStorage.setItem('userId', String(res.id));
    localStorage.setItem('nom', res.nom);
    localStorage.setItem('email', res.email);
    localStorage.setItem('role', res.role);
  }

  deconnecter(): void {
    localStorage.clear();
    window.location.href = '/connexion';
  }

  estConnecte(): boolean {
    return !!localStorage.getItem('token');
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getUserId(): number {
    return Number(localStorage.getItem('userId'));
  }

  getNom(): string {
    return localStorage.getItem('nom') || '';
  }

  getRole(): string {
    return localStorage.getItem('role') || '';
  }

  estAdmin(): boolean {
    return this.getRole() === 'ADMIN';
  }
}
