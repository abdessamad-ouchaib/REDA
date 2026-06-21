package com.souklink.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ConversationResponse {
    private Long id;
    private Long annonceId;
    private String annonceTitre;
    private String annoncePhotoUrl;
    private Long acheteurId;
    private String acheteurNom;
    private Long vendeurId;
    private String vendeurNom;
    private LocalDateTime dateCreation;
    private String dernierMessage;
    private LocalDateTime dateDernierMessage;
    private long nombreMessagesNonLus;
}
