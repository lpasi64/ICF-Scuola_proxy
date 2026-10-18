// accesso.js — accesso su invito: se sul server c'è la variabile ACCESSO_CHIAVE, ogni richiesta (tranne il controllo di salute e le OPTIONS di CORS)
// deve portare la stessa chiave nell'intestazione «X-Accesso». La chiave sta nel link di invito (dopo il «#»), mai nell'indirizzo delle richieste.
// Senza la variabile l'accesso è libero (come prima). Dopo troppi tentativi con una chiave sbagliata lo stesso indirizzo viene fermato per un po'.
import { timingSafeEqual } from "node:crypto";

export const FINESTRA_MS = 10 * 60 * 1000;
export const MAX_TENTATIVI_ERRATI = 20;

// Confronto a tempo costante: non rivela da quanti caratteri esatti inizia la chiave tentata
function uguali(a, b) {
  const x = Buffer.from(String(a || ""), "utf8"), y = Buffer.from(String(b || ""), "utf8");
  return x.length === y.length && x.length > 0 && timingSafeEqual(x, y);
}

// Ritorna { ok: true } oppure { ok: false, status, corpo }. `fallimenti` è una Map(ip → { n, da }) tenuta dal chiamante.
export function controllaAccesso({ chiave, metodo, percorso, intestazione, ip, fallimenti, ora = Date.now() }) {
  const k = String(chiave || "").trim();
  if (!k) return { ok: true };                                            // accesso libero
  if (metodo === "OPTIONS" || (metodo === "GET" && percorso === "/")) return { ok: true };   // salute del servizio e prerichieste CORS
  const registro = fallimenti instanceof Map ? fallimenti : new Map();
  const rec = registro.get(ip);
  const attivo = rec && ora - rec.da < FINESTRA_MS;
  if (attivo && rec.n >= MAX_TENTATIVI_ERRATI) {
    return { ok: false, status: 429, corpo: { error: "Troppi tentativi con una chiave non valida. Riprovi più tardi.", codice: "troppi_tentativi" } };
  }
  if (uguali(intestazione, k)) return { ok: true };
  if (intestazione !== undefined && intestazione !== null && String(intestazione) !== "") {   // conta solo chi prova una chiave sbagliata, non chi non ne ha una
    if (registro.size > 2000) for (const [a, r] of registro) if (ora - r.da >= FINESTRA_MS) registro.delete(a);
    registro.set(ip, attivo ? { n: rec.n + 1, da: rec.da } : { n: 1, da: ora });
  }
  return { ok: false, status: 401, corpo: { error: "Accesso su invito: serve il link ricevuto.", codice: "accesso" } };
}
