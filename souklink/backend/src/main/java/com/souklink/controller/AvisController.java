package com.souklink.controller;

import com.souklink.dto.AvisRequest;
import com.souklink.dto.AvisResponse;
import com.souklink.service.AvisService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/avis")
@RequiredArgsConstructor
public class AvisController {

    private final AvisService avisService;

    @PostMapping
    public ResponseEntity<AvisResponse> laisser(@Valid @RequestBody AvisRequest request,
                                                 HttpServletRequest httpRequest) {
        Long evaluateurId = (Long) httpRequest.getAttribute("utilisateurId");
        return ResponseEntity.status(HttpStatus.CREATED).body(avisService.laisser(evaluateurId, request));
    }

    @GetMapping("/utilisateur/{utilisateurId}")
    public ResponseEntity<List<AvisResponse>> listerPourUtilisateur(@PathVariable Long utilisateurId) {
        return ResponseEntity.ok(avisService.listerPourUtilisateur(utilisateurId));
    }
}
