package com.souklink.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class MessageRequest {

    @NotNull(message = "La conversation est obligatoire")
    private Long conversationId;

    @NotBlank(message = "Le contenu ne peut pas être vide")
    private String contenu;
}
