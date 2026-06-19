package com.souklink.controller;

import com.souklink.dto.AnnonceRequest;
import com.souklink.dto.AnnonceResponse;
import com.souklink.service.AnnonceService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/annonces")
@RequiredArgsConstructor
public class AnnonceController {

    private final AnnonceService annonceService;

    @GetMapping
    public ResponseEntity<Page<AnnonceResponse>> rechercher(
            @RequestParam(required = false) Long categorie,
            @RequestParam(required = false) BigDecimal prixMin,
            @RequestParam(required = false) BigDecimal prixMax,
            @RequestParam(required = false) String q,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int taille,
            HttpServletRequest httpRequest) {

        Long utilisateurConnecteId = (Long) httpRequest.getAttribute("utilisateurId");
        return ResponseEntity.ok(annonceService.rechercher(
                categorie, prixMin, prixMax, q, page, taille, utilisateurConnecteId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<AnnonceResponse> obtenirParId(@PathVariable Long id, HttpServletRequest httpRequest) {
        Long utilisateurConnecteId = (Long) httpRequest.getAttribute("utilisateurId");
        return ResponseEntity.ok(annonceService.obtenirParId(id, utilisateurConnecteId));
    }

    @GetMapping("/mes-annonces")
    public ResponseEntity<List<AnnonceResponse>> mesAnnonces(HttpServletRequest httpRequest) {
        Long vendeurId = (Long) httpRequest.getAttribute("utilisateurId");
        return ResponseEntity.ok(annonceService.listerParVendeur(vendeurId));
    }

    @GetMapping("/vendeur/{vendeurId}")
    public ResponseEntity<List<AnnonceResponse>> listerParVendeur(@PathVariable Long vendeurId) {
        return ResponseEntity.ok(annonceService.listerParVendeur(vendeurId));
    }

    @PostMapping
    public ResponseEntity<AnnonceResponse> creer(@Valid @RequestBody AnnonceRequest request,
                                                  HttpServletRequest httpRequest) {
        Long vendeurId = (Long) httpRequest.getAttribute("utilisateurId");
        return ResponseEntity.status(HttpStatus.CREATED).body(annonceService.creer(vendeurId, request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<AnnonceResponse> modifier(@PathVariable Long id,
                                                     @Valid @RequestBody AnnonceRequest request,
                                                     HttpServletRequest httpRequest) {
        Long vendeurId = (Long) httpRequest.getAttribute("utilisateurId");
        return ResponseEntity.ok(annonceService.modifier(vendeurId, id, request));
    }

    @PutMapping("/{id}/statut")
    public ResponseEntity<AnnonceResponse> changerStatut(@PathVariable Long id,
                                                          @RequestParam String statut,
                                                          HttpServletRequest httpRequest) {
        Long utilisateurId = (Long) httpRequest.getAttribute("utilisateurId");
        return ResponseEntity.ok(annonceService.changerStatut(utilisateurId, id, statut));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> supprimer(@PathVariable Long id, HttpServletRequest httpRequest) {
        Long vendeurId = (Long) httpRequest.getAttribute("utilisateurId");
        annonceService.supprimer(vendeurId, id);
        return ResponseEntity.noContent().build();
    }
}
