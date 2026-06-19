/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║  CHAT SERVICE — Messagerie temps réel via WebSocket (STOMP)  ║
 * ║  Auteur : Abdessamad Ouchaib                                  ║
 * ╚══════════════════════════════════════════════════════════════╝
 *
 * Fonctionnement :
 *   1. Connexion au endpoint /ws/messages via SockJS (compatible
 *      avec Render et tous les navigateurs, y compris mobile).
 *   2. Abonnement à /topic/conversations/{id} pour recevoir les
 *      nouveaux messages en temps réel.
 *   3. Envoi via /app/conversations/{id}/envoyer.
 *   4. L'historique des messages passe par REST (/api/messages),
 *      le WebSocket ne gère que le temps réel.
 */

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { Client, IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { environment } from '../../environments/environment';
import { ConversationResponse, MessageResponse } from './models';

const API = environment.apiUrl;

@Injectable({ providedIn: 'root' })
export class ChatService {

  private client: Client | null = null;
  private messagesRecus = new Subject<MessageResponse>();
  private conversationsAbonnees = new Set<number>();

  constructor(private http: HttpClient) {}

  // ── REST : historique et liste des conversations ─────────────

  listerConversations(): Observable<ConversationResponse[]> {
    return this.http.get<ConversationResponse[]>(`${API}/conversations`);
  }

  obtenirConversation(id: number): Observable<ConversationResponse> {
    return this.http.get<ConversationResponse>(`${API}/conversations/${id}`);
  }

  ouvrirConversation(annonceId: number): Observable<ConversationResponse> {
    return this.http.get<ConversationResponse>(`${API}/conversations/annonce/${annonceId}`);
  }

  listerMessages(conversationId: number): Observable<MessageResponse[]> {
    return this.http.get<MessageResponse[]>(`${API}/messages/conversation/${conversationId}`);
  }

  marquerCommeLu(conversationId: number): Observable<void> {
    return this.http.put<void>(`${API}/messages/conversation/${conversationId}/lu`, {});
  }

  // ── WebSocket temps réel ───────────────────────────────────────

  /** Établit la connexion WebSocket si elle n'est pas déjà active. */
  connecter(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.client && this.client.connected) {
        resolve();
        return;
      }

      this.client = new Client({
        webSocketFactory: () => new SockJS(environment.wsUrl),
        reconnectDelay: 4000,
        onConnect: () => resolve(),
        onStompError: (frame) => reject(frame),
      });

      this.client.activate();
    });
  }

  /** S'abonne aux nouveaux messages d'une conversation donnée. */
  async ecouterConversation(conversationId: number): Promise<Observable<MessageResponse>> {
    await this.connecter();

    if (!this.conversationsAbonnees.has(conversationId) && this.client) {
      this.client.subscribe(`/topic/conversations/${conversationId}`, (message: IMessage) => {
        const messageRecu: MessageResponse = JSON.parse(message.body);
        this.messagesRecus.next(messageRecu);
      });
      this.conversationsAbonnees.add(conversationId);
    }

    return this.messagesRecus.asObservable();
  }

  /** Envoie un message en temps réel via WebSocket. */
  async envoyerMessage(conversationId: number, expediteurId: number, contenu: string): Promise<void> {
    await this.connecter();

    this.client?.publish({
      destination: `/app/conversations/${conversationId}/envoyer`,
      body: JSON.stringify({ expediteurId, contenu }),
    });
  }

  deconnecter(): void {
    this.client?.deactivate();
    this.conversationsAbonnees.clear();
  }
}
