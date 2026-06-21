package com.souklink.controller;

import com.souklink.dto.CategorieRequest;
import com.souklink.dto.CategorieResponse;
import com.souklink.service.CategorieService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class CategorieController {

    private final CategorieService categorieService;

    @GetMapping
    public ResponseEntity<List<CategorieResponse>> listerToutes() {
        return ResponseEntity.ok(categorieService.listerToutes());
    }

    @PostMapping
    public ResponseEntity<CategorieResponse> creer(@Valid @RequestBody CategorieRequest request,
                                                     HttpServletRequest httpRequest) {
        Long adminId = (Long) httpRequest.getAttribute("utilisateurId");
        return ResponseEntity.status(HttpStatus.CREATED).body(categorieService.creer(adminId, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> supprimer(@PathVariable Long id, HttpServletRequest httpRequest) {
        Long adminId = (Long) httpRequest.getAttribute("utilisateurId");
        categorieService.supprimer(adminId, id);
        return ResponseEntity.noContent().build();
    }
}
