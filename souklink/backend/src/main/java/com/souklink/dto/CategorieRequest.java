package com.souklink.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CategorieRequest {

    @NotBlank(message = "Le nom est obligatoire")
    private String nom;

    private Long parentId;
}
