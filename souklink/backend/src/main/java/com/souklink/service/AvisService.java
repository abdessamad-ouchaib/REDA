package com.souklink.service;

import com.souklink.dto.AvisRequest;
import com.souklink.dto.AvisResponse;
import com.souklink.exception.AccesNonAutoriseException;
import com.souklink.exception.ElementDejaExisteException;
import com.souklink.exception.ElementNonTrouveException;
import com.souklink.exception.RequeteInvalideException;
import com.souklink.model.Avis;
import com.souklink.model.Transaction;
import com.souklink.model.Utilisateur;
import com.souklink.repository.AvisRepository;
import com.souklink.repository.TransactionRepository;
import com.souklink.repository.UtilisateurRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AvisService {

    private final AvisRepository avisRepository;
    private final TransactionRepository transactionRepository;
    private final UtilisateurRepository utilisateurRepository;

    public AvisResponse laisser(Long evaluateurId, AvisRequest request) {
        Transaction transaction = transactionRepository.findById(request.getTransactionId())
                .orElseThrow(() -> new ElementNonTrouveException("Transaction introuvable"));

        // Règle non négociable : un avis ne peut être laissé qu'après une
        // transaction confirmée PAYE, jamais avant — cela évite les faux avis.
        if (transaction.getStatutPaiement() != Transaction.StatutPaiement.PAYE) {
            throw new RequeteInvalideException("Vous ne pouvez laisser un avis qu'après un paiement confirmé");
        }

        Long acheteurId = transaction.getAcheteur().getId();
        Long vendeurId = transaction.getAnnonce().getVendeur().getId();

        boolean estAcheteur = acheteurId.equals(evaluateurId);
        boolean estVendeur = vendeurId.equals(evaluateurId);

        if (!estAcheteur && !estVendeur) {
            throw new AccesNonAutoriseException("Vous ne faites pas partie de cette transaction");
        }

        if (avisRepository.existsByTransactionIdAndUtilisateurEvaluateurId(transaction.getId(), evaluateurId)) {
            throw new ElementDejaExisteException("Vous avez déjà laissé un avis pour cette transaction");
        }

        Long utilisateurEvalueId = estAcheteur ? vendeurId : acheteurId;

        Utilisateur evaluateur = utilisateurRepository.findById(evaluateurId)
                .orElseThrow(() -> new ElementNonTrouveException("Utilisateur introuvable"));
        Utilisateur evalue = utilisateurRepository.findById(utilisateurEvalueId)
                .orElseThrow(() -> new ElementNonTrouveException("Utilisateur introuvable"));

        Avis avis = new Avis();
        avis.setTransaction(transaction);
        avis.setUtilisateurEvaluateur(evaluateur);
        avis.setUtilisateurEvalue(evalue);
        avis.setNote(request.getNote());
        avis.setCommentaire(request.getCommentaire());

        return versResponse(avisRepository.save(avis));
    }

    public List<AvisResponse> listerPourUtilisateur(Long utilisateurId) {
        return avisRepository.findByUtilisateurEvalueIdOrderByDateAvisDesc(utilisateurId)
                .stream().map(this::versResponse).toList();
    }

    private AvisResponse versResponse(Avis a) {
        return new AvisResponse(
                a.getId(), a.getUtilisateurEvalue().getId(), a.getUtilisateurEvaluateur().getId(),
                a.getUtilisateurEvaluateur().getNom(), a.getNote(), a.getCommentaire(), a.getDateAvis()
        );
    }
}
