package com.souklink.service;

import com.souklink.dto.PhotoRequest;
import com.souklink.dto.PhotoResponse;
import com.souklink.exception.AccesNonAutoriseException;
import com.souklink.exception.ElementNonTrouveException;
import com.souklink.exception.RequeteInvalideException;
import com.souklink.model.Annonce;
import com.souklink.model.Photo;
import com.souklink.repository.AnnonceRepository;
import com.souklink.repository.PhotoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PhotoService {

    private static final int MAX_PHOTOS_PAR_ANNONCE = 6;

    private final PhotoRepository photoRepository;
    private final AnnonceRepository annonceRepository;

    public PhotoResponse ajouter(Long vendeurId, Long annonceId, PhotoRequest request) {
        Annonce annonce = annonceRepository.findById(annonceId)
                .orElseThrow(() -> new ElementNonTrouveException("Annonce introuvable"));

        if (!annonce.getVendeur().getId().equals(vendeurId)) {
            throw new AccesNonAutoriseException("Vous ne pouvez ajouter des photos qu'à vos propres annonces");
        }

        long nombreActuel = photoRepository.findByAnnonceIdOrderByOrdreAffichageAsc(annonceId).size();
        if (nombreActuel >= MAX_PHOTOS_PAR_ANNONCE) {
            throw new RequeteInvalideException("Maximum " + MAX_PHOTOS_PAR_ANNONCE + " photos par annonce");
        }

        Photo photo = new Photo();
        photo.setAnnonce(annonce);
        photo.setUrlStockage(request.getUrlStockage());
        photo.setOrdreAffichage(request.getOrdreAffichage());

        Photo sauvegarde = photoRepository.save(photo);
        return new PhotoResponse(sauvegarde.getId(), sauvegarde.getUrlStockage(), sauvegarde.getOrdreAffichage());
    }

    public void supprimer(Long vendeurId, Long photoId) {
        Photo photo = photoRepository.findById(photoId)
                .orElseThrow(() -> new ElementNonTrouveException("Photo introuvable"));

        if (!photo.getAnnonce().getVendeur().getId().equals(vendeurId)) {
            throw new AccesNonAutoriseException("Vous ne pouvez supprimer que les photos de vos propres annonces");
        }

        photoRepository.delete(photo);
    }

    public List<PhotoResponse> listerParAnnonce(Long annonceId) {
        return photoRepository.findByAnnonceIdOrderByOrdreAffichageAsc(annonceId).stream()
                .map(p -> new PhotoResponse(p.getId(), p.getUrlStockage(), p.getOrdreAffichage()))
                .toList();
    }
}
