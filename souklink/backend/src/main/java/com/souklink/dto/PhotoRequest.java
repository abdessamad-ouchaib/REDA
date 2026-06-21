package com.souklink.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class PhotoRequest {

    @NotBlank(message = "L'URL de stockage est obligatoire")
    private String urlStockage;

    private int ordreAffichage;
}
