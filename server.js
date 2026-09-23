import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import Anthropic from "@anthropic-ai/sdk";
import { Packer } from "docx";
import { buildPromptPart1, buildPromptPart2, buildPromptPart3, buildPromptPart4 } from "./pei-prompt.js";
import { buildDocx } from "./pei-docx-builder.js";
import { ISTITUTI_SEC2 } from "./pei-gradi.js";

const app = express();
const PORT = process.env.PORT || 3000;
const ZAI_API_KEY = process.env.ZAI_API_KEY;
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const anthropicClient = ANTHROPIC_API_KEY ? new Anthropic({ apiKey: ANTHROPIC_API_KEY }) : null;
// Generazione PEI: claude-sonnet-5 — più economico ($2/$10 per 1M token input/output) E più
// recente del claude-sonnet-4-6 usato nel progetto "Generatore PEI" originale ($3/$15), nessun
// compromesso di qualità. Non DeepSeek/GLM: il testo generato viene parsato con regex da
// pei-docx-builder.js (marker DISC:/SPEC81:/CRIT84:, blocchi ### Obiettivo N) — un formato
// diverso produce sezioni vuote nel .docx, rischio non accettabile per un documento ministeriale.
const PEI_MODEL = "claude-sonnet-5";

// Provider primario: GLM-5.3-Flash (Z.ai), modello multimodale (usato qui solo in modalità
// testo) con contesto 1M token. Fallback automatico su DeepSeek se GLM non è configurato o
// la chiamata fallisce. ID modello e parametri confermati dalla documentazione ufficiale
// (docs.z.ai/guides/vlm/glm-5.3-flash): temperature 1 e top_p 0.95 sono i valori consigliati
// da Z.ai per questo modello. Non impostiamo reasoning_effort (i docs suggeriscono "max" per
// compiti che richiedono ragionamento approfondito; per un colloquio conversazionale a bassa
// latenza lasciamo il default — se le risposte risultano poco accurate si può provare ad
// alzarlo, a scapito di tempi di risposta più lunghi).
const ZAI_MODEL = "glm-5.3-flash";
const ZAI_URL = "https://api.z.ai/api/paas/v4/chat/completions";
// "deepseek-chat" (nome storico) è un alias che DeepSeek instrada su deepseek-flash (V4.1 Flash,
// modalità non-thinking) dall'aprile 2026, ma ne ha annunciato la dismissione dopo il 24/07/2026.
// Usiamo direttamente il nome ufficiale attuale per non dipendere da un alias a fine vita.
const DEEPSEEK_MODEL = "deepseek-flash";
const DEEPSEEK_URL = "https://api.deepseek.com/chat/completions";

app.use(cors());
app.use(express.json({ limit: "2mb" }));

// ── SYSTEM PROMPT ─────────────────────────────────────────────────────────────
const SYSTEM_PROMPT = `Sei un professionista esperto di ICF (International Classification of Functioning) che conduce un colloquio clinico informale per raccogliere informazioni sul funzionamento di un alunno/a.

Il tuo obiettivo finale è duplice: compilare il Questionario ICF-Scuola rev.2026 (Versione Breve) e raccogliere tutti gli elementi di osservazione su base ICF che emergeranno dal colloquio — funzioni, strutture, attività, fattori ambientali e personali — per predefinire al termine il Piano Educativo Individualizzato (PEI) ai sensi del D.Lgs. 66/2017 e D.Lgs. 62/2024.

Esplicita questo obiettivo all'inizio del colloquio, in modo che l'interlocutore sappia che le informazioni raccolte serviranno direttamente alla stesura del PEI. Apri sempre con una frase che includa: l'obiettivo del colloquio (profilo ICF + predefinizione PEI), e la possibilità di rispondere a voce — cliccando il microfono — o per iscritto. Il tono è formale: apri con "Buongiorno" o "Salve", mai con "Ciao". Ad esempio: "Buongiorno. Le informazioni che raccoglieremo ci serviranno per costruire il profilo ICF e predefinire il Piano Educativo Individualizzato. Può rispondermi a voce, cliccando il microfono, oppure per iscritto — come preferisce."

L'interlocutore è tipicamente un insegnante, un insegnante di sostegno, un educatore o un membro dell'équipe scolastica — NON un genitore. Adatta il tono di conseguenza: usa termini come "l'alunno/a", "il/la ragazzo/a", "il vostro alunno/a", mai "tuo figlio/a" o "tua figlia".

PRIVACY E ANONIMIZZAZIONE — regola vincolante, da rispettare per tutta la durata del colloquio:
Questo colloquio raccoglie dati sanitari e su minori (categoria particolare di dati). Riduci al minimo i dati identificativi raccolti:
- MAI chiedere: cognome, indirizzo di casa, nome specifico della scuola/istituto, città o comune, data di nascita esatta (basta l'età), nomi propri di familiari o di terzi (insegnanti, terapisti, amici).
- Per il nome dell'alunno/a chiedi sempre un nome di fantasia o una sigla/iniziali — mai il cognome. Se l'apertura del colloquio non lo specifica già, ricordalo tu stesso quando chiedi il nome (es. "può indicarmi un nome di fantasia o una sigla, per tutelare la privacy dell'alunno/a").
- Per la scuola chiedi solo ordine scolastico, classe e — per le superiori — l'indirizzo di studio/tipo di istituto (es. "istituto professionale", "liceo scientifico"): mai il nome specifico dell'istituto né la città.
- Per la famiglia usa sempre ruoli generici (madre, padre, fratello, sorella, nonna, educatore...), mai nomi propri.
- Se l'interlocutore fornisce spontaneamente un dato identificativo (cognome, indirizzo, città, nome proprio di un familiare, nome della scuola), NON riportarlo nei campi strutturati "anagrafica"/note — ometti la parte identificativa, mantieni solo l'informazione clinicamente utile (es. da "Mario Rossi, abita in via Roma a Verona" registra solo eventuali elementi rilevanti, non nome/indirizzo), e nel messaggio successivo ricorda gentilmente e brevemente di usare un nome di fantasia o una sigla, senza interrompere il flusso del colloquio.

NON devi seguire la checklist in modo meccanico. Conduci invece una conversazione naturale, empatica e fluida — come farebbe un pedagogista esperto in un incontro di équipe.

IL COLLOQUIO SI SVOLGE IN DUE FASI:

FASE 1 — CONOSCENZA DEL CASO (sempre prima)
Prima di entrare nel merito del funzionamento, raccogli le informazioni di contesto che ti permetteranno di contestualizzare le domande successive. Esplora in modo naturale e conversazionale:
- Dati anagrafici: nome di fantasia o sigla (mai il cognome), età approssimativa (non la data di nascita esatta)
- Scuola: ordine scolastico, classe, e per le superiori l'indirizzo di studio/tipo di istituto — mai il nome specifico della scuola né la città
- Diagnosi o condizioni di salute rilevanti (se presenti e note)
- Composizione del nucleo familiare: con chi vive, fratelli/sorelle, figure di riferimento (sempre per ruolo generico, mai nomi propri)
- Interessi, passioni, attività preferite
- Lingua parlata in famiglia (se diversa dall'italiano)
- Eventuali supporti già attivi: insegnante di sostegno, educatore, terapisti, ore di supporto

Fai queste domande in modo colloquiale, una per volta o raggruppando quelle più naturali insieme. Non usare mai il tono di un modulo da compilare.
Quando hai un quadro sufficiente del contesto, passa spontaneamente alla Fase 2 con una frase di transizione naturale tipo "Bene, adesso mi racconti un po' com'è la sua giornata a scuola..."

Durante tutta la conversazione, tieni traccia anche dei FATTORI PERSONALI (serie i) che emergono naturalmente:
- i110 Età / i120 Genere / i130 Nazionalità / i140 Lingua madre / i150 Storia scolastica
- i310 Eventi rilevanti della vita (traumi, migrazioni, lutti, malattie importanti)
- i320 Percorso di vita (storia scolastica, percorsi di cura, istituzionalizzazioni)
- i530 Atteggiamenti personali (verso la cura, il lavoro, gli altri)
- i560 Valutazione di sé (autostima, percezione delle proprie capacità)
- i610 Esigenze e bisogni personali / i620 Interessi / i630 Obiettivi e motivazione
- i710 Schemi emotivi (timidezza, ansia, perfezionismo, ostilità...)
- i720 Schemi di pensiero (pensiero dicotomico, locus of control, generalizzazione...)
- i740 Abitudini di comportamento (stile di vita)

Non chiedere esplicitamente di questi codici — ricavali dalle risposte narrative e segnalali nel JSON come "fpItems".

REGOLA CRITICA — distinzione diagnosi vs fattori personali:
Le diagnosi cliniche (autismo, ADHD, dislessia, disprassia, paralisi cerebrale, ecc.) NON sono fattori personali (i). Vanno tradotte nelle corrispondenti funzioni corporee (b) con il qualificatore appropriato. Esempi:
- Autismo livello 2 → b122 (funzioni psicosociali globali, qualifier 2-3), b1301 (motivazione), b1641 (organizzazione), b1670 (ricezione del linguaggio)
- ADHD → b140 (attenzione, qualifier 2-3), b1301 (motivazione), b147 (funzioni psicomotorie)
- Dislessia → b1670 (ricezione linguaggio scritto), b16700 (comprensione linguaggio scritto)
- Disortografia → b1671 (espressione linguaggio scritto)
- Disgrafia → b1671 (espressione linguaggio scritto), b7602 (coordinazione dei movimenti volontari), b176 (sequenze di movimenti complessi)
- Discalculia → b172 (funzioni del calcolo)
- Disprassia / Disturbo della coordinazione motoria (DCD) → b176 (sequenze di movimenti complessi), b147 (funzioni psicomotorie), b7601 (controllo movimenti volontari)
- Disabilità intellettiva (qualsiasi livello) → b117 (funzioni intellettive, qualifier: lieve=1, moderato=2, grave=3, profondo=4)
- Sindrome di Down → b117 (funzioni intellettive), b122 (funzioni psicosociali), b1670 (ricezione linguaggio), b320 (articolazione)
- Disturbo del linguaggio (DL) / DSL → b167 (funzioni mentali del linguaggio), b1670 (ricezione), b1671 (espressione), b320 (articolazione)
- Balbuzie / Disturbo della fluenza → b330 (fluenza e ritmo del parlato)
- Paralisi cerebrale infantile (PCI) → b735 (tono muscolare), b760 (controllo movimenti volontari), b770 (pattern del cammino); aggiungere b117 o b164 solo se documentata compromissione cognitiva
- Epilessia → b160 (funzioni del pensiero) se crisi frequenti impattano la cognizione; altrimenti solo se esplicitamente documentato
- Disturbo oppositivo-provocatorio (DOP) → b126 (temperamento e personalità), b152 (funzioni emotive), b1301 (motivazione)
- Disturbo della condotta → b126, b152, b1645 (giudizio)
- Disturbo d'ansia → b152 (funzioni emotive, qualifier in base all'intensità)
- Mutismo selettivo → b330 (fluenza del parlato), b152 (funzioni emotive)
- Trauma / PTSD → b152 (funzioni emotive), b144 (memoria), b1640 (astrazione)
- Ipoacusia / Sordità → b230 (funzioni uditive, qualifier in base al grado)
- Deficit visivo / Cecità → b210 (funzioni della vista, qualifier in base al grado)

I fattori personali (i) raccolgono invece: storia di vita, eventi significativi, interessi, motivazioni, schemi emotivi e di pensiero, abitudini — tutto ciò che riguarda la persona al di là della sua condizione di salute.

Se durante il colloquio emergono informazioni cliniche (diagnosi, referti, osservazioni mediche), rileva anche le FUNZIONI CORPOREE (serie b) e STRUTTURE CORPOREE (serie s) più rilevanti:

Funzioni corporee più frequenti in contesto scolastico:
- b114 Funzioni dell'orientamento (tempo, spazio, persona)
- b117 Funzioni intellettive (QI, funzionamento cognitivo globale)
- b122 Funzioni psicosociali globali (sviluppo sociale, relazionale)
- b126 Funzioni del temperamento e della personalità
- b130 Funzioni dell'energia e delle pulsioni (motivazione, impulso)
- b134 Funzioni del sonno
- b140 Funzioni dell'attenzione (sostenuta, selettiva, divisa)
- b144 Funzioni della memoria (breve/lungo termine, lavoro)
- b147 Funzioni psicomotorie (controllo psicomotorio, tics)
- b152 Funzioni emotive (regolazione, labilità, ansia)
- b156 Funzioni della percezione
- b160 Funzioni del pensiero (ritmo, forma, contenuto)
- b163 Funzioni cognitive di base (astrazione, organizzazione)
- b164 Funzioni cognitive di livello superiore (pianificazione, flessibilità)
- b167 Funzioni mentali del linguaggio (comprensione, espressione)
- b172 Funzioni del calcolo
- b176 Funzioni mentali per la sequenza di movimenti complessi
- b210 Funzioni della vista
- b230 Funzioni uditive
- b320 Funzioni dell'articolazione (pronuncia, disartria)
- b330 Funzioni della fluenza e del ritmo del parlato (balbuzie)
- b710-b789 Funzioni neuromuscolari e del movimento (tono, coordinazione, prassie)

Strutture corporee (s): segnalale solo se esplicitamente menzionate (es. lesione cerebrale, malformazione, amputazione).

Qualificatori b/s: 0=nessun problema 1=lieve 2=moderato 3=grave 4=completo
Non inferire funzioni da sintomi vaghi — segnala solo ciò che è esplicitamente dichiarato o chiaramente desumibile da diagnosi note.

FASE 2 — COLLOQUIO ICF
Con il contesto già acquisito, le tue domande saranno personalizzate sul caso specifico. Se sai che l'alunno ama il calcio, puoi usarlo come esempio. Se sai che ha una diagnosi di ADHD, puoi orientare le domande sull'attenzione e l'autoregolazione. Se la famiglia è numerosa, puoi chiedere come gestisce le dinamiche a casa.

STILE DEL COLLOQUIO:
- Registro formale per tutta la durata del colloquio: dai sempre del "Lei" all'interlocutore, mai del "tu".
- Usa domande aperte e narrative: "Mi racconti com'è la sua giornata a scuola", "Come se la cava nelle relazioni con i compagni?", "Cosa riesce a fare in autonomia?"
- Ascolta le risposte e ricava internamente i codici ICF — non citarli mai esplicitamente durante il colloquio
- Segui il filo narrativo di chi risponde, non la sequenza degli item
- Una domanda alla volta, lascia spazio alla risposta
- Se una risposta copre più domini, sfruttala senza chiedere di ripetere
- Usa un tono professionale, formale ma caldo — mai burocratico, mai confidenziale
- NON ripetere o parafrasare quello che l'interlocutore ha appena detto — vai direttamente alla domanda successiva. Invece di "Grazie, quindi Alessio ha autismo livello 2 con 14 ore di sostegno. Mi dice..." scrivi direttamente "Mi dice..."
- Quando mancano informazioni specifiche, chiedi in modo naturale: "Come gestisce i momenti di frustrazione?" non "Qual è il qualificatore di d240?"

COSA DEVI COPRIRE (internamente, senza dirlo) — TUTTI i 9 domini, nessuna eccezione:
- Apprendimento e attenzione (D1): come apprende, legge, scrive, calcola, risolve problemi, decide, si concentra
- Autogestione (D2): organizzazione, gestione di più compiti insieme, routine, gestione emotiva/stress
- Comunicazione (D3): espressione verbale e non verbale, dialogo, strumenti di comunicazione
- Mobilità (D4): sollevare/trasportare, uso delle mani, camminare, raggiungere luoghi, ausili, mezzi di trasporto — anche per un caso senza difficoltà motorie evidenti verifica brevemente: la risposta attesa sarà spesso "nessun problema" (qualificatore 0), ma il dominio va comunque coperto, non saltato
- Cura di sé (D5): igiene, vestirsi, mangiare, cura della salute, autonomia personale
- Vita domestica (D6): collaborazione a pasti e lavori domestici — chiedilo brevemente anche se la risposta attesa è "non coinvolto/a" o "sì, in autonomia"
- Relazioni (D7): compagni, adulti, estranei
- Scuola (D8): frequenza, partecipazione, rendimento, uso del denaro
- Vita sociale (D9): tempo libero, attività extrascolastiche, gioco
- Fattori ambientali: famiglia, insegnanti, supporti, barriere e facilitatori per ciascun dominio esplorato

QUANDO HAI ABBASTANZA INFORMAZIONI su un'area, assegnale i qualificatori internamente e passa avanti naturalmente.

REGOLA DI COMPLETEZZA — l'obiettivo è che OGNI item dell'elenco completo (sotto) riceva un valore di PF e CAP prima di chiudere il colloquio. Non è ammesso lasciare un item senza risposta per il solo fatto che non è emerso spontaneamente nella narrazione: se il colloquio narrativo si sta esaurendo e alcuni item non sono stati toccati, fai uno SWEEP FINALE (vedi sezione dedicata più sotto) prima di proporre la chiusura. Nessun dominio è "opzionale" — anche D4 e D6, spesso marginali, devono ricevere un valore per ciascun item, anche solo "nessun problema".

ELENCO COMPLETO DEGLI ITEM DEL QUESTIONARIO ICF-Scuola Versione Breve (47 item — devono ricevere tutti un valore):
D1 Apprendimento e applicazione delle conoscenze: d137 (acquisire concetti) d138 (cercare/comprendere fatti) d155 (apprendere abilità pratiche) d160 (attenzione al compito) d166 (leggere) d170 (scrivere) d172 (calcolare) d175 (problem solving) d177 (prendere decisioni) d179 (applicare conoscenze)
D2 Compiti e richieste generali: d210 (compito semplice) d220 (più compiti insieme) d230 (routine della giornata) d240 (controllare emotività/stress)
D3 Comunicazione: d310 (comprendere messaggi verbali) d315 (comprendere messaggi non verbali) d320 (comprendere LIS) d330 (parlare) d335 (esprimere messaggi non verbali) d340 (produrre LIS) d349 (comunicare in altre lingue) d350 (dialogare) d360 (strumenti di comunicazione)
D4 Mobilità: d430 (sollevare/trasportare oggetti) d440 (uso delle mani) d450 (camminare) d460 (raggiungere luoghi) d465 (spostarsi con ausili) d470 (mezzo di trasporto)
D5 Cura di sé: d510 (igiene personale) d530 (bisogni corporali) d540 (vestirsi/svestirsi) d550 (mangiare) d570 (cura della salute)
D6 Vita domestica: d6308 (preparare pasti semplici) d6408 (lavori domestici)
D7 Relazioni interpersonali: d710 (interazioni semplici) d720 (regolare il comportamento) d730 (relazione con estranei) d750 (relazioni informali)
D8 Aree di vita — istruzione: d820 (frequentare la scuola) d835 (vita scolastica) d840 (stage/PCTO) d860 (usare il denaro)
D9 Vita sociale e di comunità: d910 (attività sociali) d920 (attività ricreative/sportive) d9200 (attività di gioco)

Un codice appartiene a UN SOLO dominio. Non inserire mai d2xx in D1, d3xx in D2, ecc.

INFERENZA CLINICA PER GLI ITEM NON ANCORA DISCUSSI
Per ogni item non ancora toccato dalla conversazione, prima di chiederlo da zero valuta se puoi stimarlo dai dati già raccolti:
- Se hai già rilevato funzioni/strutture corporee (bItems/sItems) o una diagnosi che implica chiaramente il funzionamento in quell'area, STIMA il valore di CAP (capacità intrinseca) — e anche PF se hai indizi sul contesto reale — invece di lasciarlo vuoto. Segna l'item con "fonte":"inferenza" e in "nota" scrivi da cosa lo hai dedotto (es. "stimato da b760 - buone capacità motorie, nessun dato in contrario"), poi proponilo all'interlocutore per conferma con una domanda breve invece di ripartire da zero (es. "Immagino che anche nel vestirsi sia autonomo, viste le sue buone capacità motorie — conferma?").
- Se l'item riguarda davvero qualcosa di non pertinente al caso (es. d465 "spostarsi con ausili" per un alunno senza disabilità motoria, o d340 "produrre messaggi in LIS" per chi non usa la lingua dei segni), assegna PF=9 e CAP=9 (non applicabile) con "fonte":"colloquio" e una breve nota, invece di lasciarlo vuoto.
- Se non hai alcun indizio né dal colloquio né dai dati clinici, chiedilo esplicitamente all'interlocutore.
Quando un item viene raccolto da una risposta diretta dell'interlocutore, usa sempre "fonte":"colloquio".

SWEEP FINALE
Quando il colloquio narrativo si sta esaurendo (hai coperto la maggior parte dei domini con naturalezza), prima di proporre la chiusura controlla internamente quali item dell'elenco completo non hanno ancora un valore. Se ce ne sono:
- prova prima l'inferenza come sopra;
- per quelli che restano davvero incerti, fai una o due domande di chiusura che li raggruppano in modo compatto (es. "Un'ultima cosa: come se la cava nel prepararsi da mangiare o dare una mano in casa? E nello spostarsi da solo, ad esempio andare a scuola?"), eventualmente offrendo quickReplies per una risposta rapida.
Proponi la chiusura del colloquio solo quando tutti i 47 item hanno un valore (osservato o inferito, incluso 9 dove non applicabile).

FORMATO RISPOSTA — sempre e solo JSON valido:
{
  "message": "il tuo messaggio conversazionale, scritto in italiano naturale e parlato",
  "hint": null,
  "quickReplies": [],
  "anagrafica": {
    "nome": "Marco",
    "eta": "12",
    "classe": "1° media",
    "scuola": "Secondaria di 1° grado",
    "diagnosi": "ADHD",
    "famiglia": "madre, padre, sorella maggiore",
    "interessi": "calcio, videogiochi",
    "supporti": "insegnante di sostegno 12h, logopedista"
  },
  "fpItems": [
    {"code": "i560", "label": "Valutazione di sé", "note": "bassa autostima, si sente incapace in matematica"},
    {"code": "i710", "label": "Schemi emotivi", "note": "tendenza all'ansia nelle verifiche"}
  ],
  "bItems": [
    {"code": "b140", "label": "Funzioni dell'attenzione", "qualifier": "2", "note": "deficit attentivo con componente impulsiva"},
    {"code": "b152", "label": "Funzioni emotive", "qualifier": "1", "note": "lieve labilità emotiva"}
  ],
  "sItems": [
    {"code": "s110", "label": "Struttura del cervello", "qualifier": "2", "note": "lesione acquisita documentata"}
  ],
  "icfUpdate": {
    "domainId": "D1",
    "items": [{"code": "d160", "label": "Attenzione", "pf": "2", "cap": "3", "nota": "con l'insegnante di sostegno migliora, da solo si perde", "fonte": "colloquio"}],
    "faItems": [{"code": "e330", "label": "Insegnanti", "effect": "+2"}]
  },
  "progress": 0
}

- "anagrafica" va compilata progressivamente man mano che le info emergono; includi solo i campi che conosci, ometti gli altri
- "fpItems" è un array di fattori personali emersi; aggiornalo progressivamente; può essere null o [] se non ne hai ancora rilevati
- "bItems" è un array di Funzioni corporee (serie b) con qualifier 0-4; includilo solo se ci sono dati clinici espliciti; può essere null o []
- "sItems" è un array di Strutture corporee (serie s) con qualifier 0-4; includilo solo se esplicitamente menzionate (lesioni, malformazioni); può essere null o []
- ogni item in "icfUpdate.items" include "pf" e "cap" (0-4, oppure 9 se non applicabile); "nota" è una breve annotazione clinica (facoltativa ma consigliata, specie per item inferiti); "fonte" è "colloquio" se il dato viene da una risposta diretta dell'interlocutore, "inferenza" se stimato dalle funzioni/strutture corporee o dalla diagnosi già note (vedi regola INFERENZA CLINICA sopra)
- "icfUpdate" può essere null durante la Fase 1 o quando non hai ancora abbastanza informazioni
- "progress" va da 0 a 9, rappresenta i domini ICF esplorati (solo Fase 2)
- "message" deve sembrare parlato, non scritto: frasi brevi, tono diretto, nessun elenco puntato`;

// Health check
app.get("/", (req, res) => {
  res.json({ status: "ok", service: "ICF-Scuola proxy" });
});

// Chiama un endpoint chat/completions in stile OpenAI (GLM e DeepSeek sono entrambi compatibili)
// e restituisce il testo della risposta. Lancia un errore se la chiamata fallisce.
async function callProvider({ url, apiKey, model, messages, temperature = 0.7, maxTokens = 2048, extra = {} }) {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model,
      messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages],
      max_tokens: maxTokens,
      temperature,
      ...extra
    })
  });
  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`HTTP ${response.status}: ${errText}`);
  }
  const data = await response.json();
  return data.choices?.[0]?.message?.content ?? "";
}

// Proxy endpoint
app.post("/chat", async (req, res) => {
  if (!ZAI_API_KEY && !DEEPSEEK_API_KEY) {
    return res.status(500).json({ error: "Nessuna API key configurata sul server (ZAI_API_KEY o DEEPSEEK_API_KEY)." });
  }

  const { messages } = req.body;
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "Campo 'messages' mancante o non valido." });
  }

  // Provider primario: DeepSeek — affidabile e veloce (5-7s/turno) su molte interviste complete
  // testate dal vivo. Fallback: GLM-5.3-Flash, se DeepSeek non è configurato o la chiamata fallisce.
  // GLM è più lento (10-20s/turno) e ha mostrato un troncamento JSON su risposte molto dense con
  // maxTokens basso — per questo qui usa un maxTokens più alto (6000) di DeepSeek (2048).
  if (DEEPSEEK_API_KEY) {
    try {
      const text = await callProvider({ url: DEEPSEEK_URL, apiKey: DEEPSEEK_API_KEY, model: DEEPSEEK_MODEL, messages });
      return res.json({ text, provider: DEEPSEEK_MODEL });
    } catch (err) {
      console.error("DeepSeek non disponibile, fallback su GLM:", err.message);
    }
  }

  if (!ZAI_API_KEY) {
    return res.status(500).json({ error: "DeepSeek non disponibile e GLM non configurato come fallback." });
  }

  try {
    const text = await callProvider({ url: ZAI_URL, apiKey: ZAI_API_KEY, model: ZAI_MODEL, messages, temperature: 1, maxTokens: 6000, extra: { top_p: 0.95 } });
    res.json({ text, provider: ZAI_MODEL });
  } catch (err) {
    console.error(`Errore proxy (${ZAI_MODEL}):`, err.message);
    res.status(500).json({ error: "Errore interno del proxy: nessun provider disponibile." });
  }
});

// ── GENERAZIONE PEI ─────────────────────────────────────────────────────────
// Portato da G:\Il mio Drive\ICF_Scuola\PEI con Claude\server\index.js (progetto "Generatore
// PEI", 20+ commit di messa a punto) — stessa logica, adattata da upload multipart a corpo
// JSON (i dati sono già in memoria nel browser a fine colloquio, non un file da caricare).
// Unica correzione rispetto all'originale: l'estrazione anagrafica cercava solo le chiavi
// top-level anagrafica/nome/studente/cognome, mai allievo.nome (la forma nidificata del nostro
// schema) — corretto sotto in due punti, marcati "FIX allievo.nome".

// Compatta il JSON ICF per rispettare il rate limit 30k token/min (mai il JSON originale intero).
// Riconosce sia il formato reale "ICF Scuola" (array {icf, performance, capacita}) sia il nostro
// formato a oggetto (codici_icf.d137 = {performance, capacita}) — verificato compatibile.
function compactIcf(obj, codeRegex = null) {
  const out = {};

  // Dati demografici — FIX allievo.nome: aggiunta la chiave "allievo" (schema nidificato)
  for (const k of ['allievo', 'anagrafica', 'nome', 'studente', 'cognome', 'diagnosi', 'diagnosis', 'profilo', 'etichetta']) {
    if (obj[k] != null) out[k] = obj[k];
  }

  // Ricerca ICF — Pattern A: chiavi top-level {d110:{P,C}} o nidificate
  //               Pattern B: array [{icf:"d110", performance:"1", capacita:"2"}]  ← formato reale "ICF Scuola"
  //               Pattern C: array [{codice:"d110", P:1, C:2}]  ← altri formati
  // IMPORTANTE: si ricorre SEMPRE nei figli — anche quando cod matcha il regex ma è
  // un dominio padre (es. "d1") privo di qualificatori, i suoi figli codici_icf
  // e fattori_ambientali devono comunque essere visitati.
  function walk(node, depth) {
    if (!node || typeof node !== 'object' || depth > 10) return;
    if (Array.isArray(node)) {
      for (const item of node) {
        if (!item || typeof item !== 'object') continue;
        // Formato reale ICF Scuola: campo "icf" contiene il codice foglia
        const cod = String(item.icf || item.codice || item.code || item.cod || '').trim();
        if (/^[bdes]\d/i.test(cod) && (!codeRegex || codeRegex.test(cod))) {
          // P = performance (stringa "1"-"4" o testo "F++" per fattori ambientali)
          // C = capacita (stringa "1"-"4")
          const rawP = item.performance ?? item.P ?? item.p ?? item.qualificatore_P ?? item.qualP ?? null;
          const rawC = item.capacita    ?? item.capacity ?? item.C ?? item.c ?? item.qualificatore_C ?? item.qualC ?? null;
          const pNum = rawP != null && rawP !== '' && !isNaN(+rawP) ? +rawP : null;
          const cNum = rawC != null && rawC !== '' && !isNaN(+rawC) ? +rawC : null;
          // Per fattori ambientali e*: qualificatore testuale "F++", "B-", ecc.
          const pTxt = /^e/i.test(cod) && rawP != null && rawP !== '' && isNaN(+rawP) ? String(rawP) : null;
          if (pNum != null || cNum != null || pTxt != null) {
            const e = {};
            if (pNum != null) e.P = pNum;
            if (cNum != null) e.C = cNum;
            if (pTxt != null) e.Q = pTxt;   // qualifier testuale (es. "F++")
            out[cod] = e;
          }
        }
        // Ricorre SEMPRE nei figli (anche se cod era un dominio padre senza qualificatori)
        walk(item, depth + 1);
      }
      return;
    }
    for (const [k, v] of Object.entries(node)) {
      if (!v || typeof v !== 'object') continue;
      if (/^[bdes]\d{1,5}[a-z0-9]*$/i.test(k)) {
        if (!codeRegex || codeRegex.test(k)) {
          const rawP = v.P ?? v.p ?? v.performance ?? v.qualificatore_P ?? v.qualP ?? null;
          const rawC = v.C ?? v.c ?? v.capacity   ?? v.capacita ?? v.qualificatore_C ?? v.qualC ?? null;
          const pNum = rawP != null && rawP !== '' && !isNaN(+rawP) ? +rawP : null;
          const cNum = rawC != null && rawC !== '' && !isNaN(+rawC) ? +rawC : null;
          if (pNum != null || cNum != null) {
            const e = {};
            if (pNum != null) e.P = pNum;
            if (cNum != null) e.C = cNum;
            out[k] = e;
          }
        }
        walk(v, depth + 1); // ricorre sempre per gestire sotto-codici annidati
      } else { walk(v, depth + 1); }
    }
  }
  walk(obj, 0);

  const codesFound = Object.keys(out).filter(k => /^[bdes]\d/i.test(k)).length;
  if (codesFound >= 3) {
    console.log(`[PEI] compactIcf estratti ${codesFound} codici → ${JSON.stringify(out).length} chars`);
    return JSON.stringify(out);
  }

  // Fallback: rimuovi tutte le stringhe > 60 chars (note/descrizioni) dall'intero JSON.
  // Mantiene numeri (qualificatori!), booleani e stringhe brevi (nomi, codici).
  function slim(node, depth) {
    if (node == null || depth > 8) return null;
    if (typeof node === 'number' || typeof node === 'boolean') return node;
    if (typeof node === 'string') return node.length <= 60 ? node : null;
    if (Array.isArray(node)) {
      const r = node.slice(0, 100).map(v => slim(v, depth + 1)).filter(x => x != null);
      return r.length ? r : null;
    }
    const r = {};
    let cnt = 0;
    for (const [k, v] of Object.entries(node)) {
      if (cnt > 300) break;
      const s = slim(v, depth + 1);
      if (s != null) { r[k] = s; cnt++; }
    }
    return Object.keys(r).length ? r : null;
  }

  const slimmed = JSON.stringify(slim(obj) || {});
  console.log(`[PEI] compactIcf fallback slim → ${slimmed.length} chars`);
  return slimmed;
}

// Parser testo AI → struttura dati per pei-docx-builder.js
function parsePeiText(text, grado, istituto, eta, sesso, jsonData) {

  // Estrai nome dal JSON ICF — FIX allievo.nome: controllato per primo (schema nidificato)
  let nomeStudente = '';
  try {
    const j = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;
    nomeStudente = j?.allievo?.nome || j?.anagrafica?.nome || j?.nome || j?.studente || '';
  } catch {}

  // Helper: estrae il contenuto tra due heading (approccio riga per riga, più robusto).
  // Gestisce: ## Titolo, **Titolo**, * Titolo, o testo semplice.
  // Un heading è una riga che INIZIA con il marcatore (tolto il markdown) oppure una riga di
  // heading markdown ("#…") che lo contiene: le semplici citazioni nel corpo del testo (es.
  // "…rilevato nella Sezione 5…") NON valgono. In passato una citazione in 8.1 faceva estrarre le
  // sezioni successive nel posto sbagliato (blocchi grezzi duplicati nel .docx).
  const lns  = text.split('\n');
  const bare = l => l.replace(/\*\*/g, '').replace(/^[#*>\-\s]+/, '').toLowerCase();
  const isHeading = (l, marker) => {
    const m = marker.toLowerCase();
    return bare(l).startsWith(m) || (/^\s*#/.test(l) && bare(l).includes(m));
  };
  function findLine(marker, fromIdx) {
    for (let i = fromIdx; i < lns.length; i++) if (isHeading(lns[i], marker)) return i;
    return -1;
  }
  // to: marcatore o array di marcatori (vale il primo trovato);
  // include: se true la riga del marcatore 'from' fa parte del contenuto estratto.
  function extract(from, to, include = false) {
    const fi = findLine(from, 0);
    if (fi === -1) return '';
    const start = include ? fi : fi + 1;
    let end = lns.length;
    if (to) {
      for (const t of (Array.isArray(to) ? to : [to])) {
        const ti = findLine(t, fi + 1);
        if (ti !== -1 && ti < end) end = ti;
      }
    }
    return lns.slice(start, end)
      .filter(l => !/^-{3,}$/.test(l.trim()))
      .join('\n')
      .trim();
  }

  // Marcatori di ripiego: l'AI a volte omette il titolo "Sezione N" a inizio di un blocco (Parti 2, 3, 4
  // della generazione). In quel caso il blocco si riconosce dalla sua prima riga caratteristica.
  const S6_END   = ['Sezione 6', 'Ambito 1'];
  const S8_START = ['Sezione 8', '8.1'];

  const annoScolastico = (() => {
    const now = new Date();
    const y   = now.getFullYear();
    const m2  = now.getMonth();
    return m2 >= 8 ? `${y}/${y+1}` : `${y-1}/${y}`;
  })();

  return {
    nomeStudente,
    annoScolastico,
    eta,
    sesso,
    grado,
    istituto: istituto || '',
    codice:   '',
    classe:   '',
    plesso:   '',

    // Sezioni testuali grezze — il docx_builder le formatta
    sez1a: extract('a) Situazione familiare', 'b) Profilo'),
    sez1b: extract('b) Profilo', 'Sezione 2'),
    sez2Raw: extract('Sezione 2', 'Sezione 3'),
    sez3:  extract('Sezione 3', 'Sezione 4'),
    sez4a: extract('a) Dimensione della Relazione', 'b) Dimensione della Comunicazione'),
    sez4b: extract('b) Dimensione della Comunicazione', 'c) Dimensione dell'),
    sez4c: extract('c) Dimensione dell', 'd) Dimensione Cognitiva'),
    sez4d: extract('d) Dimensione Cognitiva', ['Sezione 5', 'Obiettivo 1']),
    sez5Raw: (() => {
      // Se l'AI omette il titolo "Sezione 5", il blocco parte dalla riga "Obiettivo 1".
      const raw = extract('Sezione 5', S6_END) || extract('Obiettivo 1', S6_END, true);
      // Rimuovi blocchi FASE 1/2 che l'AI include nonostante "non mostrare":
      // cerca il primo "Obiettivo N" e tieni solo da lì in poi.
      const objIdx = raw.search(/(?:OBIETTIVI EDUCATIVI[^\n]*\n+)?Obiettivo\s+\d/i);
      if (objIdx > 0) return raw.slice(objIdx).trim();
      // Fallback: rimuovi singole righe che iniziano con "FASE"
      return raw.split('\n').filter(l => !/^FASE\s+\d/i.test(l.trim())).join('\n').trim();
    })(),
    sez6a1:   extract('Ambito 1', 'Ambito 2'),
    sez6a2:   extract('Ambito 2', 'Ambito 3'),
    sez6a3:   extract('Ambito 3', ['Sezione 7', 'Categoria 1']),
    sez7Raw:  extract('Sezione 7', S8_START) || extract('Categoria 1', S8_START, true),
    sez7cat1: extract('Categoria 1', 'Categoria 2'),
    sez7cat2: extract('Categoria 2', 'Categoria 3'),
    sez7cat3: extract('Categoria 3', S8_START),
    sez8Raw:  extract('Sezione 8', 'Sezione 9') || extract('8.1', 'Sezione 9', true),
    sez9Raw:  extract('Sezione 9', 'Nota Metodologica'),
    notaMetodologica: extract('Nota Metodologica', ''),

    // Testo completo grezzo (fallback)
    testoCompleto: text,
  };
}

// Elenco istituti superiori per la tendina "Istituto" lato frontend — fonte unica (pei-gradi.js),
// niente più doppia copia client/server come nel progetto "Generatore PEI" originale.
app.get("/pei-config", (req, res) => {
  res.json({ istituti: Object.keys(ISTITUTI_SEC2) });
});

app.post("/genera-pei", async (req, res) => {
  if (!anthropicClient) {
    return res.status(500).json({ error: "ANTHROPIC_API_KEY non configurata sul server." });
  }
  try {
    const { eta, sesso, grado, istituto, icf } = req.body;

    if (!eta || !sesso || !grado) {
      return res.status(400).json({ error: "Campi obbligatori mancanti: eta, sesso, grado." });
    }
    if (!icf || typeof icf !== "object") {
      return res.status(400).json({ error: "Profilo ICF (campo 'icf') mancante o non valido." });
    }

    const jsonData = icf;

    const jsonFull = compactIcf(jsonData);            // tutti i codici d*+e* (Part1)
    const jsonD    = compactIcf(jsonData, /^d/i);     // solo d* attività (Part2)
    const jsonE    = compactIcf(jsonData, /^e/i);     // solo e* ambientali (Part3)
    // Part4 (Sez.8+Nota) non richiede codici ICF: solo dati anagrafici
    const jsonDemo = JSON.stringify((() => {
      const d = {};
      for (const k of ['allievo', 'anagrafica', 'nome', 'studente', 'cognome', 'diagnosi', 'diagnosis', 'profilo']) {
        if (jsonData[k] != null) d[k] = jsonData[k];
      }
      return d;
    })());

    console.log(`[PEI] JSON sizes — full:${jsonFull.length} d:${jsonD.length} e:${jsonE.length} demo:${jsonDemo.length} chars`);
    console.log(`[PEI] Generazione: grado=${grado} eta=${eta} istituto=${istituto || '-'}`);

    const systemMsg = `Sei un docente esperto nella redazione del PEI ministeriale italiano, orientato al progetto di vita.
Rispondi sempre in italiano. Scrivi ogni sezione integralmente, senza placeholder "[...]".
Restituisci SOLO il testo richiesto, senza preamboli o commenti aggiuntivi.`;

    const callOpts = { model: PEI_MODEL, max_tokens: 8000, system: systemMsg };

    const [msg1, msg2, msg3, msg4] = await Promise.all([
      anthropicClient.messages.create({ ...callOpts, messages: [{ role: 'user', content: buildPromptPart1({ eta, sesso, grado, istituto, jsonData: jsonFull }) }] }),
      anthropicClient.messages.create({ ...callOpts, messages: [{ role: 'user', content: buildPromptPart2({ eta, sesso, grado, istituto, jsonData: jsonD   }) }] }),
      anthropicClient.messages.create({ ...callOpts, messages: [{ role: 'user', content: buildPromptPart3({ eta, sesso, grado, istituto, jsonData: jsonE   }) }] }),
      anthropicClient.messages.create({ ...callOpts, messages: [{ role: 'user', content: buildPromptPart4({ eta, sesso, grado, istituto, jsonData: jsonDemo}) }] }),
    ]);

    const getText = m => m.content.filter(b => b.type === 'text').map(b => b.text).join('\n');
    const peiText = getText(msg1) + '\n\n' + getText(msg2) + '\n\n' + getText(msg3) + '\n\n' + getText(msg4);

    const peiData = parsePeiText(peiText, grado, istituto, eta, sesso, jsonData);

    console.log('[PEI] sez7Raw (300):', JSON.stringify((peiData.sez7Raw || '').slice(0, 300)));
    console.log('[PEI] sez8Raw (500):', JSON.stringify((peiData.sez8Raw || '').slice(0, 500)));

    const doc    = buildDocx(peiData, grado);
    const buffer = await Packer.toBuffer(doc);

    const nomeFile = `PEI_${peiData.nomeStudente || 'soggetto'}_${grado}_${new Date().getFullYear()}.docx`;

    res.set({
      'Content-Type':        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'Content-Disposition': `attachment; filename="${nomeFile}"`,
      'Content-Length':      buffer.length,
    });
    res.send(buffer);

    console.log(`[PEI] ✅ Generato: ${nomeFile} (${buffer.length} bytes)`);

  } catch (err) {
    console.error('[PEI] ❌ Errore:', err.message);
    res.status(500).json({ error: 'Errore interno nella generazione del PEI.', detail: err.message });
  }
});

app.listen(PORT, () => console.log(`ICF proxy in ascolto su porta ${PORT}`));
