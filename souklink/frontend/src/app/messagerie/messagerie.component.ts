/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║  MESSAGERIE COMPONENT — Chat temps réel avec WebSocket STOMP  ║
 * ║  Auteur : Abdessamad Ouchaib                                  ║
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { Component, OnInit, OnDestroy, ElementRef, ViewChild, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { ChatService } from '../shared/chat.service';
import { AuthService } from '../shared/auth.service';
import { ConversationResponse, MessageResponse } from '../shared/models';

@Component({
  selector: 'app-messagerie',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 py-6 h-[calc(100vh-4rem)]">
      <div class="flex h-full gap-4">

        <!-- Liste des conversations -->
        <aside [class]="'bg-white rounded-2xl border border-gray-200 flex flex-col overflow-hidden ' +
                        (conversationSelectionnee ? 'hidden sm:flex sm:w-80' : 'flex-1 sm:flex-none sm:w-80')">
          <div class="p-4 border-b border-gray-100 shrink-0">
            <h2 class="font-bold text-gray-900">Messages</h2>
          </div>
          <div class="overflow-y-auto flex-1">
            <div *ngIf="chargementConversations" class="p-4 text-center text-gray-400 text-sm">Chargement...</div>
            <div *ngIf="!chargementConversations && conversations.length === 0"
                 class="p-6 text-center text-gray-400">
              <p class="text-2xl mb-2">💬</p>
              <p class="text-sm">Aucune conversation.<br>Contacte un vendeur depuis une annonce !</p>
            </div>
            <button *ngFor="let conv of conversations" (click)="ouvrirConversation(conv)"
                    [class]="'w-full text-left px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition ' +
                              (conversationSelectionnee?.id === conv.id ? 'bg-primary-50 border-l-4 border-l-primary-500' : '')">
              <div class="flex items-start gap-3">
                <div class="w-10 h-10 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-sm shrink-0">
                  {{ interlocuteur(conv).charAt(0).toUpperCase() }}
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex justify-between items-center">
                    <p class="font-semibold text-sm text-gray-900 truncate">{{ interlocuteur(conv) }}</p>
                    <span *ngIf="conv.nombreMessagesNonLus > 0"
                          class="shrink-0 w-5 h-5 bg-primary-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                      {{ conv.nombreMessagesNonLus }}
                    </span>
                  </div>
                  <p class="text-xs text-gray-500 truncate">{{ conv.annonceTitre }}</p>
                  <p *ngIf="conv.dernierMessage" class="text-xs text-gray-400 truncate mt-0.5">{{ conv.dernierMessage }}</p>
                </div>
              </div>
            </button>
          </div>
        </aside>

        <!-- Zone de chat -->
        <div [class]="'flex-1 flex flex-col bg-white rounded-2xl border border-gray-200 overflow-hidden ' +
                      (!conversationSelectionnee ? 'hidden sm:flex' : 'flex')">

          <!-- Aucune conversation sélectionnée -->
          <div *ngIf="!conversationSelectionnee"
               class="flex-1 flex items-center justify-center text-gray-400">
            <div class="text-center">
              <p class="text-4xl mb-3">💬</p>
              <p class="text-sm font-medium">Sélectionne une conversation</p>
            </div>
          </div>

          <ng-container *ngIf="conversationSelectionnee">
            <!-- En-tête chat -->
            <div class="px-4 py-3 border-b border-gray-100 flex items-center gap-3 shrink-0">
              <button (click)="conversationSelectionnee = null" class="sm:hidden text-gray-500 hover:text-gray-700 p-1">
                ← 
              </button>
              <div class="w-9 h-9 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-sm">
                {{ interlocuteur(conversationSelectionnee).charAt(0).toUpperCase() }}
              </div>
              <div>
                <p class="font-semibold text-sm text-gray-900">{{ interlocuteur(conversationSelectionnee) }}</p>
                <a [routerLink]="['/annonces', conversationSelectionnee.annonceId]"
                   class="text-xs text-primary-600 hover:underline">{{ conversationSelectionnee.annonceTitre }}</a>
              </div>
            </div>

            <!-- Messages -->
            <div #zoneMessages class="flex-1 overflow-y-auto p-4 space-y-3">
              <div *ngFor="let msg of messages" class="flex"
                   [class.justify-end]="msg.expediteurId === utilisateurId">
                <div [class]="'max-w-[70%] px-4 py-2 rounded-2xl text-sm ' +
                               (msg.expediteurId === utilisateurId
                                 ? 'bg-primary-600 text-white rounded-br-none'
                                 : 'bg-gray-100 text-gray-800 rounded-bl-none')">
                  <p>{{ msg.contenu }}</p>
                  <p class="text-xs mt-1 opacity-60">{{ msg.dateEnvoi | date:'HH:mm' }}</p>
                </div>
              </div>
              <div *ngIf="messages.length === 0 && !chargementMessages"
                   class="text-center text-gray-400 text-sm py-8">Commencez la conversation !</div>
              <div *ngIf="chargementMessages" class="text-center text-gray-400 text-sm py-4">Chargement...</div>
            </div>

            <!-- Zone de saisie -->
            <div class="border-t border-gray-100 p-3 flex gap-3 shrink-0">
              <input type="text" [(ngModel)]="messageTexte" (keyup.enter)="envoyerMessage()"
                     placeholder="Écris un message..."
                     class="flex-1 border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 transition">
              <button (click)="envoyerMessage()" [disabled]="!messageTexte.trim()"
                      class="bg-primary-600 hover:bg-primary-700 disabled:opacity-40 text-white px-4 py-2.5 rounded-xl font-semibold text-sm transition">
                Envoyer
              </button>
            </div>
          </ng-container>
        </div>
      </div>
    </div>
  `
})
export class MessagerieComponent implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild('zoneMessages') zoneMessages?: ElementRef;

  conversations: ConversationResponse[] = [];
  conversationSelectionnee: ConversationResponse | null = null;
  messages: MessageResponse[] = [];
  messageTexte = '';
  utilisateurId = 0;
  chargementConversations = true;
  chargementMessages = false;
  private abonnement?: Subscription;
  private defileNecessaire = false;

  constructor(
    private chatService: ChatService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.utilisateurId = this.authService.getUserId();
    this.chargerConversations();
  }

  chargerConversations(): void {
    this.chatService.listerConversations().subscribe({
      next: convs => {
        this.conversations = convs;
        this.chargementConversations = false;

        const id = this.route.snapshot.paramMap.get('id');
        if (id) {
          const conv = convs.find(c => c.id === Number(id));
          if (conv) this.ouvrirConversation(conv);
        }
      },
      error: () => this.chargementConversations = false
    });
  }

  async ouvrirConversation(conv: ConversationResponse): Promise<void> {
    this.conversationSelectionnee = conv;
    this.messages = [];
    this.chargementMessages = true;
    this.abonnement?.unsubscribe();
    this.router.navigate(['/messagerie', conv.id], { replaceUrl: true });

    this.chatService.listerMessages(conv.id).subscribe(msgs => {
      this.messages = msgs;
      this.chargementMessages = false;
      this.defileNecessaire = true;
      this.chatService.marquerCommeLu(conv.id).subscribe();
      conv.nombreMessagesNonLus = 0;
    });

    // Connexion WebSocket temps réel
    const obs$ = await this.chatService.ecouterConversation(conv.id);
    this.abonnement = obs$.subscribe(msg => {
      if (msg.conversationId === conv.id) {
        this.messages.push(msg);
        this.defileNecessaire = true;
      }
    });
  }

  envoyerMessage(): void {
    if (!this.messageTexte.trim() || !this.conversationSelectionnee) return;
    const contenu = this.messageTexte.trim();
    this.messageTexte = '';
    this.chatService.envoyerMessage(this.conversationSelectionnee.id, this.utilisateurId, contenu);
  }

  interlocuteur(conv: ConversationResponse): string {
    return conv.acheteurId === this.utilisateurId ? conv.vendeurNom : conv.acheteurNom;
  }

  ngAfterViewChecked(): void {
    if (this.defileNecessaire && this.zoneMessages) {
      const el = this.zoneMessages.nativeElement;
      el.scrollTop = el.scrollHeight;
      this.defileNecessaire = false;
    }
  }

  ngOnDestroy(): void {
    this.abonnement?.unsubscribe();
    this.chatService.deconnecter();
  }
}
