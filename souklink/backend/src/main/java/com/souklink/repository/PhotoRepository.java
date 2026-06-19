package com.souklink.repository;

import com.souklink.model.Photo;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PhotoRepository extends JpaRepository<Photo, Long> {
    List<Photo> findByAnnonceIdOrderByOrdreAffichageAsc(Long annonceId);
}
