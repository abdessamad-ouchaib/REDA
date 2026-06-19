package com.souklink.service;

import com.souklink.dto.AuthResponse;
import com.souklink.dto.LoginRequest;
import com.souklink.dto.RegisterRequest;
import com.souklink.exception.AccesNonAutoriseException;
import com.souklink.exception.ElementDejaExisteException;
import com.souklink.model.Utilisateur;
import com.souklink.repository.UtilisateurRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UtilisateurRepository utilisateurRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthResponse inscrire(RegisterRequest request) {
        if (utilisateurRepository.existsByEmail(request.getEmail())) {
            throw new ElementDejaExisteException("Un compte existe déjà avec cet email");
        }

        Utilisateur utilisateur = new Utilisateur();
        utilisateur.setNom(request.getNom());
        utilisateur.setEmail(request.getEmail());
        utilisateur.setMotDePasseHash(passwordEncoder.encode(request.getMotDePasse()));
        utilisateur.setTelephone(request.getTelephone());
        utilisateur.setRole(Utilisateur.RoleUtilisateur.UTILISATEUR);

        Utilisateur sauvegarde = utilisateurRepository.save(utilisateur);

        String token = jwtService.genererToken(sauvegarde.getId(), sauvegarde.getEmail(), sauvegarde.getRole().name());

        return new AuthResponse(token, sauvegarde.getId(), sauvegarde.getNom(), sauvegarde.getEmail(),
                sauvegarde.getRole().name());
    }

    public AuthResponse connecter(LoginRequest request) {
        Utilisateur utilisateur = utilisateurRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new AccesNonAutoriseException("Email ou mot de passe incorrect"));

        if (!passwordEncoder.matches(request.getMotDePasse(), utilisateur.getMotDePasseHash())) {
            throw new AccesNonAutoriseException("Email ou mot de passe incorrect");
        }

        if (utilisateur.isSuspendu()) {
            throw new AccesNonAutoriseException("Ce compte a été suspendu. Contactez l'administration.");
        }

        String token = jwtService.genererToken(utilisateur.getId(), utilisateur.getEmail(), utilisateur.getRole().name());

        return new AuthResponse(token, utilisateur.getId(), utilisateur.getNom(), utilisateur.getEmail(),
                utilisateur.getRole().name());
    }
}
