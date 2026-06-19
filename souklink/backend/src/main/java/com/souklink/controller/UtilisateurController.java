package com.souklink.controller;

import com.souklink.dto.UtilisateurResponse;
import com.souklink.service.UtilisateurService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/utilisateurs")
@RequiredArgsConstructor
public class UtilisateurController {

    private final UtilisateurService utilisateurService;

    @GetMapping("/moi")
    public ResponseEntity<UtilisateurResponse> monProfil(HttpServletRequest request) {
        Long utilisateurId = (Long) request.getAttribute("utilisateurId");
        return ResponseEntity.ok(utilisateurService.obtenirParId(utilisateurId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<UtilisateurResponse> obtenirParId(@PathVariable Long id) {
        return ResponseEntity.ok(utilisateurService.obtenirParId(id));
    }

    @GetMapping
    public ResponseEntity<List<UtilisateurResponse>> listerTous(HttpServletRequest request) {
        return ResponseEntity.ok(utilisateurService.listerTous());
    }

    @PutMapping("/{id}/suspendre")
    public ResponseEntity<UtilisateurResponse> suspendre(@PathVariable Long id,
                                                           @RequestParam boolean suspendu,
                                                           HttpServletRequest request) {
        Long adminId = (Long) request.getAttribute("utilisateurId");
        return ResponseEntity.ok(utilisateurService.suspendre(adminId, id, suspendu));
    }
}
