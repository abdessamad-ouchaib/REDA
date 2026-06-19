package com.souklink.controller;

import com.souklink.dto.MessageRequest;
import com.souklink.dto.MessageResponse;
import com.souklink.service.MessageService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/messages")
@RequiredArgsConstructor
public class MessageController {

    private final MessageService messageService;

    @GetMapping("/conversation/{conversationId}")
    public ResponseEntity<List<MessageResponse>> listerParConversation(@PathVariable Long conversationId,
                                                                          HttpServletRequest httpRequest) {
        Long utilisateurId = (Long) httpRequest.getAttribute("utilisateurId");
        return ResponseEntity.ok(messageService.listerParConversation(utilisateurId, conversationId));
    }

    // Endpoint REST de repli — le chemin principal pour l'envoi en temps réel
    // est le WebSocket /ws/messages (voir ChatWebSocketController), mais ce
    // endpoint permet aussi l'envoi via HTTP classique si nécessaire.
    @PostMapping
    public ResponseEntity<MessageResponse> envoyer(@Valid @RequestBody MessageRequest request,
                                                     HttpServletRequest httpRequest) {
        Long expediteurId = (Long) httpRequest.getAttribute("utilisateurId");
        MessageResponse reponse = messageService.envoyer(expediteurId, request.getConversationId(), request.getContenu());
        return ResponseEntity.status(HttpStatus.CREATED).body(reponse);
    }

    @PutMapping("/conversation/{conversationId}/lu")
    public ResponseEntity<Void> marquerCommeLu(@PathVariable Long conversationId, HttpServletRequest httpRequest) {
        Long utilisateurId = (Long) httpRequest.getAttribute("utilisateurId");
        messageService.marquerCommeLu(utilisateurId, conversationId);
        return ResponseEntity.noContent().build();
    }
}
