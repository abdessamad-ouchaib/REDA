package com.souklink.service;

import com.souklink.exception.AccesNonAutoriseException;
import com.souklink.exception.RequeteInvalideException;
import com.souklink.model.Annonce;
import com.souklink.model.Transaction;
import com.souklink.model.Utilisateur;
import com.souklink.repository.AnnonceRepository;
import com.souklink.repository.TransactionRepository;
import com.souklink.repository.UtilisateurRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class StripeServiceTest {

    @Mock
    private AnnonceRepository annonceRepository;
    @Mock
    private TransactionRepository transactionRepository;
    @Mock
    private UtilisateurRepository utilisateurRepository;

    @InjectMocks
    private StripeService stripeService;

    private Utilisateur acheteur;
    private Utilisateur vendeur;
    private Annonce annonce;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(stripeService, "stripeSecretKey", "sk_test_fake");
        ReflectionTestUtils.setField(stripeService, "webhookSecret", "whsec_fake");
        ReflectionTestUtils.setField(stripeService, "frontendUrl", "http://localhost:4200");

        vendeur = new Utilisateur();
        vendeur.setId(1L);
        vendeur.setNom("Vendeur Test");

        acheteur = new Utilisateur();
        acheteur.setId(2L);
        acheteur.setEmail("acheteur@example.com");

        annonce = new Annonce();
        annonce.setId(5L);
        annonce.setTitre("Vélo de route");
        annonce.setPrix(new BigDecimal("800"));
        annonce.setVendeur(vendeur);
        annonce.setStatut(Annonce.StatutAnnonce.DISPONIBLE);
    }

    @Test
    void creerSessionCheckout_leveException_quandAcheteurEstLeVendeur() {
        when(annonceRepository.findById(5L)).thenReturn(Optional.of(annonce));
        when(utilisateurRepository.findById(1L)).thenReturn(Optional.of(vendeur));

        assertThrows(RequeteInvalideException.class,
                () -> stripeService.creerSessionCheckout(1L, 5L));
    }

    @Test
    void creerSessionCheckout_leveException_quandAnnonceDejaVendue() {
        annonce.setStatut(Annonce.StatutAnnonce.VENDU);
        when(annonceRepository.findById(5L)).thenReturn(Optional.of(annonce));
        when(utilisateurRepository.findById(2L)).thenReturn(Optional.of(acheteur));

        assertThrows(RequeteInvalideException.class,
                () -> stripeService.creerSessionCheckout(2L, 5L));
    }

    @Test
    void creerSessionCheckout_leveException_quandDejaPayeParCetAcheteur() {
        when(annonceRepository.findById(5L)).thenReturn(Optional.of(annonce));
        when(utilisateurRepository.findById(2L)).thenReturn(Optional.of(acheteur));
        when(transactionRepository.existsByAnnonceIdAndAcheteurIdAndStatutPaiement(
                5L, 2L, Transaction.StatutPaiement.PAYE)).thenReturn(true);

        assertThrows(RequeteInvalideException.class,
                () -> stripeService.creerSessionCheckout(2L, 5L));
    }

    @Test
    void traiterWebhook_leveException_quandSignatureInvalide() {
        // Une signature invalide doit systématiquement être rejetée — c'est la
        // règle de sécurité la plus importante du webhook Stripe.
        String payloadFalsifie = "{\"type\":\"checkout.session.completed\"}";
        String signatureInvalide = "signature_falsifiee_par_un_attaquant";

        assertThrows(AccesNonAutoriseException.class,
                () -> stripeService.traiterWebhook(payloadFalsifie, signatureInvalide));

        // Aucune transaction ne doit être modifiée si la signature est invalide
        verify(transactionRepository, never()).save(any(Transaction.class));
        verify(annonceRepository, never()).save(any(Annonce.class));
    }
}
