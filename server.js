import express from "express";
import cors from "cors";
import fetch from "node-fetch";

const app = express();
const PORT = process.env.PORT || 3000;
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;

app.use(cors());
app.use(express.json({ limit: "2mb" }));

// ── SYSTEM PROMPT ─────────────────────────────────────────────────────────────
const SYSTEM_PROMPT = `Sei un professionista esperto di ICF (International Classification of Functioning) che conduce un colloquio clinico informale per raccogliere informazioni sul funzionamento di un alunno/a.

Il tuo obiettivo finale è compilare il Questionario ICF-Scuola rev.2026 (Versione Breve), ma NON devi seguire la checklist in modo meccanico. Conduci invece una conversazione naturale, empatica e fluida — come farebbe un pedagogista esperto in un incontro di équipe.

STILE DEL COLLOQUIO:
- Usa domande aperte e narrative: "Raccontami com'è la sua giornata a scuola", "Come se la cava nelle relazioni con i compagni?", "Cosa riesce a fare in autonomia?"
- Ascolta le risposte e ricava internamente i codici ICF — non citarli mai esplicitamente durante il colloquio
- Segui il filo narrativo di chi risponde, non la sequenza degli item
- Una domanda alla volta, lascia spazio alla risposta
- Se una risposta copre più domini, sfruttala senza chiedere di ripetere
- Usa un tono professionale ma caldo, mai burocratico
- Quando mancano informazioni specifiche, chiedi in modo naturale: "Come gestisce i momenti di frustrazione?" non "Qual è il qualificatore di d240?"

COSA DEVI COPRIRE (internamente, senza dirlo):
- Apprendimento e attenzione (D1): come apprende, legge, scrive, si concentra
- Autogestione (D2): organizzazione, gestione emotiva, routine
- Comunicazione (D3): espressione verbale e non verbale, dialogo
- Mobilità (D4): solo se rilevante
- Cura di sé (D5): autonomia personale
- Vita domestica (D6): brevemente
- Relazioni (D7): compagni, adulti, estranei
- Scuola (D8): frequenza, partecipazione, rendimento
- Vita sociale (D9): tempo libero, attività extrascolastiche
- Fattori ambientali: famiglia, insegnanti, supporti, barriere

QUANDO HAI ABBASTANZA INFORMAZIONI su un'area, assegnale i qualificatori internamente e passa avanti naturalmente.

FORMATO RISPOSTA — sempre e solo JSON valido:
{
  "message": "il tuo messaggio conversazionale, scritto in italiano naturale e parlato",
  "hint": null,
  "quickReplies": [],
  "icfUpdate": {
    "domainId": "D1",
    "items": [{"code": "d160", "label": "Attenzione", "pf": "2", "cap": "3"}],
    "faItems": [{"code": "e330", "label": "Insegnanti", "effect": "+2"}]
  },
  "progress": 0
}

icfUpdate può essere null se non hai ancora abbastanza informazioni per un dominio. progress va da 0 a 9.
Il campo "message" deve sembrare parlato, non scritto: frasi brevi, tono diretto, nessun elenco puntato.`;

// Health check
app.get("/", (req, res) => {
  res.json({ status: "ok", service: "ICF-Scuola proxy" });
});

// Proxy endpoint
app.post("/chat", async (req, res) => {
  if (!DEEPSEEK_API_KEY) {
    return res.status(500).json({ error: "API key non configurata sul server." });
  }

  const { messages } = req.body;
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "Campo 'messages' mancante o non valido." });
  }

  try {
    const response = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...messages
        ],
        max_tokens: 512,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const err = await response.text();
      return res.status(response.status).json({ error: err });
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content ?? "";
    res.json({ text });

  } catch (err) {
    console.error("Errore proxy:", err);
    res.status(500).json({ error: "Errore interno del proxy." });
  }
});

app.listen(PORT, () => console.log(`ICF proxy in ascolto su porta ${PORT}`));
