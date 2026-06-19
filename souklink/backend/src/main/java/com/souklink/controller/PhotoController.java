package com.souklink.controller;

import com.souklink.dto.PhotoRequest;
import com.souklink.dto.PhotoResponse;
import com.souklink.service.PhotoService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/annonces/{annonceId}/photos")
@RequiredArgsConstructor
public class PhotoController {

    private final PhotoService photoService;

    @GetMapping
    public ResponseEntity<List<PhotoResponse>> lister(@PathVariable Long annonceId) {
        return ResponseEntity.ok(photoService.listerParAnnonce(annonceId));
    }

    @PostMapping
    public ResponseEntity<PhotoResponse> ajouter(@PathVariable Long annonceId,
                                                  @Valid @RequestBody PhotoRequest request,
                                                  HttpServletRequest httpRequest) {
        Long vendeurId = (Long) httpRequest.getAttribute("utilisateurId");
        return ResponseEntity.status(HttpStatus.CREATED).body(photoService.ajouter(vendeurId, annonceId, request));
    }

    @DeleteMapping("/{photoId}")
    public ResponseEntity<Void> supprimer(@PathVariable Long annonceId, @PathVariable Long photoId,
                                           HttpServletRequest httpRequest) {
        Long vendeurId = (Long) httpRequest.getAttribute("utilisateurId");
        photoService.supprimer(vendeurId, photoId);
        return ResponseEntity.noContent().build();
    }
}
