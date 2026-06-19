package com.souklink.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.souklink.dto.AnnonceRequest;
import com.souklink.dto.RegisterRequest;
import com.souklink.model.Utilisateur;
import com.souklink.repository.UtilisateurRepository;
import com.souklink.service.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AnnonceControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UtilisateurRepository utilisateurRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtService jwtService;

    private String tokenVendeur;

    @BeforeEach
    void setUp() {
        Utilisateur vendeur = new Utilisateur();
        vendeur.setNom("Vendeur Annonce Test");
        vendeur.setEmail("vendeur.annonce." + System.nanoTime() + "@example.com");
        vendeur.setMotDePasseHash(passwordEncoder.encode("motdepasse123"));
        vendeur.setRole(Utilisateur.RoleUtilisateur.UTILISATEUR);
        Utilisateur sauvegarde = utilisateurRepository.save(vendeur);

        tokenVendeur = jwtService.genererToken(sauvegarde.getId(), sauvegarde.getEmail(), "UTILISATEUR");
    }

    @Test
    void creerAnnonce_reussit_avecTokenValide() throws Exception {
        AnnonceRequest request = new AnnonceRequest();
        request.setTitre("Vélo VTT");
        request.setDescription("Très bon état, peu utilisé");
        request.setPrix(new BigDecimal("1200"));
        request.setEtat("OCCASION");

        mockMvc.perform(post("/api/annonces")
                        .header("Authorization", "Bearer " + tokenVendeur)
                        .contentType("application/json")
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.titre").value("Vélo VTT"))
                .andExpect(jsonPath("$.statut").value("DISPONIBLE"));
    }

    @Test
    void creerAnnonce_echoue_quandTitreManquant() throws Exception {
        AnnonceRequest request = new AnnonceRequest();
        request.setPrix(new BigDecimal("100"));

        mockMvc.perform(post("/api/annonces")
                        .header("Authorization", "Bearer " + tokenVendeur)
                        .contentType("application/json")
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void rechercherAnnonces_retourneListePaginee() throws Exception {
        AnnonceRequest request = new AnnonceRequest();
        request.setTitre("Table en bois");
        request.setPrix(new BigDecimal("300"));
        request.setEtat("OCCASION");

        mockMvc.perform(post("/api/annonces")
                        .header("Authorization", "Bearer " + tokenVendeur)
                        .contentType("application/json")
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated());

        mockMvc.perform(get("/api/annonces")
                        .param("q", "Table"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray());
    }

    @Test
    void modifierAnnonce_echoue_quandPasProprietaire() throws Exception {
        AnnonceRequest creation = new AnnonceRequest();
        creation.setTitre("Console PS5");
        creation.setPrix(new BigDecimal("4000"));

        String reponse = mockMvc.perform(post("/api/annonces")
                        .header("Authorization", "Bearer " + tokenVendeur)
                        .contentType("application/json")
                        .content(objectMapper.writeValueAsString(creation)))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();

        Long annonceId = objectMapper.readTree(reponse).get("id").asLong();

        Utilisateur autreUtilisateur = new Utilisateur();
        autreUtilisateur.setNom("Autre Utilisateur");
        autreUtilisateur.setEmail("autre." + System.nanoTime() + "@example.com");
        autreUtilisateur.setMotDePasseHash(passwordEncoder.encode("motdepasse123"));
        autreUtilisateur.setRole(Utilisateur.RoleUtilisateur.UTILISATEUR);
        Utilisateur sauvegarde = utilisateurRepository.save(autreUtilisateur);
        String tokenAutre = jwtService.genererToken(sauvegarde.getId(), sauvegarde.getEmail(), "UTILISATEUR");

        AnnonceRequest modification = new AnnonceRequest();
        modification.setTitre("Tentative de modification frauduleuse");
        modification.setPrix(new BigDecimal("1"));

        mockMvc.perform(put("/api/annonces/" + annonceId)
                        .header("Authorization", "Bearer " + tokenAutre)
                        .contentType("application/json")
                        .content(objectMapper.writeValueAsString(modification)))
                .andExpect(status().isForbidden());
    }
}
