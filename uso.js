// uso.js — consumi delle chiamate a pagamento (colloquio, PEI, voce) scritti nei log come righe [USO] e riepilogati in costi.
// Nei log finiscono solo numeri e il nome del modello: mai testi, nomi o dati dell'alunno.

// Dollari per milione di token (chat, PEI) o di caratteri (voce). Sono stime da aggiornare se i listini cambiano;
// il log conserva i token, quindi il riepilogo si può rifare con prezzi nuovi.
export const PREZZI = {
  "deepseek-flash": { in: 0.15, out: 0.60 },
  "glm-5.3-flash": { in: 0.15, out: 0.50 },
  "claude-sonnet-5": { in: 2, out: 10 },
  "mistral-small-2603": { in: 0.15, out: 0.60 },
  tts: 16,
};

const n = (v) => (Number.isFinite(Number(v)) ? Number(v) : 0);

// [USO] tipo campo=valore ...
export function rigaUso(tipo, campi) {
  return `[USO] ${tipo} ` + Object.entries(campi).map(([k, v]) => `${k}=${v}`).join(" ");
}

export function leggiRigaUso(riga) {
  const m = /\[USO\] ([a-z]+)((?: [a-z]+=\S+)*)/.exec(String(riga));
  if (!m) return null;
  const out = { tipo: m[1] };
  for (const kv of m[2].trim().split(" ").filter(Boolean)) {
    const i = kv.indexOf("=");
    const v = kv.slice(i + 1);
    out[kv.slice(0, i)] = /^\d+$/.test(v) ? Number(v) : v;
  }
  return out;
}

// Risposta di un endpoint chat/completions in stile OpenAI (DeepSeek, GLM)
export function usoChat(data) {
  const u = (data && data.usage) || {};
  return { in: n(u.prompt_tokens), out: n(u.completion_tokens), cache: n(u.prompt_cache_hit_tokens) };
}

// Le risposte delle chiamate Claude che compongono un PEI
export function usoClaude(messaggi) {
  const lista = Array.isArray(messaggi) ? messaggi : [];
  return lista.reduce((t, m) => {
    const u = (m && m.usage) || {};
    return { chiamate: t.chiamate + 1, in: t.in + n(u.input_tokens), out: t.out + n(u.output_tokens) };
  }, { chiamate: 0, in: 0, out: 0 });
}

export function stimaCostoUsd(e) {
  if (e.tipo === "tts") return e.cache === "si" ? 0 : n(e.caratteri) * PREZZI.tts / 1e6;
  const p = PREZZI[e.modello];
  return p ? (n(e.in) * p.in + n(e.out) * p.out) / 1e6 : 0;
}

export function riepilogaLog(testo) {
  const r = {
    chat: { chiamate: 0, in: 0, out: 0, usd: 0 },
    pei: { generazioni: 0, in: 0, out: 0, usd: 0 },
    tts: { richieste: 0, caratteriFatturati: 0, caratteriInCache: 0, usd: 0 },
  };
  for (const riga of String(testo || "").split("\n")) {
    const e = leggiRigaUso(riga);
    if (!e) continue;
    const usd = stimaCostoUsd(e);
    if (e.tipo === "chat") { r.chat.chiamate++; r.chat.in += n(e.in); r.chat.out += n(e.out); r.chat.usd += usd; }
    else if (e.tipo === "pei") { r.pei.generazioni++; r.pei.in += n(e.in); r.pei.out += n(e.out); r.pei.usd += usd; }
    else if (e.tipo === "tts") {
      r.tts.richieste++;
      if (e.cache === "si") r.tts.caratteriInCache += n(e.caratteri); else r.tts.caratteriFatturati += n(e.caratteri);
      r.tts.usd += usd;
    }
  }
  r.totaleUsd = r.chat.usd + r.pei.usd + r.tts.usd;
  r.perPeiUsd = r.pei.generazioni ? r.totaleUsd / r.pei.generazioni : null;
  return r;
}

const usd = (x) => "$" + x.toFixed(2);
const mig = (x) => x.toLocaleString("it-IT");

export function formattaRiepilogo(r) {
  const righe = [
    `PEI generati: ${r.pei.generazioni}`,
    `Colloquio: ${mig(r.chat.chiamate)} chiamate, ${mig(r.chat.in)} token in ingresso, ${mig(r.chat.out)} in uscita → ${usd(r.chat.usd)}`,
    `PEI (Claude): ${mig(r.pei.in)} token in ingresso, ${mig(r.pei.out)} in uscita → ${usd(r.pei.usd)}`,
    `Voce: ${mig(r.tts.caratteriFatturati)} caratteri sintetizzati (${mig(r.tts.caratteriInCache)} serviti dalla cache) → ${usd(r.tts.usd)}`,
    `Totale stimato: ${usd(r.totaleUsd)}`,
  ];
  if (r.perPeiUsd !== null) {
    const c = r.chat.chiamate / r.pei.generazioni;
    righe.push(`Costo medio per PEI: ${usd(r.perPeiUsd)} (circa ${c.toFixed(0)} chiamate di colloquio per PEI)`);
  } else righe.push("Costo medio per PEI: non calcolabile, nessun PEI generato nel periodo.");
  righe.push("Si tratta di una stima: prezzi di listino in uso.js, senza sconti per la cache dei token né per la quota gratuita mensile della voce, e senza i costi di Railway.");
  return righe.join("\n");
}
