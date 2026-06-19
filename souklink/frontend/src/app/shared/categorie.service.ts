/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║  CATEGORIE SERVICE                                            ║
 * ║  Auteur : Abdessamad Ouchaib                                  ║
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { CategorieRequest, CategorieResponse } from './models';

const API = environment.apiUrl;

@Injectable({ providedIn: 'root' })
export class CategorieService {

  constructor(private http: HttpClient) {}

  listerToutes(): Observable<CategorieResponse[]> {
    return this.http.get<CategorieResponse[]>(`${API}/categories`);
  }

  creer(request: CategorieRequest): Observable<CategorieResponse> {
    return this.http.post<CategorieResponse>(`${API}/categories`, request);
  }

  supprimer(id: number): Observable<void> {
    return this.http.delete<void>(`${API}/categories/${id}`);
  }
}
