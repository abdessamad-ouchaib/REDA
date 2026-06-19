package com.souklink.service;

import com.souklink.dto.FavoriResponse;
import com.souklink.exception.ElementNonTrouveException;
import com.souklink.model.Annonce;
import com.souklink.model.Favori;
import com.souklink.model.Utilisateur;
import com.souklink.repository.AnnonceRepository;
import com.souklink.repository.FavoriRepository;
import com.souklink.repository.UtilisateurRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class FavoriService {

    private final FavoriRepository favoriRepository;
    private final AnnonceRepository annonceRepository;
    private final UtilisateurRepository utilisateurRepository;

    @Transactional
    public FavoriResponse basculer(Long utilisateurId, Long annonceId) {
        var existant = favoriRepository.findByUtilisateurIdAndAnnonceId(utilisateurId, annonceId);

        if (existant.isPresent()) {
            favoriRepository.delete(existant.get());
            return new FavoriResponse(annonceId, false);
        }

        Utilisateur utilisateur = utilisateurRepository.findById(utilisateurId)
                .orElseThrow(() -> new ElementNonTrouveException("Utilisateur introuvable"));
        Annonce annonce = annonceRepository.findById(annonceId)
                .orElseThrow(() -> new ElementNonTrouveException("Annonce introuvable"));

        Favori favori = new Favori();
        favori.setUtilisateur(utilisateur);
        favori.setAnnonce(annonce);
        favoriRepository.save(favori);

        return new FavoriResponse(annonceId, true);
    }
}
