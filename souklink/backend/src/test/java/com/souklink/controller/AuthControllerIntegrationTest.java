package com.souklink.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.souklink.dto.LoginRequest;
import com.souklink.dto.RegisterRequest;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AuthControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void inscriptionPuisConnexion_parcoursComplet() throws Exception {
        RegisterRequest registerRequest = new RegisterRequest();
        registerRequest.setNom("Yasmine Tazi");
        registerRequest.setEmail("yasmine.test@example.com");
        registerRequest.setMotDePasse("motdepasse123");
        registerRequest.setTelephone("0611223344");

        mockMvc.perform(post("/api/auth/register")
                        .contentType("application/json")
                        .content(objectMapper.writeValueAsString(registerRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.email").value("yasmine.test@example.com"))
                .andExpect(jsonPath("$.token").exists())
                .andExpect(jsonPath("$.role").value("UTILISATEUR"));

        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setEmail("yasmine.test@example.com");
        loginRequest.setMotDePasse("motdepasse123");

        mockMvc.perform(post("/api/auth/login")
                        .contentType("application/json")
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").exists());
    }

    @Test
    void inscription_echoue_quandEmailDejaUtilise() throws Exception {
        RegisterRequest registerRequest = new RegisterRequest();
        registerRequest.setNom("Doublon Test");
        registerRequest.setEmail("doublon@example.com");
        registerRequest.setMotDePasse("motdepasse123");

        mockMvc.perform(post("/api/auth/register")
                        .contentType("application/json")
                        .content(objectMapper.writeValueAsString(registerRequest)))
                .andExpect(status().isCreated());

        mockMvc.perform(post("/api/auth/register")
                        .contentType("application/json")
                        .content(objectMapper.writeValueAsString(registerRequest)))
                .andExpect(status().isConflict());
    }

    @Test
    void connexion_echoue_quandMotDePasseIncorrect() throws Exception {
        RegisterRequest registerRequest = new RegisterRequest();
        registerRequest.setNom("Test Login");
        registerRequest.setEmail("testlogin@example.com");
        registerRequest.setMotDePasse("bonmotdepasse");

        mockMvc.perform(post("/api/auth/register")
                        .contentType("application/json")
                        .content(objectMapper.writeValueAsString(registerRequest)))
                .andExpect(status().isCreated());

        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setEmail("testlogin@example.com");
        loginRequest.setMotDePasse("mauvaismotdepasse");

        mockMvc.perform(post("/api/auth/login")
                        .contentType("application/json")
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isForbidden());
    }

    @Test
    void inscription_echoue_quandEmailInvalide() throws Exception {
        RegisterRequest registerRequest = new RegisterRequest();
        registerRequest.setNom("Email Invalide");
        registerRequest.setEmail("pas-un-email");
        registerRequest.setMotDePasse("motdepasse123");

        mockMvc.perform(post("/api/auth/register")
                        .contentType("application/json")
                        .content(objectMapper.writeValueAsString(registerRequest)))
                .andExpect(status().isBadRequest());
    }
}
