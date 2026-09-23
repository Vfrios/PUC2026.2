import React, { useState, useEffect, useRef, useMemo } from "react";
import { api } from "../../api.js";
import { Search, MapPin, Heart, MessageCircle, QrCode, ChevronLeft, ChevronRight, Send, Leaf, Gift, Share2, Loader2, Trash2, Pencil, CheckCircle2, Archive, RotateCcw, X, ImagePlus, Copy, Save, Users, Clock, Truck, AlertTriangle, Eye, CheckSquare } from "lucide-react";
import { INK, INK_SOFT, CATS, ESTADOS, CO2_ESTIMADO, BADGES, capitalize, timeAgo, fmtDateTime, badgeIndex, onlyDigits, distanciaKm, formatCep, comprimirImagem, useApiData, Button, Chip, Avatar, Stars, SectionTitle, ItemCard, Loading, ErrorBox, TopBar, fieldLabel, fieldBox, fieldInput, EmptyState, StatusBadge, statusDoItem, MODOS_ENTREGA, ETAPA_LABEL, EtapasSolicitacao, compartilhar, linkDoItem, FieldError, Checkbox } from "../../shared/shared.jsx";

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

  const removerFoto = (idx) => setFotos(f => f.filter((_, i) => i !== idx));
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

/* ---- GERENCIAR ITENS ---- */
const ABAS_GERENCIAR = [
  { key: "ativos", label: "Ativos", filtro: it => statusDoItem(it) === "ATIVO" },
  { key: "negociacao", label: "Em negociação", filtro: it => statusDoItem(it) === "EM_NEGOCIACAO" },
  { key: "doados", label: "Doados", filtro: it => it.status === "DOADO" },
  { key: "arquivados", label: "Arquivados", filtro: it => ["REMOVIDO", "EXPIRADO"].includes(statusDoItem(it)) },
];

function RespostaRapida({ solicitacao, notify, onEnviada }) {
  const [texto, setTexto] = useState("");
  const [enviando, setEnviando] = useState(false);
  const enviar = async () => {
    if (!texto.trim()) return;
    setEnviando(true);
    try {
      await api.enviarMensagem(solicitacao.id, texto.trim());
      setTexto("");
      notify("Resposta enviada.");
      onEnviada?.();
    } catch (e) {
      notify(e.message || "Não foi possível enviar a resposta.");
    } finally {
      setEnviando(false);
    }
  };
  return (
    <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
      <input value={texto} onChange={e => setTexto(e.target.value)} onKeyDown={e => e.key === "Enter" && enviar()} placeholder="Responder aqui..." style={{ ...fieldInput, flex: 1, border: "1px solid #E9E7DC", borderRadius: 16, padding: "8px 12px", fontSize: 12.5, background: "#fff" }} />
      <button type="button" onClick={enviar} disabled={enviando || !texto.trim()} aria-label="Enviar resposta" style={{ width: 34, height: 34, borderRadius: "50%", border: "none", background: "var(--role-primary)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", opacity: texto.trim() ? 1 : .5 }}>
        {enviando ? <Loader2 size={14} style={{ animation: "spin .8s linear infinite" }} /> : <Send size={14} />}
      </button>
    </div>
  );
}

function GerenciarItens({ go, notify }) {
  const { loading, error, data: itens, reload: reloadItens } = useApiData(() => api.meusItens(), []);
  const { data: solicitacoes, reload: reloadSolic } = useApiData(() => api.solicitacoesRecebidas(), []);
  const [expandido, setExpandido] = useState(null);
  const [acaoLoading, setAcaoLoading] = useState(null);
  const [aba, setAba] = useState("ativos");
  const [selecionando, setSelecionando] = useState(false);
  const [selecionados, setSelecionados] = useState(() => new Set());

  const reload = () => { reloadItens({ silent: true }); reloadSolic({ silent: true }); };

  useEffect(() => {
    const intervalo = setInterval(() => reloadSolic({ silent: true }), 15000);
    return () => clearInterval(intervalo);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { setSelecionados(new Set()); setSelecionando(false); }, [aba]);

  const abaAtual = ABAS_GERENCIAR.find(a => a.key === aba);
  const itensVisiveis = (itens || [])
    .filter(abaAtual.filtro)
    .sort((a, b) => new Date(b.atualizadoEm || b.publicadoEm) - new Date(a.atualizadoEm || a.publicadoEm));

  const solicPorItem = (itemId) => (solicitacoes || []).filter(s => String(s.item?.id) === String(itemId));
  const ativasPorItem = (itemId) => solicPorItem(itemId).filter(s => !["CANCELADA", "RECUSADA"].includes(s.etapa));

  const executar = async (item, fn, sucesso, confirmacao) => {
    if (confirmacao && !window.confirm(confirmacao)) return;
    setAcaoLoading(item.id);
    try { await fn(); notify(sucesso); reload(); }
    catch (e) { notify(e.message || "Não foi possível concluir a ação."); }
    finally { setAcaoLoading(null); }
  };

  const remover = (item) => executar(item, () => api.removerItem(item.id), "Anúncio removido. Você pode restaurá-lo em Arquivados.", `Remover o anúncio "${item.titulo}"?`);
  const restaurar = (item) => executar(item, () => api.restaurarItem(item.id), "Item restaurado por mais 60 dias.");
  const confirmarDoacao = (item) => executar(item, () => api.marcarItemComoDoado(item.id), "Doação confirmada! Seu impacto foi atualizado.", `Confirmar que "${item.titulo}" já foi doado?`);
  const recusar = (s) => executar({ id: s.id }, () => api.recusarSolicitacao(s.id), "Solicitação recusada.", `Recusar o pedido de ${s.receptor?.nome || "este interessado"}?`);

  const acoesLote = aba === "arquivados"
    ? [{ acao: "RESTAURAR", label: "Restaurar", icon: RotateCcw, variant: "primary" }]
    : aba === "doados" ? []
    : [{ acao: "DOADO", label: "Marcar como doados", icon: CheckCircle2, variant: "primary" }, { acao: "REMOVER", label: "Remover", icon: Trash2, variant: "danger" }];

  const aplicarLote = async (acao, label) => {
    const ids = [...selecionados];
    if (ids.length === 0) return;
    if (!window.confirm(`${label}: ${ids.length} item(ns) selecionado(s). Confirmar?`)) return;
    setAcaoLoading("lote");
    try {
      const alterados = await api.acaoItensEmLote(ids, acao);
      const ignorados = ids.length - (alterados?.length || 0);
      notify(ignorados > 0 ? `${alterados.length} atualizado(s); ${ignorados} não aceitavam essa ação.` : `${alterados.length} item(ns) atualizado(s).`);
      setSelecionados(new Set());
      setSelecionando(false);
      reload();
    } catch (e) {
      notify(e.message || "Não foi possível aplicar a ação em lote.");
    } finally {
      setAcaoLoading(null);
    }
  };

  const alternarSelecao = (id) => setSelecionados(s => {
    const n = new Set(s);
    if (n.has(id)) n.delete(id); else n.add(id);
    return n;
  });

  return (
    <div style={{ paddingBottom: selecionando ? 80 : 12 }}>
      <TopBar title="Gerenciar itens" onBack={() => go(-1)} right={
        <button type="button" onClick={() => go("cadastroItem")} aria-label="Cadastrar item" title="Cadastrar item" style={{ width: 34, height: 34, borderRadius: 12, background: "var(--role-soft)", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}><Gift size={16} color="var(--role-primary-dark)" /></button>
      } />
      <div style={{ padding: "0 20px 10px", display: "flex", gap: 8, overflowX: "auto" }}>
        {ABAS_GERENCIAR.map(a => {
          const total = (itens || []).filter(a.filtro).length;
          return <Chip key={a.key} active={aba === a.key} onClick={() => setAba(a.key)}>{a.label}{total ? ` · ${total}` : ""}</Chip>;
        })}
      </div>
      {acoesLote.length > 0 && itensVisiveis.length > 1 && (
        <div style={{ padding: "0 20px 8px", display: "flex", justifyContent: "flex-end", gap: 12 }}>
          {selecionando && <button type="button" onClick={() => setSelecionados(new Set(itensVisiveis.map(i => i.id)))} style={{ border: "none", background: "none", color: "var(--role-primary)", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>Selecionar todos</button>}
          <button type="button" onClick={() => { setSelecionando(s => !s); setSelecionados(new Set()); }} style={{ border: "none", background: "none", color: "var(--role-primary)", fontSize: 12, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
            <CheckSquare size={13} /> {selecionando ? "Cancelar seleção" : "Selecionar vários"}
          </button>
        </div>
      )}
      <div style={{ padding: "0 20px", display: "flex", flexDirection: "column", gap: 10 }}>
        {loading && <Loading label="Buscando seus itens..." />}
        {error && <ErrorBox message={error} onRetry={reload} />}
        {!loading && !error && itensVisiveis.length === 0 && (
          <EmptyState Icon={aba === "arquivados" ? Archive : aba === "doados" ? CheckCircle2 : aba === "negociacao" ? Clock : Gift} text={{
            ativos: "Nenhum anúncio ativo. Toque em 'Doar' para cadastrar um item.",
            negociacao: "Nenhum item com retirada agendada no momento.",
            doados: "Nenhum item doado ainda.",
            arquivados: "Nenhum item removido ou expirado.",
          }[aba]} />
        )}
        {itensVisiveis.map((it) => {
          const relacionadas = solicPorItem(it.id);
          const interessados = it.interessados ?? ativasPorItem(it.id).length;
          const aberto = expandido === it.id;
          const foto = it.fotosUrls?.[0];
          const Icon = (CATS[it.categoria] || CATS.OUTROS).Icon;
          const status = statusDoItem(it);
          const ocupado = acaoLoading === it.id;
          return (
            <div key={it.id} style={{ background: "#fff", border: selecionados.has(it.id) ? "1.5px solid var(--role-primary)" : "1px solid #EDEBE1", borderRadius: 16, padding: 12 }}>
              <div onClick={() => selecionando ? alternarSelecao(it.id) : setExpandido(aberto ? null : it.id)} style={{ cursor: "pointer", display: "flex", gap: 10, alignItems: "center" }}>
                {selecionando && <Checkbox checked={selecionados.has(it.id)} onChange={() => alternarSelecao(it.id)} label={`Selecionar ${it.titulo}`} />}
                <div style={{ width: 52, height: 52, borderRadius: 12, background: "var(--role-soft)", overflow: "hidden", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {foto ? <img src={foto} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <Icon size={22} color="var(--role-primary-dark)" />}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 6 }}>
                    <div style={{ fontWeight: 700, fontSize: 14, color: INK, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{it.titulo}</div>
                    <StatusBadge item={it} />
                  </div>
                  <div style={{ fontSize: 11.5, color: interessados > 0 ? "var(--role-primary-dark)" : INK_SOFT, marginTop: 4, fontWeight: interessados > 0 ? 700 : 500, display: "flex", alignItems: "center", gap: 4 }}>
                    <Users size={12} /> {interessados === 1 ? "1 interessado" : `${interessados} interessados`}
                  </div>
                  <div style={{ fontSize: 10.5, color: INK_SOFT, marginTop: 2 }}>
                    {it.atualizadoEm ? `Atualizado há ${timeAgo(it.atualizadoEm)}` : `Publicado em ${new Date(it.publicadoEm).toLocaleDateString("pt-BR")}`}
                    {status === "ATIVO" && it.expiraEm && <> · até {new Date(it.expiraEm).toLocaleDateString("pt-BR")}</>}
                  </div>
                </div>
              </div>
              {aberto && !selecionando && (
                <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 8, borderTop: "1px solid #F0EEE4", paddingTop: 10 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: INK }}>Solicitações recebidas</div>
                  {relacionadas.length === 0 && <div style={{ fontSize: 12, color: INK_SOFT }}>Nenhuma solicitação ainda.</div>}
                  {relacionadas.map(s => {
                    const encerrada = ["CANCELADA", "RECUSADA", "CONCLUIDA"].includes(s.etapa);
                    return (
                      <div key={s.id} style={{ background: "#FAFAF4", borderRadius: 12, padding: 10, opacity: encerrada && s.etapa !== "CONCLUIDA" ? .65 : 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <Avatar label={s.receptor?.nome} size={26} />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 12.5, fontWeight: 700, color: INK }}>{s.receptor?.nome}</div>
                            <div style={{ fontSize: 10.5, color: INK_SOFT }}>{ETAPA_LABEL[s.etapa] || "Em conversa"} · {timeAgo(s.ultimaMensagem?.criadaEm || s.criadaEm)}</div>
                          </div>
                        </div>
                        {(s.ultimaMensagem?.texto || s.mensagem) && <div style={{ fontSize: 12, color: INK_SOFT, margin: "6px 0 0" }}>"{s.ultimaMensagem?.texto || s.mensagem}"</div>}
                        {!encerrada && <RespostaRapida solicitacao={s} notify={notify} onEnviada={() => reloadSolic({ silent: true })} />}
                        <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                          <Button small variant="ghost" style={{ flex: 1 }} onClick={() => go("chatDoador", { solicitacaoId: s.id, otherId: s.receptor?.id, otherName: s.receptor?.nome, itemTitulo: it.titulo, itemId: it.id })}>Abrir conversa</Button>
                          {!encerrada && <Button small variant="danger" loading={acaoLoading === s.id} onClick={() => recusar(s)}>Recusar</Button>}
                        </div>
                      </div>
                    );
                  })}
                  <div style={{ fontSize: 12, fontWeight: 700, color: INK, marginTop: 4 }}>Ações do anúncio</div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <Button small variant="soft" icon={Eye} onClick={() => go("detalhesItem", { itemId: it.id })}>Ver anúncio</Button>
                    {(status === "ATIVO" || status === "EM_NEGOCIACAO" || status === "EXPIRADO" || status === "REMOVIDO") && <Button small variant="ghost" icon={Pencil} onClick={() => go("cadastroItem", { item: it })}>Editar</Button>}
                    <Button small variant="ghost" icon={Copy} onClick={() => go("cadastroItem", { duplicar: it })}>Duplicar</Button>
                    {(status === "ATIVO" || status === "EM_NEGOCIACAO") && <Button small variant="primary" icon={CheckCircle2} loading={ocupado} onClick={() => confirmarDoacao(it)}>Marcar como doado</Button>}
                    {(status === "REMOVIDO" || status === "EXPIRADO") && <Button small variant="primary" icon={RotateCcw} loading={ocupado} onClick={() => restaurar(it)}>Restaurar</Button>}
                    {(status === "ATIVO" || status === "EM_NEGOCIACAO" || status === "EXPIRADO") && <Button small variant="danger" icon={Trash2} loading={ocupado} onClick={() => remover(it)}>Remover</Button>}
                  </div>
                  {status === "DOADO" && <div style={{ fontSize: 11.5, color: INK_SOFT }}>Itens doados ficam no seu histórico de impacto e não podem ser editados.</div>}
                </div>
              )}
            </div>
          );
        })}
      </div>
      {selecionando && (
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 64, padding: "10px 16px", background: "#fff", borderTop: "1px solid #EDEBE1", display: "flex", gap: 8, alignItems: "center", zIndex: 30 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: INK, flex: 1 }}>{selecionados.size} selecionado(s)</span>
          {acoesLote.map(a => <Button key={a.acao} small variant={a.variant} icon={a.icon} disabled={selecionados.size === 0} loading={acaoLoading === "lote"} onClick={() => aplicarLote(a.acao, a.label)}>{a.label}</Button>)}
        </div>
      )}
    </div>
  );
}

/* ---- LISTA DE ITENS (usada na Busca e nas categorias) ---- */
const POR_PAGINA = 8;

function pontuarRelevancia(item, termo) {
  if (!termo) return 0;
  const t = termo.toLowerCase();
  let pontos = 0;
  if (item.titulo?.toLowerCase().includes(t)) pontos += 3;
  if (item.titulo?.toLowerCase().startsWith(t)) pontos += 2;
  if (item.descricao?.toLowerCase().includes(t)) pontos += 1;
  return pontos;
}

function ListaItens({ go, favorites, toggleFav, usuario, onlineIds, params, embedded = false, onLimparFiltros }) {
  const [tipoFiltro, setTipoFiltro] = useState(null);
  const [condicao, setCondicao] = useState(null);
  const [pagina, setPagina] = useState(1);
  const categoria = params?.categoria || null;
  const termo = params?.termo || null;
  const uf = params?.uf || null;
  const cidade = params?.cidade || null;
  const origem = params?.origem || (usuario?.latitude != null ? { latitude: usuario.latitude, longitude: usuario.longitude } : null);

  const { loading, error, data: itens, reload } = useApiData(
    () => api.listarItens({ categoria, tipo: tipoFiltro, termo, uf, cidade, disponiveis: true }),
    [categoria, tipoFiltro, termo, uf, cidade]
  );
  const semResultados = !loading && !error && (itens || []).length === 0;
  const { data: sugestoes } = useApiData(() => api.listarItens({}), [semResultados], { skip: !semResultados });

  useEffect(() => {
    const intervalo = setInterval(() => reload({ silent: true }), 20000);
    return () => clearInterval(intervalo);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { setPagina(1); }, [categoria, tipoFiltro, termo, uf, cidade, condicao]);

  const filtrados = useMemo(() => {
    let lista = [...(itens || [])];
    if (condicao) lista = lista.filter(it => it.estadoConservacao === condicao);
    const porData = (a, b) => new Date(b.publicadoEm) - new Date(a.publicadoEm);
    if (termo) lista.sort((a, b) => pontuarRelevancia(b, termo) - pontuarRelevancia(a, termo) || porData(a, b));
    else lista.sort(porData);
    return lista;
  }, [itens, condicao, termo]);

  const visiveis = filtrados.slice(0, pagina * POR_PAGINA);
  const tituloRegiao = cidade ? ` em ${cidade}` : uf ? ` em ${uf}` : "";
  const titulo = termo ? `Resultados para "${termo}"` : categoria ? `${CATS[categoria]?.label || "Itens"}${tituloRegiao}` : `Itens perto de você${tituloRegiao}`;

  const limparTudo = () => {
    setTipoFiltro(null); setCondicao(null);
    onLimparFiltros?.();
  };

  return (
    <div>
      {!embedded && <TopBar title={titulo} onBack={() => go(-1)} right={<MapPin size={18} color={INK} />} />}
      {embedded && <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px 8px" }}><SectionTitle>{titulo}</SectionTitle>{!loading && <span style={{ fontSize: 11.5, color: INK_SOFT }}>{filtrados.length} resultado(s)</span>}</div>}

      <div style={{ padding: "0 20px", display: "flex", gap: 8, overflowX: "auto", paddingBottom: 6, marginBottom: 6 }}>
        <Chip active={!tipoFiltro} onClick={() => setTipoFiltro(null)}>Todos</Chip>
        <Chip active={tipoFiltro === "DOAR"} onClick={() => setTipoFiltro("DOAR")}>Doação</Chip>
        <Chip active={tipoFiltro === "TROCAR"} onClick={() => setTipoFiltro("TROCAR")}>Troca</Chip>
        {ESTADOS.map(e => <Chip key={e.value} active={condicao === e.value} onClick={() => setCondicao(condicao === e.value ? null : e.value)}>{e.label}</Chip>)}
      </div>
      <div style={{ padding: "0 20px", display: "flex", flexDirection: "column", gap: 10 }}>
        {loading && <Loading label="Buscando itens..." />}
        {error && <ErrorBox message={error} onRetry={reload} />}
        {!loading && !error && filtrados.length === 0 && (
          <div>
            <EmptyState Icon={Search} text="Nenhum item encontrado com esses filtros." />
            <Button full variant="ghost" onClick={limparTudo}>Limpar todos os filtros</Button>
            {(sugestoes || []).length > 0 && (
              <>
                <SectionTitle>Você também pode gostar</SectionTitle>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {sugestoes.slice(0, 4).map(it => <ItemCard key={it.id} item={it} usuario={usuario} onlineIds={onlineIds} favorite={!!favorites[it.id]} onFav={toggleFav} onClick={() => go("detalhesItem", { itemId: it.id })} />)}
                </div>
              </>
            )}
          </div>
        )}
        {visiveis.map(it => <ItemCard key={it.id} item={it} usuario={origem || usuario} onlineIds={onlineIds} favorite={!!favorites[it.id]} onFav={toggleFav} onClick={() => go("detalhesItem", { itemId: it.id })} />)}
        {visiveis.length < filtrados.length && (
          <Button full variant="soft" onClick={() => setPagina(p => p + 1)}>Carregar mais ({filtrados.length - visiveis.length} restantes)</Button>
        )}
      </div>
    </div>
  );
}

/* ---- DETALHES DO ITEM ---- */
const AVISO_STATUS = {
  EM_NEGOCIACAO: { texto: "Reservado: já existe uma retirada agendada para este item.", bg: "#FDEFD9", color: "#9C6B14" },
  DOADO: { texto: "Este item já foi doado.", bg: "#EDEBE1", color: INK_SOFT },
  REMOVIDO: { texto: "O anunciante removeu este anúncio.", bg: "#F1EFE6", color: INK_SOFT },
  EXPIRADO: { texto: "Este anúncio expirou e não aceita novas solicitações.", bg: "#FBE8E0", color: "#9C4327" },
};

function DetalhesItem({ go, notify, favorites, toggleFav, usuario, onlineIds, params }) {
  const itemId = params?.itemId;
  const { loading, error, errorStatus, data: item, reload } = useApiData(() => api.itemPorId(itemId), [itemId], { skip: !itemId });
  const { data: enviadas } = useApiData(() => api.solicitacoesEnviadas(), [usuario?.id, itemId], { skip: !usuario?.id || !itemId });
  const [fotoAtiva, setFotoAtiva] = useState(0);

  useEffect(() => {
    if (!itemId) return undefined;
    const id = setInterval(() => reload({ silent: true }), 20000);
    return () => clearInterval(id);
  }, [itemId]); // eslint-disable-line react-hooks/exhaustive-deps

  const voltar = () => go(-1);
  if (!itemId) return <div><TopBar title="Detalhes" onBack={voltar} /><EmptyState Icon={Search} text="Nenhum item selecionado." /></div>;
  if (loading && !item) return <div><TopBar title="Detalhes" onBack={voltar} /><Loading /></div>;
  if (errorStatus === 404 || (error && /não encontrado/i.test(error))) {
    return (
      <div>
        <TopBar title="Detalhes" onBack={voltar} />
        <EmptyState Icon={AlertTriangle} text="Este item não existe mais ou foi removido pelo anunciante." />
        <div style={{ padding: "0 20px" }}><Button full onClick={() => go("busca")}>Buscar outros itens</Button></div>
      </div>
    );
  }
  if (error) return <div><TopBar title="Detalhes" onBack={voltar} /><ErrorBox message={error} onRetry={reload} /></div>;
  if (!item) return null;

  const cat = CATS[item.categoria] || CATS.OUTROS;
  const Icon = cat.Icon;
  const souEuOItem = usuario && item.doador?.id === usuario.id;
  const fotos = item.fotosUrls || [];
  const fotoIdx = Math.min(fotoAtiva, Math.max(0, fotos.length - 1));
  const distancia = distanciaKm(usuario, item);
  const localizacao = [item.bairro, item.cidade, item.uf].filter(Boolean).join(" · ");
  const status = statusDoItem(item);
  const aviso = AVISO_STATUS[status];
  const minhaSolicitacao = (enviadas || []).find(s => s.item?.id === item.id && !["CANCELADA", "RECUSADA"].includes(s.etapa));
  const pesoImpacto = item.pesoKg || item.impactoCo2Kg || CO2_ESTIMADO[item.categoria] || 2;
  const selo = item.doador?.seloAtual ? BADGES[badgeIndex(item.doador.seloAtual)] : null;
  const modo = MODOS_ENTREGA[item.modoEntrega] || MODOS_ENTREGA.RETIRADA;
  const favoritado = !!favorites[item.id];
  const online = item.doador?.id && onlineIds.has(item.doador.id);

  const compartilharItem = () => compartilhar({
    titulo: item.titulo,
    texto: `${item.tipoPublicacao === "DOAR" ? "Doação" : "Troca"} no Reviva: ${item.titulo}${item.cidade ? ` (${item.cidade})` : ""}`,
    url: linkDoItem(item.id),
  }, notify);

  const navFoto = (delta) => setFotoAtiva(i => (i + delta + fotos.length) % fotos.length);

  return (
    <div style={{ paddingBottom: 16 }}>
      <TopBar title="Detalhes" onBack={voltar} right={<button type="button" onClick={compartilharItem} aria-label="Compartilhar item" title="Compartilhar item" style={{ width: 34, height: 34, borderRadius: 12, background: "#F1EFE6", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}><Share2 size={17} color={INK} /></button>} />
      <div style={{ padding: "0 20px" }}>
        <div style={{ height: 220, borderRadius: 20, background: "var(--role-soft)", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden" }}>
          {fotos.length > 0
            ? <img src={fotos[fotoIdx]} alt={`${item.titulo} — foto ${fotoIdx + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover", filter: status === "ATIVO" ? "none" : "grayscale(.5)" }} />
            : <Icon size={64} color="var(--role-primary-dark)" strokeWidth={1.3} />}
          <button type="button" onClick={() => toggleFav(item)} aria-label={favoritado ? "Remover dos favoritos" : "Favoritar"} style={{ position: "absolute", top: 12, right: 12, width: 38, height: 38, borderRadius: "50%", border: "none", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "0 4px 12px rgba(0,0,0,.15)" }}>
            <Heart size={19} fill={favoritado ? "#E0673F" : "none"} color="#E0673F" style={{ animation: favoritado ? "favorite-pulse .45s ease" : "none" }} />
          </button>
          <div style={{ position: "absolute", top: 12, left: 12 }}><StatusBadge item={item} label={status === "EM_NEGOCIACAO" ? "Reservado" : undefined} /></div>
          {fotos.length > 1 && (
            <>
              <button type="button" onClick={() => navFoto(-1)} aria-label="Foto anterior" style={{ position: "absolute", left: 8, top: "50%", transform: "translateY(-50%)", width: 30, height: 30, borderRadius: "50%", border: "none", background: "rgba(255,255,255,.85)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><ChevronLeft size={16} /></button>
              <button type="button" onClick={() => navFoto(1)} aria-label="Próxima foto" style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", width: 30, height: 30, borderRadius: "50%", border: "none", background: "rgba(255,255,255,.85)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><ChevronRight size={16} /></button>
              <span style={{ position: "absolute", bottom: 10, right: 12, fontSize: 11, fontWeight: 700, color: "#fff", background: "rgba(22,40,31,.6)", borderRadius: 999, padding: "2px 8px" }}>{fotoIdx + 1}/{fotos.length}</span>
            </>
          )}
        </div>
        {fotos.length > 1 && (
          <div style={{ display: "flex", gap: 6, marginTop: 8, overflowX: "auto" }}>
            {fotos.map((f, i) => (
              <button type="button" key={i} onClick={() => setFotoAtiva(i)} aria-label={`Ver foto ${i + 1}`} style={{ width: 48, height: 48, borderRadius: 10, overflow: "hidden", cursor: "pointer", padding: 0, flexShrink: 0, border: i === fotoIdx ? "2px solid var(--role-primary)" : "2px solid transparent" }}>
                <img src={f} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </button>
            ))}
          </div>
        )}

        {aviso && <div role="status" style={{ marginTop: 12, background: aviso.bg, color: aviso.color, borderRadius: 12, padding: "10px 12px", fontSize: 12.5, fontWeight: 600 }}>{aviso.texto}</div>}

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginTop: 14, gap: 8 }}>
          <div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 600, color: INK }}>{item.titulo}</div>
            <div style={{ fontSize: 12.5, color: INK_SOFT, marginTop: 3 }}>{cat.label} · {capitalize(item.estadoConservacao)}</div>
          </div>
          <span style={{ fontSize: 10.5, fontWeight: 700, padding: "4px 10px", borderRadius: 999, background: item.tipoPublicacao === "DOAR" ? "var(--role-soft)" : "#FBE8E0", color: item.tipoPublicacao === "DOAR" ? "var(--role-primary-dark)" : "#9C4327" }}>{item.tipoPublicacao === "DOAR" ? "DOAÇÃO" : "TROCA"}</span>
        </div>

        <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
          <Button full variant={favoritado ? "soft" : "ghost"} icon={Heart} onClick={() => toggleFav(item)}>{favoritado ? "Favoritado" : "Favoritar"}</Button>
          {souEuOItem ? (
            <Button full variant="soft" onClick={() => go("gerenciarItens")}>Gerenciar item</Button>
          ) : minhaSolicitacao ? (
            <Button full icon={MessageCircle} onClick={() => go("solicitacao", { itemId: item.id, solicitacaoId: minhaSolicitacao.id })}>Minha solicitação</Button>
          ) : status !== "ATIVO" ? (
            <Button full variant="ghost" disabled>Indisponível</Button>
          ) : (
            <Button full icon={Send} onClick={() => go("solicitacao", { itemId: item.id })}>Solicitar item</Button>
          )}
        </div>

        {item.descricao && (
          <>
            <SectionTitle>Descrição</SectionTitle>
            <div style={{ fontSize: 13, color: INK_SOFT, lineHeight: 1.55, whiteSpace: "pre-wrap" }}>{item.descricao}</div>
          </>
        )}

        <SectionTitle>Retirada e localização</SectionTitle>
        <div style={{ background: "#fff", border: "1px solid #EDEBE1", borderRadius: 16, padding: 12, display: "flex", flexDirection: "column", gap: 8, fontSize: 12.5, color: INK }}>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}><MapPin size={15} color="var(--role-primary)" /> {localizacao || "Localização não informada"}{distancia != null && <span style={{ color: INK_SOFT }}> · {distancia < 1 ? "menos de 1 km" : `${Math.round(distancia)} km de você`}</span>}</div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}><Truck size={15} color="var(--role-primary)" /> {modo.label}</div>
          {item.regrasRetirada && <div style={{ display: "flex", gap: 8, alignItems: "flex-start", color: INK_SOFT }}><Clock size={15} color="var(--role-primary)" style={{ flexShrink: 0, marginTop: 1 }} /> {item.regrasRetirada}</div>}
          <div style={{ fontSize: 11, color: INK_SOFT }}>O endereço exato é combinado no chat depois da solicitação.</div>
        </div>

        <SectionTitle>Impacto estimado</SectionTitle>
        <div style={{ background: "var(--role-soft)", borderRadius: 16, padding: 12, display: "flex", gap: 10, alignItems: "center" }}>
          <Leaf size={22} color="var(--role-primary-dark)" />
          <div style={{ fontSize: 12.5, color: "var(--role-primary-dark)" }}>
            Reaproveitar este item evita o descarte de cerca de <b>{Number(pesoImpacto).toFixed(1)} kg</b> de material{item.pesoKg ? "" : " (estimativa pela categoria)"}.
          </div>
        </div>

        {item.doador && (
          <>
            <SectionTitle>Anunciante</SectionTitle>
            <div style={{ background: "#fff", border: "1px solid #EDEBE1", borderRadius: 16, padding: 12, display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }} onClick={() => go("perfilPublico", { doador: item.doador })}>
              {item.doador.fotoUrl ? <img src={item.doador.fotoUrl} alt="" style={{ width: 44, height: 44, borderRadius: "50%", objectFit: "cover" }} /> : <Avatar label={item.doador.nome} size={44} />}
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 13.5, color: INK }}>{item.doador.nome}</div>
                <div style={{ fontSize: 11.5, color: INK_SOFT, display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
                  <Stars value={item.doador.reputacaoScore} /> {item.doador.reputacaoScore ? item.doador.reputacaoScore.toFixed(1) : "sem avaliações"}
                </div>
                <div style={{ fontSize: 11, marginTop: 3, display: "flex", gap: 8 }}>
                  {selo && <span style={{ color: selo.color, fontWeight: 700 }}>Selo {selo.label}</span>}
                  <span style={{ color: online ? "#2D8A57" : INK_SOFT }}>{online ? "online agora" : "offline"}</span>
                </div>
              </div>
              <ChevronRight size={16} color={INK_SOFT} />
            </div>
          </>
        )}

        <SectionTitle>Atividade do anúncio</SectionTitle>
        <div style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 12, color: INK_SOFT }}>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}><Users size={14} /> {item.interessados ? `${item.interessados} pessoa(s) já demonstraram interesse` : "Ninguém solicitou ainda — seja o primeiro!"}</div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}><Clock size={14} /> Publicado em {new Date(item.publicadoEm).toLocaleDateString("pt-BR")}</div>
          {item.atualizadoEm && <div style={{ display: "flex", gap: 8, alignItems: "center" }}><Pencil size={14} /> Atualizado em {fmtDateTime(item.atualizadoEm)}</div>}
          {status === "ATIVO" && item.expiraEm && <div style={{ display: "flex", gap: 8, alignItems: "center" }}><Archive size={14} /> Disponível até {new Date(item.expiraEm).toLocaleDateString("pt-BR")}</div>}
        </div>
      </div>
    </div>
  );
}

/* ---- SOLICITAÇÃO ---- */
function Solicitacao({ go, notify, params, usuario }) {
  const itemIdParam = params?.itemId;
  const solicitacaoIdParam = params?.solicitacaoId;
  const { loading: carregandoSolic, error: erroSolic, errorStatus: statusSolic, data: solicitacaoPorId, reload: recarregarSolic } = useApiData(
    () => api.solicitacaoPorId(solicitacaoIdParam), [solicitacaoIdParam], { skip: !solicitacaoIdParam });
  const itemId = itemIdParam || solicitacaoPorId?.item?.id;
  const { data: item, loading: carregandoItem, errorStatus: statusItem } = useApiData(() => api.itemPorId(itemId), [itemId], { skip: !itemId });
  const { data: enviadas, loading: carregandoEnviadas, reload: recarregarEnviadas } = useApiData(() => api.solicitacoesEnviadas(), [usuario?.id], { skip: !usuario?.id || !!solicitacaoIdParam });
  const [mensagem, setMensagem] = useState("");
  const [loading, setLoading] = useState(false);
  const [cancelando, setCancelando] = useState(false);

  useEffect(() => {
    if (item && !mensagem) setMensagem(`Olá! Tenho interesse no item "${item.titulo}". Ele ainda está disponível?`);
  }, [item?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const existente = solicitacaoPorId || (enviadas || []).find(s => s.item?.id === itemId && !["CANCELADA", "RECUSADA"].includes(s.etapa));
  const status = statusDoItem(item);
  const souDono = usuario && item?.doador?.id === usuario.id;
  const souDoadorDaSolic = existente && usuario && existente.doadorId === usuario.id;
  const outroNome = souDoadorDaSolic ? existente?.receptor?.nome : (existente?.item?.doador?.nome || item?.doador?.nome);
  const outroId = souDoadorDaSolic ? existente?.receptor?.id : (existente?.item?.doador?.id || item?.doador?.id);

  const abrirChat = (s) => go(souDoadorDaSolic ? "chatDoador" : "chatReceptor", {
    solicitacaoId: s.id, otherId: outroId, otherName: outroNome,
    itemTitulo: s.item?.titulo || item?.titulo, itemId: s.item?.id || itemId,
  });

  const enviar = async () => {
    if (!itemId) return;
    if (mensagem.trim().length < 5) { notify("Escreva uma mensagem um pouco maior para o anunciante."); return; }
    setLoading(true);
    try {
      const solicitacao = await api.solicitar(itemId, mensagem.trim());
      notify("Solicitação enviada! Acompanhe a resposta pelo chat.");
      go("chatReceptor", {
        solicitacaoId: solicitacao.id,
        otherId: solicitacao.item?.doador?.id,
        otherName: solicitacao.item?.doador?.nome,
        itemTitulo: solicitacao.item?.titulo,
        itemId: solicitacao.item?.id || itemId,
      });
    } catch (e) {
      notify(e.message || "Não foi possível enviar a solicitação.");
    } finally {
      setLoading(false);
    }
  };

  const cancelar = async () => {
    if (!existente) return;
    if (!window.confirm("Cancelar esta solicitação? Se houver retirada agendada, ela também será cancelada e o anunciante será avisado.")) return;
    setCancelando(true);
    try {
      await api.cancelarSolicitacao(existente.id);
      notify("Solicitação cancelada.");
      if (solicitacaoIdParam) recarregarSolic(); else recarregarEnviadas();
    } catch (e) {
      notify(e.message || "Não foi possível cancelar.");
    } finally {
      setCancelando(false);
    }
  };

  const carregando = carregandoSolic || carregandoItem || (carregandoEnviadas && !enviadas);
  if (carregando && !item && !existente) return <div><TopBar title="Solicitação" onBack={() => go(-1)} /><Loading /></div>;
  if (solicitacaoIdParam && (statusSolic === 403 || statusSolic === 404)) {
    return <div><TopBar title="Solicitação" onBack={() => go(-1)} /><EmptyState Icon={AlertTriangle} text={statusSolic === 403 ? "Você não participa desta solicitação." : "Solicitação não encontrada."} /></div>;
  }
  if (erroSolic) return <div><TopBar title="Solicitação" onBack={() => go(-1)} /><ErrorBox message={erroSolic} onRetry={recarregarSolic} /></div>;
  if (!itemId || statusItem === 404) return <div><TopBar title="Solicitação" onBack={() => go(-1)} /><EmptyState Icon={AlertTriangle} text="Este item não existe mais." /></div>;

  const foto = item?.fotosUrls?.[0];
  const podeCancelar = existente && ["ENVIADA", "ACEITA", "AGENDADA"].includes(existente.etapa);

  return (
    <div>
      <TopBar title={existente ? "Minha solicitação" : "Solicitar item"} onBack={() => go(-1)} />
      <div style={{ padding: "0 20px 20px" }}>
        {item && (
          <div onClick={() => go("detalhesItem", { itemId })} style={{ display: "flex", gap: 10, alignItems: "center", background: "#fff", border: "1px solid #EDEBE1", borderRadius: 16, padding: 10, cursor: "pointer" }}>
            <div style={{ width: 54, height: 54, borderRadius: 12, overflow: "hidden", background: "var(--role-soft)", flexShrink: 0 }}>{foto && <img src={foto} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: 13.5, color: INK }}>{item.titulo}</div>
              <div style={{ fontSize: 11.5, color: INK_SOFT, marginTop: 2 }}>{item.doador?.nome} · {[item.bairro, item.cidade].filter(Boolean).join(", ")}</div>
              <div style={{ marginTop: 4 }}><StatusBadge item={item} /></div>
            </div>
            <ChevronRight size={16} color={INK_SOFT} />
          </div>
        )}

        {existente ? (
          <>
            <SectionTitle>Andamento</SectionTitle>
            <div style={{ background: "#fff", border: "1px solid #EDEBE1", borderRadius: 16, padding: 14 }}>
              <EtapasSolicitacao etapa={existente.etapa} />
            </div>
            <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 8, fontSize: 12.5, color: INK }}>
              <div><b>Status:</b> {ETAPA_LABEL[existente.etapa] || existente.status}</div>
              <div style={{ color: INK_SOFT }}>Enviada em {fmtDateTime(existente.criadaEm)}</div>
              {existente.ultimaMensagem && <div style={{ background: "#F1EFE6", borderRadius: 12, padding: 10 }}><b>Última mensagem:</b> {existente.ultimaMensagem.texto}<div style={{ fontSize: 11, color: INK_SOFT, marginTop: 3 }}>há {timeAgo(existente.ultimaMensagem.criadaEm)}</div></div>}
              {existente.etapa === "ENVIADA" && <div style={{ color: INK_SOFT }}>O anunciante ainda não respondeu. Você será notificado quando houver resposta.</div>}
              {existente.agendamento && existente.agendamento.status !== "CANCELADO" && (
                <div style={{ background: "var(--role-soft)", borderRadius: 12, padding: 10, color: "var(--role-primary-dark)" }}>
                  <b>Retirada:</b> {fmtDateTime(existente.agendamento.dataHora)}{existente.agendamento.localEncontro ? ` · ${existente.agendamento.localEncontro}` : ""}
                  <div style={{ fontSize: 11, marginTop: 3 }}>{existente.agendamento.confirmadoPeloReceptor ? "Confirmada pelo receptor." : "Aguardando confirmação do receptor."}</div>
                </div>
              )}
            </div>
            <div style={{ marginTop: 18, display: "flex", flexDirection: "column", gap: 10 }}>
              <Button full icon={MessageCircle} onClick={() => abrirChat(existente)}>Abrir conversa</Button>
              {podeCancelar && <Button full variant="danger" icon={X} loading={cancelando} onClick={cancelar}>Cancelar solicitação</Button>}
              {!podeCancelar && ["CANCELADA", "RECUSADA"].includes(existente.etapa) && status === "ATIVO" && !souDoadorDaSolic && <Button full variant="ghost" onClick={() => go("solicitacao", { itemId })}>Solicitar novamente</Button>}
            </div>
          </>
        ) : souDono ? (
          <EmptyState Icon={Gift} text="Este item é seu. Acompanhe os pedidos em Gerenciar itens." />
        ) : status !== "ATIVO" ? (
          <div style={{ marginTop: 16, background: "#FBE8E0", color: "#9C4327", borderRadius: 14, padding: 14, fontSize: 13 }}>
            {status === "EM_NEGOCIACAO" ? "Este item está reservado para outra pessoa. Favorite para saber se ele voltar a ficar disponível." : "Este item não está mais disponível para solicitações."}
          </div>
        ) : (
          <>
            <SectionTitle>Mensagem para o anunciante</SectionTitle>
            <div style={{ ...fieldBox, alignItems: "flex-start" }}>
              <textarea rows={4} maxLength={500} value={mensagem} onChange={e => setMensagem(e.target.value)} style={{ ...fieldInput, resize: "none" }} />
            </div>
            <div style={{ fontSize: 11, color: INK_SOFT, marginTop: 4 }}>Apresente-se e diga quando pode retirar. A conversa fica disponível no Inbox.</div>
            {item?.regrasRetirada && <div style={{ marginTop: 10, background: "var(--role-soft)", borderRadius: 12, padding: 10, fontSize: 12, color: "var(--role-primary-dark)" }}><b>Regras do anunciante:</b> {item.regrasRetirada}</div>}
            <div style={{ marginTop: 18 }}>
              <Button full icon={Send} loading={loading} onClick={enviar}>Enviar solicitação</Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export { CadastroItem, GerenciarItens, ListaItens, DetalhesItem, Solicitacao };
