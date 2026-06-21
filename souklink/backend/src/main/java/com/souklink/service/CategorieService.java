package com.souklink.service;

import com.souklink.dto.CategorieRequest;
import com.souklink.dto.CategorieResponse;
import com.souklink.exception.AccesNonAutoriseException;
import com.souklink.exception.ElementNonTrouveException;
import com.souklink.model.Categorie;
import com.souklink.model.Utilisateur;
import com.souklink.repository.CategorieRepository;
import com.souklink.repository.UtilisateurRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CategorieService {

    private final CategorieRepository categorieRepository;
    private final UtilisateurRepository utilisateurRepository;

    public List<CategorieResponse> listerToutes() {
        return categorieRepository.findAll().stream().map(this::versResponse).toList();
    }

    public CategorieResponse creer(Long adminId, CategorieRequest request) {
        verifierAdmin(adminId);

        Categorie categorie = new Categorie();
        categorie.setNom(request.getNom());

        if (request.getParentId() != null) {
            Categorie parent = categorieRepository.findById(request.getParentId())
                    .orElseThrow(() -> new ElementNonTrouveException("Catégorie parente introuvable"));
            categorie.setParent(parent);
        }

        return versResponse(categorieRepository.save(categorie));
    }

    public void supprimer(Long adminId, Long categorieId) {
        verifierAdmin(adminId);
        if (!categorieRepository.existsById(categorieId)) {
            throw new ElementNonTrouveException("Catégorie introuvable");
        }
        categorieRepository.deleteById(categorieId);
    }

    private void verifierAdmin(Long utilisateurId) {
        Utilisateur u = utilisateurRepository.findById(utilisateurId)
                .orElseThrow(() -> new ElementNonTrouveException("Utilisateur introuvable"));
        if (u.getRole() != Utilisateur.RoleUtilisateur.ADMIN) {
            throw new AccesNonAutoriseException("Seul un administrateur peut gérer les catégories");
        }
    }

    private CategorieResponse versResponse(Categorie c) {
        return new CategorieResponse(c.getId(), c.getNom(), c.getParent() != null ? c.getParent().getId() : null);
    }
}
