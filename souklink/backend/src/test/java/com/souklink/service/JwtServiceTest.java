package com.souklink.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.*;

class JwtServiceTest {

    private JwtService jwtService;

    @BeforeEach
    void setUp() {
        jwtService = new JwtService();
        ReflectionTestUtils.setField(jwtService, "secret", "CleSecreteDeTestPourSoukLinkTresLonguePourHS256");
        ReflectionTestUtils.setField(jwtService, "expiration", 3600000L);
    }

    @Test
    void genererToken_creeUnTokenValide() {
        String token = jwtService.genererToken(1L, "test@example.com", "UTILISATEUR");

        assertNotNull(token);
        assertTrue(jwtService.estValide(token));
    }

    @Test
    void extraireEmail_retourneLeBonEmail() {
        String token = jwtService.genererToken(1L, "test@example.com", "UTILISATEUR");

        assertEquals("test@example.com", jwtService.extraireEmail(token));
    }

    @Test
    void extraireUtilisateurId_retourneLeBonId() {
        String token = jwtService.genererToken(42L, "test@example.com", "ADMIN");

        assertEquals(42L, jwtService.extraireUtilisateurId(token));
    }

    @Test
    void extraireRole_retourneLeBonRole() {
        String token = jwtService.genererToken(1L, "test@example.com", "ADMIN");

        assertEquals("ADMIN", jwtService.extraireRole(token));
    }

    @Test
    void estValide_retourneFaux_quandTokenMalforme() {
        assertFalse(jwtService.estValide("token.invalide.falsifie"));
    }

    @Test
    void estValide_retourneFaux_quandTokenExpire() {
        ReflectionTestUtils.setField(jwtService, "expiration", -1000L);
        String tokenExpire = jwtService.genererToken(1L, "test@example.com", "UTILISATEUR");

        assertFalse(jwtService.estValide(tokenExpire));
    }
}
