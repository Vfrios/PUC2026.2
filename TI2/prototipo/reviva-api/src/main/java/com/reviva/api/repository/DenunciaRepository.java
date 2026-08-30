package com.reviva.api.repository;

import com.reviva.api.model.Denuncia;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DenunciaRepository extends JpaRepository<Denuncia, String> {
}
