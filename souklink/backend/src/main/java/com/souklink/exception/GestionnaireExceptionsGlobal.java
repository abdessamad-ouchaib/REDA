package com.souklink.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GestionnaireExceptionsGlobal {

    @ExceptionHandler(ElementNonTrouveException.class)
    public ResponseEntity<Map<String, Object>> gererNonTrouve(ElementNonTrouveException ex) {
        return construireReponse(HttpStatus.NOT_FOUND, ex.getMessage());
    }

    @ExceptionHandler(ElementDejaExisteException.class)
    public ResponseEntity<Map<String, Object>> gererDejaExiste(ElementDejaExisteException ex) {
        return construireReponse(HttpStatus.CONFLICT, ex.getMessage());
    }

    @ExceptionHandler(AccesNonAutoriseException.class)
    public ResponseEntity<Map<String, Object>> gererAccesNonAutorise(AccesNonAutoriseException ex) {
        return construireReponse(HttpStatus.FORBIDDEN, ex.getMessage());
    }

    @ExceptionHandler(RequeteInvalideException.class)
    public ResponseEntity<Map<String, Object>> gererRequeteInvalide(RequeteInvalideException ex) {
        return construireReponse(HttpStatus.BAD_REQUEST, ex.getMessage());
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> gererValidation(MethodArgumentNotValidException ex) {
        StringBuilder sb = new StringBuilder();
        ex.getBindingResult().getFieldErrors().forEach(err ->
                sb.append(err.getField()).append(": ").append(err.getDefaultMessage()).append(". "));
        return construireReponse(HttpStatus.BAD_REQUEST, sb.toString());
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> gererErreurGenerique(Exception ex) {
        return construireReponse(HttpStatus.INTERNAL_SERVER_ERROR, "Erreur serveur : " + ex.getMessage());
    }

    private ResponseEntity<Map<String, Object>> construireReponse(HttpStatus statut, String message) {
        Map<String, Object> body = new HashMap<>();
        body.put("horodatage", LocalDateTime.now());
        body.put("statut", statut.value());
        body.put("message", message);
        return ResponseEntity.status(statut).body(body);
    }
}
