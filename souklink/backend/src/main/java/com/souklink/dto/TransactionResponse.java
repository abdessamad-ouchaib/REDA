package com.souklink.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TransactionResponse {
    private Long id;
    private Long annonceId;
    private String annonceTitre;
    private Long acheteurId;
    private BigDecimal montant;
    private String statutPaiement;
    private LocalDateTime dateCreation;
    private LocalDateTime datePaiement;
}
