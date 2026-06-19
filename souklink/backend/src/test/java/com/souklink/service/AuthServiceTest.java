package com.souklink.service;

import com.souklink.dto.AuthResponse;
import com.souklink.dto.LoginRequest;
import com.souklink.dto.RegisterRequest;
import com.souklink.exception.AccesNonAutoriseException;
import com.souklink.exception.ElementDejaExisteException;
import com.souklink.model.Utilisateur;
import com.souklink.repository.UtilisateurRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UtilisateurRepository utilisateurRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtService jwtService;

    @InjectMocks
    private AuthService authService;

    private RegisterRequest registerRequest;
    private LoginRequest loginRequest;
    private Utilisateur utilisateur;

    @BeforeEach
    void setUp() {
        registerRequest = new RegisterRequest();
        registerRequest.setNom("Karim Benani");
        registerRequest.setEmail("karim@example.com");
        registerRequest.setMotDePasse("motdepasse123");
        registerRequest.setTelephone("0600000000");

        loginRequest = new LoginRequest();
        loginRequest.setEmail("karim@example.com");
        loginRequest.setMotDePasse("motdepasse123");

        utilisateur = new Utilisateur();
        utilisateur.setId(1L);
        utilisateur.setNom("Karim Benani");
        utilisateur.setEmail("karim@example.com");
        utilisateur.setMotDePasseHash("hash_encode");
        utilisateur.setRole(Utilisateur.RoleUtilisateur.UTILISATEUR);
    }

    @Test
    void inscrire_creeUnNouvelUtilisateur_quandEmailDisponible() {
        when(utilisateurRepository.existsByEmail("karim@example.com")).thenReturn(false);
        when(passwordEncoder.encode("motdepasse123")).thenReturn("hash_encode");
        when(utilisateurRepository.save(any(Utilisateur.class))).thenReturn(utilisateur);
        when(jwtService.genererToken(1L, "karim@example.com", "UTILISATEUR")).thenReturn("token-jwt-fake");

        AuthResponse reponse = authService.inscrire(registerRequest);

        assertNotNull(reponse);
        assertEquals("token-jwt-fake", reponse.getToken());
        assertEquals("karim@example.com", reponse.getEmail());
        assertEquals("UTILISATEUR", reponse.getRole());
        verify(utilisateurRepository, times(1)).save(any(Utilisateur.class));
    }

    @Test
    void inscrire_leveException_quandEmailDejaUtilise() {
        when(utilisateurRepository.existsByEmail("karim@example.com")).thenReturn(true);

        assertThrows(ElementDejaExisteException.class, () -> authService.inscrire(registerRequest));
        verify(utilisateurRepository, never()).save(any(Utilisateur.class));
    }

    @Test
    void connecter_retourneToken_quandIdentifiantsValides() {
        when(utilisateurRepository.findByEmail("karim@example.com")).thenReturn(Optional.of(utilisateur));
        when(passwordEncoder.matches("motdepasse123", "hash_encode")).thenReturn(true);
        when(jwtService.genererToken(1L, "karim@example.com", "UTILISATEUR")).thenReturn("token-jwt-fake");

        AuthResponse reponse = authService.connecter(loginRequest);

        assertEquals("token-jwt-fake", reponse.getToken());
        assertEquals(1L, reponse.getId());
    }

    @Test
    void connecter_leveException_quandMotDePasseIncorrect() {
        when(utilisateurRepository.findByEmail("karim@example.com")).thenReturn(Optional.of(utilisateur));
        when(passwordEncoder.matches("motdepasse123", "hash_encode")).thenReturn(false);

        assertThrows(AccesNonAutoriseException.class, () -> authService.connecter(loginRequest));
    }

    @Test
    void connecter_leveException_quandCompteSuspendu() {
        utilisateur.setSuspendu(true);
        when(utilisateurRepository.findByEmail("karim@example.com")).thenReturn(Optional.of(utilisateur));
        when(passwordEncoder.matches("motdepasse123", "hash_encode")).thenReturn(true);

        assertThrows(AccesNonAutoriseException.class, () -> authService.connecter(loginRequest));
    }

    @Test
    void connecter_leveException_quandEmailInexistant() {
        when(utilisateurRepository.findByEmail("inconnu@example.com")).thenReturn(Optional.empty());
        loginRequest.setEmail("inconnu@example.com");

        assertThrows(AccesNonAutoriseException.class, () -> authService.connecter(loginRequest));
    }
}
