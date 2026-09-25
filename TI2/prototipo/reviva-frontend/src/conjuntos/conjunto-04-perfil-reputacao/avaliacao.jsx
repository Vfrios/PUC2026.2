import React, { useState } from "react";
import { CheckCircle2, Star } from "lucide-react";
import { api } from "../../api.js";
import { GOLD, INK, INK_SOFT, useApiData, Avatar, Button, Loading, TopBar, fieldBox, fieldInput } from "../../shared/shared.jsx";

const CATEGORIAS_AVALIACAO = [
	{ key: "pontualidade", label: "Pontualidade" },
	{ key: "comunicacao", label: "Comunicação" },
	{ key: "estadoItem", label: "Item conforme anunciado" },
];

function EstrelasInput({ value, onChange, size = 30, label }) {
	return (
		<div role="radiogroup" aria-label={label} style={{ display: "flex", gap: 4 }}>
			{[1, 2, 3, 4, 5].map(i => <Star key={i} role="radio" aria-checked={i === value} aria-label={`${i} estrela(s)`} size={size} onClick={() => onChange(i)} fill={i <= value ? GOLD : "none"} color={i <= value ? GOLD : "#D6D6D0"} style={{ cursor: "pointer" }} />)}
		</div>
	);
}

export function Avaliar({ go, notify, params }) {
	const { quem, avaliadoId, agendamentoId, next } = params || {};
	const [nota, setNota] = useState(5);
	const [categorias, setCategorias] = useState({ pontualidade: 5, comunicacao: 5, estadoItem: 5 });
	const [comentario, setComentario] = useState("");
	const [loading, setLoading] = useState(false);
	const { data: jaAvaliada, loading: verificando } = useApiData(() => api.jaAvaliei(agendamentoId), [agendamentoId], { skip: !agendamentoId });

	const enviar = async () => {
		if (!agendamentoId || !avaliadoId) { go(next || "homeDoador"); return; }
		setLoading(true);
		try {
			await api.avaliar(agendamentoId, avaliadoId, nota, comentario.trim(), categorias);
			notify("Avaliação enviada — obrigado! A reputação foi atualizada.");
			go(next || "homeDoador");
		} catch (e) { notify(e.message || "Não foi possível enviar a avaliação."); }
		finally { setLoading(false); }
	};

	if (verificando) return <div><TopBar title="Avaliação" onBack={() => go(-1)} /><Loading /></div>;
	if (jaAvaliada) return <div><TopBar title="Avaliação" onBack={() => go(-1)} /><div style={{ padding: "30px 24px", textAlign: "center" }}><CheckCircle2 size={40} color="var(--role-primary)" /><div style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 600, color: INK, marginTop: 12 }}>Você já avaliou esta troca</div><div style={{ fontSize: 13, color: INK_SOFT, marginTop: 6 }}>Sua nota foi {jaAvaliada.nota} estrela(s). Cada troca pode ser avaliada uma única vez.</div><Button full style={{ marginTop: 20 }} onClick={() => go(next || "homeDoador")}>Continuar</Button></div></div>;

	return <div><TopBar title="Avaliação" onBack={() => go(-1)} /><div style={{ padding: "24px", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}><Avatar label={quem || "Usuário"} size={64} tone="var(--role-primary)" /><div style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 600, color: INK, marginTop: 14 }}>Como foi com {quem || "essa pessoa"}?</div><div style={{ margin: "14px 0 6px" }}><EstrelasInput value={nota} onChange={setNota} label="Nota geral" /></div><div style={{ fontSize: 11.5, color: INK_SOFT }}>Nota geral</div><div style={{ width: "100%", background: "#fff", border: "1px solid #EDEBE1", borderRadius: 16, padding: 12, marginTop: 14, display: "flex", flexDirection: "column", gap: 10 }}>{CATEGORIAS_AVALIACAO.map(c => <div key={c.key} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}><span style={{ fontSize: 12.5, fontWeight: 600, color: INK, textAlign: "left" }}>{c.label}</span><EstrelasInput value={categorias[c.key]} onChange={v => setCategorias(x => ({ ...x, [c.key]: v }))} size={20} label={c.label} /></div>)}</div><div style={{ ...fieldBox, width: "100%", alignItems: "flex-start", marginTop: 12 }}><textarea rows={3} maxLength={400} value={comentario} onChange={e => setComentario(e.target.value)} placeholder="Deixe um comentário (opcional)" style={{ ...fieldInput, resize: "none" }} /></div><div style={{ marginTop: 20, width: "100%", display: "flex", flexDirection: "column", gap: 8 }}><Button full loading={loading} onClick={enviar}>Enviar avaliação</Button><Button full variant="ghost" onClick={() => go(next || "homeDoador")}>Avaliar depois</Button></div></div></div>;
}
