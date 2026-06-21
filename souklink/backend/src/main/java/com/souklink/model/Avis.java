package com.souklink.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "avis")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Avis {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "transaction_id", nullable = false)
    private Transaction transaction;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "utilisateur_evalue_id", nullable = false)
    private Utilisateur utilisateurEvalue;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "utilisateur_evaluateur_id", nullable = false)
    private Utilisateur utilisateurEvaluateur;

    @Column(nullable = false)
    private int note;

    @Column(length = 1000)
    private String commentaire;

    @Column(name = "date_avis", nullable = false)
    private LocalDateTime dateAvis = LocalDateTime.now();
}
