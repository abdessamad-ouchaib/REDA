package com.souklink.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UtilisateurResponse {
    private Long id;
    private String nom;
    private String email;
    private String telephone;
    private String role;
    private boolean suspendu;
    private LocalDateTime dateInscription;
    private Double noteMoyenne;
}
