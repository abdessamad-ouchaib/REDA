package com.souklink.repository;

import com.souklink.model.Favori;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface FavoriRepository extends JpaRepository<Favori, Favori.FavoriId> {
    List<Favori> findByUtilisateurId(Long utilisateurId);
    Optional<Favori> findByUtilisateurIdAndAnnonceId(Long utilisateurId, Long annonceId);
    void deleteByUtilisateurIdAndAnnonceId(Long utilisateurId, Long annonceId);
}
