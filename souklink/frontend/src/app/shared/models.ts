/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║  MODELS — Interfaces TypeScript miroir des DTOs Spring Boot   ║
 * ║  Auteur : Abdessamad Ouchaib                                  ║
 * ╚══════════════════════════════════════════════════════════════╝
 */

// ── AUTH ──────────────────────────────────────────────────────
export interface RegisterRequest {
  nom: string;
  email: string;
  motDePasse: string;
  telephone?: string;
}

export interface LoginRequest {
  email: string;
  motDePasse: string;
}

export interface AuthResponse {
  token: string;
  id: number;
  nom: string;
  email: string;
  role: 'UTILISATEUR' | 'ADMIN';
}

// ── UTILISATEUR ───────────────────────────────────────────────
export interface UtilisateurResponse {
  id: number;
  nom: string;
  email: string;
  telephone?: string;
  role: 'UTILISATEUR' | 'ADMIN';
  suspendu: boolean;
  dateInscription: string;
  noteMoyenne: number | null;
}

// ── CATEGORIE ─────────────────────────────────────────────────
export interface CategorieResponse {
  id: number;
  nom: string;
  parentId: number | null;
}

export interface CategorieRequest {
  nom: string;
  parentId?: number;
}

// ── PHOTO ─────────────────────────────────────────────────────
export interface PhotoResponse {
  id: number;
  urlStockage: string;
  ordreAffichage: number;
}

export interface PhotoRequest {
  urlStockage: string;
  ordreAffichage: number;
}

// ── ANNONCE ───────────────────────────────────────────────────
export type EtatAnnonce = 'NEUF' | 'OCCASION';
export type StatutAnnonce = 'DISPONIBLE' | 'VENDU' | 'SUSPENDU';

export interface AnnonceRequest {
  titre: string;
  description?: string;
  prix: number;
  etat?: EtatAnnonce;
  categorieId?: number;
}

export interface AnnonceResponse {
  id: number;
  titre: string;
  description: string;
  prix: number;
  etat: EtatAnnonce;
  statut: StatutAnnonce;
  categorieNom: string | null;
  categorieId: number | null;
  vendeurId: number;
  vendeurNom: string;
  vendeurNoteMoyenne: number | null;
  photos: PhotoResponse[];
  dateCreation: string;
  estFavori: boolean;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
}

// ── CONVERSATION & MESSAGE ───────────────────────────────────
export interface ConversationResponse {
  id: number;
  annonceId: number;
  annonceTitre: string;
  annoncePhotoUrl: string | null;
  acheteurId: number;
  acheteurNom: string;
  vendeurId: number;
  vendeurNom: string;
  dateCreation: string;
  dernierMessage: string | null;
  dateDernierMessage: string | null;
  nombreMessagesNonLus: number;
}

export interface MessageRequest {
  conversationId: number;
  contenu: string;
}

export interface MessageResponse {
  id: number;
  conversationId: number;
  expediteurId: number;
  expediteurNom: string;
  contenu: string;
  dateEnvoi: string;
  lu: boolean;
}

// ── TRANSACTION (STRIPE) ─────────────────────────────────────
export type StatutPaiement = 'EN_ATTENTE' | 'PAYE' | 'ECHOUE' | 'ANNULE';

export interface CheckoutRequest {
  annonceId: number;
}

export interface CheckoutResponse {
  checkoutUrl: string;
  sessionId: string;
  transactionId: number;
}

export interface TransactionResponse {
  id: number;
  annonceId: number;
  annonceTitre: string;
  acheteurId: number;
  montant: number;
  statutPaiement: StatutPaiement;
  dateCreation: string;
  datePaiement: string | null;
}

// ── AVIS ──────────────────────────────────────────────────────
export interface AvisRequest {
  transactionId: number;
  note: number;
  commentaire?: string;
}

export interface AvisResponse {
  id: number;
  utilisateurEvalueId: number;
  utilisateurEvaluateurId: number;
  evaluateurNom: string;
  note: number;
  commentaire: string;
  dateAvis: string;
}

// ── FAVORI ────────────────────────────────────────────────────
export interface FavoriResponse {
  annonceId: number;
  estFavori: boolean;
}
