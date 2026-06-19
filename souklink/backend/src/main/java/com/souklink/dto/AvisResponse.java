package com.souklink.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AvisResponse {
    private Long id;
    private Long utilisateurEvalueId;
    private Long utilisateurEvaluateurId;
    private String evaluateurNom;
    private int note;
    private String commentaire;
    private LocalDateTime dateAvis;
}
