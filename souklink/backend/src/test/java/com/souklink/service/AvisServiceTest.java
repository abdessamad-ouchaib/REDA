package com.souklink.service;

import com.souklink.dto.AvisRequest;
import com.souklink.exception.AccesNonAutoriseException;
import com.souklink.exception.ElementDejaExisteException;
import com.souklink.exception.RequeteInvalideException;
import com.souklink.model.Annonce;
import com.souklink.model.Transaction;
import com.souklink.model.Utilisateur;
import com.souklink.repository.AvisRepository;
import com.souklink.repository.TransactionRepository;
import com.souklink.repository.UtilisateurRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AvisServiceTest {

    @Mock
    private AvisRepository avisRepository;
    @Mock
    private TransactionRepository transactionRepository;
    @Mock
    private UtilisateurRepository utilisateurRepository;

    @InjectMocks
    private AvisService avisService;

    private Transaction transaction;
    private Utilisateur acheteur;
    private Utilisateur vendeur;
    private AvisRequest request;

    @BeforeEach
    void setUp() {
        vendeur = new Utilisateur();
        vendeur.setId(1L);
        vendeur.setNom("Vendeur");

        acheteur = new Utilisateur();
        acheteur.setId(2L);
        acheteur.setNom("Acheteur");

        Annonce annonce = new Annonce();
        annonce.setId(5L);
        annonce.setVendeur(vendeur);

        transaction = new Transaction();
        transaction.setId(100L);
        transaction.setAnnonce(annonce);
        transaction.setAcheteur(acheteur);
        transaction.setStatutPaiement(Transaction.StatutPaiement.EN_ATTENTE);

        request = new AvisRequest();
        request.setTransactionId(100L);
        request.setNote(5);
        request.setCommentaire("Excellent vendeur");
    }

    @Test
    void laisser_leveException_quandTransactionNonPayee() {
        when(transactionRepository.findById(100L)).thenReturn(Optional.of(transaction));

        assertThrows(RequeteInvalideException.class, () -> avisService.laisser(2L, request));
        verify(avisRepository, never()).save(any());
    }

    @Test
    void laisser_leveException_quandEvaluateurNeFaitPasPartieDeLaTransaction() {
        transaction.setStatutPaiement(Transaction.StatutPaiement.PAYE);
        when(transactionRepository.findById(100L)).thenReturn(Optional.of(transaction));

        assertThrows(AccesNonAutoriseException.class, () -> avisService.laisser(999L, request));
    }

    @Test
    void laisser_leveException_quandAvisDejaLaisse() {
        transaction.setStatutPaiement(Transaction.StatutPaiement.PAYE);
        when(transactionRepository.findById(100L)).thenReturn(Optional.of(transaction));
        when(avisRepository.existsByTransactionIdAndUtilisateurEvaluateurId(100L, 2L)).thenReturn(true);

        assertThrows(ElementDejaExisteException.class, () -> avisService.laisser(2L, request));
    }

    @Test
    void laisser_reussit_quandTransactionPayeeEtAcheteurEvalue() {
        transaction.setStatutPaiement(Transaction.StatutPaiement.PAYE);
        when(transactionRepository.findById(100L)).thenReturn(Optional.of(transaction));
        when(avisRepository.existsByTransactionIdAndUtilisateurEvaluateurId(100L, 2L)).thenReturn(false);
        when(utilisateurRepository.findById(2L)).thenReturn(Optional.of(acheteur));
        when(utilisateurRepository.findById(1L)).thenReturn(Optional.of(vendeur));
        when(avisRepository.save(any())).thenAnswer(invocation -> {
            var avis = invocation.getArgument(0, com.souklink.model.Avis.class);
            avis.setId(1L);
            return avis;
        });

        var reponse = avisService.laisser(2L, request);

        assertNotNull(reponse);
        assertEquals(5, reponse.getNote());
        // L'avis doit cibler le vendeur, puisque c'est l'acheteur qui évalue
        assertEquals(1L, reponse.getUtilisateurEvalueId());
    }
}
