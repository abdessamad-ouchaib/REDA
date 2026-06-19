package com.souklink.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AnnonceResponse {
    private Long id;
    private String titre;
    private String description;
    private BigDecimal prix;
    private String etat;
    private String statut;
    private String categorieNom;
    private Long categorieId;
    private Long vendeurId;
    private String vendeurNom;
    private Double vendeurNoteMoyenne;
    private List<PhotoResponse> photos;
    private LocalDateTime dateCreation;
    private boolean estFavori;
}
