package com.souklink.service;

import com.souklink.dto.ConversationResponse;
import com.souklink.exception.AccesNonAutoriseException;
import com.souklink.exception.ElementNonTrouveException;
import com.souklink.exception.RequeteInvalideException;
import com.souklink.model.Annonce;
import com.souklink.model.Conversation;
import com.souklink.model.Message;
import com.souklink.model.Utilisateur;
import com.souklink.repository.AnnonceRepository;
import com.souklink.repository.ConversationRepository;
import com.souklink.repository.MessageRepository;
import com.souklink.repository.UtilisateurRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ConversationService {

    private final ConversationRepository conversationRepository;
    private final AnnonceRepository annonceRepository;
    private final MessageRepository messageRepository;
    private final UtilisateurRepository utilisateurRepository;

    public ConversationResponse ouvrirOuRecuperer(Long acheteurId, Long annonceId) {
        Annonce annonce = annonceRepository.findById(annonceId)
                .orElseThrow(() -> new ElementNonTrouveException("Annonce introuvable"));

        if (annonce.getVendeur().getId().equals(acheteurId)) {
            throw new RequeteInvalideException("Vous ne pouvez pas discuter avec vous-même sur votre propre annonce");
        }

        Conversation conversation = conversationRepository.findByAnnonceIdAndAcheteurId(annonceId, acheteurId)
                .orElseGet(() -> {
                    Utilisateur acheteur = utilisateurRepository.findById(acheteurId)
                            .orElseThrow(() -> new ElementNonTrouveException("Utilisateur introuvable"));

                    Conversation nouvelle = new Conversation();
                    nouvelle.setAnnonce(annonce);
                    nouvelle.setAcheteur(acheteur);
                    nouvelle.setVendeur(annonce.getVendeur());
                    return conversationRepository.save(nouvelle);
                });

        return versResponse(conversation, acheteurId);
    }

    public List<ConversationResponse> listerPourUtilisateur(Long utilisateurId) {
        return conversationRepository.findByAcheteurIdOrVendeurIdOrderByDateCreationDesc(utilisateurId, utilisateurId)
                .stream().map(c -> versResponse(c, utilisateurId)).toList();
    }

    public ConversationResponse obtenirParId(Long utilisateurId, Long conversationId) {
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new ElementNonTrouveException("Conversation introuvable"));
        verifierParticipant(conversation, utilisateurId);
        return versResponse(conversation, utilisateurId);
    }

    void verifierParticipant(Conversation conversation, Long utilisateurId) {
        boolean estParticipant = conversation.getAcheteur().getId().equals(utilisateurId)
                || conversation.getVendeur().getId().equals(utilisateurId);
        if (!estParticipant) {
            throw new AccesNonAutoriseException("Vous ne participez pas à cette conversation");
        }
    }

    ConversationResponse versResponse(Conversation c, Long utilisateurId) {
        List<Message> messages = messageRepository.findByConversationIdOrderByDateEnvoiAsc(c.getId());

        Message dernier = messages.stream()
                .max(Comparator.comparing(Message::getDateEnvoi))
                .orElse(null);

        long nonLus = messages.stream()
                .filter(m -> !m.isLu() && !m.getExpediteur().getId().equals(utilisateurId))
                .count();

        String photoUrl = c.getAnnonce().getPhotos().isEmpty() ? null
                : c.getAnnonce().getPhotos().get(0).getUrlStockage();

        return new ConversationResponse(
                c.getId(), c.getAnnonce().getId(), c.getAnnonce().getTitre(), photoUrl,
                c.getAcheteur().getId(), c.getAcheteur().getNom(),
                c.getVendeur().getId(), c.getVendeur().getNom(),
                c.getDateCreation(),
                dernier != null ? dernier.getContenu() : null,
                dernier != null ? dernier.getDateEnvoi() : null,
                nonLus
        );
    }
}
