package com.souklink.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MessageResponse {
    private Long id;
    private Long conversationId;
    private Long expediteurId;
    private String expediteurNom;
    private String contenu;
    private LocalDateTime dateEnvoi;
    private boolean lu;
}
