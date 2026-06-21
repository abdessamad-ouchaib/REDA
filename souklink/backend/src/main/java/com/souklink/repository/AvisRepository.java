package com.souklink.repository;

import com.souklink.model.Avis;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface AvisRepository extends JpaRepository<Avis, Long> {
    List<Avis> findByUtilisateurEvalueIdOrderByDateAvisDesc(Long utilisateurId);

    boolean existsByTransactionIdAndUtilisateurEvaluateurId(Long transactionId, Long evaluateurId);

    @Query("SELECT AVG(a.note) FROM Avis a WHERE a.utilisateurEvalue.id = :utilisateurId")
    Double moyenneNotePourUtilisateur(@Param("utilisateurId") Long utilisateurId);
}
