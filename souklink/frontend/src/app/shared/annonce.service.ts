/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║  ANNONCE SERVICE — Catalogue, recherche, CRUD annonces       ║
 * ║  Auteur : Abdessamad Ouchaib                                  ║
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  AnnonceRequest, AnnonceResponse, FavoriResponse, PageResponse,
  PhotoRequest, PhotoResponse
} from './models';

const API = environment.apiUrl;

export interface CritereRecherche {
  categorie?: number;
  prixMin?: number;
  prixMax?: number;
  q?: string;
  page?: number;
  taille?: number;
}

@Injectable({ providedIn: 'root' })
export class AnnonceService {

  constructor(private http: HttpClient) {}

  rechercher(criteres: CritereRecherche): Observable<PageResponse<AnnonceResponse>> {
    let params = new HttpParams();
    if (criteres.categorie != null) params = params.set('categorie', criteres.categorie);
    if (criteres.prixMin != null) params = params.set('prixMin', criteres.prixMin);
    if (criteres.prixMax != null) params = params.set('prixMax', criteres.prixMax);
    if (criteres.q) params = params.set('q', criteres.q);
    params = params.set('page', criteres.page ?? 0);
    params = params.set('taille', criteres.taille ?? 20);

    return this.http.get<PageResponse<AnnonceResponse>>(`${API}/annonces`, { params });
  }

  obtenirParId(id: number): Observable<AnnonceResponse> {
    return this.http.get<AnnonceResponse>(`${API}/annonces/${id}`);
  }

  mesAnnonces(): Observable<AnnonceResponse[]> {
    return this.http.get<AnnonceResponse[]>(`${API}/annonces/mes-annonces`);
  }

  listerParVendeur(vendeurId: number): Observable<AnnonceResponse[]> {
    return this.http.get<AnnonceResponse[]>(`${API}/annonces/vendeur/${vendeurId}`);
  }

  creer(request: AnnonceRequest): Observable<AnnonceResponse> {
    return this.http.post<AnnonceResponse>(`${API}/annonces`, request);
  }

  modifier(id: number, request: AnnonceRequest): Observable<AnnonceResponse> {
    return this.http.put<AnnonceResponse>(`${API}/annonces/${id}`, request);
  }

  changerStatut(id: number, statut: string): Observable<AnnonceResponse> {
    const params = new HttpParams().set('statut', statut);
    return this.http.put<AnnonceResponse>(`${API}/annonces/${id}/statut`, {}, { params });
  }

  supprimer(id: number): Observable<void> {
    return this.http.delete<void>(`${API}/annonces/${id}`);
  }

  ajouterPhoto(annonceId: number, request: PhotoRequest): Observable<PhotoResponse> {
    return this.http.post<PhotoResponse>(`${API}/annonces/${annonceId}/photos`, request);
  }

  supprimerPhoto(annonceId: number, photoId: number): Observable<void> {
    return this.http.delete<void>(`${API}/annonces/${annonceId}/photos/${photoId}`);
  }

  basculerFavori(annonceId: number): Observable<FavoriResponse> {
    return this.http.post<FavoriResponse>(`${API}/annonces/${annonceId}/favoris`, {});
  }
}
