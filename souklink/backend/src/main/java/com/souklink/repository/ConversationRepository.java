package com.souklink.repository;

import com.souklink.model.Conversation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ConversationRepository extends JpaRepository<Conversation, Long> {
    Optional<Conversation> findByAnnonceIdAndAcheteurId(Long annonceId, Long acheteurId);

    List<Conversation> findByAcheteurIdOrVendeurIdOrderByDateCreationDesc(Long acheteurId, Long vendeurId);
}
