package com.souklink.service;

import com.souklink.dto.MessageResponse;
import com.souklink.exception.AccesNonAutoriseException;
import com.souklink.exception.ElementNonTrouveException;
import com.souklink.model.Conversation;
import com.souklink.model.Message;
import com.souklink.model.Utilisateur;
import com.souklink.repository.ConversationRepository;
import com.souklink.repository.MessageRepository;
import com.souklink.repository.UtilisateurRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MessageService {

    private final MessageRepository messageRepository;
    private final ConversationRepository conversationRepository;
    private final UtilisateurRepository utilisateurRepository;
    private final ConversationService conversationService;

    public MessageResponse envoyer(Long expediteurId, Long conversationId, String contenu) {
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new ElementNonTrouveException("Conversation introuvable"));

        conversationService.verifierParticipant(conversation, expediteurId);

        Utilisateur expediteur = utilisateurRepository.findById(expediteurId)
                .orElseThrow(() -> new ElementNonTrouveException("Utilisateur introuvable"));

        Message message = new Message();
        message.setConversation(conversation);
        message.setExpediteur(expediteur);
        message.setContenu(contenu);

        Message sauvegarde = messageRepository.save(message);
        return versResponse(sauvegarde);
    }

    public List<MessageResponse> listerParConversation(Long utilisateurId, Long conversationId) {
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new ElementNonTrouveException("Conversation introuvable"));
        conversationService.verifierParticipant(conversation, utilisateurId);

        return messageRepository.findByConversationIdOrderByDateEnvoiAsc(conversationId)
                .stream().map(this::versResponse).toList();
    }

    public void marquerCommeLu(Long utilisateurId, Long conversationId) {
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new ElementNonTrouveException("Conversation introuvable"));
        conversationService.verifierParticipant(conversation, utilisateurId);

        List<Message> messages = messageRepository.findByConversationIdOrderByDateEnvoiAsc(conversationId);
        messages.stream()
                .filter(m -> !m.isLu() && !m.getExpediteur().getId().equals(utilisateurId))
                .forEach(m -> {
                    m.setLu(true);
                    messageRepository.save(m);
                });
    }

    private MessageResponse versResponse(Message m) {
        return new MessageResponse(
                m.getId(), m.getConversation().getId(), m.getExpediteur().getId(),
                m.getExpediteur().getNom(), m.getContenu(), m.getDateEnvoi(), m.isLu()
        );
    }
}
