package com.souklink.service;

import com.souklink.dto.UtilisateurResponse;
import com.souklink.exception.AccesNonAutoriseException;
import com.souklink.exception.ElementNonTrouveException;
import com.souklink.model.Utilisateur;
import com.souklink.repository.AvisRepository;
import com.souklink.repository.UtilisateurRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UtilisateurService {

    private final UtilisateurRepository utilisateurRepository;
    private final AvisRepository avisRepository;

    public UtilisateurResponse obtenirParId(Long id) {
        Utilisateur u = utilisateurRepository.findById(id)
                .orElseThrow(() -> new ElementNonTrouveException("Utilisateur introuvable"));
        return versResponse(u);
    }

    public List<UtilisateurResponse> listerTous() {
        return utilisateurRepository.findAll().stream().map(this::versResponse).toList();
    }

    public UtilisateurResponse suspendre(Long adminId, Long cibleId, boolean suspendu) {
        Utilisateur admin = utilisateurRepository.findById(adminId)
                .orElseThrow(() -> new ElementNonTrouveException("Utilisateur introuvable"));
        if (admin.getRole() != Utilisateur.RoleUtilisateur.ADMIN) {
            throw new AccesNonAutoriseException("Seul un administrateur peut suspendre un compte");
        }

        Utilisateur cible = utilisateurRepository.findById(cibleId)
                .orElseThrow(() -> new ElementNonTrouveException("Utilisateur introuvable"));
        cible.setSuspendu(suspendu);
        utilisateurRepository.save(cible);
        return versResponse(cible);
    }

    private UtilisateurResponse versResponse(Utilisateur u) {
        Double moyenne = avisRepository.moyenneNotePourUtilisateur(u.getId());
        return new UtilisateurResponse(
                u.getId(), u.getNom(), u.getEmail(), u.getTelephone(),
                u.getRole().name(), u.isSuspendu(), u.getDateInscription(), moyenne
        );
    }
}
