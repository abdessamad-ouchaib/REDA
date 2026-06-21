package com.souklink.controller;

import com.souklink.dto.FavoriResponse;
import com.souklink.service.FavoriService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/annonces")
@RequiredArgsConstructor
public class FavoriController {

    private final FavoriService favoriService;

    @PostMapping("/{id}/favoris")
    public ResponseEntity<FavoriResponse> basculer(@PathVariable Long id, HttpServletRequest httpRequest) {
        Long utilisateurId = (Long) httpRequest.getAttribute("utilisateurId");
        return ResponseEntity.ok(favoriService.basculer(utilisateurId, id));
    }
}
