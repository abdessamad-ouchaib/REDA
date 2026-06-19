package com.souklink.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FavoriResponse {
    private Long annonceId;
    private boolean estFavori;
}
