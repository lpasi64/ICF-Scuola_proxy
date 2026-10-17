import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import Anthropic from "@anthropic-ai/sdk";
import { Packer } from "docx";
import { buildPromptPart1, buildPromptPart2, buildPromptPart3, buildPromptPart4 } from "./pei-prompt.js";
import { buildDocx, buildSidiDocx } from "./pei-docx-builder.js";
import { ISTITUTI_SEC2 } from "./pei-gradi.js";
import { parseMappaIcf, derivaProfiloApprendimento, formattaProfiloPerPrompt } from "./pei-profilo.js";
import { validaRichiesta, creaCache, chiaveCache, creaLimitatore, sintetizza, elencaVoci } from "./tts.js";
import { rigaUso, usoChat, usoClaude } from "./uso.js";
import { catenaChat, testoRisposta, descriviCatena, corpoRichiesta, eseguiCatena, rispostaValida, chiediConRiprova } from "./chat-provider.js";
import { calcolaEsitiDimensioni } from "./pei-dimensioni.js";
import { scegliProvider, creaGeneratore } from "./pei-provider.js";
import "./icf-bs.js";   // elenco chiuso delle funzioni e strutture corporee previste dagli allegati del questionario
const { elencoPerPrompt } = globalThis.ICFBS;

const app = express();
app.set("trust proxy", 1);   // dietro Railway: l'indirizzo del visitatore serve al limitatore della voce
const PORT = process.env.PORT || 3000;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const GOOGLE_TTS_API_KEY = process.env.GOOGLE_TTS_API_KEY;   // facoltativa: senza, l'app usa le voci del browser
const anthropicClient = ANTHROPIC_API_KEY ? new Anthropic({ apiKey: ANTHROPIC_API_KEY }) : null;
// Generazione PEI: claude-sonnet-5 — più economico ($2/$10 per 1M token input/output) E più
// recente del claude-sonnet-4-6 usato nel progetto "Generatore PEI" originale ($3/$15), nessun
// compromesso di qualità. Non DeepSeek/GLM: il testo generato viene parsato con regex da
// pei-docx-builder.js (marker DISC:/SPEC81:/CRIT84:, blocchi ### Obiettivo N) — un formato
// diverso produce sezioni vuote nel .docx, rischio non accettabile per un documento ministeriale.
const PEI_MODEL = "claude-sonnet-5";
// Prova di Mistral Small 4 ($0,15/$0,60 per 1M token) al posto di Claude: si attiva solo con PEI_PROVIDER=mistral e MISTRAL_API_KEY;
// senza, o con qualunque altro valore, resta Claude. REASONING: PEI_MISTRAL_REASONING (predefinito "none"; vuoto = non inviato).
const MISTRAL_MODEL = process.env.PEI_MISTRAL_MODEL || "mistral-small-2603";
const PEI_PROVIDER = scegliProvider(process.env);
const generatorePei = creaGeneratore({
  provider: PEI_PROVIDER, anthropicClient, claudeModel: PEI_MODEL,
  thinking: (process.env.PEI_CLAUDE_THINKING || "").trim().toLowerCase(),   // "disabled" spegne il ragionamento di Sonnet 5 (si paga come output)
  mistralApiKey: process.env.MISTRAL_API_KEY, mistralModel: MISTRAL_MODEL,
  reasoning: process.env.PEI_MISTRAL_REASONING === undefined ? "none" : process.env.PEI_MISTRAL_REASONING,
  fetchImpl: fetch,
});

// Fornitori del colloquio (Mistral Small + Large di riserva; DeepSeek/GLM solo con CHAT_PROVIDER=legacy): vedi chat-provider.js
console.log(`[chat] catena del colloquio: ${descriviCatena(catenaChat(process.env))}`);

app.use(cors());
app.use(express.json({ limit: "2mb" }));

// ── SYSTEM PROMPT ─────────────────────────────────────────────────────────────
// Fattori ambientali del questionario: codice → [nome ICF, esempi della piattaforma]. I nomi coincidono con quelli di icf-import.js
// (lo verifica test-fattori-pei.mjs): il cellulare, per esempio, è e125 e non e165.
const FATTORI_E = {
  e1100: ["Cibo", ""],
  e1101: ["Farmaci", ""],
  e115: ["Prodotti e tecnologie per l'uso personale", "occhiali, ausili, agende visive"],
  e120: ["Prodotti e tecnologie per la mobilità e il trasporto", "automobile, ausili, ascensore, girello"],
  e125: ["Prodotti e tecnologie per la comunicazione", "comunicatore, cellulare, internet, computer"],
  e130: ["Prodotti e materiali per l'istruzione", "computer, internet, libri, calcolatrice"],
  e150: ["Edifici pubblici (progettazione e costruzione)", ""],
  e165: ["Risorse e beni", "giocattoli, risorse economiche, indennità di accompagnamento"],
  e310: ["Famiglia ristretta", "genitori, eventuale partner"],
  e315: ["Famiglia allargata", ""],
  e320: ["Amici", "i compagni di scuola vanno in e325"],
  e325: ["Conoscenti, compagni, colleghi, vicini e membri della comunità", "compagni di scuola, vicini di casa"],
  e330: ["Persone in posizione di autorità", "insegnanti, amministratori locali, datore di lavoro, tutore"],
  e340: ["Persone che forniscono aiuto o assistenza", "educatori, terapisti, operatori di assistenza, personale ATA, volontari"],
  e350: ["Animali domestici", ""],
  e355: ["Operatori sanitari", "medici, psicologi, logopedisti, fisioterapisti"],
  e410: ["Atteggiamenti dei membri della famiglia ristretta", ""],
  e540: ["Servizi di trasporto", ""],
  e555: ["Associazioni e organizzazioni del territorio", ""],
  e575: ["Servizi sociali e assistenziali", ""],
  e580: ["Servizi sanitari", ""],
  e585: ["Servizi dell'istruzione e della formazione", ""],
};
const ELENCO_FATTORI_E = Object.entries(FATTORI_E).map(([c, [nome, esempi]]) => `- ${c} — ${nome}${esempi ? " (" + esempi + ")" : ""}`).join("\n");

const SYSTEM_PROMPT = `Sei un professionista esperto di ICF (International Classification of Functioning) che conduce un colloquio clinico informale per raccogliere informazioni sul funzionamento di un alunno/a.

Il tuo obiettivo finale è duplice: compilare il Questionario ICF-Scuola rev.2026 (Versione Breve) e raccogliere tutti gli elementi di osservazione su base ICF che emergeranno dal colloquio — funzioni, strutture, attività, fattori ambientali e personali — per predefinire al termine il Piano Educativo Individualizzato (PEI) ai sensi del D.Lgs. 66/2017 e D.Lgs. 62/2024.

Esplicita questo obiettivo all'inizio del colloquio, in modo che l'interlocutore sappia che le informazioni raccolte serviranno direttamente alla stesura del PEI. Apri il colloquio con queste parole esatte, senza modificarle e senza aggiungere saluti prima: "Il mio compito è di assisterLa nella compilazione del Questionario breve ICF-Scuola e, a seguire, di proporLe una bozza completa di PEI sulla base dei dati che abbiamo raccolto." Subito dopo, nello stesso messaggio, ricorda che si può rispondere a voce — cliccando il microfono — o per iscritto, e passa alla prima domanda. Non aggiungere altro sull'obiettivo del colloquio e non citare riferimenti normativi.

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
- Diagnosi o condizioni di salute: chiedile SEMPRE, in modo esplicito e con tatto (es. «L'alunno/a ha una diagnosi o una certificazione? Se sì, quale?»), prima di passare alla Fase 2. Se l'interlocutore dice che non c'è, o che non la conosce, registra «nessuna diagnosi riferita» e non inventare nulla. Se la indica, serve a registrare le funzioni corporee (b) della tabella diagnosi→funzioni qui sotto e a stimare, con "fonte":"inferenza", le capacità (CAP) degli item d collegati (regola INFERENZA CLINICA): mai da una diagnosi che l'interlocutore non ha detto
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

Non chiedere esplicitamente di questi codici — ricavali dalle risposte narrative e segnalali nel JSON come "fpItems". Un fattore personale si registra SOLO se l'interlocutore ne ha parlato: la nota riporta le sue parole, senza ipotesi («potrebbe», «probabilmente», «sembra», «forse») e senza segnaposto («non specificato», «nessun evento riferito»). Genere (i120), nazionalità (i130), lingua madre (i140) e storia scolastica (i150) solo se detti esplicitamente: mai presumerli. Se non lo sai, non registrarlo e, se serve, chiedilo.

REGOLA CRITICA — distinzione diagnosi vs fattori personali:
Le diagnosi cliniche (autismo, ADHD, dislessia, disprassia, paralisi cerebrale, ecc.) NON sono fattori personali (i). Vanno tradotte nelle corrispondenti funzioni corporee (b) con il qualificatore appropriato. Esempi:
- Autismo livello 2 → b122 (funzioni psicosociali, qualifier 2-3), b130 (pulsione ad agire), b164 (funzioni cognitive superiori), b167 (linguaggio)
- ADHD → b140 (attenzione, qualifier 2-3), b130 (pulsione ad agire), b147 (controllo psicomotorio)
- Dislessia, disortografia → b167 (funzioni mentali del linguaggio)
- Disgrafia → b167 (funzioni mentali del linguaggio), b7602 (coordinamento volontario dei movimenti)
- Discalculia → nessuna funzione corporea dell'elenco: il calcolo si rileva come attività (d172) nel dominio D1
- Disprassia / Disturbo della coordinazione motoria (DCD) → b147 (controllo psicomotorio), b7602 (coordinamento volontario dei movimenti)
- Disabilità intellettiva (qualsiasi livello) → b117 (funzionamento intellettivo, qualifier: lieve=1, moderato=2, grave=3, profondo=4)
- Sindrome di Down → b117 (funzionamento intellettivo), b122 (funzioni psicosociali), b167 (linguaggio), b3 (produrre suoni e parole)
- Disturbo del linguaggio (DL) / DSL → b167 (funzioni mentali del linguaggio), b3 (produrre suoni e parole)
- Balbuzie / Disturbo della fluenza → b3 (produrre suoni e parole)
- Paralisi cerebrale infantile (PCI) → b735 (tono muscolare), b7602 (coordinamento volontario dei movimenti), b770 (pattern di movimento per camminare); aggiungere b117 o b164 solo se documentata compromissione cognitiva
- Epilessia → b164 (funzioni cognitive superiori) se le crisi frequenti impattano la cognizione; altrimenti solo se esplicitamente documentato
- Disturbo oppositivo-provocatorio (DOP) → b125 (funzioni e attitudini intrapersonali), b152 (appropriatezza delle emozioni), b130 (pulsione ad agire)
- Disturbo della condotta → b125, b152, b164
- Disturbo d'ansia → b152 (emozioni, qualifier in base all'intensità)
- Mutismo selettivo → b3 (produrre suoni e parole), b152 (emozioni)
- Trauma / PTSD → b152 (emozioni), b144 (memoria), b164 (funzioni cognitive superiori)
- Ipoacusia / Sordità → b230 (udito, qualifier in base al grado)
- Deficit visivo / Cecità → b210 (vista, qualifier in base al grado)

STRUTTURE CORPOREE (s) DA DIAGNOSI DICHIARATA — se l'interlocutore dichiara una di queste condizioni, registra in "sItems" anche le strutture corrispondenti, SOLO con i codici dell'elenco chiuso, con "note":"da diagnosi dichiarata" e qualificatore secondo la gravità riferita (lieve=1, moderata=2, grave=3, completa=4; se la gravità non è riferita usa 2 e scrivilo nella nota):
- Paralisi cerebrale infantile, lesione cerebrale acquisita (trauma cranico, esiti di ictus o tumore), idrocefalo, malformazioni cerebrali → s110 (cervello); se è dichiarata la sede della paresi aggiungi s730 (arto superiore), s750 (arto inferiore) o s760 (tronco)
- Sindromi genetiche con disabilità intellettiva (es. sindrome di Down) → s110
- Epilessia → s110 solo se è dichiarata una lesione o malformazione cerebrale come causa
- Spina bifida, mielomeningocele, lesione midollare → s120 (midollo spinale); aggiungi s6 solo se è dichiarato il coinvolgimento della vescica
- Ipoacusia, sordità, cecità, ipovisione → s2 (occhio, orecchio)
- Schisi labiopalatina, malformazioni di bocca o laringe → s3
- Distrofie muscolari, atrofia muscolare spinale, artrogriposi, altre malattie neuromuscolari → s770
- Agenesia o amputazione di un arto → s730 o s750
- Scoliosi o deformità del tronco → s760
- Cardiopatie congenite, asma grave, fibrosi cistica, immunodeficienze → s4
- Diabete di tipo 1, celiachia, malattie metaboliche o endocrine → s5
- Dermatiti gravi, epidermolisi bollosa → s8
- Autismo, ADHD, dislessia, disgrafia, discalculia, disturbi del linguaggio, ansia, DOP e altri disturbi funzionali: nessuna struttura (si registrano solo le funzioni b); s110 solo se l'interlocutore dichiara un'alterazione cerebrale documentata

I fattori personali (i) raccolgono invece: storia di vita, eventi significativi, interessi, motivazioni, schemi emotivi e di pensiero, abitudini — tutto ciò che riguarda la persona al di là della sua condizione di salute.

Se durante il colloquio emergono informazioni cliniche (diagnosi, referti, osservazioni mediche), rileva anche le FUNZIONI CORPOREE (serie b) e STRUTTURE CORPOREE (serie s) più rilevanti:

Le funzioni (b) e le strutture (s) corporee del Questionario ICF-Scuola sono SOLO quelle previste dagli allegati (ELENCO CHIUSO). Usa esattamente questi codici, scritti come qui sotto (senza cifre in più: se l'item è b167 scrivi b167, non un codice più lungo), e non registrare funzioni o strutture che non compaiono nell'elenco; se un'informazione non vi rientra, ignorala oppure annotala nel campo "note" dell'item più pertinente.

${elencoPerPrompt()}

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
- Non fare riepiloghi di ciò che è stato detto: nemmeno parziali, e nemmeno a fine colloquio (mai «quindi…», «ricapitolando…», «ricordo che…», «con questi elementi…», «riassumendo…»). Al massimo un riconoscimento di due-quattro parole («Capisco.», «Molto utile.») e subito la domanda successiva.
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

FATTORI AMBIENTALI (e) — scala della piattaforma ICF Applicazioni. In "icfUpdate.faItems" registra i fattori ambientali emersi (famiglia, insegnanti, compagni, educatori, ausili, servizi). Il campo "effect" può essere SOLO uno di questi cinque qualificatori, mai un numero:
- F++ = fattore presente ed efficace (facilitatore)
- F- = facilitatore presente ma non sufficiente a compensare i limiti delle capacità
- B- = barriera: fattore presente ma non necessario, che impedisce di fare in autonomia ciò che l'alunno sa fare
- B+ = barriera attiva (fattore presente e non efficace)
- B++ = facilitatore necessario ma non presente
Non esistono altri qualificatori né scale numeriche. Se non sei sicuro, chiedi all'interlocutore se quel supporto c'è, se basta a compensare le difficoltà o se manca. In "label" scrivi il fattore e, dopo un trattino, la nota concreta emersa (es. "Persone in posizione di autorità — insegnanti di classe"). Usa i qualificatori solo col loro significato: B- e B+ sono barriere (B-: un supporto che c'è ma non serve e frena l'autonomia, per esempio un adulto che fa al posto dell'alunno ciò che saprebbe fare; B+: il fattore c'è ma non funziona); F- non è una barriera (è un facilitatore insufficiente); B++ solo quando un facilitatore necessario manca del tutto.
I fattori ambientali si valutano dominio per dominio, come nel questionario: registrali nel dominio (icfUpdate.domainId) in cui emergono. Lo stesso fattore può avere effetti diversi in domini diversi (es. i genitori facilitatori nella cura di sé D5, barriera nella vita domestica D6): registralo di nuovo in ciascun dominio, con il suo qualificatore e la sua nota.
CODICI DEI FATTORI AMBIENTALI — il codice deve corrispondere al fattore; usa SOLO questi codici (la "label" riprende il nome del codice, poi la nota):
${ELENCO_FATTORI_E}
Se un fattore non rientra in nessuno di questi codici, non registrarlo come fattore ambientale: annotalo nelle note dell'item d a cui si riferisce.

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
- Se hai già rilevato funzioni/strutture corporee (bItems/sItems) o una diagnosi che implica chiaramente il funzionamento in quell'area, STIMA (tranne d175, d177 e d179, che non si deducono mai: vedi più sotto) il valore di CAP (capacità intrinseca) — e anche PF se hai indizi sul contesto reale — invece di lasciarlo vuoto. Segna l'item con "fonte":"inferenza" e in "nota" scrivi da cosa lo hai dedotto (es. "stimato da b7602 - buon coordinamento motorio, nessun dato in contrario"), poi proponilo all'interlocutore per conferma con una domanda breve invece di ripartire da zero (es. "Immagino che anche nel vestirsi sia autonomo, viste le sue buone capacità motorie — conferma?").
- Se l'item riguarda davvero qualcosa di non pertinente al caso (es. d465 "spostarsi con ausili" per un alunno senza disabilità motoria, o d340 "produrre messaggi in LIS" per chi non usa la lingua dei segni), assegna PF=9 e CAP=9 (non applicabile) con "fonte":"colloquio" e una breve nota, invece di lasciarlo vuoto.
- Se non hai alcun indizio né dal colloquio né dai dati clinici, chiedilo esplicitamente all'interlocutore.
Quando un item viene raccolto da una risposta diretta dell'interlocutore, usa sempre "fonte":"colloquio".

SWEEP FINALE
Quando il colloquio narrativo si sta esaurendo (hai coperto la maggior parte dei domini con naturalezza), prima di proporre la chiusura controlla internamente quali item dell'elenco completo non hanno ancora un valore. Se ce ne sono:
- prova prima l'inferenza come sopra;
- per quelli che restano davvero incerti, fai una o due domande di chiusura che li raggruppano in modo compatto (es. "Un'ultima cosa: come se la cava nel prepararsi da mangiare o dare una mano in casa? E nello spostarsi da solo, ad esempio andare a scuola?"), eventualmente offrendo quickReplies per una risposta rapida.
ITEM DA CHIEDERE SEMPRE ESPLICITAMENTE
d175 (problem solving), d177 (prendere decisioni) e d179 (applicare conoscenze) NON vanno mai dedotti dagli altri item né dalla diagnosi: chiedi sempre all'interlocutore, con domande concrete, come l'alunno/a se la cava in ciascuno dei tre. Esempi:
- d175: «Come affronta un problema nuovo o un compito che non ha mai svolto: prova da solo/a, chiede aiuto, si blocca?»
- d177: «Riesce a scegliere tra due alternative e a decidere cosa fare, per esempio come impostare un lavoro o come usare una pausa?»
- d179: «Riesce a usare ciò che ha imparato in situazioni nuove, per esempio applicare una regola o un procedimento a un esercizio diverso da quello studiato?»

NIENTE DATI INVENTATI
- Registra solo ciò che l'interlocutore ha detto, oppure ciò che deduci nei modi descritti sopra e segnalati come tali. Non aggiungere mai fatti, esempi, episodi, persone, ausili, terapie, ore di supporto, interessi, emozioni o giudizi che l'interlocutore non ha detto (se ha detto «calcio», non scrivere «calcio e Lego»).
- Anagrafica (nome, età, classe, scuola, famiglia, interessi, diagnosi, supporti): solo ciò che è stato detto. Se un dato non è stato detto, lascia il campo vuoto e, se serve, chiedilo.
- Fattori personali (fpItems) e fattori ambientali: solo se l'interlocutore ne ha parlato; non ricavarli dalla diagnosi né dall'impressione generale (es. «bassa autostima» solo se è stata riferita).
- Le note degli item riportano soltanto quanto è stato riferito, con parole vicine a quelle dell'interlocutore: niente esempi aggiunti da te.
- L'inferenza è ammessa solo per i valori degli item d e per le funzioni/strutture corporee (b, s) che discendono da una diagnosi dichiarata dall'interlocutore, come descritto sopra (con "fonte":"inferenza" e il motivo nella nota), mai per altri fatti sull'alunno/a.
- Se l'interlocutore risponde in modo vago o non risponde alla tua domanda, non riempire il vuoto: riformula la domanda in modo più concreto.

CHIUSURA DEL COLLOQUIO
- Non chiudere MAI il colloquio finché OGNI item d dell'elenco completo non ha un valore di PF e CAP (osservato, inferito, oppure 9 se non pertinente al caso). Sono omissibili, cioè da non chiedere, solo gli item evidentemente non pertinenti: a quelli assegni 9 con una nota breve.
- Non scrivere mai un messaggio di chiusura: niente "abbiamo completato tutto", niente riassunti finali, niente promesse (stesura o consegna di documenti o di bozze, contatti o verifiche successive), niente saluti finali, niente richieste di conferma per procedere. Le fasi successive (revisione, convalida del questionario, generazione del PEI) sono gestite dall'interfaccia, non da te.
- Finché mancano item, prosegui con la domanda successiva. Quando tutti gli item sono completi, scrivi soltanto una frase breve come «Abbiamo raccolto tutti gli elementi del questionario.» senza altro.

FORMATO RISPOSTA — sempre e solo JSON valido:
{
  "message": "il tuo messaggio conversazionale, scritto in italiano naturale e parlato",
  "hint": null,
  "quickReplies": [],
  "anagrafica": {
    "nome": "<nome di fantasia o sigla detti dall'interlocutore>",
    "eta": "<età detta>",
    "classe": "<classe detta>",
    "scuola": "<ordine scolastico detto>",
    "diagnosi": "<diagnosi dette, con le sue parole>",
    "famiglia": "<ruoli dei familiari detti>",
    "interessi": "<interessi detti>",
    "supporti": "<supporti detti, con le ore solo se dette>"
  },
  "fpItems": [
    {"code": "i620", "label": "Interessi", "note": "<ciò che l'interlocutore ha riferito, con le sue parole>"}
  ],
  "bItems": [
    {"code": "b140", "label": "nell'attenzione", "qualifier": "2", "note": "<motivo: diagnosi dichiarata o osservazione riferita>"}
  ],
  "sItems": [
    {"code": "s110", "label": "nella struttura del cervello", "qualifier": "2", "note": "<lesione o diagnosi dichiarata dall'interlocutore>"}
  ],
  "icfUpdate": {
    "domainId": "D1",
    "items": [{"code": "d160", "label": "Attenzione", "pf": "2", "cap": "3", "nota": "<ciò che è stato riferito>", "fonte": "colloquio"}],
    "faItems": [{"code": "e330", "label": "Persone in posizione di autorità — insegnanti di classe", "effect": "F-"}]
  },
  "progress": 0
}

- Gli esempi del formato mostrano solo la FORMA dei campi: i testi tra < > vanno sostituiti con ciò che l'interlocutore ha detto davvero e non vanno mai riportati così; non riutilizzare mai contenuti degli esempi (età, interessi, supporti, ore, note)
- "anagrafica" va compilata progressivamente man mano che le info emergono; includi solo i campi che conosci, ometti gli altri
- "fpItems" è un array di fattori personali emersi; aggiornalo progressivamente; può essere null o [] se non ne hai ancora rilevati
- "bItems" è un array di Funzioni corporee (serie b) con qualifier 0-4, SOLO con i codici dell'elenco chiuso; includilo solo se ci sono dati clinici espliciti; può essere null o []
- "sItems" è un array di Strutture corporee (serie s) con qualifier 0-4, SOLO con i codici dell'elenco chiuso; includilo se le strutture sono esplicitamente menzionate (lesioni, malformazioni) oppure discendono da una diagnosi dichiarata (tabella STRUTTURE CORPOREE DA DIAGNOSI DICHIARATA); può essere null o []
- ogni item in "icfUpdate.items" include "pf" e "cap" (0-4, oppure 9 se non applicabile); "nota" è una breve annotazione clinica (facoltativa ma consigliata, specie per item inferiti); "fonte" è "colloquio" se il dato viene da una risposta diretta dell'interlocutore, "inferenza" se stimato dalle funzioni/strutture corporee o dalla diagnosi già note (vedi regola INFERENZA CLINICA sopra)
- "icfUpdate" può essere null durante la Fase 1 o quando non hai ancora abbastanza informazioni
- "progress" va da 0 a 9, rappresenta i domini ICF esplorati (solo Fase 2)
- "message" deve sembrare parlato, non scritto: frasi brevi, tono diretto, nessun elenco puntato`;

// Health check
app.get("/", (req, res) => {
  res.json({ status: "ok", service: "ICF-Scuola proxy" });
});

// Chiama un endpoint chat/completions in stile OpenAI (Mistral, DeepSeek e GLM sono tutti compatibili)
// e restituisce il testo della risposta. Lancia un errore se la chiamata fallisce.
async function callProvider({ url, apiKey, model, messages, temperature = 0.7, maxTokens = 2048, extra = {} }) {
  const body = JSON.stringify(corpoRichiesta({ system: SYSTEM_PROMPT, messages, model, temperature, maxTokens, extra }));
  const response = await chiediConRiprova(() => fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    },
    body
  }));
  if (!response.ok) {
    const errText = (await response.text()).slice(0, 200);   // gli errori di validazione di alcuni fornitori citano l'input: se ne tiene solo l'inizio
    throw new Error(`HTTP ${response.status}: ${errText}`);
  }
  const data = await response.json();
  // consumi per il calcolo dei costi: solo numeri, mai testi
  const u = usoChat(data);
  console.log(rigaUso('chat', { modello: model, turni: messages.length, in: u.in, out: u.out, cache: u.cache }));
  return testoRisposta(data.choices?.[0]?.message?.content);
}

// Proxy endpoint: prova i fornitori della catena nell'ordine di chat-provider.js; il primo che risponde vince
app.post("/chat", async (req, res) => {
  const catena = catenaChat(process.env);
  if (!catena.length) {
    return res.status(500).json({ error: "Nessun fornitore del colloquio configurato sul server (MISTRAL_API_KEY; con CHAT_PROVIDER=legacy: DEEPSEEK_API_KEY o ZAI_API_KEY)." });
  }

  const { messages } = req.body;
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "Campo 'messages' mancante o non valido." });
  }

  const parziali = [];
  const esito = await eseguiCatena(
    catena,
    async (c) => {
      const text = await callProvider({ url: c.url, apiKey: c.apiKey, model: c.model, messages, temperature: c.temperature, maxTokens: c.maxTokens, extra: c.extra });
      if (!rispostaValida(text)) {
        if (text && text.trim()) parziali.push({ text, provider: c.model });
        throw new Error("risposta non nel formato JSON atteso");   // passa al fornitore successivo
      }
      return text;
    },
    (c, err) => console.error(`Colloquio: ${c.model} non disponibile:`, err.message)
  );
  if (!esito) {
    // nessuna risposta valida: meglio il testo del primo tentativo (il client ne ricava almeno il messaggio) che un errore che si ripete identico
    if (parziali.length) { console.error("Colloquio: restituita la risposta parziale del primo tentativo"); return res.json({ ...parziali[0], parziale: true }); }
    return res.status(500).json({ error: "Errore interno del proxy: nessun provider disponibile." });
  }
  res.json(esito);
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
  // Note libere dell'insegnante (N) e descrizioni (L): arrivano ai prompt, accorciate e in quantità limitata
  // (il generatore ha un limite di token al minuto). Per i codici e* la descrizione dell'area è nell'etichetta del fattore.
  const NOTA_MAX = 240, NOTE_PER_CODICE = 9, NOTE_TOTALI_MAX = 7000;
  const pulisciNota = (t) => {
    const s = String(t == null ? '' : t).replace(/\s+/g, ' ').trim();
    return s.length > NOTA_MAX ? s.slice(0, NOTA_MAX - 1) + '…' : s;
  };
  // Nota di un fattore ambientale: l'etichetta è «nome del codice — nota» (o un'etichetta libera): si toglie il nome standard,
  // che il generatore già conosce dal codice, e resta la nota dell'insegnante (vuota se l'etichetta è solo il nome).
  const notaFattore = (cod, label) => {
    let t = String(label || '').trim();
    const nome = typeof FATTORI_E !== 'undefined' && FATTORI_E[cod.toLowerCase()] ? FATTORI_E[cod.toLowerCase()][0] : '';
    if (nome && t.toLowerCase().startsWith(nome.toLowerCase())) t = t.slice(nome.length).replace(/^[\s—–-]+/, '');
    else if (t.includes(' — ')) t = t.split(' — ').slice(1).join(' — ');
    return t.trim();
  };
  // Registra un codice. Lo stesso fattore può comparire in più aree di vita (domini d1-d9) con qualificatori e note diversi
  // (es. i genitori: facilitatore nella cura di sé, barriera nella vita domestica): per i fattori e* e i* l'area si conserva
  // (A = {area: qualificatore}, note con il prefisso dell'area) e non si uniscono qualificatori di aree diverse.
  function registra(cod, e) {
    const prec = out[cod];
    if (prec) {
      if (prec.Q && e.Q) e.Q = prec.Q.split('/').includes(e.Q) ? prec.Q : prec.Q + '/' + e.Q;
      else if (prec.Q) e.Q = prec.Q;
      if (prec.A || e.A) {
        const A = { ...(prec.A || {}) };
        for (const [d, q] of Object.entries(e.A || {})) A[d] = A[d] ? (A[d].split('/').includes(q) ? A[d] : A[d] + '/' + q) : q;
        e.A = A;
      }
      const note = [...[].concat(prec.N || []), ...[].concat(e.N || [])].filter((n, i, a) => a.indexOf(n) === i).slice(0, NOTE_PER_CODICE);
      if (note.length) e.N = note; else delete e.N;
      for (const k of ['P', 'C', 'L']) if (e[k] === undefined && prec[k] !== undefined) e[k] = prec[k];
    }
    out[cod] = e;
  }
  function walk(node, depth, ctx) {
    if (!node || typeof node !== 'object' || depth > 10) return;
    if (Array.isArray(node)) {
      for (const item of node) {
        if (!item || typeof item !== 'object') continue;
        // Formato reale ICF Scuola: campo "icf" contiene il codice foglia
        const cod = String(item.icf || item.codice || item.code || item.cod || '').trim();
        if (/^[bdesi]\d/i.test(cod) && (!codeRegex || codeRegex.test(cod))) {
          // P = performance (stringa "1"-"4" o testo "F++" per fattori ambientali)
          // C = capacita (stringa "1"-"4")
          const rawP = item.performance ?? item.P ?? item.p ?? item.qualificatore_P ?? item.qualP ?? null;
          const rawC = item.capacita    ?? item.capacity ?? item.C ?? item.c ?? item.qualificatore_C ?? item.qualC ?? null;
          const pNum = rawP != null && rawP !== '' && !isNaN(+rawP) ? +rawP : null;
          const cNum = rawC != null && rawC !== '' && !isNaN(+rawC) ? +rawC : null;
          const eOrI = /^[ei]/i.test(cod);
          // area di vita del fattore: dal campo "dominio" (fattori personali dell'app) o dal dominio che lo contiene
          const dom = eOrI ? (item.dominio && /^d[1-9]$/i.test(String(item.dominio)) ? String(item.dominio).toUpperCase() : ctx) : undefined;
          // Per fattori ambientali e* (e personali i*): qualificatore testuale "F++", "B-", ecc.
          const qTxt = eOrI ? (rawP != null && rawP !== '' && isNaN(+rawP) ? String(rawP) : (item.qualificatore ? String(item.qualificatore) : null)) : null;
          // Per funzioni e strutture corporee (b, s): qualificatore di gravità 0-4 (campo "qualifier" o "qualificatore")
          const rawQ = /^[bs]/i.test(cod) ? (item.qualifier ?? item.qualificatore ?? null) : null;
          const qBS = rawQ != null && rawQ !== '' && !isNaN(+rawQ) ? String(+rawQ) : null;
          // Note: "nota"/"note" (d, b, s, i); per i fattori e* la descrizione dell'area sta nell'etichetta
          const nota0 = pulisciNota(item.nota ?? item.note ?? item.N ?? (/^e/i.test(cod) && item.label && item.label !== cod ? notaFattore(cod, item.label) : ''));
          const nota = nota0 && dom ? dom + ': ' + nota0 : nota0;
          const desc = /^[bs]/i.test(cod) && item.label && item.label !== cod ? pulisciNota(item.label) : '';
          // «nessun effetto» (effetto 0 del colloquio) non è un fattore
          const nessunEffetto = eOrI && String(item.effetto ?? '').trim() === '0';
          if (!nessunEffetto && (pNum != null || cNum != null || qTxt != null || qBS != null || nota)) {
            const e = {};
            if (pNum != null) e.P = pNum;
            if (cNum != null) e.C = cNum;
            if (qTxt != null) { if (dom) e.A = { [dom]: qTxt }; else e.Q = qTxt; }   // qualifier testuale (es. "F++"), per area di vita se nota
            if (qBS != null) e.Q = qBS;
            if (desc && (qBS != null || nota)) e.L = desc;
            if (nota) e.N = [nota];
            registra(cod, e);
          }
        }
        // Ricorre SEMPRE nei figli (anche se cod era un dominio padre senza qualificatori)
        walk(item, depth + 1, /^d[1-9]$/i.test(cod) ? cod.toUpperCase() : ctx);
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
          const nota = pulisciNota(v.nota ?? v.note ?? v.N ?? '');
          if (pNum != null || cNum != null) {
            const e = {};
            if (pNum != null) e.P = pNum;
            if (cNum != null) e.C = cNum;
            if (nota) e.N = [nota];
            registra(k, e);
          }
        }
        walk(v, depth + 1, /^d[1-9]$/i.test(k) ? k.toUpperCase() : ctx); // ricorre sempre per gestire sotto-codici annidati
      } else { walk(v, depth + 1, ctx); }
    }
  }
  walk(obj, 0);

  // Una sola nota: stringa; più note: elenco. Oltre il limite complessivo le note si tagliano (i codici restano tutti).
  let noteTotali = 0;
  for (const e of Object.values(out)) {
    if (!e || typeof e !== 'object' || e.N === undefined) continue;
    const kept = [];
    for (const n of [].concat(e.N)) { if (noteTotali + n.length > NOTE_TOTALI_MAX) break; kept.push(n); noteTotali += n.length; }
    if (kept.length) e.N = kept.length === 1 ? kept[0] : kept; else delete e.N;
  }

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
      // Il titolo «### Obiettivo 1» va tenuto con i suoi «#»: senza, il primo obiettivo non viene riconosciuto e sparisce dal PEI.
      const objIdx = raw.search(/(?:OBIETTIVI EDUCATIVI[^\n]*\n+)?(?:#{1,4}[ \t]*)?Obiettivo\s+\d/i);
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
  if (PEI_PROVIDER === "claude" && !anthropicClient) {
    return res.status(500).json({ error: "ANTHROPIC_API_KEY non configurata sul server." });
  }
  try {
    const { eta, sesso, grado, istituto, icf, dettaglio82: dettaglio82Req, anonimo: anonimoReq, sidi: sidiReq } = req.body;
    const sidi = sidiReq === true || sidiReq === 'true';   // aggiunge l'esportazione per SIDI (testi da copiare nei campi del portale)
    const anonimo = anonimoReq === true || anonimoReq === 'true';   // versione senza dati identificativi, per il caricamento in SIDI

    if (!eta || !sesso || !grado) {
      return res.status(400).json({ error: "Campi obbligatori mancanti: eta, sesso, grado." });
    }
    if (!icf || typeof icf !== "object") {
      return res.status(400).json({ error: "Profilo ICF (campo 'icf') mancante o non valido." });
    }

    const jsonData = icf;

    const jsonFull = compactIcf(jsonData);            // tutti i codici d*+e* (Part1)
    const jsonD    = compactIcf(jsonData, /^d/i);     // solo d* attività (profilo 8.2)
    const jsonDE   = compactIcf(jsonData, /^[de]/i);  // d* + e* per area di vita (Part2: i fattori orientano le strategie degli obiettivi)
    const jsonE    = compactIcf(jsonData, /^e/i);     // solo e* ambientali (Part3)
    // Part4 (Sez.8+Nota) non richiede codici ICF: solo dati anagrafici
    const jsonDemo = JSON.stringify((() => {
      const d = {};
      for (const k of ['allievo', 'anagrafica', 'nome', 'studente', 'cognome', 'diagnosi', 'diagnosis', 'profilo']) {
        if (jsonData[k] != null) d[k] = jsonData[k];
      }
      return d;
    })());

    // Sezione 8.2 esteso (contenuti + verifiche dal profilo ICF): interruttore per richiesta o variabile d'ambiente
    const dettaglio82 = dettaglio82Req !== undefined ? !!dettaglio82Req : process.env.PEI_DETTAGLIO_82 === '1';
    // "presente" solo se la mappa contiene davvero codici d* (il ripiego "slim" di compactIcf può restituire un JSON di altra forma)
    const mappaD = parseMappaIcf(jsonD);
    const profiloPresente = Object.keys(mappaD).some(k => /^d\d/i.test(k));
    const profilo82 = dettaglio82
      ? formattaProfiloPerPrompt(derivaProfiloApprendimento(mappaD), { presente: profiloPresente })
      : '';
    // esito delle dimensioni (VA DEFINITA / OMISSIBILE): lo calcola il programma sui dati, non il modello
    const esitiDim = calcolaEsitiDimensioni(mappaD);
    console.log(`[PEI] dettaglio82=${dettaglio82}${dettaglio82 ? ` profiloPresente=${profiloPresente}` : ''}`);

    console.log(`[PEI] JSON sizes — full:${jsonFull.length} d:${jsonD.length} e:${jsonE.length} demo:${jsonDemo.length} chars`);
    console.log(`[PEI] Generazione: grado=${grado} eta=${eta} istituto=${istituto || '-'} anonimo=${anonimo}`);

    const systemMsg = `Sei un docente esperto nella redazione del PEI ministeriale italiano, orientato al progetto di vita.
Rispondi sempre in italiano. Scrivi ogni sezione integralmente, senza placeholder "[...]".
Restituisci SOLO il testo richiesto, senza preamboli o commenti aggiuntivi.`;


    const parti = await Promise.all([
      generatorePei.genera({ system: systemMsg, prompt: buildPromptPart1({ eta, sesso, grado, istituto, jsonData: jsonFull, esitiDim }), maxTokens: 8000 }),
      generatorePei.genera({ system: systemMsg, prompt: buildPromptPart2({ eta, sesso, grado, istituto, jsonData: jsonDE, esitiDim }), maxTokens: 8000 }),
      generatorePei.genera({ system: systemMsg, prompt: buildPromptPart3({ eta, sesso, grado, istituto, jsonData: jsonE   }), maxTokens: 8000 }),
      generatorePei.genera({ system: systemMsg, prompt: buildPromptPart4({ eta, sesso, grado, istituto, jsonData: jsonDemo, dettaglio82, profilo82 }), maxTokens: 8000 }),
    ]);

    const uPei = usoClaude(parti);
    const troncate = parti.filter(p => p.troncato).length;
    console.log(rigaUso('pei', { modello: generatorePei.modello, chiamate: uPei.chiamate, in: uPei.in, out: uPei.out, ragion: uPei.ragion, troncate }));
    if (troncate) console.warn(`[PEI] ⚠ ${troncate} parti troncate dal limite di token: il PEI potrebbe essere incompleto`);

    const peiText = parti.map(p => p.text).join('\n\n');

    const peiData = parsePeiText(peiText, grado, istituto, eta, sesso, jsonData);
    peiData.esitiCalcolati = esitiDim;   // la Sezione 2 riporta questi esiti, qualunque cosa abbia scritto il modello

    // nei log non finisce mai testo del PEI né il nome dell'alunno: solo dimensioni e parametri tecnici
    const doc    = buildDocx(peiData, grado, { anonimo });
    const buffer = await Packer.toBuffer(doc);

    const nomeFile = anonimo
      ? `PEI_anonimo_${grado}_${new Date().getFullYear()}.docx`
      : `PEI_${peiData.nomeStudente || 'soggetto'}_${grado}_${new Date().getFullYear()}.docx`;

    if (sidi) {
      // due file in una sola risposta: il PEI e l'esportazione per SIDI
      const bufferSidi = await Packer.toBuffer(buildSidiDocx(peiData, grado));
      const nomeSidi = `PEI_per_SIDI_${grado}_${new Date().getFullYear()}.docx`;
      console.log(`[PEI] ✅ Generati PEI (${buffer.length} bytes) + esportazione SIDI (${bufferSidi.length} bytes)`);
      return res.json({ files: [{ nome: nomeFile, base64: buffer.toString('base64') }, { nome: nomeSidi, base64: bufferSidi.toString('base64') }] });
    }

    res.set({
      'Content-Type':        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'Content-Disposition': `attachment; filename="${nomeFile}"`,
      'Content-Length':      buffer.length,
    });
    res.send(buffer);

    console.log(`[PEI] ✅ Generato PEI (${buffer.length} bytes)`);

  } catch (err) {
    console.error('[PEI] ❌ Errore:', err.message);
    res.status(500).json({ error: 'Errore interno nella generazione del PEI.', detail: err.message });
  }
});

// ── VOCE NEURALE (Google Cloud Text-to-Speech, WaveNet) ─────────────────────
// Riceve le frasi già preparate dal browser, restituisce l'audio MP3 in base64. Non conserva né registra i testi.
const cacheVoce = creaCache(200);
const limitatoreVoce = creaLimitatore({ finestraMs: 10 * 60 * 1000, maxRichieste: 80, maxCaratteri: 60000 });
let vociTts = null, vociTtsAl = 0;
async function getVociTts() {
  if (!GOOGLE_TTS_API_KEY) return [];
  if (!vociTts || Date.now() - vociTtsAl > 6 * 3600 * 1000) { vociTts = await elencaVoci({ apiKey: GOOGLE_TTS_API_KEY, fetchImpl: fetch }); vociTtsAl = Date.now(); }
  return vociTts;
}
app.get("/tts-config", async (req, res) => {
  res.json({ attivo: !!GOOGLE_TTS_API_KEY, voci: await getVociTts() });
});
app.post("/tts", async (req, res) => {
  if (!GOOGLE_TTS_API_KEY) return res.status(503).json({ error: "tts_non_configurato" });
  const voci = (await getVociTts()).map(v => v.id);
  const v = validaRichiesta(req.body, voci);
  if (!v.ok) return res.status(400).json({ error: v.errore });
  const chiave = chiaveCache(v.voce, v.velocita, v.ssml);
  let audio = cacheVoce.get(chiave);
  const cacheHit = !!audio;
  if (!audio) {
    if (!limitatoreVoce.consenti(req.ip, v.caratteri)) return res.status(429).json({ error: "troppe_richieste" });
    try {
      audio = await sintetizza({ apiKey: GOOGLE_TTS_API_KEY, ssml: v.ssml, voce: v.voce, velocita: v.velocita, fetchImpl: fetch });
    } catch (err) {
      console.error("[TTS] errore:", err.message);
      return res.status(502).json({ error: "tts_errore" });
    }
    cacheVoce.set(chiave, audio);
    console.log(`[TTS] ok ${v.caratteri} caratteri`);
  }
  console.log(rigaUso('tts', { caratteri: v.caratteri, cache: cacheHit ? 'si' : 'no' }));
  res.json({ audio });
});

app.listen(PORT, () => console.log(`ICF proxy in ascolto su porta ${PORT}`));
