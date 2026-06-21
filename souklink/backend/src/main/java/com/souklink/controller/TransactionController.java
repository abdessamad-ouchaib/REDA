package com.souklink.controller;

import com.souklink.dto.CheckoutRequest;
import com.souklink.dto.CheckoutResponse;
import com.souklink.dto.TransactionResponse;
import com.souklink.service.StripeService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/transactions")
@RequiredArgsConstructor
public class TransactionController {

    private final StripeService stripeService;

    @PostMapping("/checkout")
    public ResponseEntity<CheckoutResponse> creerCheckout(@Valid @RequestBody CheckoutRequest request,
                                                            HttpServletRequest httpRequest) {
        Long acheteurId = (Long) httpRequest.getAttribute("utilisateurId");
        return ResponseEntity.ok(stripeService.creerSessionCheckout(acheteurId, request.getAnnonceId()));
    }

    @GetMapping
    public ResponseEntity<List<TransactionResponse>> mesTransactions(HttpServletRequest httpRequest) {
        Long acheteurId = (Long) httpRequest.getAttribute("utilisateurId");
        return ResponseEntity.ok(stripeService.listerPourAcheteur(acheteurId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<TransactionResponse> obtenirParId(@PathVariable Long id, HttpServletRequest httpRequest) {
        Long utilisateurId = (Long) httpRequest.getAttribute("utilisateurId");
        return ResponseEntity.ok(stripeService.obtenirParId(utilisateurId, id));
    }

    /**
     * Webhook Stripe — endpoint public (voir SecurityConfig), protégé
     * uniquement par la vérification de signature Stripe (en-tête Stripe-Signature),
     * jamais par un JWT. Le corps de la requête doit être lu en texte brut
     * AVANT toute désérialisation, car la signature porte sur le payload exact.
     */
    @PostMapping("/webhook")
    public ResponseEntity<String> recevoirWebhook(@RequestBody String payload,
                                                    @RequestHeader("Stripe-Signature") String signature) {
        stripeService.traiterWebhook(payload, signature);
        return ResponseEntity.ok("ok");
    }
}
