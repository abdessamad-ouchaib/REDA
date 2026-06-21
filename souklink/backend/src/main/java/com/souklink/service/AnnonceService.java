package com.souklink.service;

import com.souklink.dto.AnnonceRequest;
import com.souklink.dto.AnnonceResponse;
import com.souklink.dto.PhotoResponse;
import com.souklink.exception.AccesNonAutoriseException;
import com.souklink.exception.ElementNonTrouveException;
import com.souklink.exception.RequeteInvalideException;
import com.souklink.model.Annonce;
import com.souklink.model.Categorie;
import com.souklink.model.Favori;
import com.souklink.model.Utilisateur;
import com.souklink.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AnnonceService {

    private final AnnonceRepository annonceRepository;
    private final CategorieRepository categorieRepository;
    private final UtilisateurRepository utilisateurRepository;
    private final FavoriRepository favoriRepository;
    private final AvisRepository avisRepository;

    public Page<AnnonceResponse> rechercher(Long categorieId, BigDecimal prixMin, BigDecimal prixMax,
                                             String q, int page, int taille, Long utilisateurConnecteId) {
        Pageable pageable = PageRequest.of(page, taille, Sort.by("dateCreation").descending());
        Page<Annonce> resultats = annonceRepository.rechercher(categorieId, prixMin, prixMax,
                (q == null || q.isBlank()) ? null : q.trim(), pageable);
        return resultats.map(a -> versResponse(a, utilisateurConnecteId));
    }

    public AnnonceResponse obtenirParId(Long id, Long utilisateurConnecteId) {
        Annonce annonce = annonceRepository.findById(id)
                .orElseThrow(() -> new ElementNonTrouveException("Annonce introuvable"));
        return versResponse(annonce, utilisateurConnecteId);
    }

    public List<AnnonceResponse> listerParVendeur(Long vendeurId) {
        return annonceRepository.findByVendeurIdOrderByDateCreationDesc(vendeurId)
                .stream().map(a -> versResponse(a, vendeurId)).toList();
    }

    public AnnonceResponse creer(Long vendeurId, AnnonceRequest request) {
        Utilisateur vendeur = utilisateurRepository.findById(vendeurId)
                .orElseThrow(() -> new ElementNonTrouveException("Utilisateur introuvable"));

        if (vendeur.isSuspendu()) {
            throw new AccesNonAutoriseException("Votre compte est suspendu, vous ne pouvez pas publier d'annonce");
        }

        Annonce annonce = new Annonce();
        appliquerRequete(annonce, request);
        annonce.setVendeur(vendeur);

        return versResponse(annonceRepository.save(annonce), vendeurId);
    }

    public AnnonceResponse modifier(Long vendeurId, Long annonceId, AnnonceRequest request) {
        Annonce annonce = annonceRepository.findById(annonceId)
                .orElseThrow(() -> new ElementNonTrouveException("Annonce introuvable"));

        verifierProprietaire(annonce, vendeurId);
        appliquerRequete(annonce, request);

        return versResponse(annonceRepository.save(annonce), vendeurId);
    }

    public AnnonceResponse changerStatut(Long utilisateurId, Long annonceId, String nouveauStatut) {
        Annonce annonce = annonceRepository.findById(annonceId)
                .orElseThrow(() -> new ElementNonTrouveException("Annonce introuvable"));

        Utilisateur utilisateur = utilisateurRepository.findById(utilisateurId)
                .orElseThrow(() -> new ElementNonTrouveException("Utilisateur introuvable"));

        boolean estProprietaire = annonce.getVendeur().getId().equals(utilisateurId);
        boolean estAdmin = utilisateur.getRole() == Utilisateur.RoleUtilisateur.ADMIN;

        if (!estProprietaire && !estAdmin) {
            throw new AccesNonAutoriseException("Vous ne pouvez modifier que vos propres annonces");
        }

        try {
            annonce.setStatut(Annonce.StatutAnnonce.valueOf(nouveauStatut.toUpperCase()));
        } catch (IllegalArgumentException e) {
            throw new RequeteInvalideException("Statut invalide : " + nouveauStatut);
        }

        return versResponse(annonceRepository.save(annonce), utilisateurId);
    }

    public void supprimer(Long vendeurId, Long annonceId) {
        Annonce annonce = annonceRepository.findById(annonceId)
                .orElseThrow(() -> new ElementNonTrouveException("Annonce introuvable"));
        verifierProprietaire(annonce, vendeurId);
        annonceRepository.delete(annonce);
    }

    private void appliquerRequete(Annonce annonce, AnnonceRequest request) {
        annonce.setTitre(request.getTitre());
        annonce.setDescription(request.getDescription());
        annonce.setPrix(request.getPrix());

        if (request.getEtat() != null) {
            try {
                annonce.setEtat(Annonce.EtatAnnonce.valueOf(request.getEtat().toUpperCase()));
            } catch (IllegalArgumentException e) {
                throw new RequeteInvalideException("État invalide : " + request.getEtat());
            }
        }

        if (request.getCategorieId() != null) {
            Categorie categorie = categorieRepository.findById(request.getCategorieId())
                    .orElseThrow(() -> new ElementNonTrouveException("Catégorie introuvable"));
            annonce.setCategorie(categorie);
        }
    }

    private void verifierProprietaire(Annonce annonce, Long utilisateurId) {
        if (!annonce.getVendeur().getId().equals(utilisateurId)) {
            throw new AccesNonAutoriseException("Vous ne pouvez modifier que vos propres annonces");
        }
    }

    private AnnonceResponse versResponse(Annonce a, Long utilisateurConnecteId) {
        List<PhotoResponse> photos = a.getPhotos().stream()
                .sorted((p1, p2) -> Integer.compare(p1.getOrdreAffichage(), p2.getOrdreAffichage()))
                .map(p -> new PhotoResponse(p.getId(), p.getUrlStockage(), p.getOrdreAffichage()))
                .toList();

        Double noteMoyenneVendeur = avisRepository.moyenneNotePourUtilisateur(a.getVendeur().getId());

        boolean estFavori = false;
        if (utilisateurConnecteId != null) {
            estFavori = favoriRepository.findByUtilisateurIdAndAnnonceId(utilisateurConnecteId, a.getId()).isPresent();
        }

        return new AnnonceResponse(
                a.getId(), a.getTitre(), a.getDescription(), a.getPrix(),
                a.getEtat().name(), a.getStatut().name(),
                a.getCategorie() != null ? a.getCategorie().getNom() : null,
                a.getCategorie() != null ? a.getCategorie().getId() : null,
                a.getVendeur().getId(), a.getVendeur().getNom(), noteMoyenneVendeur,
                photos, a.getDateCreation(), estFavori
        );
    }
}
