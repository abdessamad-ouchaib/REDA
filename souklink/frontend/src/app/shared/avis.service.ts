/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║  AVIS SERVICE                                                 ║
 * ║  Auteur : Abdessamad Ouchaib                                  ║
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { AvisRequest, AvisResponse } from './models';

const API = environment.apiUrl;

@Injectable({ providedIn: 'root' })
export class AvisService {

  constructor(private http: HttpClient) {}

  laisser(request: AvisRequest): Observable<AvisResponse> {
    return this.http.post<AvisResponse>(`${API}/avis`, request);
  }

  listerPourUtilisateur(utilisateurId: number): Observable<AvisResponse[]> {
    return this.http.get<AvisResponse[]>(`${API}/avis/utilisateur/${utilisateurId}`);
  }
}
