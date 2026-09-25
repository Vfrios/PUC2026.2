import React, { useState, useEffect } from "react";
import { api } from "../../api.js";
import { Briefcase, CheckCircle2, GraduationCap, Home, Loader2, MapPin, Pencil, Plus, Star, Trash2 } from "lucide-react";
import { Button, Checkbox, Chip, EmptyState, ErrorBox, fieldBox, fieldInput, fieldLabel, FieldError, formatCep, INK, INK_SOFT, Loading, onlyDigits, SectionTitle, TopBar, useApiData } from "../../shared/shared.jsx";

const card = { background: "#fff", border: "1px solid #EDEBE1", borderRadius: 16, padding: 14 };
/* ---- ENDEREÇOS SALVOS ---- */
const APELIDOS = [
  { label: "Casa", Icon: Home },
  { label: "Trabalho", Icon: Briefcase },
  { label: "Faculdade", Icon: GraduationCap },
];

const VAZIO = { apelido: "", cep: "", logradouro: "", numero: "", complemento: "", bairro: "", cidade: "", uf: "", latitude: null, longitude: null, principal: false };

function iconeDoApelido(apelido) {
  return APELIDOS.find(a => a.label.toLowerCase() === (apelido || "").toLowerCase())?.Icon || MapPin;
}

function resumoEndereco(e) {
  return [
    e.logradouro && `${e.logradouro}${e.numero ? `, ${e.numero}` : ""}${e.complemento ? ` - ${e.complemento}` : ""}`,
    e.bairro,
    e.cidade && `${e.cidade}/${e.uf}`,
  ].filter(Boolean).join(" · ");
}

function FormEndereco({ inicial, primeiro, onCancelar, onSalvo, notify }) {
  const [form, setForm] = useState({ ...VAZIO, ...inicial, cep: formatCep(inicial?.cep || "") });
  const [erros, setErros] = useState({});
  const [buscandoCep, setBuscandoCep] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const set = (campo, valor) => setForm(f => ({ ...f, [campo]: valor }));

  const consultarCep = async (cep) => {
    if (onlyDigits(cep).length !== 8) return;
    setBuscandoCep(true);
    setErros(e => ({ ...e, cep: undefined }));
    try {
      const r = await api.buscarCep(cep);
      setForm(f => ({ ...f, logradouro: r.logradouro || f.logradouro, bairro: r.bairro || f.bairro, cidade: r.cidade || f.cidade, uf: r.uf || f.uf, latitude: r.latitude, longitude: r.longitude }));
    } catch (e) { setErros(er => ({ ...er, cep: e.message || "CEP não encontrado." })); }
    finally { setBuscandoCep(false); }
  };

  const validar = () => {
    const e = {};
    if (!form.apelido.trim()) e.apelido = "Dê um apelido, como Casa ou Trabalho.";
    if (onlyDigits(form.cep).length !== 8) e.cep = "Informe um CEP com 8 dígitos.";
    if (!form.logradouro.trim()) e.logradouro = "Informe a rua.";
    if (!form.bairro.trim()) e.bairro = "Informe o bairro.";
    if (!form.cidade.trim()) e.cidade = "Informe a cidade.";
    if (!/^[A-Za-z]{2}$/.test(form.uf.trim())) e.uf = "UF com 2 letras.";
    setErros(e);
    return Object.keys(e).length === 0;
  };

  const salvar = async () => {
    if (!validar()) return;
    setSalvando(true);
    const payload = { ...form, cep: onlyDigits(form.cep), uf: form.uf.toUpperCase() };
    try {
      const salvo = inicial?.id ? await api.editarEndereco(inicial.id, payload) : await api.criarEndereco(payload);
      notify(inicial?.id ? "Endereço atualizado." : "Endereço salvo.");
      onSalvo(salvo);
    } catch (e) { setErros({ geral: e.message || "Não foi possível salvar o endereço." }); }
    finally { setSalvando(false); }
  };

  return (
    <div style={card}>
      <div style={{ fontSize: 14, fontWeight: 700, color: INK }}>{inicial?.id ? "Editar endereço" : "Novo endereço"}</div>
      <label style={fieldLabel}>Apelido</label>
      <div style={{ display: "flex", gap: 6, marginBottom: 6 }}>
        {APELIDOS.map(a => <Chip key={a.label} active={form.apelido === a.label} onClick={() => set("apelido", a.label)}>{a.label}</Chip>)}
      </div>
      <div style={fieldBox}><input value={form.apelido} maxLength={30} onChange={e => set("apelido", e.target.value)} placeholder="Ex.: Casa da vó" style={fieldInput} /></div>
      <FieldError>{erros.apelido}</FieldError>

      <label style={fieldLabel}>CEP</label>
      <div style={fieldBox}>
        <input value={form.cep} inputMode="numeric" placeholder="00000-000" onChange={e => { const v = formatCep(e.target.value); set("cep", v); if (onlyDigits(v).length === 8) consultarCep(v); }} style={fieldInput} />
        {buscandoCep && <Loader2 size={15} color={INK_SOFT} style={{ animation: "spin 1s linear infinite" }} />}
      </div>
      <FieldError>{erros.cep}</FieldError>
      {!erros.cep && <div style={{ fontSize: 10.5, color: INK_SOFT, marginTop: 4 }}>Rua, bairro e cidade são preenchidos pelo CEP.</div>}

      <label style={fieldLabel}>Rua</label>
      <div style={fieldBox}><input value={form.logradouro} maxLength={120} onChange={e => set("logradouro", e.target.value)} style={fieldInput} /></div>
      <FieldError>{erros.logradouro}</FieldError>

      <div style={{ display: "flex", gap: 8 }}>
        <div style={{ width: 100 }}>
          <label style={fieldLabel}>Número</label>
          <div style={fieldBox}><input value={form.numero || ""} maxLength={10} onChange={e => set("numero", e.target.value)} style={fieldInput} /></div>
        </div>
        <div style={{ flex: 1 }}>
          <label style={fieldLabel}>Complemento</label>
          <div style={fieldBox}><input value={form.complemento || ""} maxLength={60} placeholder="Apto, bloco..." onChange={e => set("complemento", e.target.value)} style={fieldInput} /></div>
        </div>
      </div>

      <label style={fieldLabel}>Bairro</label>
      <div style={fieldBox}><input value={form.bairro} maxLength={80} onChange={e => set("bairro", e.target.value)} style={fieldInput} /></div>
      <FieldError>{erros.bairro}</FieldError>

      <div style={{ display: "flex", gap: 8 }}>
        <div style={{ flex: 1 }}>
          <label style={fieldLabel}>Cidade</label>
          <div style={fieldBox}><input value={form.cidade} maxLength={80} onChange={e => set("cidade", e.target.value)} style={fieldInput} /></div>
          <FieldError>{erros.cidade}</FieldError>
        </div>
        <div style={{ width: 70 }}>
          <label style={fieldLabel}>UF</label>
          <div style={fieldBox}><input value={form.uf} maxLength={2} onChange={e => set("uf", e.target.value.toUpperCase())} style={fieldInput} /></div>
          <FieldError>{erros.uf}</FieldError>
        </div>
      </div>

      {!primeiro && !inicial?.principal && (
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 12 }}>
          <Checkbox checked={!!form.principal} onChange={v => set("principal", v)} label="Usar como endereço padrão" />
          <span style={{ fontSize: 12.5, color: INK }}>Usar como endereço padrão</span>
        </div>
      )}
      {primeiro && <div style={{ fontSize: 11, color: INK_SOFT, marginTop: 10 }}>Seu primeiro endereço vira o padrão automaticamente.</div>}
      {erros.geral && <FieldError>{erros.geral}</FieldError>}
      <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
        <Button small variant="ghost" onClick={onCancelar}>Cancelar</Button>
        <Button small icon={CheckCircle2} loading={salvando} onClick={salvar}>Salvar endereço</Button>
      </div>
    </div>
  );
}

function Enderecos({ go, notify, usuario, refreshUsuario }) {
  const { loading, error, data, reload } = useApiData(() => api.enderecos(), [usuario?.id]);
  const [editando, setEditando] = useState(null);
  const [processando, setProcessando] = useState(null);
  const lista = data || [];
  const temCadastroAntigo = lista.length === 0 && usuario?.cep && usuario?.cidade;

  const aposMudanca = async () => {
    setEditando(null);
    await reload({ silent: true });
    refreshUsuario?.();
  };

  const tornarPadrao = async (e) => {
    setProcessando(e.id);
    try { await api.definirEnderecoPrincipal(e.id); notify(`"${e.apelido}" agora é o endereço padrão.`); await aposMudanca(); }
    catch (err) { notify(err.message || "Não foi possível alterar o padrão."); }
    finally { setProcessando(null); }
  };

  const excluir = async (e) => {
    const aviso = e.principal && lista.length > 1 ? " Outro endereço vai virar o padrão." : "";
    if (!window.confirm(`Excluir o endereço "${e.apelido}"?${aviso}`)) return;
    setProcessando(e.id);
    try { await api.excluirEndereco(e.id); notify("Endereço excluído."); await aposMudanca(); }
    catch (err) { notify(err.message || "Não foi possível excluir."); }
    finally { setProcessando(null); }
  };

  return (
    <div>
      <TopBar title="Endereços salvos" onBack={() => go(-1)} />
      <div style={{ padding: "0 20px 24px", display: "flex", flexDirection: "column", gap: 10 }}>
        <div style={{ fontSize: 12, color: INK_SOFT, lineHeight: 1.45 }}>Os endereços salvos aparecem como atalho ao publicar um item e ao agendar uma retirada. O endereço exato só é compartilhado quando você envia no chat.</div>
        {loading && <Loading />}
        {error && <ErrorBox message={error} onRetry={reload} />}

        {editando ? (
          <FormEndereco inicial={editando === "novo" ? null : editando} primeiro={lista.length === 0} notify={notify} onCancelar={() => setEditando(null)} onSalvo={aposMudanca} />
        ) : (
          <>
            {!loading && !error && lista.length === 0 && (
              <>
                <EmptyState Icon={MapPin} text="Você ainda não salvou nenhum endereço." />
                {temCadastroAntigo && (
                  <div style={{ ...card, background: "var(--role-soft)", borderColor: "transparent" }}>
                    <div style={{ fontSize: 12.5, color: "var(--role-primary-dark)" }}>Encontramos o endereço do seu cadastro: <b>{resumoEndereco(usuario)}</b></div>
                    <div style={{ marginTop: 8 }}>
                      <Button small variant="soft" onClick={() => setEditando({ ...VAZIO, apelido: "Casa", cep: usuario.cep, logradouro: usuario.logradouro || "", numero: usuario.numero || "", complemento: usuario.complemento || "", bairro: usuario.bairro || "", cidade: usuario.cidade, uf: usuario.uf || "", latitude: usuario.latitude, longitude: usuario.longitude })}>Salvar como "Casa"</Button>
                    </div>
                  </div>
                )}
              </>
            )}
            {lista.map(e => {
              const Icon = iconeDoApelido(e.apelido);
              return (
                <div key={e.id} style={{ ...card, borderColor: e.principal ? "var(--role-primary)" : "#EDEBE1" }}>
                  <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                    <div style={{ width: 34, height: 34, borderRadius: 10, background: "var(--role-soft)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Icon size={16} color="var(--role-primary-dark)" /></div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{ fontSize: 13.5, fontWeight: 700, color: INK }}>{e.apelido}</span>
                        {e.principal && <span style={{ fontSize: 10, fontWeight: 700, color: "var(--role-primary-dark)", background: "var(--role-soft)", borderRadius: 999, padding: "2px 8px" }}>padrão</span>}
                      </div>
                      <div style={{ fontSize: 12, color: INK_SOFT, marginTop: 3, lineHeight: 1.4 }}>{resumoEndereco(e)}</div>
                      <div style={{ fontSize: 11, color: INK_SOFT }}>CEP {formatCep(e.cep)}</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 6, marginTop: 10, flexWrap: "wrap" }}>
                    {!e.principal && <Button small variant="soft" icon={Star} loading={processando === e.id} onClick={() => tornarPadrao(e)}>Tornar padrão</Button>}
                    <Button small variant="ghost" icon={Pencil} onClick={() => setEditando(e)}>Editar</Button>
                    <Button small variant="ghost" icon={Trash2} onClick={() => excluir(e)}>Excluir</Button>
                  </div>
                </div>
              );
            })}
            {!loading && !error && lista.length < 10 && <Button full variant="soft" icon={Plus} onClick={() => setEditando("novo")}>Adicionar endereço</Button>}
          </>
        )}
      </div>
    </div>
  );
}

export { Enderecos };
