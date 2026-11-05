import React, { useState, useEffect, useRef, useMemo } from "react";
import { api } from "../../api.js";
import { MapPin, ChevronLeft, ChevronRight, Loader2, Trash2, ImagePlus, Save, Star, QrCode } from "lucide-react";
import { INK, INK_SOFT, CATS, ESTADOS, CO2_ESTIMADO, MODOS_ENTREGA, timeAgo, onlyDigits, formatCep, comprimirImagem, useApiData, Button, Chip, TopBar, fieldLabel, fieldBox, fieldInput, FieldError } from "../../shared/shared.jsx";

const MAX_FOTOS = 5;
const chaveRascunho = (usuarioId) => `reviva_rascunho_item_${usuarioId || "anonimo"}`;

function lerRascunho(usuarioId) {
  try { return JSON.parse(localStorage.getItem(chaveRascunho(usuarioId)) || "null"); } catch { return null; }
}

const secaoStyle = { background: "#fff", border: "1px solid #EDEBE1", borderRadius: 18, padding: "4px 14px 14px", marginTop: 12 };

function Secao({ titulo, descricao, children }) {
  return (
    <div style={secaoStyle}>
      <div style={{ fontFamily: "var(--font-display)", fontSize: 15, fontWeight: 600, color: INK, marginTop: 12 }}>{titulo}</div>
      {descricao && <div style={{ fontSize: 11.5, color: INK_SOFT, marginTop: 2 }}>{descricao}</div>}
      {children}
    </div>
  );
}

/* ---- CADASTRO / EDIÇÃO DE ITEM ---- */
function CadastroItem({ go, notify, params, usuario }) {
  const itemEditando = params?.item || null;
  const itemBase = itemEditando || params?.duplicar || null;
  const rascunhoInicial = useMemo(() => (itemBase ? null : lerRascunho(usuario?.id)), []); // eslint-disable-line react-hooks/exhaustive-deps
  const inicial = rascunhoInicial || itemBase || {};

  const [tipo, setTipo] = useState(inicial.tipoPublicacao || "DOAR");
  const [cat, setCat] = useState(inicial.categoria || "ROUPAS");
  const [estado, setEstado] = useState(inicial.estadoConservacao || "SEMINOVO");
  const [titulo, setTitulo] = useState(params?.duplicar ? `${params.duplicar.titulo} (cópia)` : (inicial.titulo || ""));
  const [descricao, setDescricao] = useState(inicial.descricao || "");
  const [pesoKg, setPesoKg] = useState(inicial.pesoKg ?? "");
  const [modoEntrega, setModoEntrega] = useState(MODOS_ENTREGA[inicial.modoEntrega] ? inicial.modoEntrega : "RETIRADA");
  const [regrasRetirada, setRegrasRetirada] = useState(inicial.regrasRetirada || "");
  const [fotos, setFotos] = useState(inicial.fotosUrls || []);
  const [fotoEnviando, setFotoEnviando] = useState(false);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");
  const [erros, setErros] = useState({});
  const [rascunhoRestaurado, setRascunhoRestaurado] = useState(!!rascunhoInicial);
  const galeriaRef = useRef(null);
  const [cep, setCep] = useState(inicial.cep || usuario?.cep || "");
  const [numero, setNumero] = useState(inicial.numero || usuario?.numero || "");
  const [complemento, setComplemento] = useState(inicial.complemento || usuario?.complemento || "");
  const [bairro, setBairro] = useState(inicial.bairro || usuario?.bairro || "");
  const [cidade, setCidade] = useState(inicial.cidade || usuario?.cidade || "");
  const [endereco, setEndereco] = useState(itemBase || rascunhoInicial ? {
    logradouro: null, uf: inicial.uf, cidade: inicial.cidade, bairro: inicial.bairro,
    latitude: inicial.latitude, longitude: inicial.longitude,
  } : null);
  const [cepBuscando, setCepBuscando] = useState(false);
  const [cepErro, setCepErro] = useState("");
  const cepDigits = onlyDigits(cep).slice(0, 8);
  const { data: enderecosSalvos } = useApiData(() => api.enderecos(), [usuario?.id], { skip: !usuario?.id });
  const cepInicial = useRef(cepDigits);

  useEffect(() => {
    if (cepDigits.length !== 8) { setCepErro(""); return; }
    // Na edição, não sobrescreve bairro/cidade salvos se o CEP não mudou.
    if (cepDigits === cepInicial.current && (itemBase || rascunhoInicial)) return;
    let cancelado = false;
    setCepBuscando(true);
    setCepErro("");
    api.buscarCep(cepDigits)
      .then(res => {
        if (cancelado) return;
        setEndereco(res);
        setBairro(res.bairro || "");
        setCidade(res.cidade || "");
      })
      .catch(e => {
        if (cancelado) return;
        setEndereco(null);
        setCepErro(e.message || "CEP não encontrado. Preencha o bairro e a cidade manualmente.");
      })
      .finally(() => { if (!cancelado) setCepBuscando(false); });
    return () => { cancelado = true; };
  }, [cepDigits]); // eslint-disable-line react-hooks/exhaustive-deps

  const montarPayload = () => ({
    titulo: titulo.trim(),
    descricao: descricao.trim(),
    categoria: cat,
    estadoConservacao: estado,
    tipoPublicacao: tipo,
    cep: cepDigits || null,
    numero: numero.trim(),
    complemento: complemento.trim(),
    bairro: bairro.trim(),
    cidade: cidade.trim(),
    uf: endereco?.uf || null,
    latitude: endereco?.latitude ?? null,
    longitude: endereco?.longitude ?? null,
    impactoCo2Kg: pesoKg !== "" ? Number(pesoKg) : (CO2_ESTIMADO[cat] || 2),
    pesoKg: pesoKg !== "" ? Number(pesoKg) : null,
    fotosUrls: fotos,
    modoEntrega,
    regrasRetirada: regrasRetirada.trim(),
  });

  // Rascunho automático só para itens novos (edição salva direto no servidor).
  useEffect(() => {
    if (itemEditando) return undefined;
    const id = window.setTimeout(() => {
      const temConteudo = titulo.trim() || descricao.trim() || fotos.length > 0;
      if (temConteudo) localStorage.setItem(chaveRascunho(usuario?.id), JSON.stringify({ ...montarPayload(), salvoEm: new Date().toISOString() }));
    }, 800);
    return () => window.clearTimeout(id);
  }); // eslint-disable-line react-hooks/exhaustive-deps

  const salvarRascunho = () => {
    localStorage.setItem(chaveRascunho(usuario?.id), JSON.stringify({ ...montarPayload(), salvoEm: new Date().toISOString() }));
    notify("Rascunho salvo neste aparelho.");
  };

  const descartarRascunho = () => {
    localStorage.removeItem(chaveRascunho(usuario?.id));
    setRascunhoRestaurado(false);
    setTitulo(""); setDescricao(""); setFotos([]); setPesoKg(""); setRegrasRetirada("");
    notify("Rascunho descartado.");
  };

  const abrirSeletor = (ref) => { if (!fotoEnviando && fotos.length < MAX_FOTOS) ref.current?.click(); };

  const adicionarFotos = async (e) => {
    const arquivos = Array.from(e.target.files || []);
    e.target.value = "";
    if (arquivos.length === 0) return;
    const vagas = MAX_FOTOS - fotos.length;
    if (arquivos.length > vagas) notify(`Só cabem mais ${vagas} foto(s) neste item.`);
    setFotoEnviando(true);
    try {
      const novas = [];
      for (const file of arquivos.slice(0, vagas)) novas.push(await comprimirImagem(file));
      setFotos(f => [...f, ...novas].slice(0, MAX_FOTOS));
      setErros(x => ({ ...x, fotos: undefined }));
    } catch (err) {
      setErro(err.message || "Não foi possível processar a foto.");
    } finally {
      setFotoEnviando(false);
    }
  };

  const removerFoto = (idx) => setFotos(f => {
    const next = f.filter((_, i) => i !== idx);
    return next;
  });

  const selecionarCapa = (idx) => setFotos(f => {
    if (idx === 0 || f.length < 2) return f;
    const next = [...f];
    const [selecionada] = next.splice(idx, 1);
    next.unshift(selecionada);
    return next;
  });

  const moverFoto = (idx, delta) => setFotos(f => {
    const destino = idx + delta;
    if (destino < 0 || destino >= f.length) return f;
    const n = [...f];
    [n[idx], n[destino]] = [n[destino], n[idx]];
    return n;
  });

  const usarEnderecoSalvo = (e) => {
    setCep(e.cep || ""); cepInicial.current = onlyDigits(e.cep || "");
    setNumero(e.numero || ""); setComplemento(e.complemento || "");
    setBairro(e.bairro || ""); setCidade(e.cidade || "");
    setEndereco({ logradouro: e.logradouro, uf: e.uf, cidade: e.cidade, bairro: e.bairro, latitude: e.latitude, longitude: e.longitude });
    setErros(x => ({ ...x, endereco: undefined, numero: undefined }));
  };

  const validar = () => {
    const e = {};
    if (titulo.trim().length < 3) e.titulo = "O título precisa ter pelo menos 3 caracteres.";
    else if (titulo.trim().length > 80) e.titulo = "Use no máximo 80 caracteres no título.";
    if (descricao.trim().length > 0 && descricao.trim().length < 10) e.descricao = "Descreva com pelo menos 10 caracteres (ou deixe em branco).";
    if (descricao.length > 1000) e.descricao = "A descrição pode ter no máximo 1000 caracteres.";
    if (pesoKg !== "" && !(Number(pesoKg) > 0)) e.pesoKg = "Informe um peso maior que zero.";
    if (!numero.trim()) e.numero = "Informe o número do endereço.";
    if (!bairro.trim() || !cidade.trim()) e.endereco = "Informe o CEP ou preencha bairro e cidade.";
    if (regrasRetirada.length > 300) e.regras = "Use no máximo 300 caracteres.";
    setErros(e);
    return Object.keys(e).length === 0;
  };

  const submit = async () => {
    setErro("");
    if (!validar()) { setErro("Revise os campos destacados antes de continuar."); return; }
    setLoading(true);
    try {
      const payload = montarPayload();
      if (itemEditando) {
        await api.editarItem(itemEditando.id, payload);
        notify("Alterações salvas. O anúncio foi renovado por mais 60 dias.");
        go(-1);
      } else {
        await api.criarItem(payload);
        localStorage.removeItem(chaveRascunho(usuario?.id));
        notify("Item publicado com sucesso!");
        go("gerenciarItens");
      }
    } catch (e) {
      setErro(e.status === 409 ? e.message : (e.message || "Não foi possível salvar o item."));
      if (e.status === 409) setErros(x => ({ ...x, titulo: "Já existe um anúncio ativo seu com este título." }));
    } finally {
      setLoading(false);
    }
  };

  const tituloTela = itemEditando ? "Editar item" : params?.duplicar ? "Duplicar item" : "Cadastrar item";

  return (
    <div>
      <TopBar title={tituloTela} onBack={() => go(-1)} right={!itemEditando && (
        <button type="button" onClick={salvarRascunho} aria-label="Salvar rascunho" title="Salvar rascunho" style={{ width: 34, height: 34, borderRadius: 12, background: "#F1EFE6", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}><Save size={16} color={INK} /></button>
      )} />
      <div style={{ padding: "0 20px 20px" }}>
        {rascunhoRestaurado && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#FDEFD9", color: "#9C6B14", borderRadius: 12, padding: "9px 12px", fontSize: 12 }}>
            <Save size={14} />
            <span style={{ flex: 1 }}>Rascunho restaurado{rascunhoInicial?.salvoEm ? ` (salvo há ${timeAgo(rascunhoInicial.salvoEm)})` : ""}.</span>
            <button type="button" onClick={descartarRascunho} style={{ border: "none", background: "none", color: "#9C4327", fontWeight: 700, fontSize: 12, cursor: "pointer" }}>Descartar</button>
          </div>
        )}
        {params?.duplicar && <div style={{ fontSize: 12, color: INK_SOFT, background: "var(--role-soft)", borderRadius: 12, padding: "9px 12px" }}>Copiamos os dados de "{params.duplicar.titulo}". Ajuste o título e o que mudou antes de publicar.</div>}

        <Secao titulo="Fotos" descricao={`Até ${MAX_FOTOS} fotos. A primeira é a capa do anúncio; use as setas para reordenar.`}>
          <div style={{ display: "flex", gap: 10, overflowX: "auto", padding: "10px 0 4px" }}>
            {fotos.map((foto, i) => (
              <div key={i} style={{ width: 86, flexShrink: 0 }}>
                <div style={{ width: 86, height: 86, borderRadius: 14, position: "relative", overflow: "hidden", border: i === 0 ? "2px solid var(--role-primary)" : "1px solid #EDEBE1" }}>
                  <img src={foto} alt={`Foto ${i + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  {i === 0 && <span style={{ position: "absolute", left: 4, bottom: 4, fontSize: 9.5, fontWeight: 700, background: "var(--role-primary)", color: "#fff", borderRadius: 6, padding: "2px 6px" }}>Capa</span>}
                  <button type="button" onClick={() => removerFoto(i)} aria-label="Remover foto" style={{ position: "absolute", top: 4, right: 4, width: 22, height: 22, borderRadius: "50%", border: "none", background: "rgba(22,40,31,.8)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}><Trash2 size={11} /></button>
                  <button type="button" onClick={() => selecionarCapa(i)} aria-label={i === 0 ? "Foto de capa atual" : "Definir como capa"} title={i === 0 ? "Esta é a capa do anúncio" : "Definir como capa"} style={{ position: "absolute", top: 4, left: 4, width: 22, height: 22, borderRadius: "50%", border: "none", background: i === 0 ? "rgba(255, 198, 52, .95)" : "rgba(255,255,255,.85)", color: i === 0 ? "#1d2d22" : "#23372f", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "0 2px 6px rgba(0,0,0,.12)" }}><Star size={11} fill={i === 0 ? "currentColor" : "none"} /></button>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
                  <button type="button" disabled={i === 0} onClick={() => moverFoto(i, -1)} aria-label="Mover para a esquerda" style={{ border: "none", background: "#F1EFE6", borderRadius: 8, width: 30, height: 22, cursor: i === 0 ? "default" : "pointer", opacity: i === 0 ? .35 : 1 }}><ChevronLeft size={13} /></button>
                  <button type="button" disabled={i === fotos.length - 1} onClick={() => moverFoto(i, 1)} aria-label="Mover para a direita" style={{ border: "none", background: "#F1EFE6", borderRadius: 8, width: 30, height: 22, cursor: i === fotos.length - 1 ? "default" : "pointer", opacity: i === fotos.length - 1 ? .35 : 1 }}><ChevronRight size={13} /></button>
                </div>
              </div>
            ))}
            {fotos.length < MAX_FOTOS && (
              <div onClick={() => abrirSeletor(galeriaRef)} role="button" aria-label="Adicionar foto" style={{ width: 86, height: 86, borderRadius: 14, background: "var(--role-soft)", border: "1.5px dashed var(--role-primary)", flexShrink: 0, display: "flex", flexDirection: "column", gap: 4, alignItems: "center", justifyContent: "center", color: "var(--role-primary-dark)", cursor: fotoEnviando ? "default" : "pointer" }}>
                {fotoEnviando ? <Loader2 size={20} style={{ animation: "spin .8s linear infinite" }} /> : <><ImagePlus size={20} /><span style={{ fontSize: 10.5, fontWeight: 700 }}>{fotos.length}/{MAX_FOTOS}</span></>}
              </div>
            )}
          </div>
          <input ref={galeriaRef} type="file" accept="image/*" multiple onChange={adicionarFotos} style={{ display: "none" }} />
          <div style={{ fontSize: 11, color: INK_SOFT, marginTop: 6 }}>Toque no quadro para escolher fotos da galeria.</div>
          {fotos.length === 0 && <div style={{ fontSize: 11, color: "#9C6B14", marginTop: 6 }}>Anúncios com foto recebem muito mais interessados.</div>}
        </Secao>

        <Secao titulo="Sobre o item">
          <label style={fieldLabel}>Título *</label>
          <div style={{ ...fieldBox, borderColor: erros.titulo ? "#E0A18A" : "#E9E7DC" }}><input value={titulo} maxLength={80} onChange={e => { setTitulo(e.target.value); setErros(x => ({ ...x, titulo: undefined })); }} placeholder="Ex: Jaqueta jeans P/M" style={fieldInput} /></div>
          <FieldError>{erros.titulo}</FieldError>

          <label style={fieldLabel}>Descrição <span style={{ fontWeight: 500 }}>({descricao.length}/1000)</span></label>
          <div style={{ ...fieldBox, alignItems: "flex-start", borderColor: erros.descricao ? "#E0A18A" : "#E9E7DC" }}><textarea rows={3} maxLength={1000} value={descricao} onChange={e => { setDescricao(e.target.value); setErros(x => ({ ...x, descricao: undefined })); }} placeholder="Conte detalhes, estado de uso, tamanho, marcas de uso..." style={{ ...fieldInput, resize: "none" }} /></div>
          <FieldError>{erros.descricao}</FieldError>

          <label style={fieldLabel}>Categoria *</label>
          <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4 }}>
            {Object.entries(CATS).map(([k, v]) => <Chip key={k} active={cat === k} onClick={() => setCat(k)}>{v.label}</Chip>)}
          </div>

          <label style={fieldLabel}>Condição *</label>
          <div style={{ display: "flex", gap: 8 }}>
            {ESTADOS.map(e => <Chip key={e.value} active={estado === e.value} onClick={() => setEstado(e.value)}>{e.label}</Chip>)}
          </div>

          <label style={fieldLabel}>Tipo de publicação *</label>
          <div style={{ display: "flex", gap: 8 }}>
            <Chip active={tipo === "DOAR"} onClick={() => setTipo("DOAR")}>Doar</Chip>
            <Chip active={tipo === "TROCAR"} onClick={() => setTipo("TROCAR")}>Trocar</Chip>
          </div>

          <label style={fieldLabel}>Peso aproximado (kg)</label>
          <div style={{ ...fieldBox, borderColor: erros.pesoKg ? "#E0A18A" : "#E9E7DC" }}>
            <input type="number" min="0.1" step="0.1" value={pesoKg} onChange={e => { setPesoKg(e.target.value); setErros(x => ({ ...x, pesoKg: undefined })); }} placeholder={`Estimativa: ${CO2_ESTIMADO[cat] || 2} kg`} inputMode="decimal" style={fieldInput} />
          </div>
          <FieldError>{erros.pesoKg}</FieldError>
          <div style={{ fontSize: 11, color: INK_SOFT, marginTop: 4 }}>Usamos o peso para medir o material que deixou de ser descartado (ODS 12).</div>
        </Secao>

        <Secao titulo="Localização" descricao="Mostramos só bairro e cidade no anúncio; o endereço completo fica para o chat.">
          {(enderecosSalvos || []).length > 0 && (
            <>
              <label style={fieldLabel}>Usar endereço salvo</label>
              <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4 }}>
                {enderecosSalvos.map(e => <Chip key={e.id} onClick={() => usarEnderecoSalvo(e)}>{e.apelido || e.bairro}{e.principal ? " ★" : ""}</Chip>)}
              </div>
            </>
          )}
          <label style={fieldLabel}>CEP</label>
          <div style={fieldBox}>
            <MapPin size={16} color={INK_SOFT} />
            <input value={formatCep(cep)} onChange={e => setCep(e.target.value)} placeholder="00000-000" inputMode="numeric" maxLength={9} style={fieldInput} />
            {cepBuscando && <Loader2 size={15} color={INK_SOFT} style={{ animation: "spin .8s linear infinite" }} />}
          </div>
          {cepErro && <FieldError>{cepErro}</FieldError>}
          {endereco?.logradouro && (
            <div style={{ marginTop: 8, background: "var(--role-soft)", borderRadius: 12, padding: "9px 12px", fontSize: 12, color: "var(--role-primary-dark)" }}>
              {endereco.logradouro}{endereco.uf ? ` · ${endereco.uf}` : ""}
            </div>
          )}
          <div style={{ display: "flex", gap: 8 }}>
            <div style={{ flex: 1 }}>
              <label style={fieldLabel}>Número *</label>
              <div style={{ ...fieldBox, borderColor: erros.numero ? "#E0A18A" : "#E9E7DC" }}><input value={numero} onChange={e => { setNumero(e.target.value); setErros(x => ({ ...x, numero: undefined })); }} placeholder="Ex: 120" style={fieldInput} /></div>
              <FieldError>{erros.numero}</FieldError>
            </div>
            <div style={{ flex: 1 }}>
              <label style={fieldLabel}>Complemento</label>
              <div style={fieldBox}><input value={complemento} onChange={e => setComplemento(e.target.value)} placeholder="Opcional" style={fieldInput} /></div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <div style={{ flex: 1 }}>
              <label style={fieldLabel}>Bairro *</label>
              <div style={{ ...fieldBox, borderColor: erros.endereco ? "#E0A18A" : "#E9E7DC" }}><input value={bairro} onChange={e => { setBairro(e.target.value); setErros(x => ({ ...x, endereco: undefined })); }} placeholder="Preenchido pelo CEP" style={fieldInput} /></div>
            </div>
            <div style={{ flex: 1 }}>
              <label style={fieldLabel}>Cidade *</label>
              <div style={{ ...fieldBox, borderColor: erros.endereco ? "#E0A18A" : "#E9E7DC" }}><input value={cidade} onChange={e => { setCidade(e.target.value); setErros(x => ({ ...x, endereco: undefined })); }} placeholder="Preenchido pelo CEP" style={fieldInput} /></div>
            </div>
          </div>
          <FieldError>{erros.endereco}</FieldError>
        </Secao>

        <Secao titulo="Retirada ou entrega" descricao="Deixe claro como a pessoa vai receber o item.">
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10 }}>
            {Object.entries(MODOS_ENTREGA).map(([k, v]) => <Chip key={k} active={modoEntrega === k} onClick={() => setModoEntrega(k)}>{v.label}</Chip>)}
          </div>
          <label style={fieldLabel}>Regras e horários <span style={{ fontWeight: 500 }}>({regrasRetirada.length}/300)</span></label>
          <div style={{ ...fieldBox, alignItems: "flex-start" }}><textarea rows={2} maxLength={300} value={regrasRetirada} onChange={e => setRegrasRetirada(e.target.value)} placeholder="Ex: retirada na portaria, dias úteis após 18h." style={{ ...fieldInput, resize: "none" }} /></div>
          <FieldError>{erros.regras}</FieldError>
          <div style={{ marginTop: 10, background: "var(--role-soft)", borderRadius: 12, padding: 10, display: "flex", gap: 8, alignItems: "center" }}>
            <QrCode size={18} color="var(--role-primary-dark)" />
            <div style={{ fontSize: 11, color: "var(--role-primary-dark)" }}>Depois do agendamento geramos um código de retirada para confirmar a entrega.</div>
          </div>
        </Secao>

        {erro && <div role="alert" style={{ marginTop: 12, fontSize: 12, color: "#9C4327", background: "#FBE8E0", padding: "8px 10px", borderRadius: 10 }}>{erro}</div>}

        <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 8 }}>
          <Button full loading={loading} onClick={submit}>{itemEditando ? "Salvar alterações" : "Publicar item"}</Button>
          {!itemEditando && <Button full variant="ghost" icon={Save} onClick={salvarRascunho}>Salvar rascunho</Button>}
        </div>
      </div>
    </div>
  );
}

export { CadastroItem };
