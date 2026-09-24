// pei-programmi.js
// Base curata di riferimento ai programmi ministeriali, per fondare la Sezione 8 del PEI
// su competenze/nuclei tematici reali invece che sul solo nome della disciplina.
//
// FONTE (infanzia/primaria/sec1): Indicazioni Nazionali per il curricolo della scuola
// dell'infanzia e del primo ciclo d'istruzione, D.M. 9 dicembre 2025, n. 221 (Valditara) —
// pubblicate in G.U. il 27/01/2026, in vigore dall'11/02/2026, sostituiscono le Indicazioni 2012.
// Testo integrale: https://www.mim.gov.it/documents/20182/10554370/curricolo_web.pdf
//
// NOTA SULLA TRANSIZIONE (decisione condivisa con l'utente 2026-09-15): l'app usa SOLO le
// nuove Indicazioni 2025, anche per l'a.s. 2026/2027 in cui — per legge — le classi diverse
// dalla prima di primaria/sec1 sono ancora transitoriamente sulle Indicazioni 2012 (che
// restano in vigore fino all'a.s. 2030/2031 per la primaria e 2028/2029 per la sec1). Scelta
// deliberata per tenere sostenibile la curatela: il disallineamento si esaurisce da solo entro
// pochi anni scolastici e riguarda solo la formulazione dei contenuti, non la sostanza.
//
// STRUTTURA DATI: una voce per grado × nome disciplina (i nomi devono combaciare ESATTAMENTE
// con quelli in CAMPI_ESPERIENZA / DISCIPLINE_PRIMARIA / DISCIPLINE_SEC1 / ISTITUTI_SEC2 di
// pei-gradi.js). Per la sec2: PROGRAMMI_SEC2_BASE per nome disciplina condiviso tra indirizzi
// + PROGRAMMI_SEC2_OVERRIDE[istituto][nome] solo dove l'indirizzo cambia sostanzialmente il
// programma (Approccio C, concordato con l'utente) — 1 override: Liceo Scienze Umane / Diritto ed Economia.
//
// COMPLETO (2026-09-23): 101 voci base + 8 override (6 Laboratori Tecnologici per indirizzo), tutti i 32 indirizzi sec2 coperti al 100%
// (verificato con checkCoverage/test-programmi-coverage.js). Unica esclusione voluta:
// "Religione / Attività alternativa" in ogni grado (traguardi fissati dal DPR 11/02/2010
// per l'IRC, fonte diversa dalle Indicazioni Nazionali/Linee Guida laiche — non curata).
//
// FONTI SEC2: Licei — Indicazioni Nazionali per i Licei, bozza MIM 22/04/2026, parere CSPI
// 14/07/2026, NON ANCORA adottate in via definitiva (rischio di modifiche; scelta condivisa
// con l'utente di curare comunque sulla bozza attuale). Istituti Tecnici — Linee Guida DPR
// 88/2010, secondo biennio/quinto anno (stabile). Istituti Professionali — Regolamento e
// Linee Guida D.Lgs. 61/2017 (stabile); per gli indirizzi/discipline dove non è stato
// reperito un documento ufficiale "Disciplina:" dedicato, la voce lo segnala esplicitamente
// nel proprio campo "competenze" (sintesi dal P.E.Cu.P. generale o adattamento da una
// disciplina affine dell'ordinamento previgente) — da rivedere quando/se emergerà una fonte
// più specifica. Voci "fuse" per i licei con cattedre unificate (es. "Storia e Filosofia",
// "Matematica e Fisica"): contenuto sintetizzato dai capitoli separati delle fonti ufficiali.

// ── Infanzia — 5 campi di esperienza ──────────────────────────────────────────
const PROGRAMMI_INFANZIA = {
  "Il sé e l'altro": {
    competenze: "Costruzione dell'identità personale, dell'autostima e del senso morale; cura e rispetto di sé, degli altri e dell'ambiente; gestione dei primi conflitti tra pari.",
    nuclei: [
      "Identità personale e senso morale",
      "Relazioni con pari e adulti, gestione dei conflitti",
      "Regole di base della vita sociale, diritti e doveri",
      "Riconoscimento ed espressione delle emozioni",
      "Prime categorie di tempo (passato/presente/futuro) e appartenenza culturale",
    ],
  },
  "Il corpo e il movimento": {
    competenze: "Consapevolezza della propria corporeità nelle potenzialità espressive, comunicative e motorie; sviluppo dello schema corporeo e dell'autonomia nel movimento, nel rispetto delle regole.",
    nuclei: [
      "Schema corporeo ed equilibrio",
      "Movimento controllato e finalizzato, gioco psicomotorio",
      "Orientamento nello spazio",
      "Cura di sé, igiene e corretti stili di vita",
      "Riconoscimento di emozioni e sensazioni di benessere/malessere",
    ],
  },
  "Immagini, suoni, colori": {
    competenze: "Uso dei principali linguaggi espressivi (musicale, grafico-pittorico, plastico, audiovisivo); produzione creativa con materiali e tecniche diverse; primo gusto estetico e atteggiamento critico verso opere osservate/ascoltate.",
    nuclei: [
      "Esplorazione sensoriale e linguaggi espressivi multipli",
      "Produzione artistica creativa (manufatti, canti, danze, scenette)",
      "Ascolto e fruizione di musica e opere d'arte",
      "Primi alfabeti musicali e notazione informale",
      "Uso mediato delle tecnologie per l'espressione creativa",
    ],
  },
  "I discorsi e le parole": {
    competenze: "Uso della lingua italiana per comprendere e produrre semplici enunciati; ascolto e narrazione di racconti; prima consapevolezza di lingue e culture diverse; avvio al linguaggio scritto.",
    nuclei: [
      "Comprensione e produzione orale in italiano",
      "Arricchimento lessicale",
      "Gioco linguistico (rime, filastrocche, invenzione di parole)",
      "Familiarizzazione con una seconda lingua",
      "Prime forme di linguaggio scritto e coordinazione grafica",
    ],
  },
  "La conoscenza del mondo": {
    competenze: "Osservazione di fenomeni naturali e cambiamenti (cicli, stagioni); collocazione nello spazio e nel tempo; primi concetti di quantità, misura e classificazione; riconoscimento di semplici forme geometriche.",
    nuclei: [
      "Osservazione di organismi viventi e fenomeni naturali/artificiali",
      "Orientamento spaziale e categorie topologiche",
      "Tempo: giorni, stagioni, successione",
      "Forme geometriche nello spazio e nel piano",
      "Raggruppamento, conteggio, misurazione, classificazione",
    ],
  },
};

// Nota per Religione Cattolica / Attività alternativa: traguardi fissati dal DPR 11/02/2010
// (non dalle Indicazioni Nazionali laiche) — nessun aggancio curato in questa base dati.
const NOTA_RELIGIONE = {
  competenze: "Disciplina non coperta dalle Indicazioni Nazionali 2025 (traguardi fissati dal DPR 11/02/2010 per l'IRC, o dal progetto d'istituto per l'attività alternativa) — nessun aggancio curato in questa base dati.",
  nuclei: [],
};

// ── Primaria — classe quinta ──────────────────────────────────────────────────
const PROGRAMMI_PRIMARIA = {
  "Italiano": {
    competenze: "Alfabetizzazione di base sicura in lettura/scrittura/ascolto/parlato; riflessione sulla lingua a partire dagli usi comuni; produzione di testi semplici e coerenti; primo approccio ai testi letterari.",
    nuclei: [
      "Grammatica per classi di parole e ampliamento del lessico",
      "Ortografia, punteggiatura e strategie di autocorrezione",
      "Ascolto, dialogo ed esposizione orale organizzata",
      "Lettura e interpretazione di testi anche letterari, memorizzazione di poesie",
      "Scrittura di testi narrativi/descrittivi/argomentativi e riassunto",
    ],
  },
  "Matematica": {
    competenze: "Formulare e risolvere problemi con strategie personali; calcolo scritto/mentale sicuro con numeri naturali e frazioni; rappresentare e classificare forme geometriche; leggere e rappresentare dati; primi elementi di informatica.",
    nuclei: [
      "Numeri, calcolo e frazioni",
      "Spazio e figure geometriche (uso di riga, squadra, compasso)",
      "Dati, previsioni e incertezza",
      "Risoluzione di problemi e argomentazione",
      "Informatica: dati, algoritmi, semplice programmazione",
    ],
  },
  "Storia": {
    competenze: "Conoscenza di fatti, processi e personaggi storici collocati nel tempo e nello spazio; capacità di sintesi e comunicazione delle conoscenze storiche.",
    nuclei: [
      "Strumenti del tempo storico (successione, periodizzazione, linea del tempo)",
      "Dalla comparsa dell'uomo alle civiltà del Mediterraneo e del Vicino Oriente",
      "Grecia e Roma: istituzioni, società, romanizzazione",
      "Crisi dell'Impero romano d'Occidente e mondo alto-medievale (regni romano-barbarici, impero romano d'Oriente, codificazione di Giustiniano, espansione islamica)",
      "Cittadinanza: Costituzione, governo locale e nazionale",
    ],
  },
  "Geografia": {
    competenze: "Orientamento nello spazio vissuto e in contesti più ampi (Italia, Europa, mondo) con strumenti cartografici anche digitali; lettura e interpretazione del paesaggio; relazioni tra società e ambiente.",
    nuclei: [
      "Orientamento con punti cardinali, bussola, carte anche digitali",
      "Geografia fisica e umana dell'Italia (regioni, città, mari, monti, fiumi)",
      "Lettura di carte fisiche, politiche, storiche e tematiche",
      "Rappresentazione degli spazi vissuti",
      "Relazioni tra territorio, società e ambiente",
    ],
  },
  "Scienze": {
    competenze: "Osservazione diretta di fenomeni naturali con curiosità scientifica; comprensione di ecosistemi e interazioni uomo-ambiente; adozione di comportamenti responsabili per la salute.",
    nuclei: [
      "Osservazione ed esplorazione della natura (minerali, piante, animali)",
      "Materia e trasformazioni (stati, conservazione della quantità)",
      "Fenomeni fisici (moto, equilibrio, misure)",
      "Ecosistemi e cura dell'ambiente",
      "Educazione alimentare e stili di vita sani",
    ],
  },
  "Tecnologia": {
    competenze: "Comprendere il funzionamento di dispositivi tecnologici e il relativo impatto ambientale; progettare e realizzare semplici modelli; primi elementi di informatica (Internet, uso sicuro e consapevole).",
    nuclei: [
      "Osservazione e classificazione di elementi artificiali",
      "Progettazione e realizzazione di semplici modelli/oggetti",
      "Disegno tecnico e rappresentazioni grafiche",
      "Lettura di documentazione tecnica e commerciale",
      "Informatica: Internet, uso sicuro e responsabile della tecnologia",
    ],
  },
  "Musica": {
    competenze: "Ascolto critico e interpretazione del suono; coordinazione di ritmo e movimento; esplorazione di strumenti musicali e pratica corale; sensibilità estetica e primo inquadramento storico-culturale.",
    nuclei: [
      "Percezione, ascolto e analisi dei suoni",
      "Prime forme di notazione grafica della musica",
      "Produzione: canto corale, musica d'insieme, semplici ritmi",
      "Ritmo e movimento corporeo",
      "Dimensione culturale ed emotiva della musica",
    ],
  },
  "Arte e Immagine": {
    competenze: "Esprimere emozioni e idee attraverso elaborati grafico-plastici con tecniche semplici; osservare e commentare testi visivi; riconoscere il contesto storico-culturale di opere anche locali.",
    nuclei: [
      "Produzione con tecniche semplici (chiaroscuro, prospettiva intuitiva)",
      "Comunicazione visiva e linguaggio simbolico",
      "Osservazione e lettura di testi visivi (dipinti, video)",
      "Confronto tra opere di culture diverse",
      "Tutela e rispetto dei beni artistici",
    ],
  },
  "Educazione motoria": {
    competenze: "Consapevolezza della propria corporeità in relazione a spazio e tempo; partecipazione al gioco rispettando regole e fair play; comportamenti di sicurezza e stili di vita sani.",
    nuclei: [
      "Padronanza dei movimenti e percezione del corpo",
      "Gioco e regole (fair play)",
      "Sicurezza per sé, gli altri, l'ambiente",
      "Igiene e alimentazione",
      "Espressività motoria e linguaggi non verbali",
    ],
  },
  "Inglese": {
    competenze: "Comprendere e rispondere a semplici stimoli orali/scritti; usare lessico e strutture di base per bisogni quotidiani; interagire in contesti sociali; riconoscere elementi culturali dei paesi anglofoni.",
    nuclei: [
      "Ascolto e comprensione orale di messaggi semplici",
      "Produzione orale e interazione in giochi/attività di gruppo",
      "Lettura di brevi messaggi con supporto visivo",
      "Scrittura di parole e frasi semplici",
      "Elementi culturali dei paesi anglofoni",
    ],
  },
  "Religione / Attività alternativa": NOTA_RELIGIONE,
};

// ── Secondaria di 1° grado — classe terza ─────────────────────────────────────
const PROGRAMMI_SEC1 = {
  "Italiano": {
    competenze: "Comprensione di testi anche complessi; capacità di ordinare/sintetizzare informazioni da più fonti; lettura autonoma e interpretazione di testi letterari e non; produzione scritta di testi argomentativi e creativi ben strutturati.",
    nuclei: [
      "Analisi logica e sintattica della frase complessa",
      "Lessico: relazioni di significato, famiglie lessicali",
      "Lettura e interpretazione di testi letterari (racconti, romanzi, poesie, teatro)",
      "Scrittura argomentativa, riassunto, citazione/parafrasi",
      "Ascolto, esposizione e discussione con rispetto dei turni di parola",
    ],
  },
  "Storia": {
    competenze: "Conoscenza di fatti, processi e personaggi storici con comprensione del loro ruolo; uso delle conoscenze del passato per orientarsi nel presente; prima consapevolezza delle diversità culturali attuali.",
    nuclei: [
      "Nessi causali tra fatti storici e confronto con l'attualità europea/mondiale",
      "Collocazione degli eventi su carte geostoriche",
      "Centralità della storia europea e occidentale (radici della cultura e delle istituzioni democratiche)",
      "Riconoscimento delle tracce del passato nel territorio",
      "Esposizione orale con linguaggio e terminologia storica appropriati",
    ],
  },
  "Geografia": {
    competenze: "Collocazione spaziale come cittadino consapevole (contesto locale, nazionale, europeo, mondiale); lettura del paesaggio mediterraneo ed europeo; comprensione delle interazioni uomo-ambiente e dell'organizzazione territoriale.",
    nuclei: [
      "Orientamento con carte anche digitali, cartografia storica e tematica",
      "Geografia fisica e umana a scala europea/mondiale",
      "Interazioni tra attività umane e territorio (soluzioni e progetti)",
      "Organizzazione politico-amministrativa, economica, sociale dei territori",
      "Localizzazione e confronto di paesaggi e culture diverse",
    ],
  },
  "Matematica": {
    competenze: "Ragionamento logico e problem solving in contesti matematici e interdisciplinari; calcolo sicuro con i numeri razionali; rappresentazione di forme, dati e probabilità; argomentazione e linguaggio matematico; elementi di informatica più avanzati.",
    nuclei: [
      "Numeri razionali e calcolo",
      "Spazio, figure e loro relazioni",
      "Dati, variabilità e probabilità",
      "Argomentazione, dimostrazione e linguaggio matematico",
      "Informatica: rappresentazione dei dati, comprensione di sistemi/algoritmi",
    ],
  },
  "Scienze": {
    competenze: "Analisi e interpretazione di fenomeni naturali e antropici con i concetti e i metodi delle scienze naturali e della fisica; comunicazione scientifica argomentata; responsabilità verso biodiversità e ambiente.",
    nuclei: [
      "Fenomeni fisici e relazioni tra grandezze (misure, grafici)",
      "Ecosistemi, ciclo del carbonio, geosfera e biosfera",
      "Rischi naturali e prevenzione ambientale",
      "Fossili ed evoluzione",
      "Biodiversità e monitoraggio ecologico",
    ],
  },
  "Tecnologia": {
    competenze: "Riconoscere e descrivere processi di trasformazione e produzione; valutare opportunità e rischi delle scelte tecnologiche; usare correttamente oggetti/strumenti/macchine; informatica di base su architettura dei sistemi e uso responsabile.",
    nuclei: [
      "Processi di trasformazione delle risorse e forme di energia",
      "Sicurezza nelle attività pratiche e tecnologiche",
      "Disegno tecnico e rappresentazioni grafiche/infografiche",
      "Mezzi di comunicazione: uso efficace e responsabile",
      "Informatica: architettura di un sistema informatico, uso consapevole online",
    ],
  },
  "Musica": {
    competenze: "Creatività e improvvisazione musicale individuale e di gruppo; competenze esecutive e interpretative (voce, corpo, strumenti); lettura della notazione musicale; conoscenza storico-culturale della musica; uso creativo di strumenti digitali.",
    nuclei: [
      "Esecuzione e improvvisazione in ensemble",
      "Notazione musicale ed elementi ritmico-melodici",
      "Ascolto critico e contestualizzazione storico-culturale",
      "Espressività e significato delle musiche ascoltate",
      "Competenze digitali applicate alla musica",
    ],
  },
  "Arte e Immagine": {
    competenze: "Applicazione consapevole di tecniche artistiche (prospettiva, chiaroscuro, teoria del colore) in progetti visivi/audiovisivi strutturati; lettura critica di testi visivi complessi collegati al contesto storico-culturale; confronto tra linguaggi artistici di culture diverse.",
    nuclei: [
      "Tecniche e progetti visivi/audiovisivi (anche digitali)",
      "Lettura di opere complesse con cenni di iconografia",
      "Arte come fonte storica e dialogo interculturale",
      "Diario visivo che integra tecnica, emozione e contesto",
      "Espressione di idee personali con pensiero creativo autonomo",
    ],
  },
  "Educazione Fisica": {
    competenze: "Consapevolezza della propria corporeità e uso di linguaggi non verbali; partecipazione al gioco con tattiche e rispetto delle regole/fair play; comportamenti di sicurezza trasferibili anche fuori scuola; responsabilità, collaborazione e stili di vita attivi.",
    nuclei: [
      "Comportamenti e stili di vita attivi e sani (anche nel tempo libero)",
      "Padronanza motoria e tattiche di gioco",
      "Sicurezza per sé, gli altri e l'ambiente, anche extrascolastica",
      "Collaborazione e responsabilità di gruppo",
      "Autonomia nello spazio e nel tempo",
    ],
  },
  "Prima Lingua Straniera (Inglese)": {
    competenze: "Comprendere e produrre testi orali/scritti su argomenti familiari e di studio; interagire in conversazioni con linguaggio appropriato; usare l'inglese in contesti interdisciplinari e di cittadinanza globale; sviluppare autonomia nell'apprendimento anche con strumenti digitali.",
    nuclei: [
      "Comprensione orale di discorsi su argomenti familiari",
      "Comunicazione scritta e orale strutturata",
      "Interazione sociale e consapevolezza (inter)culturale",
      "Applicazione interdisciplinare, cittadinanza globale e sostenibilità",
      "Autonomia nell'apprendimento con strumenti digitali (Digicomp 2.2)",
    ],
  },
  "Seconda Lingua Straniera": {
    competenze: "Raggiungere il livello A1 del QCER: comprendere e produrre frasi semplici su argomenti quotidiani; interagire in scambi comunicativi elementari; prima riflessione sulla lingua e apertura interculturale.",
    nuclei: [
      "Comprensione e produzione orale elementare",
      "Comprensione e produzione scritta di testi brevi",
      "Interazione in scambi comunicativi quotidiani (presentarsi, chiedere/rispondere)",
      "Riflessione sulla lingua e strategie di apprendimento autonomo",
      "Cultura, interculturalità e plurilinguismo",
    ],
  },
  "Religione / Attività alternativa": NOTA_RELIGIONE,
};

// ── Secondaria di 2° grado — Lotto 2, COMPLETO (tutti i 32 indirizzi) ─────────
//
// Fonte Licei: Indicazioni Nazionali per i Licei, bozza pubblicata dal MIM il 22/04/2026,
// parere CSPI 14/07/2026 — NON ANCORA adottate in via definitiva con decreto (rischio di
// modifiche prima dell'adozione formale; scelta condivisa con l'utente 2026-09-15 di curare
// comunque sulla bozza attuale).
// Fonte Tecnici: Linee Guida DPR 88/2010, secondo biennio/quinto anno (stabile, non in
// riforma). "Storia" è comune a tutti gli 11 indirizzi tecnici (area generale) — curata
// una sola volta. Le voci di indirizzo (es. Economia Aziendale/Diritto/Economia Politica
// per Amministrazione Finanza e Marketing) sono tratte dall'Allegato specifico per
// indirizzo, non dal documento generale "passaggio al nuovo ordinamento" (che copre solo
// il primo biennio comune, non le materie di indirizzo del secondo biennio/quinto anno).
// Fonte Professionali: Linee Guida D.Lgs. 61/2017 (stabile, non in riforma). "Scienze
// Integrate" e "Diritto ed Economia" sono comuni a tutti i 10 indirizzi professionali
// (primo biennio) — curate una sola volta ciascuna.
//
// Voci "fuse" per i licei che accorpano più materie in un'unica cattedra (es. "Storia e
// Filosofia", "Discipline Pittoriche / Plastiche / Geometriche"):
// contenuto sintetizzato a partire dai capitoli separati delle fonti ufficiali.
// Due voci (Made in Italy/Musicale) segnalate come non sourced direttamente nel testo
// stesso della voce: "Design e Progettazione" (il documento tratta il design solo dentro
// "Storia dell'Arte e del Design", nessun capitolo a sé) e la componente "della
// Danza"/"Tecniche della Danza"/"Laboratorio Coreutico" nelle 3 voci del Liceo Musicale
// e Coreutico (il documento consultato tratta solo la parte musicale).
const PROGRAMMI_SEC2_BASE = {
  "Italiano": {
    competenze: "Padronanza della lingua italiana scritta e orale in vari contesti e scopi, con riflessione critica anche sul confronto tra scrittura umana e testi generati da IA; approfondimento della letteratura attraverso la lettura diretta dei testi (non biografie o correnti letterarie a memoria), con apertura a generi non solo letterari (saggistica, graphic novel, audiovisivi, canzoni) secondo percorsi tematici o cronologici scelti dal docente.",
    nuclei: [
      "Analisi logica e riflessione metalinguistica avanzata",
      "Storia della lingua italiana e plurilinguismo",
      "Lettura diretta e comprensione dei testi, senza eccesso di nomenclatura tecnica",
      "Letture integrali annuali ed esposizione orale su libri letti",
      "Scrittura e generi non tradizionali (saggio, sceneggiatura, articolo, graphic novel)",
    ],
  },
  "Latino": {
    competenze: "Competenze linguistiche (morfosintattiche, lessicali, semantiche) per comprendere e tradurre testi d'autore, inquadrandoli storicamente e nel genere di riferimento; analisi semantica, stilistica e retorica con confronto tra traduzioni; uso critico di strumenti informatici e di IA generativa per lo studio del latino.",
    nuclei: [
      "Traduzione e riflessione metalinguistica, anche contrastiva con l'italiano",
      "Inquadramento storico-letterario dei testi (età arcaica-tardoantica)",
      "Analisi semantica, stilistica e retorica",
      "Confronto tra lingua latina e lingua italiana",
      "Uso critico di strumenti digitali e IA per lo studio del latino",
    ],
  },
  "Lingua Straniera (Inglese)": {
    competenze: "Uso prevalente e progressivamente pervasivo della lingua straniera per l'acquisizione di strategie comunicative efficaci secondo il QCER/Companion Volume; riflessione contrastiva su sistema linguistico e fenomeni culturali in ottica interculturale; uso di strumenti accessibili (sottotitoli, audiodescrizioni) e media literacy critica sui contenuti digitali.",
    nuclei: [
      "Attività linguistico-comunicative secondo il QCER/Companion Volume",
      "Riflessione interculturale e valorizzazione della diversità linguistica",
      "Fruizione di testi multimediali con strumenti accessibili (sottotitoli, audiodescrizioni)",
      "Media literacy e uso critico delle informazioni digitali",
      "Integrazione tra teoria e pratica linguistica",
    ],
  },
  "Storia e Filosofia": {
    competenze: "Storia: consapevolezza della dimensione temporale e spaziale degli eventi, conoscenza della vicenda politico-culturale occidentale e delle affinità/diversità tra civiltà, fondamenti costituzionali e cittadinanza, senza nozionismo eccessivo. Filosofia: consapevolezza del significato della riflessione filosofica nelle sue articolazioni (ontologia, epistemologia, logica, etica, filosofia politica, estetica), lettura diretta di testi filosofici, nessi con le altre discipline e consapevolezza critica sugli sviluppi tecnologici/IA.",
    nuclei: [
      "Cronologia e quadri di riferimento storico (centralità della storia italiana ed europea)",
      "Costituzione, cittadinanza e ordinamento giuridico",
      "Autori e correnti filosofiche in approccio sia diacronico sia tematico",
      "Lettura diretta di testi filosofici e lessico specifico della disciplina",
      "Nessi interdisciplinari tra filosofia e discipline scientifiche/artistiche/economiche",
    ],
  },
  "Geografia": {
    competenze: "Primo biennio (bozza Indicazioni Licei 2026: Storia e Geografia sono due discipline distinte, affidate a un unico docente). Geografia umana e culturale come scienza della rappresentazione e delle relazioni tra sistemi umani e naturali alle diverse scale; analisi critica dei cambiamenti ambientali, politici, economici e sociali; lettura di carte, dati statistici e paesaggi (art. 9 Costituzione) con approccio critico alle rappresentazioni digitali e generate da IA; sostenibilità e uso equo dei beni ambientali come beni comuni.",
    soloPer: ["Liceo"],
    nuclei: [
      "Sistemi naturali e umani e loro interazioni (Antropocene, cambiamento climatico)",
      "Lettura e interpretazione di carte, dati statistici e rappresentazioni geografiche (anche digitali/IA)",
      "Popolazione, migrazioni, urbanizzazione e diversità culturale",
      "Organizzazione politica del territorio e geografia economica: Italia, Unione Europea, area mediterranea",
      "Paesaggio come patrimonio e sviluppo sostenibile; continenti extraeuropei (secondo anno)",
    ],
  },
  "Matematica": {
    competenze: "La matematica come linguaggio per descrivere la realtà e sistema teorico coerente, con valorizzazione della dimensione culturale e storica; costruzione di rappresentazioni, argomentazione e dimostrazione rigorosa; primi elementi di informatica (modellizzazione, analisi di fenomeni) in continuità col primo ciclo.",
    nuclei: [
      "Rappresentazione di oggetti matematici e passaggio tra rappresentazioni",
      "Modellizzazione di fenomeni reali (anche fisici) e lettura critica di dati/grafici",
      "Argomentazione e costruzione di dimostrazioni rigorose",
      "Porre e risolvere problemi anche in contesti non matematici",
      "Informatica: princìpi e concetti per analizzare e modellare fenomeni",
    ],
  },
  "Fisica": {
    competenze: "Padronanza dei concetti della fisica classica (inclusa la relatività ristretta) con solide basi di formalizzazione matematica e attività sperimentali/laboratoriali; consapevolezza dei nessi storico-filosofici dello sviluppo della fisica; sviluppo del pensiero critico e del ragionamento logico-argomentativo.",
    nuclei: [
      "Concetti fondamentali della fisica classica e relatività ristretta",
      "Osservazione, raccolta e analisi di dati sperimentali",
      "Formulazione di ipotesi con modelli, analogie e leggi",
      "Collegamenti interdisciplinari (storia, filosofia, matematica, tecnologia)",
      "Metodo sperimentale e attività di laboratorio",
    ],
  },
  "Scienze Naturali": {
    competenze: "Sviluppo di un approccio scientifico alla conoscenza attraverso Scienze della Terra, Chimica e Biologia; argomentazione rigorosa, collaborazione nella ricerca di risposte, consapevolezza critica dei rapporti tra conoscenze disciplinari e contesto storico/filosofico/tecnologico; centralità della dimensione sperimentale e laboratoriale.",
    nuclei: [
      "Biologia, Chimica e Scienze della Terra: nuclei fondanti",
      "Metodo sperimentale e didattica laboratoriale (anche virtuale)",
      "Argomentazione rigorosa e confronto di punti di vista",
      "Nessi con Fisica, Matematica e Intelligenza Artificiale",
      "Consapevolezza critica del rapporto scienza-società-tecnologia",
    ],
  },
  "Disegno e Storia dell'Arte": {
    competenze: "Approccio laboratoriale integrato tra competenze grafico-progettuali e sguardo storico-critico, sviluppato in tre fasi: Primo Biennio (fondamenti del vedere/rappresentare, geometria descrittiva, arte antica e medievale), Secondo Biennio (rappresentazione dello spazio, prospettiva, primi strumenti digitali/CAD, arte dal Rinascimento all'Ottocento), Quinto Anno (sintesi in un progetto di ricerca sul campo).",
    nuclei: [
      "Disegno dal vero e geometria descrittiva",
      "Storia dell'arte: dall'antichità al contemporaneo per fasi",
      "Strumenti digitali di base (CAD) nel secondo biennio",
      "Lettura critica di opere architettoniche e figurative",
      "Progetto di sintesi (rilievo, analisi digitale) al quinto anno",
    ],
  },
  "Storia dell'Arte": {
    competenze: "Bozza Indicazioni Licei 2026 (capitolo Storia dell'arte, comune ai licei): disciplina storica e critica che studia opere figurative, architettoniche e visive come documenti della cultura; competenze storico-critica (inquadrare autori, opere e movimenti nel contesto), di lettura e analisi (aspetti materiali, tecnici, formali, iconografici e stilistici con terminologia appropriata), interpretativa e di giudizio, e di cittadinanza attiva (tutela e valorizzazione del patrimonio, lettura critica delle immagini anche generate da IA). Secondo biennio: dalle origini classiche al Settecento; quinto anno: dall'Ottocento al contemporaneo. Nel Classico maggiore attenzione ai nessi con filosofia e fonti letterarie.",
    nuclei: [
      "Lettura e analisi dell'opera: aspetti materiali, tecnici, formali, iconografici e stilistici",
      "Contestualizzazione storico-critica di autori, opere e movimenti; percorso cronologico e tematico",
      "Sviluppo del linguaggio artistico occidentale: dalle origini classiche al Settecento (secondo biennio)",
      "Ottocento, Novecento e contemporaneo: crisi della rappresentazione, nuovi media, sistema dell'arte (quinto anno)",
      "Patrimonio del territorio, tutela e valorizzazione; lettura critica delle immagini, anche generate da IA",
    ],
  },
  "Scienze Motorie e Sportive": {
    competenze: "Consapevolezza del significato personale e sociale della pratica motoria/sportiva; capacità di progettare e realizzare azioni, interventi e programmi anche in autonomia; sviluppo di 5 dimensioni interconnesse (stili di vita attivi e sani, motoria, cognitiva, sociale, emotivo-relazionale) con uso consapevole di tecnologie digitali/IA per monitorare la performance. Nel Liceo scientifico a indirizzo sportivo l'enfasi è maggiore su pianificazione di piani di attività personali e su tecniche, tattiche e strategie sportive a livello avanzato.",
    nuclei: [
      "Stili di vita attivi e sani, cultura del movimento e della salute",
      "Competenze motorie e sportive avanzate (tecniche, tattiche, strategie)",
      "Dimensione cognitiva: conoscenze teoriche del corpo in movimento",
      "Dimensione sociale ed emotivo-relazionale: collaborazione e gestione emotiva",
      "Uso di strumenti digitali/IA per la performance e il benessere",
    ],
  },
  "Laboratorio di Musica d'Insieme": {
    competenze: "Pratica musicale d'insieme come modalità di apprendimento collaborativo (bozza Indicazioni Licei 2026): esecuzione in ensemble, coro e orchestra con ascolto reciproco, coordinazione e responsabilità individuale/collettiva; padronanza delle tecniche esecutive vocali e strumentali in contesti performativi (gesto, postura, sicurezza scenica); uso di tecnologie musicali e strumenti di IA a supporto dell'esecuzione; valore inclusivo del fare musica insieme.",
    nuclei: [
      "Esecuzione collettiva di repertori di generi, stili e tradizioni diversi (ensemble, coro, orchestra)",
      "Ascolto reciproco, concertazione e problem solving per il risultato collettivo",
      "Tecniche esecutive vocali e strumentali, postura, gesto e sicurezza scenica",
      "Studio delle partiture e integrazione di aspetti stilistici e culturali",
      "Cooperazione, inclusione e valorizzazione del contributo individuale nel gruppo",
    ],
  },
  "Tecnologie Musicali": {
    competenze: "Processi tecnologici applicati alla musica (bozza Indicazioni Licei 2026): uso di software e hardware per produzione, registrazione ed editing del suono (DAW, MIDI, sintetizzatori, campionatori), notazione digitale, sperimentazione sonora e ambienti sonori interattivi; ascolto critico della musica elettronica; principi e uso etico degli strumenti di IA applicati alla musica, con attenzione a proprietà intellettuale e diritto d'autore (AI Act).",
    nuclei: [
      "Audio digitale, MIDI, DAW e registrazione/editing del suono",
      "Sintesi e manipolazione del suono; sperimentazione di nuovi linguaggi musicali",
      "Software di notazione: lettura, scrittura e interpretazione digitale delle partiture",
      "Ambienti sonori interattivi, colonne sonore e progetti multimediali con altre arti",
      "IA applicata alla musica, proprietà intellettuale e impatto culturale delle tecnologie",
    ],
  },
  "Greco": {
    competenze: "Ricerca etimologica e analisi comparativa/contrastiva del lessico e della morfosintassi tra greco, latino, italiano e lingue straniere curricolari; comprensione e traduzione di testi in lingua originale con strategie plurali e laboratoriali, anche con supporto critico di strumenti informatici/IA; padronanza del sistema linguistico della civiltà greca antica in rapporto a coordinate spazio-temporali.",
    nuclei: [
      "Ricerca etimologica e confronto morfosintattico tra lingue",
      "Traduzione con strategie plurali e problem solving",
      "Uso critico di strumenti informatici/IA come supporto alla traduzione",
      "Letteratura greca: confronto intertestuale tra autori e opere",
      "Analisi del contesto di produzione e fruizione delle opere",
    ],
  },
  "Scienze Umane": {
    competenze: "Orientamento attraverso contenuti, linguaggi e metodi delle scienze umane nelle molteplici dimensioni della persona (esperienza di sé e dell'altro, relazioni educative e affettive, vita sociale); comprensione delle dinamiche della realtà sociale (fenomeni educativi, formazione, lavoro, interculturalità); lettura critica di almeno un testo classico di pedagogia, psicologia, sociologia o antropologia.",
    nuclei: [
      "Tipologie educative, relazionali e sociali della cultura occidentale",
      "Dinamiche della realtà sociale: educazione, lavoro, interculturalità, cittadinanza",
      "Costruzione del sé e relazioni interpersonali, anche in contesti mediati dall'IA",
      "Nuclei tematici delle scienze umane nel confronto con la realtà contemporanea",
      "Lettura critica di testi classici di pedagogia/psicologia/sociologia/antropologia",
    ],
  },
  "Scienze Umane (Sociologia e Metodologia della Ricerca)": {
    competenze: "Comprensione della complessità della persona nelle dimensioni psicologiche, relazionali, sociali, culturali e mediali; approccio scientifico all'analisi dei fenomeni umani e sociali con metodologie sia qualitative sia quantitative; progettazione e conduzione di semplici ricerche empiriche.",
    nuclei: [
      "Processi di costruzione dell'identità e dinamiche relazionali",
      "Fenomeni sociali e culturali, trasformazioni delle società contemporanee",
      "Linguaggi e metodologie di psicologia, sociologia, antropologia",
      "Progettazione di ricerche empiriche: raccolta, analisi e comunicazione dei dati",
      "Collegamento tra scienze umane e saperi giuridico-economici",
    ],
  },
  "Diritto ed Economia Politica": {
    competenze: "Comprensione del diritto e dell'economia come strumenti per interpretare le relazioni tra individui, collettività, istituzioni e sistemi produttivi; la Costituzione come paradigma interpretativo; analisi di forme di Stato/governo, istituzioni italiane/europee, teorie economiche e globalizzazione; lettura critica di dati statistici e indicatori.",
    nuclei: [
      "Norme giuridiche, categorie economiche ed evoluzione storica",
      "Costituzione, istituzioni e processi democratici",
      "Teorie economiche, trasformazioni produttive e globalizzazione",
      "Lettura e interpretazione critica di dati e indicatori economici",
      "Principi etici e giuridici dell'uso di strumenti informatici/IA",
    ],
  },
  "Diritto ed Economia dello Sport": {
    competenze: "Comprensione del diritto e dell'economia come strumenti per interpretare il fenomeno sportivo (norme, regole condivise, scelte economiche/organizzative); acquisizione del linguaggio giuridico ed economico per leggere documenti, regolamenti, contratti, bilanci sportivi; i valori costituzionali come riferimento nella pratica sportiva.",
    nuclei: [
      "Ordinamento sportivo e rapporto con l'ordinamento statale/internazionale",
      "Linguaggio giuridico-economico applicato allo sport (regolamenti, contratti, bilanci)",
      "Valori costituzionali nella pratica sportiva (uguaglianza, salute, responsabilità)",
      "Aspetti organizzativi e gestionali degli eventi sportivi",
      "Uso critico e responsabile di informazioni su piattaforme digitali sportive",
    ],
  },
  "Discipline Sportive": {
    competenze: "Conoscenza della letteratura scientifica e tecnica delle scienze motorie e sportive; principi di igiene dello sport, fisiologia dell'esercizio e prevenzione dei rischi; norme che regolano le discipline sportive per persone con disabilità e lo sport inclusivo; teorie di allenamento e strategia competitiva; capacità di arbitraggio/organizzazione di tornei.",
    nuclei: [
      "Igiene dello sport, fisiologia dell'esercizio e prevenzione dei rischi",
      "Sport per persone con disabilità e sport inclusivo",
      "Teorie di allenamento tecnico-pratico e strategia competitiva",
      "Classificazione degli sport, giuria/arbitraggio/organizzazione di gare",
      "Uso di strumenti digitali/IA in ambito motorio e sportivo",
    ],
  },
  "Prima Lingua Straniera (Inglese)": {
    competenze: "Uso prevalente e progressivamente pervasivo della lingua straniera per l'acquisizione di strategie comunicative efficaci secondo il QCER/Companion Volume; riflessione contrastiva su sistema linguistico e fenomeni culturali in ottica interculturale; uso di strumenti accessibili (sottotitoli, audiodescrizioni) e media literacy critica.",
    nuclei: [
      "Attività linguistico-comunicative secondo il QCER/Companion Volume",
      "Riflessione interculturale e valorizzazione della diversità linguistica",
      "Fruizione di testi multimediali con strumenti accessibili",
      "Media literacy e uso critico delle informazioni digitali",
      "Integrazione tra teoria e pratica linguistica",
    ],
  },
  "Seconda Lingua Straniera": {
    competenze: "Come 'Prima Lingua Straniera (Inglese)' (stesso impianto QCER/Companion Volume, stesse attività linguistico-comunicative), con livello di uscita atteso generalmente inferiore data la minore esposizione informale rispetto all'inglese.",
    nuclei: [
      "Attività linguistico-comunicative secondo il QCER/Companion Volume",
      "Riflessione interculturale e valorizzazione della diversità linguistica",
      "Fruizione di testi multimediali con strumenti accessibili",
      "Media literacy e uso critico delle informazioni digitali",
      "Educazione plurilingue: risorsa delle lingue già studiate",
    ],
  },
  "Terza Lingua Straniera": {
    competenze: "Come le altre lingue straniere (QCER/Companion Volume), con valorizzazione esplicita dell'educazione plurilingue: le lingue già studiate come risorsa preziosa nelle fasi iniziali di apprendimento della terza lingua.",
    nuclei: [
      "Attività linguistico-comunicative secondo il QCER/Companion Volume",
      "Educazione plurilingue: transfer dalle lingue già studiate",
      "Fruizione di testi multimediali con strumenti accessibili",
      "Media literacy e uso critico delle informazioni digitali",
      "Uso della lingua per contenuti di discipline non linguistiche (gradualmente)",
    ],
  },
  "Informatica": {
    competenze: "Comprensione dei concetti fondamentali dell'informatica e padronanza dei suoi strumenti per risolvere problemi, anche in connessione con altre discipline; consapevolezza di vantaggi/limiti e conseguenze sociali/culturali dell'uso di strumenti informatici; padronanza di rappresentazione/organizzazione/elaborazione dei dati e di uno o più linguaggi di programmazione.",
    nuclei: [
      "Rappresentazione, organizzazione ed elaborazione dei dati",
      "Linguaggi di programmazione per applicazioni semplici",
      "Architettura logico-funzionale di computer e reti",
      "Ricerca, interazione in rete e comunicazione multimediale",
      "Collegamenti con logica, matematica, fisica e altre scienze",
    ],
  },
  "Economia e Diritto": {
    competenze: "Padronanza del lessico di base e degli elementi costitutivi dell'economia politica, industriale e aziendale con riferimento al modello produttivo del Made in Italy e all'internazionalizzazione; competenze giuridiche applicate ai settori dell'attività d'impresa (proprietà intellettuale/industriale, marchi, denominazioni d'origine, diritto doganale ed europeo); analisi critica di fenomeni economici e giuridici anche mediati da sistemi digitali/IA.",
    nuclei: [
      "Economia politica, industriale e aziendale del sistema Made in Italy",
      "Internazionalizzazione, mercati globali e strategie d'impresa",
      "Diritto d'impresa: contratti, proprietà intellettuale/industriale, marchi",
      "Diritto europeo e internazionale degli scambi (import/export, dazi)",
      "Uso critico di dati, indicatori economici e strumenti digitali/IA",
    ],
  },
  "Storia dell'Arte e del Design": {
    competenze: "Approccio storico-contestuale che considera opera d'arte e oggetto di design nella loro integralità di manufatto, processo tecnico-produttivo, forma espressiva e documento culturale, con attenzione al sistema del Made in Italy; metodo di lettura che integra scansione cronologica e analisi materiale, tecnica, formale, iconografica e funzionale.",
    nuclei: [
      "Competenza storico-critica: autori, opere e prodotti di design nel contesto culturale/produttivo",
      "Lettura e analisi del processo: aspetti materiali, tecnici, formali, iconografici",
      "Filiera del valore del Made in Italy",
      "Osservazione diretta del patrimonio e strumenti digitali per l'analisi",
      "Percorsi tematici trasversali e confronti interculturali",
    ],
  },
  "Design e Progettazione": {
    competenze: "Voce non presente come capitolo distinto nella bozza consultata (il documento tratta il design solo dentro 'Storia dell'Arte e del Design'): sintesi basata sulla prassi consolidata dei licei del Made in Italy — laboratorio di progettazione dall'ideazione al prototipo, applicato a prodotto/moda/artigianato di eccellenza italiana. Da verificare quando disponibile una fonte specifica.",
    nuclei: [
      "Metodo progettuale: ideazione, sviluppo, prototipazione",
      "Disegno tecnico e rappresentazione (anche CAD)",
      "Materiali, tecniche produttive e sostenibilità",
      "Cultura del progetto nel sistema Made in Italy (prodotto, moda, artigianato)",
      "Comunicazione visiva del progetto (tavole, moodboard, presentazione)",
    ],
  },
  "Storia della Musica / della Danza": {
    competenze: "Comprensione dei fenomeni musicali, della loro evoluzione storica e dell'interconnessione con altri ambiti culturali; ascolto consapevole di opere della tradizione occidentale, contestualizzate storicamente (primo biennio); approfondimento cronologico di periodi/correnti/generi/stili nel secondo biennio e quinto anno, con uso di tecnologie digitali/IA per l'analisi. Fonte specifica sulla componente 'della Danza' non reperita in questo passaggio.",
    nuclei: [
      "Ascolto consapevole e lessico musicale tecnico (primo biennio)",
      "Iter cronologico: periodi, correnti, generi, stili, forme (secondo biennio-quinto anno)",
      "Contestualizzazione storico-culturale e interdisciplinare (filosofia, arte, storia)",
      "Impatto delle tecnologie di riproduzione/elaborazione del suono",
      "Analisi in chiave semiologica, sociologica e storica",
    ],
  },
  "Teoria, Analisi e Composizione / Tecniche della Danza": {
    competenze: "Acquisizione di competenze in notazione musicale, intervalli, scale, ritmica ed esercitazioni di analisi/composizione (primo biennio); approfondimento di sistemi armonici complessi e tecniche compositive avanzate (secondo biennio); forme musicali complesse (sonata, fuga) e composizione di pezzi originali con software assistiti/IA generativa (quinto anno). Fonte specifica sulla componente 'Tecniche della Danza' non reperita in questo passaggio.",
    nuclei: [
      "Notazione musicale, intervalli, scale e ritmica di base",
      "Tecniche armoniche e compositive, dal semplice al complesso",
      "Analisi formale e stilistica di brani musicali",
      "Composizione di pezzi originali, anche con software/IA generativa",
      "Forme musicali complesse (sonata, fuga) nel quinto anno",
    ],
  },
  "Esecuzione e Interpretazione / Laboratorio Coreutico": {
    competenze: "Competenze esecutive vocali/strumentali attraverso l'esperienza pratica (ascolto, esplorazione espressiva, tecnica); dal riconoscimento dell'errore e consapevolezza musicale (primo biennio) alla comprensione del significato estetico con supporto di strumenti IA per l'analisi comparativa degli stili (secondo biennio), fino alla gestione autonoma del repertorio esecutivo (quinto anno). Fonte specifica sulla componente 'Laboratorio Coreutico' non reperita in questo passaggio.",
    nuclei: [
      "Tecnica esecutiva vocale/strumentale e consapevolezza del gesto sonoro",
      "Ascolto, lettura e analisi del testo musicale",
      "Metodo di studio basato sul riconoscimento dell'errore",
      "Interpretazione e significato estetico dell'idea compositiva",
      "Gestione autonoma del repertorio e relazione con il territorio (quinto anno)",
    ],
  },
  "Discipline Pittoriche / Plastiche / Geometriche": {
    competenze: "Primo biennio propedeutico ai laboratori di indirizzo del triennio (Arti Figurative, Grafica, Scenografia, Design, Architettura): Discipline Pittoriche (uso di materiali/tecniche grafico-pittoriche, principi compositivi, disegno dal vero); Discipline Plastiche e Scultoree (costruzione della forma tridimensionale tramite volume/superficie, tecniche di modellazione e formatura); Discipline Geometriche (linguaggio della rappresentazione: proiezioni ortogonali, assonometria, prospettiva intuitiva, anche con strumenti CAD di base).",
    nuclei: [
      "Materiali e tecniche grafico-pittoriche (grafite, acquerello, tempera) e principi compositivi",
      "Costruzione della forma tridimensionale: modellazione, formatura (argilla, cera, gesso)",
      "Rappresentazione geometrica: proiezioni ortogonali, assonometria, prospettiva intuitiva",
      "Disegno/osservazione dal vero e taccuino di lavoro (visivo, geometrico, tridimensionale)",
      "Uso critico di strumenti digitali (fotografia, CAD base, modellazione/stampa 3D) accanto alla manualità",
    ],
  },
  "Laboratorio Artistico": {
    competenze: "Spazio esperienziale e orientativo del primo biennio, organizzato in moduli a rotazione (pittura, scultura, grafica, fotografia, multimedialità) per sperimentare tecniche e linguaggi dei diversi indirizzi artistici, partendo dalle pratiche e questioni dell'arte contemporanea (fumetto, illustrazione, videogioco inclusi) per risalire alle radici tecniche/concettuali nella tradizione, favorendo una scelta d'indirizzo consapevole per il triennio.",
    nuclei: [
      "Moduli a rotazione su ambiti artistici diversi (pittura, scultura, grafica, fotografia, multimedialità)",
      "Metodo critico-operativo: dall'analisi di opere/fenomeni contemporanei alla pratica",
      "Confronto tra fare manuale e processi generativi automatizzati/IA",
      "Orientamento consapevole verso gli indirizzi del triennio",
      "Costruzione di un metodo personale e di senso critico sul fare artistico",
    ],
  },
  "Storia": {
    competenze: "Sapere storico che colloca le scoperte scientifiche e le innovazioni tecnologiche in una dimensione storico-culturale ed etica; stabilire collegamenti tra tradizioni culturali locali, nazionali e internazionali; riconoscere l'interdipendenza tra fenomeni economici, sociali, istituzionali, culturali nella loro dimensione locale/globale. Fonte: Linee Guida Istituti Tecnici, area generale (comune ai settori economico e tecnologico).",
    nuclei: [
      "Nesso tra scienza, tecnologia ed economia nel corso della storia",
      "Integrazione tra storia generale/globale e storie settoriali (secondo biennio)",
      "Metodo di lavoro laboratoriale e ricerca-azione su fonti storiche",
      "Costituzione italiana e cittadinanza (in collegamento con Diritto)",
      "Consolidamento nel quinto anno con riferimento ai contesti professionali",
    ],
  },
  "Economia Aziendale": {
    competenze: "Analisi della realtà economica aziendale (previsione, organizzazione, conduzione, controllo di gestione); uso di strumenti di marketing e valutazione di prodotti/servizi con calcoli di convenienza; gestione del sistema informativo aziendale con contabilità integrata; applicazione di programmazione e controllo di gestione.",
    nuclei: [
      "Sistemi, modelli organizzativi e processi aziendali",
      "Rilevazioni aziendali e contabilità integrata",
      "Programmazione, controllo di gestione e marketing",
      "Normativa pubblicistica, civilistica e fiscale applicata all'azienda",
      "Rendicontazione sociale/ambientale e responsabilità sociale d'impresa",
    ],
  },
  "Diritto": {
    competenze: "Agire in base a un sistema di valori coerenti con i principi costituzionali; orientarsi nella normativa pubblicistica, civilistica e fiscale; analizzare valore, limiti e rischi delle soluzioni tecniche per la vita sociale (sicurezza nei luoghi di lavoro, tutela della persona/ambiente); insegnamento della Costituzione in collegamento con Storia.",
    nuclei: [
      "Diritti reali, obbligazioni e normativa civilistica di base",
      "Normativa pubblicistica e fiscale applicata alle attività aziendali",
      "Costituzione italiana e cittadinanza (in collegamento con Storia)",
      "Mercato del lavoro e gestione delle risorse umane",
      "Sicurezza nei luoghi di vita e di lavoro, tutela dell'ambiente",
    ],
  },
  "Economia Politica": {
    competenze: "Analisi dei fatti economici e generalizzazioni sui comportamenti individuali/collettivi; riconoscimento dell'interdipendenza tra fenomeni economici, sociali, istituzionali nella loro dimensione locale/globale; uso di strumenti matematici/informatici per l'analisi dei fenomeni economici e sociali.",
    nuclei: [
      "Macrofenomeni economici nazionali e internazionali",
      "Aspetti geografici, ecologici, demografici e trasformazioni economiche nel tempo",
      "Tendenze dei mercati locali, nazionali e globali",
      "Marketing e ciclo di vita dell'azienda",
      "Rendicontazione sociale/ambientale d'impresa",
    ],
  },
  "Scienze Integrate": {
    competenze: "Materia comune del primo biennio di tutti gli istituti professionali (Fisica, Chimica, Scienze della Terra, Biologia in approccio integrato): osservare, descrivere e analizzare fenomeni della realtà naturale e artificiale; riconoscere i concetti di sistema e complessità; analizzare qualitativamente/quantitativamente fenomeni legati alle trasformazioni di energia e materia.",
    soloPer: ["IP"],
    nuclei: [
      "Osservazione e analisi di fenomeni naturali e artificiali",
      "Concetti di sistema e complessità",
      "Trasformazioni di energia e materia (approccio integrato Fisica-Chimica)",
      "Scienze della Terra e Biologia: elementi di base",
      "Metodo scientifico e attività laboratoriale",
    ],
  },
  "Diritto ed Economia": {
    competenze: "Materia comune del primo biennio di tutti gli istituti professionali: principi fondamentali del diritto (Costituzione, diritti/doveri del cittadino) e dell'economia (bisogni, beni, mercato, imprese); primo approccio al lessico giuridico-economico applicato a contesti quotidiani e al settore professionale di riferimento.",
    soloPer: ["IP"],
    nuclei: [
      "Costituzione italiana e principi fondamentali del diritto",
      "Diritti e doveri del cittadino, cittadinanza attiva",
      "Elementi di base dell'economia (bisogni, beni, mercato)",
      "Il sistema impresa e il mondo del lavoro",
      "Lessico giuridico-economico applicato al settore professionale",
    ],
  },
  "Discipline Turistiche e Aziendali": {
    competenze: "Uso di reti/strumenti informatici e del sistema informativo aziendale nel settore turistico; strumenti di marketing e valutazione di prodotti/servizi turistici con calcoli di convenienza; gestione delle rilevazioni aziendali con contabilità integrata specifica per il turismo.",
    nuclei: [
      "Sistemi e processi di gestione delle imprese turistiche",
      "Marketing e progettazione di servizi/prodotti turistici",
      "Contabilità integrata specifica per il settore turistico",
      "Normativa pubblicistica, civilistica e fiscale del settore turistico",
      "Mercato del lavoro e gestione del personale nell'impresa turistica",
    ],
  },
  "Diritto e Legislazione Turistica": {
    competenze: "Orientamento nella normativa pubblicistica, civilistica e fiscale applicata al settore turistico; conoscenza di obbligazioni/contratti tipici del turismo, disciplina della concorrenza, normativa tributaria e sulla qualità dell'impresa turistica; nel quinto anno: istituzioni locali/nazionali/internazionali, beni culturali/ambientali, commercio elettronico, tutela del consumatore.",
    nuclei: [
      "Contratti e disciplina giuridica delle imprese turistiche",
      "Diritto tributario del settore turistico",
      "Normativa sul lavoro nel settore turistico",
      "Beni culturali/ambientali e tutela del consumatore (quinto anno)",
      "Sicurezza e trattamento dei dati personali nel contesto turistico",
    ],
  },
  "Arte e Territorio": {
    competenze: "Riconoscimento degli aspetti geografici, ecologici, territoriali dell'ambiente naturale e antropico e delle loro trasformazioni storiche; collegamenti tra tradizioni culturali locali/nazionali/internazionali; valorizzazione dei beni artistici e ambientali per il turismo integrato e sostenibile.",
    nuclei: [
      "Patrimonio culturale e territoriale in chiave turistica",
      "Strategie di sviluppo del turismo integrato e sostenibile",
      "Progettazione e presentazione di servizi/prodotti turistici legati al territorio",
      "Confronto diacronico/sincronico tra epoche e aree geografico-culturali",
      "Fruizione e valorizzazione dei beni artistici e ambientali",
    ],
  },
  "Meccanica, Macchine ed Energia": {
    competenze: "Progettazione di strutture/apparati/sistemi con analisi delle risposte a sollecitazioni meccaniche/termiche/elettriche; progettazione, assemblaggio, collaudo e manutenzione di componenti/macchine/sistemi termotecnici; gestione di processi di manutenzione per sistemi di trasporto; consapevolezza delle implicazioni etiche/sociali/ambientali dell'innovazione tecnologica.",
    nuclei: [
      "Progettazione di strutture e sistemi meccanici/termici/elettrici",
      "Assemblaggio, collaudo e manutenzione di macchine e sistemi termotecnici",
      "Sicurezza nei luoghi di vita e di lavoro, tutela dell'ambiente",
      "Gestione per progetti ed efficacia/efficienza/qualità del lavoro",
      "Normativa dei processi produttivi del settore meccanico-energetico",
    ],
  },
  "Sistemi e Automazione": {
    competenze: "Definizione, classificazione e programmazione di sistemi di automazione integrata e robotica applicata ai processi produttivi; intervento nelle fasi del processo produttivo con strumenti di progettazione/documentazione/controllo; applicazione dei principi di organizzazione e controllo dei processi produttivi.",
    nuclei: [
      "Automazione integrata e robotica applicata ai processi produttivi",
      "Sistemi digitali e reti logiche",
      "Progettazione, documentazione e controllo del processo produttivo",
      "Sicurezza e normativa dei processi produttivi",
      "Redazione di relazioni tecniche e documentazione di attività",
    ],
  },
  "Tecnologie Meccaniche di Processo e di Prodotto": {
    competenze: "Individuazione delle proprietà dei materiali in relazione a impiego/processi/trattamenti; misura ed elaborazione di grandezze e caratteristiche tecniche; organizzazione del processo produttivo (realizzazione, controllo, collaudo); gestione di progetti secondo standard di qualità e sicurezza.",
    nuclei: [
      "Proprietà dei materiali e trattamenti tecnologici",
      "Misura e strumentazione tecnica",
      "Organizzazione, controllo e collaudo del processo produttivo",
      "Sistemi aziendali di qualità e sicurezza",
      "Innovazione tecnologica applicata ai processi produttivi",
    ],
  },
  "Disegno, Progettazione e Organizzazione Industriale": {
    competenze: "Documentazione e gestione dei processi di industrializzazione; innovazione di processi correlati a funzioni aziendali; gestione di progetti secondo standard di qualità/sicurezza; organizzazione del processo produttivo (realizzazione, controllo, collaudo).",
    nuclei: [
      "Disegno tecnico e documentazione di progetto",
      "Processi di industrializzazione e funzioni aziendali",
      "Organizzazione, controllo e collaudo del processo produttivo",
      "Sistemi aziendali di qualità e sicurezza",
      "Gestione per progetti nell'ambito industriale",
    ],
  },
  "Scienze della Navigazione, Struttura e Costruzione del Mezzo": {
    competenze: "Identificazione/comparazione di tipologie e funzioni dei mezzi e sistemi di trasporto; interazione con sistemi di assistenza/sorveglianza/monitoraggio del traffico; gestione degli spazi a bordo e dei servizi di carico/scarico; organizzazione del trasporto in relazione a sicurezza e condizioni ambientali/meteorologiche. Per i titoli professionali marittimi: nel rispetto delle normative STCW78/95 e direttiva 2008/106/CE.",
    nuclei: [
      "Tipologie e funzioni dei mezzi e sistemi di trasporto",
      "Sistemi di assistenza, sorveglianza e monitoraggio del traffico",
      "Gestione degli spazi a bordo e dei servizi di carico/scarico merci e passeggeri",
      "Sicurezza degli spostamenti e interazione con l'ambiente esterno",
      "Normative nazionali e internazionali per i titoli professionali marittimi",
    ],
  },
  "Meccanica e Macchine": {
    competenze: "Controllo e gestione del funzionamento dei componenti di un mezzo di trasporto, con programmazione della manutenzione; gestione dell'attività di trasporto tenendo conto delle interazioni con l'ambiente esterno; cooperazione nelle attività di piattaforma per la gestione di merci/servizi/flussi passeggeri.",
    nuclei: [
      "Funzionamento e manutenzione dei componenti del mezzo di trasporto",
      "Gestione dell'attività di trasporto e condizioni ambientali",
      "Attività di piattaforma: merci, servizi tecnici, flussi passeggeri",
      "Sistema qualità e normative sulla sicurezza",
      "Gestione per progetti nell'ambito dei trasporti",
    ],
  },
  "Logistica": {
    competenze: "Interazione con i sistemi di assistenza/sorveglianza/monitoraggio del traffico; cooperazione nelle attività di piattaforma per la gestione di merci/servizi/flussi passeggeri; organizzazione del trasporto in relazione a motivazioni del viaggio e sicurezza; concetti di economia e organizzazione dei processi produttivi e dei servizi.",
    nuclei: [
      "Sistemi di monitoraggio e comunicazioni nel trasporto",
      "Gestione di piattaforme logistiche (merci, servizi, passeggeri)",
      "Organizzazione del trasporto e sicurezza degli spostamenti",
      "Economia e organizzazione dei processi produttivi e dei servizi",
      "Sistema qualità e normative sulla sicurezza",
    ],
  },
  "Diritto e Legislazione Nautica": {
    competenze: "Adattato da 'Diritto ed Economia' dell'indirizzo Trasporti e Logistica (fonte non specifica per la denominazione 'nautica' usata da pei-gradi.js): valutazione di fatti e comportamenti secondo i principi costituzionali; concetti di economia e organizzazione dei processi produttivi/servizi di trasporto; normativa di settore con attenzione a sicurezza e tutela dell'ambiente/territorio.",
    nuclei: [
      "Costituzione e principi giuridici applicati al settore dei trasporti",
      "Normativa di settore: sicurezza, ambiente, territorio",
      "Economia e organizzazione dei processi produttivi e dei servizi",
      "Sistema qualità e gestione delle attività secondo normative di sicurezza",
      "Tipologie e funzioni dei mezzi e sistemi di trasporto",
    ],
  },
  "Tecnologie e Progettazione di Sistemi Elettrici ed Elettronici": {
    competenze: "Uso della strumentazione di laboratorio e metodi di misura per verifiche/controlli/collaudi; gestione di progetti e processi produttivi correlati a funzioni aziendali; approfondimento di progettazione, realizzazione e gestione di sistemi e circuiti elettronici.",
    nuclei: [
      "Strumentazione di laboratorio e metodi di misura",
      "Progettazione e realizzazione di sistemi e circuiti elettronici",
      "Gestione di progetti e processi produttivi aziendali",
      "Sicurezza nei luoghi di vita e di lavoro, tutela dell'ambiente",
      "Redazione di relazioni tecniche e documentazione",
    ],
  },
  "Elettrotecnica ed Elettronica": {
    competenze: "Applicazione dei procedimenti dell'elettrotecnica e dell'elettronica nello studio/progettazione di impianti e apparecchiature elettriche/elettroniche; uso della strumentazione di laboratorio per verifiche/controlli/collaudi; analisi di tipologie e caratteristiche tecniche di macchine elettriche e apparecchiature elettroniche.",
    nuclei: [
      "Procedimenti dell'elettrotecnica e dell'elettronica",
      "Progettazione di impianti e apparecchiature elettriche/elettroniche",
      "Strumentazione di laboratorio, misure, verifiche e collaudi",
      "Macchine elettriche e apparecchiature elettroniche",
      "Organizzazione e controllo dei processi produttivi",
    ],
  },
  "Sistemi Automatici": {
    competenze: "Uso della strumentazione di laboratorio e metodi di misura; uso di linguaggi di programmazione a diversi livelli per ambiti specifici; analisi del funzionamento, progettazione e implementazione di sistemi automatici.",
    nuclei: [
      "Linguaggi di programmazione per l'automazione",
      "Progettazione e implementazione di sistemi automatici",
      "Strumentazione di laboratorio, misure, verifiche e collaudi",
      "Sicurezza e implicazioni etiche/sociali dell'innovazione tecnologica",
      "Organizzazione e controllo dei processi produttivi",
    ],
  },
  "Sistemi e Reti": {
    competenze: "Configurazione, installazione e gestione di sistemi di elaborazione dati e reti; scelta di dispositivi/strumenti in base alle caratteristiche funzionali; descrizione e confronto del funzionamento di dispositivi elettronici e di telecomunicazione; gestione di progetti secondo standard di qualità e sicurezza.",
    nuclei: [
      "Configurazione, installazione e gestione di sistemi di elaborazione dati e reti",
      "Scelta di dispositivi e strumenti in base a caratteristiche funzionali",
      "Sicurezza nei luoghi di vita e di lavoro, tutela dell'ambiente",
      "Sistemi aziendali di gestione della qualità e della sicurezza",
      "Reti e strumenti informatici per studio e ricerca disciplinare",
    ],
  },
  "Telecomunicazioni": {
    competenze: "Scelta di dispositivi/strumenti in base alle caratteristiche funzionali; descrizione e confronto del funzionamento di dispositivi elettronici e di telecomunicazione; uso di linguaggi settoriali delle lingue straniere per interagire in contesti di studio/lavoro; gestione di progetti secondo standard di qualità e sicurezza.",
    nuclei: [
      "Dispositivi e strumenti elettronici e di telecomunicazione",
      "Linguaggi settoriali delle lingue straniere applicati al settore",
      "Comunicazione e team working in contesti professionali",
      "Sistemi aziendali di gestione della qualità e della sicurezza",
      "Redazione di relazioni tecniche e documentazione",
    ],
  },
  "Tecnologie e Progettazione di Sistemi Informatici e di Telecomunicazioni": {
    competenze: "Sviluppo di applicazioni informatiche per reti locali o servizi a distanza; scelta di dispositivi/strumenti in base alle caratteristiche funzionali; configurazione/installazione/gestione di sistemi di elaborazione dati e reti; realizzazione di un progetto tecnologico in cooperazione con le altre discipline di indirizzo (specialmente al quinto anno).",
    nuclei: [
      "Sviluppo di applicazioni informatiche per reti locali o servizi a distanza",
      "Progetto tecnologico interdisciplinare (quinto anno)",
      "Configurazione e gestione di sistemi di elaborazione dati e reti",
      "Sistemi aziendali di gestione della qualità e della sicurezza",
      "Gestione di processi produttivi correlati a funzioni aziendali",
    ],
  },
  "Progettazione Multimediale": {
    competenze: "Individuazione e uso delle forme di comunicazione visiva e multimediale (anche in rete); progettazione e realizzazione di prodotti di comunicazione fruibili su diversi canali; uso di pacchetti informatici dedicati; progettazione, realizzazione e pubblicazione di contenuti per il web.",
    nuclei: [
      "Comunicazione visiva e multimediale su diversi canali",
      "Progettazione e gestione di comunicazione grafica e multimediale",
      "Produzione e pubblicazione di contenuti per il web",
      "Pacchetti informatici dedicati alla grafica",
      "Gestione per progetti e lavoro di gruppo",
    ],
  },
  "Tecnologie dei Processi di Produzione": {
    competenze: "Programmazione ed esecuzione delle operazioni delle diverse fasi dei processi di produzione grafica; gestione di progetti/processi secondo standard di qualità e sicurezza; concetti di economia e organizzazione dei processi produttivi e dei servizi.",
    nuclei: [
      "Fasi dei processi di produzione grafica",
      "Sistemi aziendali di gestione della qualità e della sicurezza",
      "Economia e organizzazione dei processi produttivi e dei servizi",
      "Sicurezza nei luoghi di lavoro, tutela della persona/ambiente",
      "Redazione di relazioni tecniche e documentazione",
    ],
  },
  "Organizzazione e Gestione dei Processi Produttivi": {
    competenze: "Applicazione dei principi di organizzazione/gestione/controllo dei processi produttivi (quinto anno); analisi e monitoraggio delle esigenze del mercato dei settori di riferimento; gestione di progetti secondo standard di qualità e sicurezza.",
    nuclei: [
      "Organizzazione di un'azienda grafica o audiovisiva",
      "Gestione e controllo dei processi produttivi",
      "Analisi del mercato del settore grafico/audiovisivo",
      "Aspetti organizzativi ed economici dell'attività produttiva",
      "Sistemi aziendali di gestione della qualità e della sicurezza",
    ],
  },
  "Chimica Analitica e Strumentale": {
    competenze: "Acquisizione dati ed espressione qualitativa/quantitativa dei risultati di osservazioni attraverso grandezze fondamentali/derivate; uso di concetti/principi/modelli della chimica fisica per interpretare struttura e trasformazioni dei sistemi; elaborazione di progetti chimici/biotecnologici e gestione di attività di laboratorio, nel rispetto delle normative su protezione ambientale e sicurezza.",
    nuclei: [
      "Misura e analisi strumentale di grandezze chimico-fisiche",
      "Concetti e modelli della chimica fisica",
      "Progetti chimici e biotecnologici in laboratorio",
      "Normative su protezione ambientale e sicurezza",
      "Redazione di relazioni tecniche e documentazione",
    ],
  },
  "Chimica Organica e Biochimica": {
    competenze: "Acquisizione dati ed espressione qualitativa/quantitativa dei risultati di osservazioni attraverso grandezze fondamentali/derivate; uso di concetti/principi/modelli della chimica per interpretare struttura e trasformazioni di sistemi organici e biochimici; elaborazione di progetti chimici/biotecnologici e gestione di attività di laboratorio, nel rispetto delle normative su protezione ambientale e sicurezza.",
    nuclei: [
      "Struttura e trasformazioni di sistemi organici e biochimici",
      "Concetti e modelli della chimica organica",
      "Progetti chimici e biotecnologici in laboratorio",
      "Normative su protezione ambientale e sicurezza",
      "Redazione di relazioni tecniche e documentazione",
    ],
  },
  "Biologia, Microbiologia e Tecnologie di Controllo Ambientale": {
    competenze: "Riconoscimento degli aspetti geografici/ecologici/territoriali dell'ambiente naturale e antropico e delle loro trasformazioni; acquisizione dati ed espressione qualitativa/quantitativa dei risultati sperimentali; elaborazione di progetti chimici/biotecnologici e gestione di attività di laboratorio, nel rispetto delle normative su protezione ambientale e sicurezza.",
    nuclei: [
      "Aspetti geografici, ecologici e territoriali dell'ambiente",
      "Microbiologia e tecnologie di controllo ambientale",
      "Attività sperimentali e di laboratorio",
      "Normative su protezione ambientale e sicurezza",
      "Redazione di relazioni tecniche e documentazione",
    ],
  },
  "Economia e Marketing nel Sistema Moda": {
    competenze: "Adattato dalla fonte 'Economia e Marketing delle Aziende di Moda': visione sistemica dell'azienda e intervento nei diversi segmenti della filiera moda; riconoscimento e confronto di strategie aziendali (in particolare di marketing) per aziende del sistema moda; concetti di economia e organizzazione dei processi produttivi e dei servizi.",
    nuclei: [
      "Filiera della moda: segmenti, prodotti intermedi e finali",
      "Strategie aziendali e di marketing nel sistema moda",
      "Disciplina giuridica dell'impresa e strutture organizzative aziendali",
      "Gruppi aziendali, poli del lusso, segni distintivi di moda",
      "Economia e organizzazione dei processi produttivi e dei servizi",
    ],
  },
  "Tecnologie Applicate ai Materiali e ai Processi Produttivi Tessili": {
    competenze: "Adattato dalla fonte 'Tecnologie dei Materiali e dei Processi Produttivi e Organizzativi della Moda': individuazione dei processi della filiera tessile e dei prodotti intermedi/finali; analisi del funzionamento delle macchine operanti nella filiera con calcoli sui cicli produttivi; applicazione dei principi di organizzazione/gestione/controllo dei processi produttivi tessili.",
    nuclei: [
      "Processi della filiera tessile: segmenti e specifiche di prodotto",
      "Macchine e cicli produttivi tessili",
      "Organizzazione, gestione e controllo dei processi produttivi",
      "Sicurezza nei luoghi di lavoro, tutela della persona/ambiente",
      "Strumenti matematico-statistici applicati ai processi tessili",
    ],
  },
  "Progettazione Tessile-Abbigliamento, Moda e Costume": {
    competenze: "Adattato dalla fonte 'Ideazione Progettazione e Industrializzazione dei Prodotti Moda': astrazione di topos letterari/artistici per ideare messaggi di moda; analisi della storia della moda del Novecento; progettazione di prodotti/collezioni con software dedicati; visione sistemica dell'azienda e della filiera moda.",
    nuclei: [
      "Storia della moda (in particolare del XX secolo)",
      "Ideazione e progettazione di prodotti e collezioni",
      "Software dedicati per la progettazione tessile/moda",
      "Comunicazione visiva e multimediale nel settore moda",
      "Filiera moda: processi, segmenti e specifiche di prodotto",
    ],
  },
  "Produzioni Vegetali": {
    competenze: "Organizzazione di attività produttive ecocompatibili nel comparto vegetale; gestione di attività produttive/trasformative valorizzando qualità, tracciabilità e sicurezza; interpretazione e applicazione delle normative comunitarie/nazionali/regionali sulle attività agricole integrate; valorizzazione dei prodotti agroalimentari legati al territorio.",
    nuclei: [
      "Tecniche di produzione vegetale ecocompatibili",
      "Qualità, tracciabilità e sicurezza dei prodotti",
      "Normativa comunitaria/nazionale/regionale sulle attività agricole",
      "Valorizzazione dei prodotti agroalimentari del territorio",
      "Gestione per progetti in ambito agrario",
    ],
  },
  "Produzioni Animali": {
    competenze: "Organizzazione di attività produttive ecocompatibili nel comparto zootecnico; gestione di attività produttive/trasformative valorizzando qualità, tracciabilità e sicurezza; interpretazione e applicazione delle normative comunitarie/nazionali/regionali sulle attività agricole integrate; valorizzazione dei prodotti agroalimentari legati al territorio.",
    nuclei: [
      "Tecniche di produzione zootecnica ecocompatibili",
      "Qualità, tracciabilità e sicurezza dei prodotti",
      "Normativa comunitaria/nazionale/regionale sulle attività agricole",
      "Valorizzazione dei prodotti agroalimentari del territorio",
      "Gestione per progetti in ambito agrario",
    ],
  },
  "Trasformazione dei Prodotti": {
    competenze: "Uso di modelli appropriati per indagare fenomeni e interpretare dati sperimentali; gestione di attività produttive/trasformative valorizzando qualità, tracciabilità e sicurezza; interpretazione e applicazione delle normative comunitarie/nazionali/regionali; realizzazione di attività promozionali per i prodotti agroalimentari.",
    nuclei: [
      "Processi di trasformazione dei prodotti agroalimentari",
      "Qualità, tracciabilità e sicurezza alimentare",
      "Normativa comunitaria/nazionale/regionale sulle attività agricole integrate",
      "Valorizzazione promozionale dei prodotti legati al territorio",
      "Redazione di relazioni tecniche e documentazione",
    ],
  },
  "Gestione dell'Ambiente e del Territorio": {
    competenze: "Riconoscimento degli aspetti geografici/ecologici/territoriali dell'ambiente naturale e antropico; identificazione e descrizione delle caratteristiche dei contesti ambientali; organizzazione di attività produttive ecocompatibili; riconoscimento del valore dei beni artistici/ambientali per la loro fruizione e valorizzazione.",
    nuclei: [
      "Caratteristiche e analisi dei contesti ambientali",
      "Attività produttive ecocompatibili",
      "Beni artistici e ambientali: fruizione e valorizzazione",
      "Normativa comunitaria/nazionale/regionale sull'ambiente e il territorio",
      "Modelli di indagine e interpretazione di dati sperimentali",
    ],
  },
  "Economia Agraria e dello Sviluppo Rurale": {
    competenze: "Adattato dalla fonte 'Economia, Estimo, Marketing e Legislazione': rilevazione contabile dei capitali aziendali e bilanci aziendali; elaborazione di stime di valore, analisi costi-benefici e valutazione di impatto ambientale; interpretazione delle normative agricole comunitarie/nazionali/regionali; valorizzazione promozionale dei prodotti agroalimentari.",
    nuclei: [
      "Contabilità aziendale, bilanci e indici di efficienza in agricoltura",
      "Estimo: stime di valore e analisi costi-benefici",
      "Valutazione di impatto ambientale",
      "Normativa comunitaria/nazionale/regionale sulle attività agricole",
      "Economia e organizzazione dei processi produttivi e dei servizi",
    ],
  },
  "Gestione del Cantiere e Sicurezza dell'Ambiente di Lavoro": {
    competenze: "Orientamento nella normativa sui processi produttivi del settore edile, con attenzione a sicurezza e tutela ambientale/territoriale; organizzazione e conduzione di cantieri mobili nel rispetto delle normative sulla sicurezza; applicazione dei principi di organizzazione/gestione/controllo dei processi produttivi.",
    nuclei: [
      "Organizzazione del cantiere e utilizzo delle macchine",
      "Normativa su sicurezza e prevenzione infortuni/incendi nei cantieri",
      "Piani di sicurezza e coordinamento",
      "Documenti di controllo sanitario",
      "Economia e organizzazione dei processi produttivi edili",
    ],
  },
  "Progettazione, Costruzioni e Impianti": {
    competenze: "Selezione dei materiali da costruzione in rapporto a impiego e lavorazione; applicazione delle metodologie di progettazione/valutazione/realizzazione di costruzioni e manufatti (anche risparmio energetico); uso di strumenti per la restituzione grafica di progetti e rilievi.",
    nuclei: [
      "Materiali da costruzione: proprietà e classificazione",
      "Progettazione, valutazione e realizzazione di costruzioni",
      "Risparmio energetico nell'edilizia",
      "Restituzione grafica di progetti e rilievi",
      "Gestione per progetti e documentazione tecnica",
    ],
  },
  "Geopedologia, Economia ed Estimo": {
    competenze: "Tutela, salvaguardia e valorizzazione delle risorse del territorio e dell'ambiente; operazioni di estimo in ambito privato/pubblico (edilizia e territorio); gestione della manutenzione ordinaria e dell'esercizio di organismi edilizi; concetti di economia e organizzazione dei processi produttivi.",
    nuclei: [
      "Processi geomorfici e formazione del suolo",
      "Estimo: stime di valore in ambito edilizio e territoriale",
      "Tutela e valorizzazione delle risorse del territorio",
      "Manutenzione ordinaria di organismi edilizi",
      "Economia e organizzazione dei processi produttivi",
    ],
  },
  "Topografia": {
    competenze: "Rilevamento del territorio, delle aree libere e dei manufatti con metodologie/strumentazioni adeguate ed elaborazione dei dati; uso di strumenti per la restituzione grafica di progetti e rilievi; organizzazione e conduzione di cantieri mobili nel rispetto delle normative sulla sicurezza.",
    nuclei: [
      "Rilievo del territorio e dei manufatti",
      "Elaborazione dati topografici e restituzione grafica",
      "Strumenti matematico-statistici applicati alla topografia",
      "Sicurezza nei cantieri mobili",
      "Redazione di relazioni tecniche e documentazione",
    ],
  },
  "Scienze e Tecnologie Agrarie": {
    competenze: "Sintetizzato dal Regolamento D.Lgs. 61/2017 (competenze in uscita per indirizzo, organizzate per assi culturali anziché per singola disciplina): riconoscimento dell'ambiente territoriale di riferimento e delle principali specie vegetali coltivate; gestione di soluzioni tecniche di produzione/trasformazione conformi alla normativa nazionale/comunitaria sulla qualità dei prodotti.",
    nuclei: [
      "Ambiente territoriale di riferimento ed ecologia/pedologia",
      "Caratteristiche botaniche delle coltivazioni erbacee, arboree e forestali",
      "Ciclo dell'acqua e gestione delle risorse idriche",
      "Normativa nazionale e comunitaria sulla qualità dei prodotti",
      "Metodi di produzione e trasformazione agraria",
    ],
  },
  "Produzioni Vegetali e Animali": {
    competenze: "Sintetizzato dal Regolamento D.Lgs. 61/2017: identificazione delle specie e avversità delle piante (coltivazioni erbacee) e delle problematiche legate ai pesticidi; gestione di sistemi di allevamento e acquacoltura garantendo benessere animale e qualità delle produzioni.",
    nuclei: [
      "Tecniche delle produzioni vegetali (coltivazioni erbacee, arboree, forestali)",
      "Principali avversità delle piante e uso dei pesticidi",
      "Sistemi di allevamento e benessere animale",
      "Acquacoltura e qualità delle produzioni zootecniche",
      "Filiera agroalimentare e tecniche di trasformazione",
    ],
  },
  "Biologia Marina e Acquacoltura": {
    competenze: "Sintetizzato dal Profilo Educativo Culturale e Professionale (P.E.Cu.P.) D.Lgs. 61/2017: conoscenza della biologia delle specie ittiche e della chimica delle acque; tecniche di allevamento, conservazione e trasformazione dei prodotti ittici; normativa internazionale/comunitaria/nazionale su pesca marittima e acquacoltura.",
    nuclei: [
      "Biologia delle specie ittiche e degli ecosistemi acquatici",
      "Chimica delle acque e parametri ambientali per l'acquacoltura",
      "Tecniche di allevamento, conservazione e trasformazione dei prodotti ittici",
      "Normativa internazionale, comunitaria e nazionale sulla pesca e l'acquacoltura",
      "Ecologia applicata alla pesca e all'acquacoltura",
    ],
  },
  "Tecnologie della Pesca": {
    competenze: "Sintetizzato dal Profilo Educativo Culturale e Professionale (P.E.Cu.P.) D.Lgs. 61/2017: gestione e conduzione dell'imbarcazione da pesca e manutenzione di attrezzature/impianti; tecniche di pesca sostenibile; logistica e filiera produttiva ittica nel rispetto della normativa di settore.",
    nuclei: [
      "Conduzione e gestione dell'imbarcazione da pesca",
      "Manutenzione di attrezzature e impianti per la pesca",
      "Tecniche di pesca sostenibile",
      "Logistica e filiera produttiva del settore ittico",
      "Normativa marittima e di settore",
    ],
  },
  "Tecnologie Applicate ai Materiali e ai Processi Produttivi": {
    competenze: "Sintetizzato dal Profilo Educativo Culturale e Professionale (P.E.Cu.P.) D.Lgs. 61/2017: conoscenza delle proprietà dei materiali (naturali e artificiali) e dei processi di lavorazione, realizzazione, assemblaggio di prodotti industriali/artigianali del Made in Italy; scelta di tecniche e materiali in funzione del prodotto da realizzare.",
    nuclei: [
      "Proprietà e classificazione dei materiali per la produzione industriale/artigianale",
      "Processi di lavorazione, realizzazione e assemblaggio del prodotto",
      "Tecniche produttive del settore Made in Italy",
      "Sicurezza e norme tecniche nei processi produttivi",
      "Qualità e controllo del prodotto finito",
    ],
  },
  "Progettazione e Rappresentazione Grafica": {
    competenze: "Sintetizzato dal Profilo Educativo Culturale e Professionale (P.E.Cu.P.) D.Lgs. 61/2017: ideazione e progettazione di prodotti industriali/artigianali; uso del disegno tecnico e di strumenti di visualizzazione digitale per rappresentare il prodotto dall'ideazione alla realizzazione.",
    nuclei: [
      "Ideazione e progettazione di prodotti industriali/artigianali",
      "Disegno tecnico e rappresentazione grafica",
      "Strumenti digitali di visualizzazione e progettazione (CAD)",
      "Comunicazione visiva del progetto",
      "Rapporto tra progetto, materiali e processo produttivo",
    ],
  },
  "Tecnologie Meccaniche, Elettriche ed Elettroniche": {
    competenze: "Adattato dalla fonte 'Tecnologie Meccaniche e Applicazioni' (ordinamento previgente, tematiche corrispondenti): uso di strumenti/tecnologie specifiche nel rispetto della normativa sulla sicurezza; individuazione di componenti e materiali per montaggio/sostituzione; uso di strumenti di misura, controllo e diagnosi per la regolazione di sistemi e impianti.",
    nuclei: [
      "Componenti, materiali e strumenti tecnologici (meccanici, elettrici, elettronici)",
      "Strumenti di misura, controllo e diagnosi",
      "Normativa sulla sicurezza nei luoghi di lavoro",
      "Documentazione tecnica per la funzionalità di apparecchiature e impianti",
      "Organizzazione e controllo di qualità dei processi",
    ],
  },
  "Manutenzione di Impianti e Apparati": {
    competenze: "Adattato dalla fonte 'Tecnologie e Tecniche di Installazione e di Manutenzione' (ordinamento previgente, tematiche corrispondenti): uso della documentazione tecnica per garantire la funzionalità di apparecchiature/impianti/sistemi; messa a punto, collaudo e installazione di impianti e macchine; gestione delle esigenze del committente con risorse tecniche efficaci.",
    nuclei: [
      "Installazione, collaudo e messa a punto di impianti e macchine",
      "Manutenzione ordinaria e straordinaria di apparecchiature e sistemi",
      "Documentazione tecnica e normativa sulla sicurezza",
      "Diagnosi e risoluzione di problemi tecnici",
      "Gestione del rapporto con il committente e controllo di qualità",
    ],
  },
  "Tecnologie Ambientali": {
    competenze: "Sintetizzato dal Profilo Educativo Culturale e Professionale (P.E.Cu.P.) D.Lgs. 61/2017: conoscenza di processi e impianti per la tutela e il risanamento del territorio; gestione delle risorse idriche e ambientali (acque sotterranee, superficiali, marine); tecniche di controllo e prevenzione ambientale.",
    nuclei: [
      "Processi e impianti per la tutela e il risanamento del territorio",
      "Risorse idriche e ambientali (acque sotterranee, superficiali, marine)",
      "Tecniche di controllo e prevenzione ambientale",
      "Gestione dei rifiuti e sicurezza ambientale",
      "Normativa ambientale e territoriale",
    ],
  },
  "Gestione e Trattamento delle Acque": {
    competenze: "Sintetizzato dal Profilo Educativo Culturale e Professionale (P.E.Cu.P.) D.Lgs. 61/2017: tecniche operative per la gestione delle reti idriche e fognarie; competenze tecnico-professionali per operare in sicurezza nella gestione delle acque e negli impianti di depurazione/risanamento.",
    nuclei: [
      "Reti idriche e fognarie: gestione e manutenzione",
      "Impianti di depurazione e trattamento delle acque",
      "Sicurezza nella gestione delle acque e degli impianti",
      "Normativa sulla gestione delle risorse idriche",
      "Tecniche di risanamento ambientale",
    ],
  },
  "Tecniche di Comunicazione": {
    competenze: "Uso del patrimonio lessicale/espressivo dell'italiano in contesti sociali/culturali/economici/tecnologici; sviluppo di qualità relazionali, comunicative e di ascolto; interazione nel sistema azienda e nella gestione commerciale/marketing; produzione di strumenti di comunicazione visiva e multimediale.",
    nuclei: [
      "Comunicazione professionale e relazione con il cliente (customer satisfaction)",
      "Sistema azienda e strutture organizzative",
      "Marketing e realizzazione di prodotti pubblicitari",
      "Comunicazione visiva e multimediale (anche in rete)",
      "Comunicazione e team working in contesti professionali",
    ],
  },
  "Informatica e Laboratorio": {
    competenze: "Uso di reti e strumenti informatici per studio/ricerca/approfondimento disciplinare; produzione di strumenti di comunicazione visiva e multimediale; svolgimento di rilevazioni aziendali con strumenti tecnologici e software di settore; interazione con il sistema informativo aziendale.",
    nuclei: [
      "Sistemi informatici, dati e loro codifica",
      "Architettura e componenti di un computer, sistema operativo",
      "Software di utilità e gestionali per il settore commerciale",
      "Comunicazione visiva e multimediale",
      "Sistema informativo aziendale e strumenti telematici",
    ],
  },
  "Diritto e Tecniche Amministrative": {
    competenze: "Sintetizzato dal Profilo Educativo Culturale e Professionale (P.E.Cu.P.) D.Lgs. 61/2017: conoscenza della normativa che regola le attività ricettive e ristorative (contratti, sicurezza alimentare, licenze); tecniche amministrative e contabili applicate alla gestione di strutture enogastronomiche/alberghiere.",
    nuclei: [
      "Normativa del settore ricettivo e ristorativo",
      "Contratti e licenze per attività enogastronomiche/alberghiere",
      "Tecniche amministrative e contabili di settore",
      "Sicurezza alimentare e normativa igienico-sanitaria",
      "Gestione economica di strutture ricettive",
    ],
  },
  "Scienze e Culture dell'Alimentazione": {
    competenze: "Sintetizzato dal Profilo Educativo Culturale e Professionale (P.E.Cu.P.) D.Lgs. 61/2017: conoscenza degli alimenti sotto il profilo nutrizionale/organolettico/gastronomico; principi di alimentazione equilibrata e diete speciali; tradizioni gastronomiche locali/nazionali/internazionali.",
    nuclei: [
      "Composizione e valore nutrizionale degli alimenti",
      "Alimentazione equilibrata e diete speciali",
      "Sicurezza e igiene alimentare",
      "Tradizioni gastronomiche locali, nazionali e internazionali",
      "Abbinamento cibo-bevande",
    ],
  },
  "Laboratorio di Cucina / Sala e Vendita / Accoglienza Turistica": {
    competenze: "Uso di tecniche di lavorazione e strumenti gestionali per servizi/prodotti enogastronomici, ristorativi e di accoglienza turistico-alberghiera; valorizzazione delle tradizioni locali/nazionali/internazionali; controllo degli alimenti sotto il profilo organolettico/gastronomico; predisposizione di menu coerenti con contesto e clientela (anche esigenze dietologiche).",
    nuclei: [
      "Tecniche di lavorazione enogastronomica (cucina/sala/accoglienza)",
      "Qualità organolettica e gastronomica degli alimenti",
      "Predisposizione di menu per contesti e clientele diverse",
      "Comunicazione e relazione con il cliente",
      "Coordinamento del servizio e lavoro di squadra",
    ],
  },
  "Storia dell'Arte e del Territorio": {
    competenze: "Sintetizzato dal Profilo Educativo Culturale e Professionale (P.E.Cu.P.) D.Lgs. 61/2017: conoscenza del patrimonio storico-artistico e delle sue relazioni con il territorio di appartenenza; lettura di opere ed edifici storici in chiave di valorizzazione culturale e turistica.",
    nuclei: [
      "Patrimonio storico-artistico e beni culturali del territorio",
      "Lettura e contestualizzazione di opere ed edifici storici",
      "Valorizzazione culturale e turistica del territorio",
      "Musei, archivi e istituzioni culturali",
      "Tutela e conservazione dei beni culturali",
    ],
  },
  "Tecniche di Comunicazione e Promozione Culturale": {
    competenze: "Sintetizzato dal Profilo Educativo Culturale e Professionale (P.E.Cu.P.) D.Lgs. 61/2017: progettazione e realizzazione di attività di comunicazione e promozione di eventi/beni culturali; uso di strumenti di comunicazione visiva/multimediale e digitale per la valorizzazione del patrimonio.",
    nuclei: [
      "Progettazione di eventi ed attività culturali",
      "Comunicazione visiva, multimediale e digitale del patrimonio",
      "Marketing e promozione culturale e turistica",
      "Relazione con il pubblico e mediazione culturale",
      "Uso di strumenti digitali per la valorizzazione dei beni culturali",
    ],
  },
  "Metodologie Operative": {
    competenze: "Uso di metodologie/strumenti operativi per rilevare bisogni socio-sanitari del territorio e predisporre progetti individuali/di gruppo/di comunità; tecniche di animazione sociale, ludica e culturale; azioni a sostegno della persona con disabilità e della sua famiglia; facilitazione della comunicazione tra persone/gruppi di culture diverse.",
    nuclei: [
      "Rilevazione dei bisogni socio-sanitari e progettazione individuale/di gruppo/di comunità",
      "Tecniche di animazione sociale, ludica e culturale",
      "Sostegno alla persona con disabilità e alla famiglia",
      "Comunicazione interculturale e lavoro in équipe",
      "Reti territoriali formali e informali",
    ],
  },
  "Igiene e Cultura Medico-Sanitaria": {
    competenze: "Promozione di stili di vita rispettosi delle norme igieniche, della corretta alimentazione e della sicurezza; uso di metodologie/strumenti per rilevare bisogni socio-sanitari del territorio; raccolta/archiviazione/trasmissione dati per monitoraggio e valutazione di interventi e servizi.",
    nuclei: [
      "Benessere psico-fisico-sociale e stili di vita salutari",
      "Rilevazione dei bisogni socio-sanitari del territorio",
      "Documentazione e monitoraggio di interventi e servizi",
      "Comunicazione interculturale in contesti sanitari",
      "Lavoro in équipe con altre figure professionali",
    ],
  },
  "Psicologia Generale ed Applicata": {
    competenze: "Riconoscimento delle componenti culturali/sociali/economiche/tecnologiche dei processi di servizio; sensibilità alle differenze di cultura e atteggiamento dei destinatari per un servizio personalizzato; tecniche di animazione sociale, ludica e culturale e azioni di sostegno alla persona con disabilità.",
    nuclei: [
      "Processi psicologici nella relazione di aiuto",
      "Sensibilità interculturale e personalizzazione del servizio",
      "Tecniche di animazione sociale, ludica e culturale",
      "Sostegno alla persona con disabilità e alla famiglia",
      "Deontologia professionale e lavoro in équipe",
    ],
  },
  "Tecnica Amministrativa ed Economia Sociale": {
    competenze: "Comprensione e uso dei concetti di economia/organizzazione/processi produttivi e dei servizi; collaborazione nella gestione di progetti e attività dell'impresa sociale; uso del linguaggio matematico per organizzare/valutare informazioni qualitative/quantitative; gestione per progetti.",
    nuclei: [
      "Economia e organizzazione dei servizi sociali",
      "Gestione di progetti e attività dell'impresa sociale",
      "Reti territoriali formali e informali",
      "Redazione di relazioni tecniche e documentazione",
      "Normativa su riservatezza, sicurezza e tutela dell'ambiente",
    ],
  },
  "Fisica Applicata (Ottica)": {
    competenze: "Adattato dalla fonte 'Ottica, Ottica Applicata': realizzazione di ausili ottici su prescrizione medica nel rispetto della normativa; misurazione dei parametri anatomici del paziente per l'assemblaggio degli ausili; uso di macchine computerizzate per sagomare/assemblare lenti; definizione della prescrizione oftalmica dei difetti semplici (miopia, presbiopia).",
    nuclei: [
      "Ottica geometrica: lenti sottili/spesse, lenti asferiche e astigmatiche",
      "Sistema ottico dell'occhio e ametropie",
      "Proprietà dei materiali per montature e lenti oftalmiche",
      "Macchine computerizzate per lavorazione delle lenti",
      "Normativa e standard nazionali/internazionali (UNI, DIN)",
    ],
  },
  "Optometria": {
    competenze: "Assistenza tecnica al cliente nella selezione di montatura e lenti oftalmiche in base a caratteristiche fisiche/occupazione/abitudini, nel rispetto della prescrizione medica; informazione al cliente su uso e manutenzione degli ausili ottici; compilazione del certificato di conformità degli ausili ottici.",
    nuclei: [
      "Selezione di montature e lenti in base alle esigenze del cliente",
      "Prescrizione oftalmica dei difetti semplici (miopia, presbiopia)",
      "Certificazione di conformità degli ausili ottici",
      "Valutazione di parametri biologici e sensoriali (esercitazioni di laboratorio)",
      "Aggiornamento su innovazioni scientifiche e tecnologiche del settore",
    ],
  },
  "Contattologia": {
    competenze: "Realizzazione di ausili ottici (lenti a contatto) su prescrizione medica; misurazione dei parametri anatomici del paziente; informazione al cliente su uso e corretta manutenzione degli ausili; compilazione del certificato di conformità nel rispetto della prescrizione oftalmica e delle norme vigenti.",
    nuclei: [
      "Lenti a contatto: tipologie e applicazione",
      "Misurazione dei parametri anatomici del paziente",
      "Manutenzione e uso corretto degli ausili a contatto",
      "Certificazione di conformità e normativa di settore",
      "Aggiornamento su innovazioni scientifiche e tecnologiche",
    ],
  },
  "Esercitazioni di Laboratorio di Optometria": {
    competenze: "Adattato dalla fonte 'Esercitazioni di Optometria' (stessi contenuti, declinati in chiave pratico-laboratoriale): valutazione di parametri biologici e sensoriali simulando analisi di casi; assistenza tecnica al cliente nella selezione di montatura/lenti; compilazione del certificato di conformità degli ausili ottici.",
    nuclei: [
      "Valutazione pratica di parametri biologici e sensoriali",
      "Simulazione di casi clinici in laboratorio",
      "Selezione e assemblaggio di montature e lenti",
      "Certificazione di conformità degli ausili ottici",
      "Comunicazione professionale con il cliente",
    ],
  },
  "Scienze dei Materiali Dentali": {
    competenze: "Adattato dalla fonte 'Scienze dei Materiali Dentali e Laboratorio': applicazione delle conoscenze di anatomia dell'apparato boccale, biomeccanica, fisica e chimica per la realizzazione di un manufatto protesico; tecniche di lavorazione per costruire protesi provvisorie, fisse e mobili; interazione con lo specialista odontoiatra.",
    nuclei: [
      "Proprietà dei materiali dentali (metalli, resine, ceramiche)",
      "Anatomia dell'apparato boccale, biomeccanica, fisica e chimica applicata",
      "Tecniche di costruzione di protesi provvisorie, fisse e mobili",
      "Interazione professionale con lo specialista odontoiatra",
      "Metodologie operative (learning by doing, problem solving)",
    ],
  },
  "Gnatologia": {
    competenze: "Applicazione delle conoscenze di anatomia dell'apparato boccale, biomeccanica, fisica e chimica per la realizzazione di un manufatto protesico; applicazione della normativa su igiene/sicurezza/prevenzione infortuni; interazione con lo specialista odontoiatra.",
    nuclei: [
      "Anatomia dell'apparato boccale e biomeccanica",
      "Funzionamento dell'apparato masticatorio",
      "Realizzazione di manufatti protesici",
      "Normativa su igiene e sicurezza del lavoro",
      "Interazione professionale con lo specialista odontoiatra",
    ],
  },
  "Rappresentazione e Modellazione Odontotecnica": {
    competenze: "Correlazione tra spazio reale e rappresentazione grafica, conversione della rappresentazione bidimensionale in modello tridimensionale; applicazione delle conoscenze di anatomia/biomeccanica/fisica/chimica per la realizzazione di un manufatto protesico.",
    nuclei: [
      "Rappresentazione grafica bidimensionale e modellazione tridimensionale",
      "Realizzazione di manufatti protesici",
      "Anatomia dell'apparato boccale applicata alla modellazione",
      "Strumenti tecnologici e di rappresentazione digitale",
      "Interazione professionale con lo specialista odontoiatra",
    ],
  },
  "Esercitazioni di Laboratorio Odontotecnico": {
    competenze: "Uso delle tecniche di lavorazione per costruire protesi provvisorie, fisse e mobili; lavorazioni del gesso e sviluppo delle impronte con collocazione dei modelli sui dispositivi di registrazione occlusale; uso di strumenti di precisione per costruire/levigare/rifinire le protesi.",
    nuclei: [
      "Tecniche di lavorazione delle protesi dentali",
      "Lavorazione del gesso e sviluppo di impronte",
      "Uso di strumenti di precisione per costruzione e rifinitura",
      "Normativa su igiene e sicurezza del lavoro",
      "Didattica attiva con analisi di casi pratici",
    ],
  },
};
// Override per indirizzo: Diritto ed Economia del Liceo delle Scienze Umane (bozza Indicazioni
// Licei, primo biennio) ha impostazione propria, diversa dalla voce base comune a professionali/tecnici.
// Alias: nome ufficiale del quadro orario -> voce già curata con nome leggermente diverso (stessa disciplina).
const PROGRAMMI_SEC2_ALIAS = {
  "Discipline Turistiche Aziendali": "Discipline Turistiche e Aziendali",
  "Tecnologie Meccaniche di Processo e Prodotto": "Tecnologie Meccaniche di Processo e di Prodotto",
  "Psicologia Generale e Applicata": "Psicologia Generale ed Applicata",
  "Economia e Marketing delle Aziende della Moda": "Economia e Marketing nel Sistema Moda",
  "Gestione Ambiente e Territorio": "Gestione dell'Ambiente e del Territorio",
  "Esercitazioni di Optometria": "Esercitazioni di Laboratorio di Optometria",
  "Esercitazioni di Contattologia": "Contattologia",
  "Ottica, Ottica Applicata": "Fisica Applicata (Ottica)",
};
// Una voce base con "soloPer" vale solo per gli istituti il cui nome inizia con uno dei prefissi indicati
const _applicabile = (voce, istituto) => !voce.soloPer || (istituto && voce.soloPer.some(p => istituto.startsWith(p)));
function _risolviSec2(nome, istituto) {
  // Licei già migrati alle Indicazioni nazionali vigenti (D.M. 211/2010): solo le voci del 2010, mai la bozza 2026
  if (istituto && LICEI_2010_MIGRATI.has(istituto)) {
    return PROGRAMMI_LICEI_2010_OVERRIDE[istituto]?.[nome] || PROGRAMMI_LICEI_2010[nome] || null;
  }
  const ov = istituto && PROGRAMMI_SEC2_OVERRIDE[istituto];
  if (ov?.[nome]) return ov[nome];
  const chiave = PROGRAMMI_SEC2_ALIAS[nome] || nome;
  if (ov?.[chiave]) return ov[chiave];
  const base = PROGRAMMI_SEC2_BASE[chiave];
  return base && _applicabile(base, istituto) ? base : null;
}
const PROGRAMMI_SEC2_OVERRIDE = {
  "IP – Pesca commerciale e produzioni ittiche": {
    "Laboratori Tecnologici ed Esercitazioni": {
      competenze: "Sintetizzato dalle competenze dell'indirizzo (P.E.Cu.P. D.Lgs. 61/2017, già curate nelle altre voci di questo indirizzo): non esiste una fonte ministeriale dedicata alla singola disciplina di laboratorio. Attività pratiche a supporto di biologia marina e tecnologie della pesca: uso e manutenzione di attrezzature e imbarcazione, trattamento e conservazione dei prodotti ittici, sicurezza a bordo e in laboratorio.",
      nuclei: [
        "Uso e manutenzione di attrezzature e impianti per la pesca",
        "Tecniche di trattamento, conservazione e trasformazione dei prodotti ittici",
        "Analisi e rilevazione di parametri delle acque e delle specie ittiche",
        "Sicurezza a bordo e norme igienico-sanitarie in laboratorio",
        "Supporto pratico alle discipline tecnico-professionali dell'indirizzo",
      ],
    },
  },
  "IP – Industria e artigianato per il Made in Italy": {
    "Laboratori Tecnologici ed Esercitazioni": {
      competenze: "Sintetizzato dalle competenze dell'indirizzo (P.E.Cu.P. D.Lgs. 61/2017, già curate nelle altre voci di questo indirizzo): non esiste una fonte ministeriale dedicata alla singola disciplina di laboratorio. Attività pratiche a supporto di tecnologie dei materiali e progettazione: lavorazione, realizzazione e assemblaggio di prodotti industriali/artigianali del Made in Italy, uso di strumenti e macchine, disegno tecnico e strumenti digitali, controllo di qualità.",
      nuclei: [
        "Lavorazione e assemblaggio di prodotti industriali/artigianali",
        "Uso di strumenti, utensili e macchine di laboratorio",
        "Disegno tecnico e strumenti digitali di progettazione applicati al prodotto",
        "Controllo di qualità del prodotto finito",
        "Sicurezza e norme tecniche nei processi produttivi",
      ],
    },
  },
  "IP – Manutenzione e assistenza tecnica": {
    "Laboratori Tecnologici ed Esercitazioni": {
      competenze: "Sintetizzato dalle competenze dell'indirizzo (P.E.Cu.P. D.Lgs. 61/2017, già curate nelle altre voci di questo indirizzo): non esiste una fonte ministeriale dedicata alla singola disciplina di laboratorio. Attività pratiche a supporto di tecnologie e manutenzione: installazione, montaggio e sostituzione di componenti, uso di strumenti di misura, controllo e diagnosi, collaudo e messa a punto di apparecchiature e impianti, uso della documentazione tecnica nel rispetto delle norme di sicurezza.",
      nuclei: [
        "Installazione, montaggio e sostituzione di componenti e apparecchiature",
        "Uso di strumenti di misura, controllo e diagnosi",
        "Collaudo e messa a punto di impianti e macchine",
        "Lettura e uso della documentazione tecnica",
        "Sicurezza nei luoghi di lavoro e in laboratorio",
      ],
    },
  },
  "IP – Gestione delle acque e risanamento ambientale": {
    "Laboratori Tecnologici ed Esercitazioni": {
      competenze: "Sintetizzato dalle competenze dell'indirizzo (P.E.Cu.P. D.Lgs. 61/2017, già curate nelle altre voci di questo indirizzo): non esiste una fonte ministeriale dedicata alla singola disciplina di laboratorio. Attività pratiche a supporto di tecnologie ambientali e gestione delle acque: campionamento e rilevazione di parametri delle risorse idriche, operazioni su reti e impianti di depurazione, tecniche di controllo ambientale, nel rispetto delle norme di sicurezza.",
      nuclei: [
        "Campionamento e rilevazione di parametri delle acque",
        "Operazioni su reti idriche e impianti di depurazione/trattamento",
        "Tecniche di controllo e prevenzione ambientale",
        "Sicurezza nella gestione delle acque e degli impianti",
        "Supporto pratico alle discipline tecnico-professionali dell'indirizzo",
      ],
    },
  },
  "IP – Servizi culturali e dello spettacolo": {
    "Laboratori Tecnologici ed Esercitazioni": {
      competenze: "Sintetizzato dalle competenze dell'indirizzo (P.E.Cu.P. D.Lgs. 61/2017, già curate nelle altre voci di questo indirizzo): non esiste una fonte ministeriale dedicata alla singola disciplina di laboratorio. Attività pratiche a supporto di comunicazione e promozione culturale: realizzazione di prodotti e materiali di comunicazione visiva, multimediale e digitale, allestimento e documentazione di eventi e beni culturali, uso di strumenti tecnologici per la valorizzazione del patrimonio.",
      nuclei: [
        "Realizzazione di prodotti di comunicazione visiva, multimediale e digitale",
        "Allestimento e documentazione di eventi e beni culturali",
        "Uso di strumenti digitali e tecnologici per la valorizzazione del patrimonio",
        "Lavoro di gruppo e organizzazione delle attività di progetto",
        "Supporto pratico alle discipline tecnico-professionali dell'indirizzo",
      ],
    },
  },
  "IP – Agricoltura, sviluppo rurale, valorizzazione dei prodotti del territorio e gestione delle risorse forestali e montane": {
    "Laboratori Tecnologici ed Esercitazioni": {
      competenze: "Sintetizzato dalle competenze dell'indirizzo (P.E.Cu.P. D.Lgs. 61/2017, già curate nelle altre voci di questo indirizzo): non esiste una fonte ministeriale dedicata alla singola disciplina di laboratorio. Attività pratiche a supporto delle discipline agrarie: attività laboratoriali (biologia e chimica applicata ai processi di trasformazione, scienze e tecnologie agrarie) a supporto delle competenze tecnico-professionali; analisi chimico-fisiche sugli alimenti e riconoscimento delle tecniche di trasformazione/condizionamento dei prodotti.",
      nuclei: [
        "Analisi chimico-fisiche e organolettiche di materie prime e prodotti trasformati",
        "Tecniche di trasformazione e condizionamento dei prodotti",
        "Attività sperimentali di biologia e chimica applicata",
        "Sicurezza e norme igienico-sanitarie in laboratorio",
        "Supporto pratico alle discipline tecnico-professionali dell'indirizzo",
      ],
    },
  },
  "Liceo Linguistico": {
    "Latino": {
      competenze: "Solo primo biennio (bozza Indicazioni Licei 2026), in chiave comparativa con italiano e lingue moderne studiate: competenze morfosintattiche, lessicali e semantiche essenziali per comprendere e tradurre testi latini semplici, prevalentemente in prosa, di argomento storico e narrativo; lessico di base (almeno 600 parole) come accesso alle lingue e culture europee; livello atteso indicativamente A1; uso critico di strumenti multimediali e IA.",
      nuclei: [
        "Fonetica e morfologia essenziali (nome, aggettivo, pronome, verbo)",
        "Lessico latino di base e confronto con italiano e lingue moderne curricolari",
        "Lettura e comprensione di testi semplici, poi originali annotati e contestualizzati",
        "Traduzione come metodo di lettura e riflessione metalinguistica; confronto tra traduzioni in più lingue",
        "Latino come eredità comune delle culture europee e sua ricezione",
      ],
    },
  },
  "Liceo delle Scienze Umane": {
    "Diritto ed Economia": {
      competenze: "Primo biennio (bozza Indicazioni Licei 2026). Diritto ed economia per interpretare le strutture della vita sociale: funzione delle norme e Costituzione (dignità, libertà, uguaglianza, solidarietà), istituzioni della Repubblica e dell'Unione Europea; linguaggio e categorie di base dell'economia (bisogni, risorse, soggetti economici, circuito economico semplice, reddito/consumo/risparmio/investimento); nessi con persona, famiglia, relazioni educative, tutela di minori e soggetti fragili; uso critico e responsabile dei sistemi di IA.",
      nuclei: [
        "Norme giuridiche, ordinamento e Costituzione (principi fondamentali, diritti e doveri)",
        "Istituzioni della Repubblica e dell'Unione Europea, forme di Stato",
        "Diritto e persona: famiglia, relazioni educative, protezione dei minori e dei soggetti fragili",
        "Bisogni, risorse, soggetti economici, circuito economico semplice e forme elementari di mercato",
        "Disuguaglianze, sostenibilità e uso critico di dati e sistemi di IA",
      ],
    },
  },
};

// ─────────────────────────────────────────────────────────────────────────────────────────────
// LICEI — Indicazioni nazionali VIGENTI (D.M. 7 ottobre 2010, n. 211; regolamento DPR 89/2010)
// Decisione 2026-09-24: le nuove Indicazioni (bozza MIM 22/04/2026) non sono in vigore (previste dal
// 2027/28, solo classi prime): per il 2026/27 valgono queste. Le voci ricavate dalla bozza restano in
// PROGRAMMI_SEC2_BASE per un riuso dal 2027/28 (non usate per i licei "migrati").
// Fonte: "Indicazioni nazionali per i licei" (indire.it, capitoli per disciplina: linee generali e
// competenze; obiettivi specifici di apprendimento per primo biennio, secondo biennio, quinto anno).
// Lotto 1: Classico, Scientifico, Scientifico Scienze applicate, Linguistico, Scienze umane, LES.
// Struttura: PROGRAMMI_LICEI_2010[nome] = voce comune ai licei; PROGRAMMI_LICEI_2010_OVERRIDE[istituto][nome]
// = variante di quel liceo (dove il capitolo delle Indicazioni differisce).
// ─────────────────────────────────────────────────────────────────────────────────────────────
const LICEI_2010_MIGRATI = new Set([
  "Liceo Classico",
  "Liceo Scientifico",
  "Liceo Scientifico – opzione Scienze Applicate",
  "Liceo Linguistico",
  "Liceo delle Scienze Umane",
  "Liceo delle Scienze Umane – opzione economico-sociale",
]);

const _LINGUA_STRANIERA_2010 = {
  competenze: "Indicazioni licei 2010 – Lingua e cultura straniera: due assi interrelati, competenze linguistico-comunicative e conoscenza della cultura dei paesi di cui si parla la lingua; traguardo del percorso liceale almeno livello B2 del QCER (primo biennio orientativamente B1). Comprensione di testi orali e scritti (ambito personale, scolastico, letterario, artistico, scientifico, sociale, economico), produzione e interazione adeguate a interlocutore e contesto, riflessione sul sistema e sugli usi linguistici, uso della lingua per contenuti di discipline non linguistiche.",
  nuclei: [
    "Comprensione globale e selettiva di testi orali e scritti su argomenti noti (primo biennio)",
    "Produzione di testi orali e scritti lineari e coesi per riferire fatti e descrivere situazioni",
    "Interazione e conversazione, anche con parlanti nativi, adeguata al contesto",
    "Riflessione su fonologia, morfologia, sintassi, lessico e registri, anche in ottica comparativa con l'italiano",
    "Cultura dei paesi di cui si parla la lingua (letteratura, arte, attualità) e strategie di apprendimento autonomo",
  ],
};

const PROGRAMMI_LICEI_2010 = {
  "Italiano": {
    competenze: "Indicazioni licei 2010 – Lingua e letteratura italiana: padronanza della lingua italiana scritta e orale (esprimersi con chiarezza e proprietà nei diversi contesti, riassumere e parafrasare, organizzare e motivare un ragionamento, interpretare un fenomeno storico, culturale, scientifico), riflessione metalinguistica sui livelli ortografico, interpuntivo, morfosintattico, lessicale-semantico e testuale, coscienza della storicità della lingua; gusto della lettura come obiettivo primario, lettura e interpretazione di testi letterari lungo il quinquennio.",
    nuclei: [
      "Lingua: consolidamento delle capacità linguistiche orali e scritte, uso efficace e corretto, coesione e coerenza del testo",
      "Riflessione sulla lingua (livelli ortografico, morfosintattico, lessicale-semantico, testuale) senza tassonomie minuziose",
      "Produzione scritta: riassumere, parafrasare, titolare, relazionare, testi di varie tipologie e registri, videoscrittura",
      "Storia della lingua: dal latino ai volgari e all'italiano, varietà d'uso e dialetti",
      "Letteratura: lettura diretta e interpretazione dei testi, percorsi per autori, generi e temi dalle origini all'età contemporanea",
    ],
  },
  "Lingua Straniera (Inglese)": _LINGUA_STRANIERA_2010,
  "Prima Lingua Straniera (Inglese)": _LINGUA_STRANIERA_2010,
  "Seconda Lingua Straniera": _LINGUA_STRANIERA_2010,
  "Terza Lingua Straniera": _LINGUA_STRANIERA_2010,
  "Storia e Geografia": {
    competenze: "Indicazioni licei 2010 – Storia e Geografia (primo biennio): Storia: orientarsi nella dimensione temporale e spaziale degli eventi, civiltà antiche e altomedievali, lessico e categorie della disciplina, lettura e valutazione delle fonti, cittadinanza e Costituzione. Geografia: strumenti e metodi fondamentali, lettura critica delle rappresentazioni cartografiche (aspetti geografico-fisici e geopolitici), relazioni tra condizioni ambientali, caratteristiche socioeconomiche e culturali e assetti politici.",
    nuclei: [
      "Civiltà antiche: Vicino Oriente, giudaica, greca, romana; avvento del Cristianesimo",
      "Europa romano-barbarica e altomedioevo: società, economia, Chiesa, Islam, Impero e regni, feudalesimo",
      "Fonti storiche e contributo di archeologia, epigrafia e paleografia",
      "Geografia: carte e strumenti di rappresentazione del territorio, orientamento e nuove tecniche di lettura",
      "Cittadinanza e Costituzione, relazioni tra ambiente, società ed economia",
    ],
  },
  "Storia": {
    competenze: "Indicazioni licei 2010 – Storia (secondo biennio e quinto anno): conoscere i principali eventi e le trasformazioni di lungo periodo della storia d'Europa e d'Italia nel quadro della storia globale; usare lessico e categorie interpretative, leggere e valutare le fonti, discutere criticamente interpretazioni diverse; conoscere i fondamenti dell'ordinamento costituzionale. Secondo biennio: dall'XI secolo alle soglie del Novecento (formazione dell'Europa e apertura a una dimensione globale). Quinto anno: epoca contemporanea, dalle premesse della prima guerra mondiale ai giorni nostri.",
    nuclei: [
      "Dall'XI secolo al Basso Medioevo: poteri universali, comuni, monarchie, Chiesa, società ed economia",
      "Età moderna: scoperte geografiche e loro conseguenze, Signorie e Stati territoriali, rivoluzioni e Illuminismo",
      "Ottocento: Risorgimento, industrializzazione e trasformazioni sociali fino alle soglie del Novecento",
      "Novecento: prima guerra mondiale, totalitarismi, seconda guerra mondiale, Repubblica italiana e mondo contemporaneo",
      "Cittadinanza e Costituzione; differenza tra storia e cronaca e uso critico delle fonti",
    ],
  },
  "Filosofia": {
    competenze: "Indicazioni licei 2010 – Filosofia (triennio): consapevolezza del significato della riflessione filosofica come modalità specifica della ragione umana; conoscenza organica dei punti nodali dello sviluppo del pensiero occidentale, con il legame con il contesto storico-culturale; lettura diretta dei testi; sviluppo di riflessione personale, giudizio critico e capacità di argomentare; problemi fondamentali: ontologia, etica e felicità, rapporto con le tradizioni religiose, conoscenza, logica, rapporto con la scienza, bellezza, libertà e potere.",
    nuclei: [
      "Lessico e categorie della filosofia; esposizione organica di idee e sistemi di pensiero",
      "Filosofia antica: presocratici, sofisti, Socrate, Platone, Aristotele, età ellenistica",
      "Filosofia medievale e moderna, dalle origini a Hegel: percorsi per autori e problemi con lettura di testi",
      "Quinto anno: filosofia contemporanea (Schopenhauer, Kierkegaard, Marx, Nietzsche, Positivismo e reazioni, autori del Novecento)",
      "Cittadinanza e Costituzione: libertà e potere nel pensiero politico; nessi con le altre discipline",
    ],
  },
  "Matematica": {
    competenze: "Indicazioni licei 2010 – Matematica (licei classico, linguistico, musicale e coreutico, scienze umane): concetti e metodi elementari della matematica, interni alla disciplina e rilevanti per descrivere e prevedere semplici fenomeni, in particolare del mondo fisico; visione storico-critica dei rapporti tra pensiero matematico e contesto filosofico, scientifico e tecnologico. Gruppi di concetti: geometria euclidea del piano e dello spazio, calcolo algebrico e geometria analitica, funzioni elementari e prime nozioni di calcolo differenziale e integrale, probabilità e statistica, modelli matematici, elementi di informatica.",
    nuclei: [
      "Aritmetica e algebra: dal calcolo aritmetico al calcolo algebrico, numeri interi, razionali e reali, equazioni e disequazioni",
      "Geometria euclidea del piano e dello spazio: definizioni, dimostrazioni, assiomatizzazione, geometria analitica cartesiana",
      "Relazioni e funzioni: funzioni elementari, prime nozioni di calcolo differenziale e integrale",
      "Dati e previsioni: analisi statistica e calcolo delle probabilità",
      "Modelli matematici, strumenti informatici per il calcolo e la rappresentazione, contesto storico del pensiero matematico",
    ],
  },
  "Fisica": {
    competenze: "Indicazioni licei 2010 – Fisica (licei classico, linguistico, musicale e coreutico, scienze umane): concetti fondamentali della fisica, valore culturale della disciplina e sua evoluzione storica ed epistemologica; competenze di osservare e identificare fenomeni, risolvere semplici problemi con gli strumenti matematici adeguati, consapevolezza del metodo sperimentale (esperimento come interrogazione ragionata dei fenomeni, analisi critica dei dati e dell'affidabilità della misura), valutare le scelte scientifiche e tecnologiche della società.",
    nuclei: [
      "Linguaggio della fisica classica: grandezze scalari e vettoriali, unità di misura, semplificazione e modellizzazione di situazioni reali",
      "Meccanica: moto, forze e principi della dinamica, energia e quantità di moto",
      "Termodinamica e onde (secondo biennio)",
      "Elettromagnetismo e cenni di fisica moderna (quinto anno)",
      "Metodo sperimentale, misure e analisi critica dei dati; raccordo con matematica, scienze, storia e filosofia",
    ],
  },
  "Scienze Naturali": {
    competenze: "Indicazioni licei 2010 – Scienze naturali: conoscenze disciplinari e metodologie delle scienze della natura (scienze della Terra, chimica, biologia) fondate sull'indagine scientifica 'osservazione e sperimentazione'; dimensione sperimentale e laboratorio come momento significativo del 'fare scienza' (anche in classe o sul campo, con dati, simulazioni, modelli). Primo biennio: approccio fenomenologico e osservativo-descrittivo; poi approfondimento concettuale e modellistico.",
    nuclei: [
      "Scienze della Terra: moti della Terra, geomorfologia (fiumi, laghi, ghiacciai, mari); poi mineralogia e petrologia",
      "Chimica: stati e classificazione della materia, reazioni semplici, modello atomico, sistema periodico, legami chimici, primi concetti di chimica organica",
      "Biologia: cellula e biodiversità, genetica mendeliana, evoluzione e sistematica, rapporti organismi-ambiente; poi basi molecolari e aspetti anatomici e fisiologici (educazione alla salute)",
      "Metodo sperimentale: unità di misura, raccolta e registrazione dei dati, attività di laboratorio",
      "Scienza, tecnologia e società: rapporti con i contesti storico, filosofico e tecnologico",
    ],
  },
  "Storia dell'Arte": {
    competenze: "Indicazioni licei 2010 – Storia dell'arte: comprensione del rapporto tra opere d'arte e situazione storica in cui sono state prodotte, con i legami con letteratura, pensiero filosofico e scientifico, politica, religione; lettura delle opere pittoriche, scultoree, architettoniche con metodo e terminologia appropriati (aspetti iconografici e simbolici, caratteri stilistici, funzioni, materiali e tecniche); consapevolezza del valore del patrimonio archeologico, architettonico e artistico e delle questioni di tutela, conservazione e restauro. Secondo biennio: dalle origini nell'area mediterranea alla fine del XVIII secolo; quinto anno: Ottocento e Novecento.",
    nuclei: [
      "Lettura dell'opera: metodo e terminologia, aspetti iconografici, simbolici, stilistici, materiali e tecniche",
      "Inquadramento storico degli artisti e delle opere e legami con letteratura, pensiero, scienza, politica e religione",
      "Dalle origini nell'area mediterranea alla fine del XVIII secolo: opere e movimenti fondamentali (secondo biennio)",
      "Ottocento e Novecento: dal Neoclassicismo e Romanticismo alle avanguardie fino alla metà del secolo (quinto anno)",
      "Patrimonio culturale: tutela, conservazione, restauro e storia dei metodi storiografici",
    ],
  },
  "Scienze Motorie e Sportive": {
    competenze: "Indicazioni licei 2010 – Scienze motorie e sportive: consapevolezza della propria corporeità (conoscenza, padronanza e rispetto del proprio corpo), valori sociali dello sport, buona preparazione motoria e atteggiamento positivo verso uno stile di vita sano e attivo; padronanza del corpo sperimentando un'ampia gamma di attività (capacità coordinative, forza, resistenza, velocità, flessibilità); agire in modo responsabile, analizzare la propria e l'altrui prestazione; linguaggio del corpo e espressione di emozioni; benefici delle attività fisiche nei diversi ambienti.",
    nuclei: [
      "Percezione di sé e completamento dello sviluppo funzionale delle capacità motorie ed espressive",
      "Capacità coordinative e condizionali: forza, resistenza, velocità, flessibilità",
      "Sport individuali e di squadra, regole, fair play e valori sociali dello sport",
      "Linguaggio del corpo ed espressione di stati d'animo ed emozioni",
      "Salute, prevenzione e sicurezza; attività fisica nei diversi ambienti",
    ],
  },
  "Latino": {
    competenze: "Indicazioni licei 2010 – Lingua e cultura latina (Liceo classico): leggere, comprendere e tradurre testi d'autore di vario genere e argomento; confronto linguistico del latino con l'italiano e con altre lingue moderne (lessico, semantica), traduzione come strumento di conoscenza di un testo e di un autore; cultura: lettura diretta in lingua originale e in traduzione dei testi fondamentali del patrimonio letterario classico, valore fondante della classicità romana per la tradizione europea, interpretazione e commento di opere in prosa e in versi con analisi linguistica, stilistica, retorica.",
    nuclei: [
      "Primo biennio: lettura scorrevole, morfosintassi (flessione nominale e verbale, funzioni dei casi, periodo), lessico per famiglie semantiche",
      "Traduzione di testi d'autore, prevalentemente in prosa, con note di contestualizzazione, e confronto con l'italiano",
      "Secondo biennio e quinto anno: lettura di autori e generi della latinità (prosa e versi), analisi linguistica, stilistica e retorica",
      "Storia letteraria e cultura di Roma: contesto storico, religioso, politico, morale ed estetico dei testi",
      "Confronto tra modelli culturali e letterari e ricezione della classicità nella tradizione europea",
    ],
  },
  "Greco": {
    competenze: "Indicazioni licei 2010 – Lingua e cultura greca (Liceo classico): leggere, comprendere e tradurre testi d'autore di vario genere e argomento; confronto di strutture morfosintattiche e lessico con italiano e latino, continuità e cambiamento dei sistemi linguistici; cultura: lettura diretta e in traduzione dei testi fondamentali del patrimonio letterario greco, valore fondante della classicità greca per la tradizione europea, interpretazione e commento di opere in prosa e in versi.",
    nuclei: [
      "Primo biennio: lettura, morfosintassi di base (nome, verbo, funzioni dei casi), lessico e formazione delle parole",
      "Traduzione di testi d'autore come strumento di conoscenza del testo e dell'autore",
      "Secondo biennio e quinto anno: generi e autori della letteratura greca, analisi linguistica, stilistica e retorica",
      "Cultura greca: contesto storico, religioso, politico, morale ed estetico dei testi",
      "Confronto con latino e italiano e ricezione del mondo greco nella civiltà europea",
    ],
  },
  "Informatica": {
    competenze: "Indicazioni licei 2010 – Informatica (opzione scienze applicate): comprendere i fondamenti teorici delle scienze dell'informazione, padroneggiare strumenti software per calcolo, ricerca e comunicazione in rete, comunicazione multimediale, acquisizione e organizzazione dei dati; sufficiente padronanza di uno o più linguaggi per applicazioni di calcolo in ambito scientifico; struttura logico-funzionale di computer e reti locali; consapevolezza di vantaggi, limiti e conseguenze sociali e culturali dell'uso degli strumenti informatici, con teoria e pratica integrate.",
    nuclei: [
      "Architettura del computer: hardware e software, codifica binaria (ASCII, Unicode), macchina di Von Neumann",
      "Strumenti di lavoro: sistemi operativi, elaborazione di testi e dati, ricerca e comunicazione in rete, multimedialità",
      "Algoritmi e programmazione: linguaggi per applicazioni semplici di calcolo scientifico",
      "Reti: struttura di reti locali, Internet e servizi",
      "Uso consapevole: vantaggi, limiti e conseguenze sociali e culturali dell'informatica; applicazioni all'indagine scientifica",
    ],
  },
  "Disegno e Storia dell'Arte": {
    competenze: "Indicazioni licei 2010 – Disegno e storia dell'arte (Liceo scientifico): padronanza del disegno grafico/geometrico come linguaggio e strumento di conoscenza (vedere nello spazio, confrontare, ipotizzare relazioni), metodi di rappresentazione della geometria descrittiva e uso degli strumenti del disegno; lettura critica di opere architettoniche e artistiche con terminologia e sintassi descrittiva appropriate (lettura formale e iconografica), collocazione storico-culturale, materiali, tecniche, stili, significati e funzioni; consapevolezza del valore del patrimonio architettonico e artistico. Primo biennio: dalle origini alla fine del XIV secolo.",
    nuclei: [
      "Disegno geometrico e geometria descrittiva: proiezioni ortogonali, assonometrie, prospettiva, uso degli strumenti",
      "Disegno come strumento di studio dell'architettura e dell'opera d'arte (rilievo, analisi grafica)",
      "Lettura dell'opera d'arte e dello spazio architettonico: categorie formali, iconografia, tecniche e materiali",
      "Storia dell'arte e dell'architettura: dalle origini al Medioevo (primo biennio), poi Rinascimento, Barocco, Ottocento e Novecento",
      "Patrimonio architettonico e artistico: valore culturale, tutela e conservazione",
    ],
  },
  "Scienze Umane": {
    competenze: "Indicazioni licei 2010 – Scienze umane (Liceo delle scienze umane): orientarsi con i linguaggi propri delle scienze umane nelle molteplici dimensioni della persona e delle relazioni (esperienza di sé e dell'altro, relazioni educative e interpersonali, forme di vita sociale e di cura per il bene comune, forme istituzionali in ambito socio-educativo, relazioni con il mondo dei valori); padroneggiare le principali tipologie educative, relazionali e sociali della cultura occidentale, comprendere le dinamiche della realtà sociale (fenomeni educativi e formativi, servizi alla persona, lavoro, interculturalità, cittadinanza), consapevolezza culturale delle dinamiche degli affetti. Insegnamento pluridisciplinare (antropologia, pedagogia, psicologia, sociologia) in stretto contatto con filosofia, storia, letteratura.",
    nuclei: [
      "Antropologia: significato della cultura, teorie antropologiche, diversità culturali e loro ragioni",
      "Pedagogia: tipologie educative e storia dell'educazione, processi formativi formali e non formali",
      "Psicologia: funzionamento mentale, sviluppo, dimensioni sociali e dinamiche affettive",
      "Sociologia: fenomeni e istituzioni sociali, lavoro, servizi alla persona, interculturalità e cittadinanza",
      "Approccio pluridisciplinare, in stretto contatto con filosofia, storia e letteratura",
    ],
  },
  "Diritto ed Economia": {
    competenze: "Indicazioni licei 2010 – Diritto ed economia (Liceo delle scienze umane, biennio): Economia: elementi teorici fondamentali dell'economia politica come scienza delle decisioni di soggetti razionali che vivono in società, dinamica di produzione e scambio di beni e servizi, dimensioni etiche, psicologiche e sociali dell'agire umano; Diritto: linguaggio giuridico essenziale, confronto tra diritto e altre norme sociali ed etiche, principi della Costituzione, organi costituzionali e forma di governo, istituti del diritto di famiglia, ordinamento dell'Unione Europea.",
    nuclei: [
      "Il problema economico: ricchezza, reddito, moneta, produzione, consumo, risparmio, investimento, costo e ricavo",
      "Produzione e scambio di beni e servizi; dimensioni etiche, psicologiche e sociali dell'agire economico",
      "Fonti e funzione delle norme giuridiche; distinzione tra diritto e altre norme sociali ed etiche",
      "Costituzione italiana, organi costituzionali e forma di governo",
      "Diritto di famiglia; ordinamento e istituzioni dell'Unione Europea",
    ],
  },
  "Diritto ed Economia Politica": {
    competenze: "Indicazioni licei 2010 – Diritto ed economia politica (Liceo delle scienze umane, opzione economico-sociale): Economia politica: lessico di base e fondamenti teorici come scienza sociale in dialogo con storia, filosofia, sociologia, storia del pensiero economico e strumenti di analisi quantitativa, ruolo degli operatori economici pubblici e privati (anche terzo settore) a livello internazionale; Diritto: linguaggio giuridico in diversi contesti, principi filosofici e trasformazioni storiche delle istituzioni giuridiche, conoscenza approfondita della Costituzione italiana nel quinquennio.",
    nuclei: [
      "Primo biennio: problema economico (ricchezza, reddito, moneta, produzione, consumo, risparmio, investimento) a partire dall'esperienza di vita e dai media",
      "Economia politica: mercato, imprese, Stato e politiche economiche; storia del pensiero economico e fatti salienti della storia economica",
      "Operatori economici pubblici e privati, terzo settore, dimensione internazionale e benessere sociale",
      "Diritto: fonti e principi delle norme, Costituzione italiana, ordinamento dello Stato e istituzioni europee",
      "Strumenti di analisi quantitativa dei fenomeni economici",
    ],
  },
};

const PROGRAMMI_LICEI_2010_OVERRIDE = {
  "Liceo Scientifico": {
    "Matematica": {
      competenze: "Indicazioni licei 2010 – Matematica (Liceo scientifico): concetti e metodi elementari della matematica, interni alla disciplina e rilevanti per descrivere e prevedere fenomeni, in particolare del mondo fisico (più ampio impianto rispetto agli altri licei); visione storico-critica dei rapporti tra pensiero matematico e contesto filosofico, scientifico e tecnologico; geometria euclidea del piano e dello spazio, calcolo algebrico, geometria analitica, funzioni, calcolo differenziale e integrale, calcolo vettoriale e derivata per lo studio dei fenomeni fisici, probabilità e statistica, modelli matematici, elementi di informatica.",
      nuclei: [
        "Aritmetica e algebra: dal calcolo aritmetico al calcolo algebrico, numeri reali, equazioni e disequazioni",
        "Geometria euclidea e analitica: dimostrazioni, trasformazioni, geometria cartesiana, coniche",
        "Relazioni e funzioni: funzioni elementari, limiti, calcolo differenziale e integrale",
        "Dati e previsioni: statistica, calcolo delle probabilità, distribuzioni",
        "Modelli matematici di fenomeni (anche fisici), strumenti informatici di calcolo e rappresentazione",
      ],
    },
    "Fisica": {
      competenze: "Indicazioni licei 2010 – Fisica (Liceo scientifico): concetti fondamentali, leggi e teorie della fisica, valore conoscitivo della disciplina e nesso con il contesto storico e filosofico; competenze di osservare e identificare fenomeni, formulare ipotesi esplicative con modelli, analogie e leggi, formalizzare un problema e applicare gli strumenti matematici, metodo sperimentale (scelta delle variabili, raccolta e analisi critica dei dati, affidabilità della misura, costruzione e validazione di modelli), valutare le scelte scientifiche e tecnologiche della società.",
      nuclei: [
        "Linguaggio della fisica classica: grandezze scalari e vettoriali, misura e modellizzazione",
        "Meccanica: moto e dinamica, leggi di conservazione, gravitazione",
        "Termodinamica e onde: calore, principi della termodinamica, ottica e fenomeni ondulatori",
        "Elettromagnetismo: campi elettrico e magnetico, induzione, equazioni di Maxwell (secondo biennio e quinto anno)",
        "Fisica del Novecento: relatività e quanti; metodo sperimentale e attività di laboratorio",
      ],
    },
    "Scienze Naturali": {
      competenze: "Indicazioni licei 2010 – Scienze naturali (Liceo scientifico): conoscenze disciplinari e metodologie delle scienze della natura (Terra, chimica, biologia) con dimensione sperimentale e laboratorio come momento del 'fare scienza'; consapevolezza critica dei rapporti tra sviluppo delle conoscenze e contesto storico, filosofico e tecnologico e dei nessi tra le aree scientifiche; primo biennio con approccio osservativo-descrittivo, poi approfondimento concettuale, modellistico e interpretativo.",
      nuclei: [
        "Scienze della Terra: moti della Terra, geomorfologia, mineralogia e petrologia, tettonica (secondo biennio e quinto anno)",
        "Chimica: struttura della materia, sistema periodico, legami, reazioni, chimica organica di base",
        "Biologia: cellula e biodiversità, genetica, evoluzione, basi molecolari (DNA, sintesi proteica), aspetti anatomici e fisiologici, biochimica",
        "Metodo sperimentale: misure, raccolta dati, laboratorio, modelli e simulazioni",
        "Scienza e società: nessi con il contesto storico, filosofico e tecnologico",
      ],
    },
  },
  "Liceo Scientifico – opzione Scienze Applicate": {}, // popolato sotto con gli stessi override dello Scientifico
  "Liceo Scientifico – opzione Scienze Applicate ": {},
  "Liceo Linguistico": {
    "Latino": {
      competenze: "Indicazioni licei 2010 – Lingua latina (Liceo linguistico, primo biennio): conoscere i fondamenti della lingua latina e riflettere metalinguisticamente su di essi attraverso la traduzione di testi d'autore non troppo impegnativi e annotati; a livello di base, riconoscere affinità e divergenze tra latino, italiano e altre lingue romanze e non romanze (formazione delle parole, esiti morfologici, semantica storica, etimologia); orientarsi su aspetti della società e della cultura di Roma antica a partire dai fattori linguistici (lessico dei legami familiari, del diritto, della politica, del culto).",
      nuclei: [
        "Strutture fonologiche e morfologiche di base: sistema quantitativo, flessione di nome, aggettivo, pronome e verbo",
        "Sintassi essenziale: funzioni dei casi, participio e ablativo assoluto, infinitive, cum e ut",
        "Lessico latino di base e famiglie semantiche; formazione delle parole ed esiti nelle lingue romanze",
        "Traduzione di testi d'autore non impegnativi con note; confronto con italiano e lingue moderne studiate",
        "Aspetti della civiltà romana attraverso il lessico (famiglia, diritto, politica, religione)",
      ],
    },
  },
  "Liceo delle Scienze Umane": {
    "Latino": {
      competenze: "Indicazioni licei 2010 – Lingua e cultura latina (Liceo delle scienze umane e Liceo scientifico): padronanza della lingua latina sufficiente a orientarsi nella lettura, diretta o in traduzione con testo a fronte, dei testi più rappresentativi della latinità e a coglierne i valori storici e culturali; confronto linguistico con l'italiano e le lingue straniere note (lessico, semantica); traduzione come strumento di conoscenza; cultura: lettura in lingua e in traduzione dei testi fondamentali della latinità in prospettiva letteraria e culturale e valore fondante del patrimonio latino per la tradizione europea.",
      nuclei: [
        "Primo biennio: lettura scorrevole, morfologia di nome, aggettivo, pronome e verbo, sintassi dei casi e del periodo essenziale",
        "Lessico di base, famiglie semantiche e formazione delle parole",
        "Traduzione e confronto con l'italiano e le lingue straniere note",
        "Secondo biennio e quinto anno: lettura in lingua e in traduzione di autori e generi rappresentativi della latinità",
        "Aspetti storici e culturali del mondo romano attraverso i testi",
      ],
    },
  },
  "Liceo delle Scienze Umane – opzione economico-sociale": {
    "Scienze Umane": {
      competenze: "Indicazioni licei 2010 – Scienze umane (opzione economico-sociale): orientarsi con i linguaggi della cultura nelle dimensioni della persona e delle relazioni (esperienza di sé e dell'altro, relazioni interpersonali, forme di vita sociale e di cura per il bene comune, relazioni istituzionali in ambito sociale); comprendere le dinamiche della realtà sociale (mondo del lavoro, servizi alla persona, interculturalità, cittadinanza) e le trasformazioni socio-politiche ed economiche indotte dalla globalizzazione, gestione della multiculturalità, significato del terzo settore; consapevolezza delle dinamiche psicosociali; principi, metodi e tecniche della ricerca in campo economico-sociale. In stretto contatto con economia, diritto, matematica, geografia, filosofia, storia, letteratura.",
      nuclei: [
        "Psicologia: specificità della disciplina scientifica, funzionamento mentale, sviluppo e dimensioni sociali",
        "Antropologia: cultura, diversità culturali e interculturalità",
        "Sociologia: fenomeni e istituzioni sociali, lavoro, globalizzazione, multiculturalità, terzo settore",
        "Metodologia della ricerca: principi, metodi e tecniche di ricerca economico-sociale (qualitativa e quantitativa)",
        "Collegamenti con economia, diritto, matematica, geografia, filosofia, storia e letteratura",
      ],
    },
  },
};
// Le opzioni Scienze applicate e (per gli stessi capitoli) Scientifico condividono le varianti
PROGRAMMI_LICEI_2010_OVERRIDE["Liceo Scientifico – opzione Scienze Applicate"] = PROGRAMMI_LICEI_2010_OVERRIDE["Liceo Scientifico"];
delete PROGRAMMI_LICEI_2010_OVERRIDE["Liceo Scientifico – opzione Scienze Applicate "];
// Il Liceo Scientifico (tradizionale) e il Liceo delle scienze umane usano la stessa variante del Latino
PROGRAMMI_LICEI_2010_OVERRIDE["Liceo Scientifico"] = { ...PROGRAMMI_LICEI_2010_OVERRIDE["Liceo Scientifico"], "Latino": PROGRAMMI_LICEI_2010_OVERRIDE["Liceo delle Scienze Umane"]["Latino"] };

const PROGRAMMI_PER_GRADO = {
  infanzia: PROGRAMMI_INFANZIA,
  primaria: PROGRAMMI_PRIMARIA,
  sec1: PROGRAMMI_SEC1,
};

/**
 * Risolve il programma curato per una singola disciplina.
 * Per sec2: override[istituto][nome] -> base[nome] -> null.
 * Per gli altri gradi: mappa[nome] -> null.
 */
function getProgrammaDisciplina(grado, nomeDisciplina, istituto = null) {
  if (grado === 'sec2') return _risolviSec2(nomeDisciplina, istituto);
  return PROGRAMMI_PER_GRADO[grado]?.[nomeDisciplina] || null;
}

/**
 * Costruisce il blocco testuale "Programmi ministeriali di riferimento" da iniettare
 * nel prompt per la Sezione 8. Le discipline senza voce curata vengono semplicemente
 * omesse dal blocco (degrado silenzioso: il prompt userà comunque il nome disciplina).
 */
// Intestazione del blocco: indica il riferimento normativo effettivamente usato per quella scuola
function _intestazioneProgrammi(grado, istituto) {
  if (grado === 'sec2' && istituto && LICEI_2010_MIGRATI.has(istituto)) {
    return 'Programmi ministeriali di riferimento (Indicazioni nazionali per i licei, D.M. 211/2010, vigenti):';
  }
  return 'Programmi ministeriali di riferimento (Indicazioni Nazionali 2025 / Linee Guida):';
}
function getProgrammiPerDiscipline(grado, nomiDiscipline, istituto = null) {
  const righe = [];
  for (const nome of nomiDiscipline) {
    const prog = getProgrammaDisciplina(grado, nome, istituto);
    if (!prog || !prog.nuclei || prog.nuclei.length === 0) continue;
    righe.push(`- ${nome}: ${prog.competenze} Nuclei: ${prog.nuclei.join('; ')}.`);
  }
  if (righe.length === 0) return '';
  return `${_intestazioneProgrammi(grado, istituto)}\n${righe.join('\n')}`;
}

/**
 * Verifica di copertura: confronta i nomi disciplina effettivamente in uso (da pei-gradi.js)
 * con quelli curati in questo file. Usata dal test automatico, non a runtime.
 */
function checkCoverage({ campiEsperienza, disciplinePrimaria, disciplineSec1, istitutiSec2 }) {
  const missing = [];
  for (const nome of campiEsperienza) {
    if (!PROGRAMMI_INFANZIA[nome]) missing.push(`infanzia: ${nome}`);
  }
  for (const nome of disciplinePrimaria) {
    if (!PROGRAMMI_PRIMARIA[nome]) missing.push(`primaria: ${nome}`);
  }
  for (const nome of disciplineSec1) {
    if (!PROGRAMMI_SEC1[nome]) missing.push(`sec1: ${nome}`);
  }
  // sec2: "Religione / Attività alternativa" è l'unica esclusione voluta (fonte diversa,
  // non curata per scelta) — non segnalata come mancante.
  if (istitutiSec2) {
    for (const [istituto, discipline] of Object.entries(istitutiSec2)) {
      for (const nome of discipline) {
        if (nome === 'Religione / Attività alternativa') continue;
        if (!_risolviSec2(nome, istituto)) missing.push(`sec2 (${istituto}): ${nome}`);
      }
    }
  }
  return missing;
}

export {
  PROGRAMMI_INFANZIA,
  PROGRAMMI_PRIMARIA,
  PROGRAMMI_SEC1,
  PROGRAMMI_SEC2_BASE,
  PROGRAMMI_SEC2_OVERRIDE,
  PROGRAMMI_SEC2_ALIAS,
  PROGRAMMI_LICEI_2010,
  PROGRAMMI_LICEI_2010_OVERRIDE,
  LICEI_2010_MIGRATI,
  getProgrammaDisciplina,
  getProgrammiPerDiscipline,
  checkCoverage,
};
