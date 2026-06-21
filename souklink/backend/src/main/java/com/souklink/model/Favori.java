package com.souklink.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.Objects;

@Entity
@Table(name = "favoris")
@Data
@NoArgsConstructor
@AllArgsConstructor
@IdClass(Favori.FavoriId.class)
public class Favori {

    @Id
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "utilisateur_id", nullable = false)
    private Utilisateur utilisateur;

    @Id
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "annonce_id", nullable = false)
    private Annonce annonce;

    @Column(name = "date_ajout", nullable = false)
    private LocalDateTime dateAjout = LocalDateTime.now();

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FavoriId implements Serializable {
        private Long utilisateur;
        private Long annonce;

        @Override
        public boolean equals(Object o) {
            if (this == o) return true;
            if (!(o instanceof FavoriId)) return false;
            FavoriId that = (FavoriId) o;
            return Objects.equals(utilisateur, that.utilisateur) && Objects.equals(annonce, that.annonce);
        }

        @Override
        public int hashCode() {
            return Objects.hash(utilisateur, annonce);
        }
    }
}
