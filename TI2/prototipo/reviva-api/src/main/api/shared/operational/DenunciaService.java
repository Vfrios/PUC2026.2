package com.reviva.api.service;

import com.reviva.api.model.Denuncia;
import com.reviva.api.repository.DenunciaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class DenunciaService {

    private final DenunciaRepository denunciaRepository;

    public Denuncia registrar(Denuncia denuncia) {
        denuncia.setStatus(Denuncia.StatusDenuncia.ABERTA);
        return denunciaRepository.save(denuncia);
    }
}
