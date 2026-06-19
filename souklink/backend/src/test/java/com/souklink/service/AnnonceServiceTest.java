package com.souklink.service;

import com.souklink.dto.AnnonceRequest;
import com.souklink.dto.AnnonceResponse;
import com.souklink.exception.AccesNonAutoriseException;
import com.souklink.exception.ElementNonTrouveException;
import com.souklink.model.Annonce;
import com.souklink.model.Utilisateur;
import com.souklink.repository.*;
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
class AnnonceServiceTest {

    @Mock
    private AnnonceRepository annonceRepository;
    @Mock
    private CategorieRepository categorieRepository;
    @Mock
    private UtilisateurRepository utilisateurRepository;
    @Mock
    private FavoriRepository favoriRepository;
    @Mock
    private AvisRepository avisRepository;

    @InjectMocks
    private AnnonceService annonceService;

    private Utilisateur vendeur;
    private Annonce annonce;
    private AnnonceRequest request;

    @BeforeEach
    void setUp() {
        vendeur = new Utilisateur();
        vendeur.setId(1L);
        vendeur.setNom("Sara El Idrissi");
        vendeur.setRole(Utilisateur.RoleUtilisateur.UTILISATEUR);
        vendeur.setSuspendu(false);

        annonce = new Annonce();
        annonce.setId(10L);
        annonce.setTitre("iPhone 12 en bon état");
        annonce.setPrix(new BigDecimal("2500"));
        annonce.setVendeur(vendeur);

        request = new AnnonceRequest();
        request.setTitre("iPhone 12 en bon état");
        request.setDescription("Très peu utilisé");
        request.setPrix(new BigDecimal("2500"));
        request.setEtat("OCCASION");
    }

    @Test
    void creer_publieAnnonce_quandVendeurNonSuspendu() {
        when(utilisateurRepository.findById(1L)).thenReturn(Optional.of(vendeur));
        when(annonceRepository.save(any(Annonce.class))).thenReturn(annonce);
        when(avisRepository.moyenneNotePourUtilisateur(1L)).thenReturn(null);

        AnnonceResponse reponse = annonceService.creer(1L, request);

        assertNotNull(reponse);
        assertEquals("iPhone 12 en bon état", reponse.getTitre());
        verify(annonceRepository, times(1)).save(any(Annonce.class));
    }

    @Test
    void creer_leveException_quandVendeurSuspendu() {
        vendeur.setSuspendu(true);
        when(utilisateurRepository.findById(1L)).thenReturn(Optional.of(vendeur));

        assertThrows(AccesNonAutoriseException.class, () -> annonceService.creer(1L, request));
        verify(annonceRepository, never()).save(any(Annonce.class));
    }

    @Test
    void creer_leveException_quandUtilisateurInexistant() {
        when(utilisateurRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ElementNonTrouveException.class, () -> annonceService.creer(99L, request));
    }

    @Test
    void modifier_leveException_quandPasProprietaire() {
        when(annonceRepository.findById(10L)).thenReturn(Optional.of(annonce));

        assertThrows(AccesNonAutoriseException.class, () -> annonceService.modifier(2L, 10L, request));
    }

    @Test
    void modifier_reussit_quandProprietaire() {
        when(annonceRepository.findById(10L)).thenReturn(Optional.of(annonce));
        when(annonceRepository.save(any(Annonce.class))).thenReturn(annonce);
        when(avisRepository.moyenneNotePourUtilisateur(1L)).thenReturn(4.5);

        AnnonceResponse reponse = annonceService.modifier(1L, 10L, request);

        assertNotNull(reponse);
        verify(annonceRepository, times(1)).save(any(Annonce.class));
    }

    @Test
    void supprimer_leveException_quandPasProprietaire() {
        when(annonceRepository.findById(10L)).thenReturn(Optional.of(annonce));

        assertThrows(AccesNonAutoriseException.class, () -> annonceService.supprimer(2L, 10L));
        verify(annonceRepository, never()).delete(any(Annonce.class));
    }

    @Test
    void obtenirParId_leveException_quandAnnonceInexistante() {
        when(annonceRepository.findById(404L)).thenReturn(Optional.empty());

        assertThrows(ElementNonTrouveException.class, () -> annonceService.obtenirParId(404L, 1L));
    }

    @Test
    void changerStatut_reussitPourProprietaire() {
        when(annonceRepository.findById(10L)).thenReturn(Optional.of(annonce));
        when(utilisateurRepository.findById(1L)).thenReturn(Optional.of(vendeur));
        when(annonceRepository.save(any(Annonce.class))).thenReturn(annonce);
        when(avisRepository.moyenneNotePourUtilisateur(1L)).thenReturn(null);

        AnnonceResponse reponse = annonceService.changerStatut(1L, 10L, "VENDU");

        assertEquals(Annonce.StatutAnnonce.VENDU, annonce.getStatut());
    }

    @Test
    void changerStatut_leveException_quandUtilisateurNiProprietaireNiAdmin() {
        Utilisateur autre = new Utilisateur();
        autre.setId(3L);
        autre.setRole(Utilisateur.RoleUtilisateur.UTILISATEUR);

        when(annonceRepository.findById(10L)).thenReturn(Optional.of(annonce));
        when(utilisateurRepository.findById(3L)).thenReturn(Optional.of(autre));

        assertThrows(AccesNonAutoriseException.class, () -> annonceService.changerStatut(3L, 10L, "VENDU"));
    }
}
