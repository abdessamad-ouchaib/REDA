/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║  UTILISATEUR SERVICE — Profil et administration              ║
 * ║  Auteur : Abdessamad Ouchaib                                  ║
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { UtilisateurResponse } from './models';

const API = environment.apiUrl;

@Injectable({ providedIn: 'root' })
export class UtilisateurService {

  constructor(private http: HttpClient) {}

  monProfil(): Observable<UtilisateurResponse> {
    return this.http.get<UtilisateurResponse>(`${API}/utilisateurs/moi`);
  }

  obtenirParId(id: number): Observable<UtilisateurResponse> {
    return this.http.get<UtilisateurResponse>(`${API}/utilisateurs/${id}`);
  }

  listerTous(): Observable<UtilisateurResponse[]> {
    return this.http.get<UtilisateurResponse[]>(`${API}/utilisateurs`);
  }

  suspendre(id: number, suspendu: boolean): Observable<UtilisateurResponse> {
    return this.http.put<UtilisateurResponse>(
      `${API}/utilisateurs/${id}/suspendre?suspendu=${suspendu}`, {});
  }
}
