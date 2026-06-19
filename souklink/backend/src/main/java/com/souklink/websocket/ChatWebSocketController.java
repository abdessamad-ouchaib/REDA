package com.souklink.websocket;

import com.souklink.dto.MessageResponse;
import com.souklink.service.MessageService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

/**
 * Gère les messages de chat envoyés en temps réel via STOMP.
 *
 * Le client se connecte sur /ws/messages, envoie un message sur
 * /app/conversations/{conversationId}/envoyer, et tous les participants
 * abonnés à /topic/conversations/{conversationId} reçoivent le message
 * instantanément.
 */
@Controller
@RequiredArgsConstructor
public class ChatWebSocketController {

    private final MessageService messageService;
    private final SimpMessagingTemplate messagingTemplate;

    @MessageMapping("/conversations/{conversationId}/envoyer")
    public void envoyerMessage(@DestinationVariable Long conversationId, ChatPayload payload) {
        MessageResponse messageEnvoye = messageService.envoyer(
                payload.getExpediteurId(), conversationId, payload.getContenu());

        messagingTemplate.convertAndSend(
                "/topic/conversations/" + conversationId, messageEnvoye);
    }

    public static class ChatPayload {
        private Long expediteurId;
        private String contenu;

        public Long getExpediteurId() {
            return expediteurId;
        }

        public void setExpediteurId(Long expediteurId) {
            this.expediteurId = expediteurId;
        }

        public String getContenu() {
            return contenu;
        }

        public void setContenu(String contenu) {
            this.contenu = contenu;
        }
    }
}
