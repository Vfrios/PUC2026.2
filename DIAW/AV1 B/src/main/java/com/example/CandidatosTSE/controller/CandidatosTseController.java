package com.example.CandidatosTSE.controller;

import java.util.List;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

import com.example.CandidatosTSE.model.Candidato;
import com.example.CandidatosTSE.service.CandidatosTseService;

@Controller
public class CandidatosTseController {

    private final CandidatosTseService service;

    public CandidatosTseController(CandidatosTseService service) {
        this.service = service;
    }

    @GetMapping("/")
    public String index(@RequestParam(required = false) String genero,
                        @RequestParam(required = false) String escolaridade,
                        @RequestParam(required = false) Integer idadeMin,
                        @RequestParam(required = false) Integer idadeMax,
                        Model model) {

   
        String generoSel = genero == null ? "" : genero;
        String escolaridadeSel = escolaridade == null ? "" : escolaridade;

        List<Candidato> candidatos = service.filtrarPerfil(generoSel, escolaridadeSel, idadeMin, idadeMax);

        model.addAttribute("candidatos", candidatos);
        model.addAttribute("totalEncontrado", candidatos.size());
        model.addAttribute("Generos", service.listarGeneros());
        model.addAttribute("escolaridades", service.listarEscolaridades());
        model.addAttribute("generoSelecionado", generoSel);
        model.addAttribute("escolaridadeSelecionada", escolaridadeSel);
        model.addAttribute("idadeMin", idadeMin);
        model.addAttribute("idadeMax", idadeMax);

        return "index";
    }
}
