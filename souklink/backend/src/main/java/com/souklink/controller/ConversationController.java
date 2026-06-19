package com.souklink.controller;

import com.souklink.dto.ConversationResponse;
import com.souklink.service.ConversationService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/conversations")
@RequiredArgsConstructor
public class ConversationController {

    private final ConversationService conversationService;

    @GetMapping
    public ResponseEntity<List<ConversationResponse>> mesConversations(HttpServletRequest httpRequest) {
        Long utilisateurId = (Long) httpRequest.getAttribute("utilisateurId");
        return ResponseEntity.ok(conversationService.listerPourUtilisateur(utilisateurId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ConversationResponse> obtenirParId(@PathVariable Long id, HttpServletRequest httpRequest) {
        Long utilisateurId = (Long) httpRequest.getAttribute("utilisateurId");
        return ResponseEntity.ok(conversationService.obtenirParId(utilisateurId, id));
    }

    @GetMapping("/annonce/{annonceId}")
    public ResponseEntity<ConversationResponse> ouvrirOuRecuperer(@PathVariable Long annonceId,
                                                                    HttpServletRequest httpRequest) {
        Long acheteurId = (Long) httpRequest.getAttribute("utilisateurId");
        return ResponseEntity.ok(conversationService.ouvrirOuRecuperer(acheteurId, annonceId));
    }
}
