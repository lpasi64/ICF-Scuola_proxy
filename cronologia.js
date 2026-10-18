// cronologia.js — compattazione della cronologia del colloquio prima di inviarla al modello.
// Il client rimanda a ogni turno TUTTE le risposte JSON precedenti dell'assistente (messaggio + tutti gli item registrati): più il colloquio avanza,
// più la richiesta pesa (fino a 100.000 token) e il modello tende a imitare le proprie risposte lunghe (fino a 4.096 token, troncate).
// Qui: (1) lo stato già registrato si ricava dalle risposte precedenti e si passa al modello in forma di elenco breve (STATO GIÀ REGISTRATO);
// (2) le risposte vecchie si riducono al solo messaggio, tenendo intere le ultime (restano l'esempio del formato JSON da seguire).
// Nei messaggi non entra nulla che non fosse già nella cronologia inviata dal client: stessi dati, meno ripetizioni.

// I 47 item d del questionario breve (stesso elenco di icf-transform.js; lo verifica test-cronologia.mjs)
export const ITEM_D = [
  "d137", "d138", "d155", "d160", "d166", "d170", "d172", "d175", "d177", "d179",
  "d210", "d220", "d230", "d240",
  "d310", "d315", "d320", "d330", "d335", "d340", "d349", "d350", "d360",
  "d430", "d440", "d450", "d460", "d465", "d470",
  "d510", "d530", "d540", "d550", "d570",
  "d6308", "d6408",
  "d710", "d720", "d730", "d750",
  "d820", "d835", "d840", "d860",
  "d910", "d920", "d9200",
];

// Risposta dell'assistente come oggetto, anche se racchiusa in un blocco ```json; null se non è JSON valido
export function leggiRisposta(testo) {
  try {
    const j = JSON.parse(String(testo || "").replace(/```json|```/g, "").trim());
    return j && typeof j === "object" && !Array.isArray(j) ? j : null;
  } catch { return null; }
}

// Del testo di una risposta non valida (troncata) si recupera almeno il messaggio
function messaggioDaTesto(testo) {
  const m = /"message"\s*:\s*"((?:[^"\\]|\\.)*)"/.exec(String(testo || ""));
  if (!m) return null;
  try { return JSON.parse('"' + m[1] + '"'); } catch { return m[1]; }
}

// Un codice d (anche figlio, es. d1750) → il codice previsto dal questionario, oppure null
function codiceD(code) {
  const c = String(code || "").trim().toLowerCase();
  if (ITEM_D.includes(c)) return c;
  return ITEM_D.filter(p => c.length > p.length && c.startsWith(p)).sort((a, b) => b.length - a.length)[0] || null;
}
const valore = (v) => { const n = Number(v); return v === "" || v === null || v === undefined || !Number.isInteger(n) ? null : n; };

// Stato registrato finora, ricavato dalle risposte dell'assistente nella cronologia (le ultime sovrascrivono le prime, come fa il client)
export function ricavaStato(messages) {
  const stato = { anagrafica: {}, d: new Map(), b: new Map(), s: new Map(), fp: new Set(), fa: new Set() };
  for (const m of Array.isArray(messages) ? messages : []) {
    if (!m || m.role !== "assistant") continue;
    const r = leggiRisposta(m.content);
    if (!r) continue;
    for (const [k, v] of Object.entries(r.anagrafica || {})) if (v !== null && v !== undefined && String(v).trim()) stato.anagrafica[k] = Array.isArray(v) ? v.join(", ") : String(v);
    for (const it of (r.icfUpdate && r.icfUpdate.items) || []) {
      const c = codiceD(it && it.code), pf = valore(it && it.pf);
      if (c && pf !== null) stato.d.set(c, { pf, cap: valore(it.cap) });
    }
    for (const f of (r.icfUpdate && r.icfUpdate.faItems) || []) if (f && f.code) stato.fa.add(`${String(f.code).toLowerCase()}@${r.icfUpdate.domainId || "?"}`);
    for (const [lista, mappa, pref] of [[r.bItems, stato.b, "b"], [r.sItems, stato.s, "s"]]) for (const x of Array.isArray(lista) ? lista : []) {
      const c = String((x && x.code) || "").trim().toLowerCase();
      if (c) mappa.set(c.startsWith(pref) ? c : pref + c, x.qualifier ?? "");
    }
    for (const x of Array.isArray(r.fpItems) ? r.fpItems : []) if (x && x.code) stato.fp.add(String(x.code).startsWith("i") ? String(x.code) : "i" + x.code);
  }
  return stato;
}

// Testo dello stato da aggiungere in coda al prompt di sistema ("" se non c'è ancora nulla)
export function testoStato(stato) {
  const ana = Object.entries(stato.anagrafica).map(([k, v]) => `${k}=${String(v).slice(0, 120)}`).join("; ");
  const valutati = ITEM_D.filter(c => stato.d.has(c)), mancanti = ITEM_D.filter(c => !stato.d.has(c));
  if (!ana && !valutati.length && !stato.b.size && !stato.s.size && !stato.fp.size && !stato.fa.size) return "";
  const righe = ["STATO GIÀ REGISTRATO NEL QUESTIONARIO (ricavato dalle tue risposte precedenti, che per brevità non sono più riportate per intero). Nel JSON di questa risposta includi SOLO ciò che è nuovo o corretto in questo turno: non ripetere ciò che è già qui."];
  if (ana) righe.push(`- Anagrafica: ${ana}`);
  righe.push(`- Item d già valutati (${valutati.length} su ${ITEM_D.length}), con PF/CAP: ${valutati.length ? valutati.map(c => `${c}(${stato.d.get(c).pf}/${stato.d.get(c).cap ?? "-"})`).join(", ") : "nessuno"}`);
  righe.push(`- Item d ancora senza valore (${mancanti.length}): ${mancanti.length ? mancanti.join(", ") : "nessuno"}`);
  if (stato.b.size) righe.push(`- Funzioni corporee: ${[...stato.b].map(([c, q]) => `${c}(${q})`).join(", ")}`);
  if (stato.s.size) righe.push(`- Strutture corporee: ${[...stato.s].map(([c, q]) => `${c}(${q})`).join(", ")}`);
  if (stato.fp.size) righe.push(`- Fattori personali: ${[...stato.fp].join(", ")}`);
  if (stato.fa.size) righe.push(`- Fattori ambientali già registrati (codice@dominio): ${[...stato.fa].join(", ")}`);
  return righe.join("\n");
}

// Cronologia compattata: gli ultimi `mantieniUltimi` messaggi restano interi (sono l'esempio del formato da seguire),
// le risposte dell'assistente più vecchie si riducono al solo messaggio. I messaggi dell'insegnante non si toccano. L'originale non si modifica.
export function compattaMessaggi(messages, { mantieniUltimi = 4 } = {}) {
  const lista = Array.isArray(messages) ? messages : [];
  const limite = Math.max(0, lista.length - mantieniUltimi);
  return lista.map((m, i) => {
    if (i >= limite || !m || m.role !== "assistant") return m;
    const r = leggiRisposta(m.content);
    const messaggio = r ? (typeof r.message === "string" ? r.message : "") : messaggioDaTesto(m.content);
    if (messaggio === null) return { ...m, content: String(m.content || "").slice(0, 500) };   // né JSON né messaggio riconoscibile: se ne tiene l'inizio
    return { ...m, content: JSON.stringify({ message: messaggio }) };
  });
}

// Tutto insieme: messaggi compattati + testo dello stato. Con `attiva` false restituisce la cronologia com'è (interruttore).
export function preparaCronologia(messages, { attiva = true, mantieniUltimi = 4 } = {}) {
  if (!attiva) return { messages, stato: "" };
  return { messages: compattaMessaggi(messages, { mantieniUltimi }), stato: testoStato(ricavaStato(messages)) };
}
