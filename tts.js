// tts.js — voce neurale lato server: Google Cloud Text-to-Speech (voci WaveNet italiane).
// Il browser invia le frasi da leggere (già preparate da voce.js); il server costruisce l'SSML, controlla i limiti e chiede l'audio MP3.
// La chiave del servizio (GOOGLE_TTS_API_KEY) resta sul server: non arriva mai al browser.
import { createHash } from "node:crypto";

export const MAX_FRASI = 60;
export const MAX_CARATTERI = 1800;      // per richiesta: con le pause l'SSML resta sotto i 5000 byte ammessi dall'API
export const VELOCITA_MIN = 0.7, VELOCITA_MAX = 1.3;
const URL_SINTESI = "https://texttospeech.googleapis.com/v1/text:synthesize";
const URL_VOCI = "https://texttospeech.googleapis.com/v1/voices?languageCode=it-IT";

// Ripiego se l'elenco delle voci non risponde (nomi usati da Google per l'italiano)
export const VOCI_PREDEFINITE = [
  { id: "it-IT-Wavenet-A", label: "Voce WaveNet A", genere: null },
  { id: "it-IT-Wavenet-C", label: "Voce WaveNet C", genere: null },
];

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// SSML con una pausa dopo ogni frase (le pause danno il respiro, come in una lettura umana)
export function costruisciSsml(frasi) {
  let corpo = "", caratteri = 0;
  for (const f of Array.isArray(frasi) ? frasi : []) {
    if (!f || typeof f.testo !== "string") continue;
    const testo = f.testo.trim();
    if (!testo) continue;
    const pausa = Math.min(1000, Math.max(0, Math.round(Number(f.pausa) || 0)));
    corpo += `${esc(testo)}<break time="${pausa}ms"/>`;
    caratteri += testo.length;
  }
  return { ssml: `<speak>${corpo}</speak>`, caratteri };
}

export function validaRichiesta(body, vociAmmesse) {
  if (!body || !Array.isArray(body.frasi) || !body.frasi.length) return { ok: false, errore: "frasi mancanti" };
  if (body.frasi.length > MAX_FRASI) return { ok: false, errore: "troppe frasi" };
  const { ssml, caratteri } = costruisciSsml(body.frasi);
  if (!caratteri) return { ok: false, errore: "nessun testo da leggere" };
  if (caratteri > MAX_CARATTERI) return { ok: false, errore: "testo troppo lungo" };
  const voce = body.voce === undefined || body.voce === null || body.voce === "" ? vociAmmesse[0] : body.voce;
  if (!vociAmmesse.includes(voce)) return { ok: false, errore: "voce non ammessa" };
  let velocita = Number(body.velocita);
  if (!Number.isFinite(velocita)) velocita = 1;
  velocita = Math.min(VELOCITA_MAX, Math.max(VELOCITA_MIN, velocita));
  return { ok: true, ssml, caratteri, voce, velocita };
}

// Cache delle ultime voci generate (es. il messaggio di benvenuto): ogni lettura ripetuta non costa
export function creaCache(max = 200) {
  const m = new Map();
  return {
    get(k) { if (!m.has(k)) return undefined; const v = m.get(k); m.delete(k); m.set(k, v); return v; },
    set(k, v) { m.delete(k); m.set(k, v); while (m.size > max) m.delete(m.keys().next().value); },
    get size() { return m.size; },
  };
}
export const chiaveCache = (voce, velocita, ssml) => createHash("sha256").update(`${voce}|${velocita}|${ssml}`).digest("hex");

// Limite per indirizzo: la chiave del servizio è a pagamento, un endpoint aperto non deve poter essere usato da chiunque senza freno
export function creaLimitatore({ finestraMs = 600000, maxRichieste = 80, maxCaratteri = 60000, ora = Date.now } = {}) {
  const registro = new Map();
  return {
    consenti(ip, caratteri) {
      const adesso = ora();
      const voci = (registro.get(ip) || []).filter(x => x.t > adesso - finestraMs);
      const usati = voci.reduce((n, x) => n + x.c, 0);
      if (voci.length >= maxRichieste || usati + caratteri > maxCaratteri) { registro.set(ip, voci); return false; }
      voci.push({ t: adesso, c: caratteri });
      registro.set(ip, voci);
      return true;
    },
  };
}

export async function sintetizza({ apiKey, ssml, voce, velocita, fetchImpl = fetch }) {
  const r = await fetchImpl(URL_SINTESI, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Goog-Api-Key": apiKey },
    body: JSON.stringify({
      input: { ssml },
      voice: { languageCode: "it-IT", name: voce },
      audioConfig: { audioEncoding: "MP3", speakingRate: velocita, pitch: 0 },
    }),
  });
  if (!r.ok) throw new Error(`Google TTS ${r.status}`);   // il testo della richiesta non entra mai nel messaggio d'errore
  const d = await r.json();
  if (!d || !d.audioContent) throw new Error("Google TTS: risposta senza audio");
  return d.audioContent;
}

// Voci italiane WaveNet disponibili per la chiave configurata, con etichetta per genere
export async function elencaVoci({ apiKey, fetchImpl = fetch }) {
  try {
    const r = await fetchImpl(URL_VOCI, { headers: { "X-Goog-Api-Key": apiKey } });
    if (!r.ok) throw new Error(String(r.status));
    const d = await r.json();
    const wave = (d.voices || []).filter(v => /^it-IT-Wavenet-/.test(v.name)).sort((a, b) => a.name.localeCompare(b.name));
    if (!wave.length) return VOCI_PREDEFINITE;
    const n = { MALE: 0, FEMALE: 0 };
    return wave.map(v => {
      const g = v.ssmlGender === "MALE" ? "MALE" : "FEMALE";
      n[g] += 1;
      return { id: v.name, genere: g, label: `Voce ${g === "MALE" ? "maschile" : "femminile"} ${n[g]} (WaveNet)` };
    });
  } catch (e) {
    return VOCI_PREDEFINITE;
  }
}
