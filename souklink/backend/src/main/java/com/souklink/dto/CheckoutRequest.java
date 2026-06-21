package com.souklink.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CheckoutRequest {

    @NotNull(message = "L'annonce est obligatoire")
    private Long annonceId;
}
