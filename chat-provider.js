// chat-provider.js — i modelli che conducono il colloquio, in ordine di tentativo (il primo che risponde vince).
// Predefinito: Mistral Small (UE) con Mistral Large di riserva, se MISTRAL_API_KEY c'è.
// CHAT_PROVIDER=legacy riporta la catena precedente (DeepSeek, poi GLM); CHAT_PROVIDER=mistral la impone (senza chiave: catena vuota, mai ripiego silenzioso su fornitori extra-UE).
// Nei messaggi d'errore e nei log non finiscono mai i testi del colloquio.

const MISTRAL_URL = "https://api.mistral.ai/v1/chat/completions";
const ZAI_URL = "https://api.z.ai/api/paas/v4/chat/completions";
const DEEPSEEK_URL = "https://api.deepseek.com/chat/completions";

// Modelli: nomi ufficiali (gli alias «latest» possono cambiare modello e prezzo senza avviso)
const MISTRAL_SMALL = "mistral-small-2603";
const MISTRAL_LARGE = "mistral-large-2512";
const DEEPSEEK_MODEL = "deepseek-flash";
const ZAI_MODEL = "glm-5.3-flash";

const numero = (v, predefinito) => (Number.isFinite(Number(v)) && String(v).trim() !== "" ? Number(v) : predefinito);

// Quale famiglia di fornitori usare: "mistral" | "legacy"
export function scegliCatenaChat(env) {
  const e = env || {};
  const richiesto = String(e.CHAT_PROVIDER || "").trim().toLowerCase();
  if (richiesto === "legacy") return "legacy";
  if (richiesto === "mistral") return "mistral";
  return e.MISTRAL_API_KEY ? "mistral" : "legacy";
}

// Elenco dei tentativi: { nome, url, apiKey, model, temperature, maxTokens, extra }
export function catenaChat(env) {
  const e = env || {};
  const temperature = numero(e.CHAT_TEMPERATURE, 0.7);
  const catena = [];
  if (scegliCatenaChat(e) === "mistral") {
    if (!e.MISTRAL_API_KEY) return catena;
    // Small 4 ragiona se non glielo si vieta: nel colloquio i token di ragionamento sono solo costo e attesa
    const ragionamento = e.CHAT_MISTRAL_REASONING === undefined ? "none" : String(e.CHAT_MISTRAL_REASONING).trim();
    // Mistral risponde in testo libero se non gli si impone il JSON, che il client si aspetta (message, quickReplies, icfUpdate…)
    const small = { nome: "mistral-small", url: MISTRAL_URL, apiKey: e.MISTRAL_API_KEY, model: e.CHAT_MISTRAL_MODEL || MISTRAL_SMALL, temperature, maxTokens: 2048, extra: { response_format: { type: "json_object" } } };
    if (ragionamento) small.extra.reasoning_effort = ragionamento;
    catena.push(small);
    const riserva = e.CHAT_MISTRAL_FALLBACK === undefined ? MISTRAL_LARGE : String(e.CHAT_MISTRAL_FALLBACK).trim();
    if (riserva && riserva.toLowerCase() !== "none") {
      // niente reasoning_effort: Large non è detto che lo accetti
      catena.push({ nome: "mistral-riserva", url: MISTRAL_URL, apiKey: e.MISTRAL_API_KEY, model: riserva, temperature, maxTokens: 2048, extra: { response_format: { type: "json_object" } } });
    }
    return catena;
  }
  if (e.DEEPSEEK_API_KEY) catena.push({ nome: "deepseek", url: DEEPSEEK_URL, apiKey: e.DEEPSEEK_API_KEY, model: DEEPSEEK_MODEL, temperature, maxTokens: 2048, extra: {} });
  // GLM è più lento e può troncare il JSON con maxTokens basso: 6000; temperature 1 e top_p 0,95 sono i valori consigliati da Z.ai
  if (e.ZAI_API_KEY) catena.push({ nome: "glm", url: ZAI_URL, apiKey: e.ZAI_API_KEY, model: ZAI_MODEL, temperature: 1, maxTokens: 6000, extra: { top_p: 0.95 } });
  return catena;
}

// Il contenuto può essere una stringa oppure una lista di blocchi (ragionamento + testo): si tiene solo il testo
export function testoRisposta(content) {
  if (typeof content === "string") return content;
  if (!Array.isArray(content)) return "";
  return content.filter(b => b && b.type === "text" && typeof b.text === "string").map(b => b.text).join("");
}

// Descrizione della catena per il log di avvio (solo nomi di modelli)
export function descriviCatena(catena) {
  return catena.length ? catena.map(c => c.model).join(" → ") : "nessun fornitore configurato";
}

// Corpo della richiesta chat/completions (formato OpenAI, comune a Mistral, DeepSeek e GLM)
export function corpoRichiesta({ system, messages, model, temperature, maxTokens, extra }) {
  return { model, messages: [{ role: "system", content: system }, ...messages], max_tokens: maxTokens, temperature, ...(extra || {}) };
}

// Prova i fornitori nell'ordine: il primo che risponde vince. chiama(c) restituisce il testo o lancia; ritorna { text, provider } oppure null.
export async function eseguiCatena(catena, chiama, segnalaErrore) {
  for (const c of catena) {
    try {
      return { text: await chiama(c), provider: c.model };
    } catch (err) {
      if (segnalaErrore) segnalaErrore(c, err);
    }
  }
  return null;
}

// La risposta del colloquio deve essere un oggetto JSON con il campo message (anche dentro un blocco ```json): altrimenti il client non può usarla
export function rispostaValida(text) {
  try {
    const j = JSON.parse(String(text || "").replace(/```json|```/g, "").trim());
    return !!j && typeof j === "object" && !Array.isArray(j) && typeof j.message === "string" && j.message.trim() !== "";
  } catch { return false; }
}
