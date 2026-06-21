package com.souklink.repository;

import com.souklink.model.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    Optional<Transaction> findByStripeSessionId(String stripeSessionId);
    List<Transaction> findByAcheteurIdOrderByDateCreationDesc(Long acheteurId);

    boolean existsByAnnonceIdAndAcheteurIdAndStatutPaiement(
            Long annonceId, Long acheteurId, Transaction.StatutPaiement statutPaiement);
}
