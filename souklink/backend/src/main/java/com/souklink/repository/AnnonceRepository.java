package com.souklink.repository;

import com.souklink.model.Annonce;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.List;

public interface AnnonceRepository extends JpaRepository<Annonce, Long> {

    @Query("""
        SELECT a FROM Annonce a
        WHERE a.statut = 'DISPONIBLE'
        AND (:categorieId IS NULL OR a.categorie.id = :categorieId)
        AND (:prixMin IS NULL OR a.prix >= :prixMin)
        AND (:prixMax IS NULL OR a.prix <= :prixMax)
        AND (:q IS NULL OR LOWER(a.titre) LIKE LOWER(CONCAT('%', :q, '%'))
             OR LOWER(a.description) LIKE LOWER(CONCAT('%', :q, '%')))
        ORDER BY a.dateCreation DESC
        """)
    Page<Annonce> rechercher(
            @Param("categorieId") Long categorieId,
            @Param("prixMin") BigDecimal prixMin,
            @Param("prixMax") BigDecimal prixMax,
            @Param("q") String q,
            Pageable pageable
    );

    List<Annonce> findByVendeurIdOrderByDateCreationDesc(Long vendeurId);
}
