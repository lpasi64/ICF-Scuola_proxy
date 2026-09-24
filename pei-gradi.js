// pei-gradi.js
// Porting ESM di server/gradi.js (progetto "Generatore PEI", G:\Il mio Drive\ICF_Scuola\PEI con Claude)
// Nessuna modifica di logica — solo require/module.exports -> import/export.

/**
 * Configurazione per grado scolastico.
 * Determina: terminologia, struttura sezione 8, campi di esperienza/discipline.
 */

// ── Terminologia per grado ────────────────────────────────────────────────────
const TERMINOLOGIA = {
  infanzia: {
    soggetto:    "bambino/a",
    soggetto_m:  "bambino",
    soggetto_f:  "bambina",
    sezione:     "sezione",
    docenti:     "docenti della sezione",
    organo:      "tutti i docenti della sezione",
    intestazione: "SCUOLA DELL'INFANZIA",
    grado:       "infanzia",
  },
  primaria: {
    soggetto:    "alunno/a",
    soggetto_m:  "alunno",
    soggetto_f:  "alunna",
    sezione:     "classe",
    docenti:     "team dei docenti",
    organo:      "tutto il Team dei docenti",
    intestazione: "SCUOLA PRIMARIA",
    grado:       "primaria",
  },
  sec1: {
    soggetto:    "alunno/a",
    soggetto_m:  "alunno",
    soggetto_f:  "alunna",
    sezione:     "classe",
    docenti:     "consiglio di classe",
    organo:      "tutto il Consiglio di classe",
    intestazione: "SCUOLA SECONDARIA DI PRIMO GRADO",
    grado:       "sec1",
  },
  sec2: {
    soggetto:    "studente/essa",
    soggetto_m:  "studente",
    soggetto_f:  "studentessa",
    sezione:     "classe",
    docenti:     "consiglio di classe",
    organo:      "il Consiglio di classe",
    intestazione: "SCUOLA SECONDARIA DI SECONDO GRADO",
    grado:       "sec2",
  },
};

// ── Testo standard 8.1 (comune a tutti i gradi, adattato) ────────────────────
function testoStandard81(term) {
  if (term.grado === 'infanzia') {
    return `Il docente per il sostegno, in quanto docente della ${term.sezione} e contitolare, può assumere la conduzione educativo-didattica in alcune attività. In sua assenza i colleghi/e (ed eventuali altre figure di assistenza) assicurano il supporto necessario al/alla ${term.soggetto} con disabilità affinché possa partecipare nel miglior modo possibile alle attività proposte, anche avvalendosi della collaborazione dei compagni.
Per tutti i campi di esperienza sarà posta attenzione per un apprendimento significativo e lo sviluppo di competenze spendibili nei contesti di vita, prediligendo, quando possibile, situazioni di gioco e attività laboratoriali.`;
  }
  return `Il docente per il sostegno, in quanto docente della ${term.sezione} e contitolare, può assumere la conduzione didattica in alcune unità di apprendimento. In sua assenza i colleghi/e (ed eventuali altre figure di assistenza) assicurano il supporto necessario all'${term.soggetto} con disabilità affinché possa partecipare nel miglior modo possibile alle attività proposte, anche avvalendosi della collaborazione dei compagni.
Per tutte le aree disciplinari sarà posta attenzione per un apprendimento significativo e lo sviluppo di competenze spendibili nei contesti di vita, prediligendo, quando possibile, compiti di realtà e la didattica laboratoriale.`;
}

// ── Struttura sezione 8 per grado ────────────────────────────────────────────
const STRUTTURA_SEZ8 = {

  infanzia: {
    haProgettazioneDisciplinare: false,
    haFSL: false,
    haPercorsoDifferenziato: false,
    haCertificazioneCompetenze: false,
    haValutazioneComportamento: false,
    titolo81: "8.1 – Interventi educativo-didattici, strategie, strumenti nei diversi campi di esperienza",
    desc81: "Modalità di sostegno educativo-didattico e ulteriori interventi di inclusione nei campi di esperienza delle Indicazioni Nazionali per il Curricolo (Il sé e l'altro; Il corpo e il movimento; Immagini, suoni, colori; I discorsi e le parole; La conoscenza del mondo).",
    note82: null,
    noteValutazione: "La valutazione dei traguardi di sviluppo delle competenze previste nei campi di esperienza delle Indicazioni Nazionali è effettuata da tutti i docenti della sezione.",
  },

  primaria: {
    haProgettazioneDisciplinare: true,
    haFSL: false,
    haPercorsoDifferenziato: false,
    haCertificazioneCompetenze: true,
    haValutazioneComportamento: true,
    titolo81: "8.1 – Modalità di sostegno didattico e ulteriori interventi di inclusione",
    desc81: "Interventi educativo-didattici, strategie, strumenti nelle diverse discipline/aree disciplinari.",
    opzioni82: ["A – Personalizzazioni rispetto alla progettazione della classe"],
    note82: "Compilare soltanto per le discipline/aree disciplinari per le quali è prevista una progettazione personalizzata. Nella scuola primaria non è previsto il percorso differenziato (opzione C).",
    noteValutazione: "La valutazione finale degli apprendimenti è di competenza di tutto il Team dei docenti.",
    certCompetenze: "Solo per alunni/e in uscita dalle classi quinte (D.M. 742/2017) – Competenze chiave europee e Competenze dal Profilo dello studente al termine del primo ciclo di istruzione.",
  },

  sec1: {
    haProgettazioneDisciplinare: true,
    haFSL: false,
    haPercorsoDifferenziato: false,
    haCertificazioneCompetenze: true,
    haValutazioneComportamento: true,
    titolo81: "8.1 – Modalità di sostegno didattico e ulteriori interventi di inclusione",
    desc81: "Interventi educativo-didattici, strategie, strumenti nelle diverse discipline/aree disciplinari. Include indicazioni di orientamento scolastico.",
    opzioni82: [
      "A – Segue la progettazione didattica della classe (stessi criteri di valutazione)",
      "B – Personalizzazioni rispetto alla progettazione della classe",
    ],
    note82: "Compilare soltanto per le discipline/aree disciplinari per le quali è prevista una progettazione personalizzata. Nella scuola secondaria di primo grado non è previsto il percorso differenziato (opzione C).",
    noteValutazione: "La valutazione finale degli apprendimenti è di competenza di tutto il Consiglio di classe.",
    certCompetenze: "Solo per alunni/e in uscita dalle classi terze (D.M. 742/2017) – Competenze chiave europee e Competenze dal Profilo dello studente al termine del primo ciclo di istruzione.",
  },

  sec2: {
    haProgettazioneDisciplinare: true,
    haFSL: true,
    haPercorsoDifferenziato: true,
    haCertificazioneCompetenze: true,
    haValutazioneComportamento: true,
    titolo81: "8.1 – Modalità di sostegno didattico e ulteriori interventi di inclusione",
    desc81: "Include indicazioni di orientamento scolastico e raccordo con la FSL (Formazione Scuola-Lavoro).",
    opzioni82: [
      "A – Segue la progettazione didattica della classe (stessi criteri di valutazione)",
      "B – Personalizzazioni rispetto alla progettazione della classe (verifiche identiche o equipollenti)",
      "C – Percorso didattico differenziato con verifiche non equipollenti",
    ],
    note82: "Per ogni disciplina indicare l'opzione scelta e, per la B, le personalizzazioni adottate. Il percorso C (differenziato) va esplicitamente deliberato dal Consiglio di classe.",
    noteValutazione: "La valutazione finale degli apprendimenti è di competenza del Consiglio di classe.",
    certCompetenze: "Solo per classi seconde – Certificazione delle competenze relative all'assolvimento dell'obbligo d'istruzione (D.M. 139/2007 e D.M. 9/2010).",
    percorsoDifferenziato: "Lo/a studente/essa segue un percorso didattico di tipo: □ A. ordinario  □ B. personalizzato (con prove equipollenti)  □ C. differenziato",
  },
};

// ── Campi di esperienza (Infanzia) ────────────────────────────────────────────
const CAMPI_ESPERIENZA = [
  "Il sé e l'altro",
  "Il corpo e il movimento",
  "Immagini, suoni, colori",
  "I discorsi e le parole",
  "La conoscenza del mondo",
];

// ── Discipline per grado (Primaria e Sec. 1°) ─────────────────────────────────
const DISCIPLINE_PRIMARIA = [
  "Italiano",
  "Matematica",
  "Storia",
  "Geografia",
  "Scienze",
  "Tecnologia",
  "Musica",
  "Arte e Immagine",
  "Educazione motoria",
  "Inglese",
  "Religione / Attività alternativa",
];

const DISCIPLINE_SEC1 = [
  "Italiano",
  "Storia",
  "Geografia",
  "Matematica",
  "Scienze",
  "Tecnologia",
  "Musica",
  "Arte e Immagine",
  "Educazione Fisica",
  "Prima Lingua Straniera (Inglese)",
  "Seconda Lingua Straniera",
  "Religione / Attività alternativa",
];

// ── Istituti Sec. 2° grado con discipline ─────────────────────────────────────
// ── Quadri orari sec. 2° grado ────────────────────────────────────────────────
// Ogni indirizzo ha un elenco di discipline per il BIENNIO (classi 1ª-2ª) e uno per il TRIENNIO (3ª-5ª).
// Forma "legacy": un semplice array = stesso elenco per tutte le classi (indirizzi non ancora migrati).
// Forma per anno (Professionali, migrati da D.M. 33/2020 – Quadri orari nuovi istituti professionali):
//   ip(biennioIndirizzo, triennioIndirizzo, triennioOpzionali)
// Le discipline "opzionali" sono quelle con soglia minima 0 ore nel quadro orario: alternative tra
// loro secondo la caratterizzazione dell'istituto (art. 3 c. 5 D.Lgs. 61/2017). Sono incluse nell'elenco
// del triennio ma segnalate a parte (v. getOpzionaliSec2) perché l'istituto potrebbe non attivarle.
const IP_GEN_BIENNIO = ["Italiano","Storia","Geografia","Matematica","Lingua Straniera (Inglese)","Diritto ed Economia","Scienze Motorie e Sportive","Religione / Attività alternativa"];
const IP_GEN_TRIENNIO = ["Italiano","Storia","Matematica","Lingua Straniera (Inglese)","Scienze Motorie e Sportive","Religione / Attività alternativa"];
// Istituti Tecnici: DUE ordinamenti (vedi getOrdinamentoSec2)
//  - vigente: DPR 88/2010 (classi non ancora passate al nuovo ordinamento)
//  - nuovoOrdinamento: D.M. 29/2026 (Valditara), dalle classi PRIME del 2026/27, poi una classe in più ogni anno
// Nell'ordinamento nuovo l'area generale è l'Allegato B, l'area di indirizzo "flessibile" gli Allegati C1-C11.
// Le discipline specifiche delle articolazioni (alternative tra loro) sono nelle opzionali.
const IT_GEN_BIENNIO_VIGENTE = ["Italiano","Storia","Matematica","Lingua Straniera (Inglese)","Diritto ed Economia","Scienze Integrate (Scienze della Terra e Biologia)","Scienze Motorie e Sportive","Religione / Attività alternativa"];
const IT_GEN_TRIENNIO = ["Italiano","Storia","Matematica","Lingua Straniera (Inglese)","Scienze Motorie e Sportive","Religione / Attività alternativa"];
const IT_GEN_BIENNIO_NUOVO = ["Italiano","Storia","Geografia","Matematica","Lingua Straniera (Inglese)","Diritto ed Economia","Scienze Motorie e Sportive","Religione / Attività alternativa"];
const IT_NUOVO_DAL = 2026; // anno scolastico di inizio (2026/27) per le classi prime
function it(bV, tV, oV, bN, tN, oN) {
  return {
    biennio: [...IT_GEN_BIENNIO_VIGENTE, ...bV],
    triennio: [...IT_GEN_TRIENNIO, ...tV, ...oV],
    triennioOpzionali: [...oV],
    nuovoOrdinamento: {
      biennio: [...IT_GEN_BIENNIO_NUOVO, ...bN],
      triennio: [...IT_GEN_TRIENNIO, ...tN, ...oN],
      triennioOpzionali: [...oN],
      dal: IT_NUOVO_DAL,
    },
  };
}
// Licei: piano degli studi vigente (DPR 89/2010, Allegati B-G) con biennio e triennio distinti
// biennioOpz/triennioOpz: discipline specifiche di indirizzo o sezione (alternative tra loro), incluse nell'elenco
function lic(biennio, triennio, biennioOpz = [], triennioOpz = []) {
  return {
    biennio: [...biennio, ...biennioOpz],
    triennio: [...triennio, ...triennioOpz],
    biennioOpzionali: [...biennioOpz],
    triennioOpzionali: [...triennioOpz],
  };
}
function ip(biennioInd, triennioInd, opz = []) {
  return {
    biennio: [...IP_GEN_BIENNIO, ...biennioInd],
    triennio: [...IP_GEN_TRIENNIO, ...triennioInd, ...opz],
    triennioOpzionali: [...opz],
  };
}

const QUADRI_ORARI_SEC2 = {
  "Liceo Classico": lic(
    ["Italiano","Latino","Greco","Lingua Straniera (Inglese)","Storia e Geografia","Matematica","Scienze Naturali","Scienze Motorie e Sportive","Religione / Attività alternativa"],
    ["Italiano","Latino","Greco","Lingua Straniera (Inglese)","Storia","Filosofia","Matematica","Fisica","Scienze Naturali","Storia dell'Arte","Scienze Motorie e Sportive","Religione / Attività alternativa"]
  ),
  "Liceo Scientifico": lic(
    ["Italiano","Latino","Lingua Straniera (Inglese)","Storia e Geografia","Matematica","Fisica","Scienze Naturali","Disegno e Storia dell'Arte","Scienze Motorie e Sportive","Religione / Attività alternativa"],
    ["Italiano","Latino","Lingua Straniera (Inglese)","Storia","Filosofia","Matematica","Fisica","Scienze Naturali","Disegno e Storia dell'Arte","Scienze Motorie e Sportive","Religione / Attività alternativa"]
  ),
  "Liceo Scientifico – opzione Scienze Applicate": lic(
    ["Italiano","Lingua Straniera (Inglese)","Storia e Geografia","Matematica","Informatica","Fisica","Scienze Naturali","Disegno e Storia dell'Arte","Scienze Motorie e Sportive","Religione / Attività alternativa"],
    ["Italiano","Lingua Straniera (Inglese)","Storia","Filosofia","Matematica","Informatica","Fisica","Scienze Naturali","Disegno e Storia dell'Arte","Scienze Motorie e Sportive","Religione / Attività alternativa"]
  ),
  "Liceo Linguistico": lic(
    ["Italiano","Latino","Prima Lingua Straniera (Inglese)","Seconda Lingua Straniera","Terza Lingua Straniera","Storia e Geografia","Matematica","Scienze Naturali","Scienze Motorie e Sportive","Religione / Attività alternativa"],
    ["Italiano","Prima Lingua Straniera (Inglese)","Seconda Lingua Straniera","Terza Lingua Straniera","Storia","Filosofia","Matematica","Fisica","Scienze Naturali","Storia dell'Arte","Scienze Motorie e Sportive","Religione / Attività alternativa"]
  ),
  "Liceo delle Scienze Umane": lic(
    ["Italiano","Latino","Storia e Geografia","Scienze Umane","Diritto ed Economia","Lingua Straniera (Inglese)","Matematica","Scienze Naturali","Scienze Motorie e Sportive","Religione / Attività alternativa"],
    ["Italiano","Latino","Storia","Filosofia","Scienze Umane","Lingua Straniera (Inglese)","Matematica","Fisica","Scienze Naturali","Storia dell'Arte","Scienze Motorie e Sportive","Religione / Attività alternativa"]
  ),
  "Liceo delle Scienze Umane – opzione economico-sociale": lic(
    ["Italiano","Storia e Geografia","Scienze Umane","Diritto ed Economia Politica","Lingua Straniera (Inglese)","Seconda Lingua Straniera","Matematica","Scienze Naturali","Scienze Motorie e Sportive","Religione / Attività alternativa"],
    ["Italiano","Storia","Filosofia","Scienze Umane","Diritto ed Economia Politica","Lingua Straniera (Inglese)","Seconda Lingua Straniera","Matematica","Fisica","Storia dell'Arte","Scienze Motorie e Sportive","Religione / Attività alternativa"]
  ),
  "Liceo Scientifico – sezione a indirizzo sportivo": lic(
    ["Italiano","Lingua Straniera (Inglese)","Storia e Geografia","Matematica","Fisica","Scienze Naturali","Scienze Motorie e Sportive","Discipline Sportive","Religione / Attività alternativa"],
    ["Italiano","Lingua Straniera (Inglese)","Storia","Filosofia","Matematica","Fisica","Scienze Naturali","Diritto ed Economia dello Sport","Scienze Motorie e Sportive","Discipline Sportive","Religione / Attività alternativa"],
    [],
    []
  ),
  "Liceo del Made in Italy": lic(
    ["Italiano","Storia e Geografia","Diritto","Economia Politica","Lingua Straniera (Inglese)","Seconda Lingua Straniera","Matematica","Scienze Naturali","Storia dell'Arte e del Design","Scienze Motorie e Sportive","Religione / Attività alternativa"],
    ["Italiano","Storia","Filosofia","Scienze Giuridiche per il Made in Italy","Scienze Economiche per il Made in Italy","Lingua Straniera (Inglese)","Seconda Lingua Straniera","Matematica","Fisica","Storia dell'Arte e del Design","Laboratorio Interdisciplinare per il Made in Italy","Scienze Motorie e Sportive","Religione / Attività alternativa"],
    [],
    []
  ),
  "Liceo Artistico": lic(
    ["Italiano","Lingua Straniera (Inglese)","Storia e Geografia","Matematica","Scienze Naturali","Storia dell'Arte","Discipline Grafiche e Pittoriche","Discipline Geometriche","Discipline Plastiche e Scultoree","Laboratorio Artistico","Scienze Motorie e Sportive","Religione / Attività alternativa"],
    ["Italiano","Lingua Straniera (Inglese)","Storia","Filosofia","Matematica","Fisica","Storia dell'Arte","Scienze Motorie e Sportive","Religione / Attività alternativa"],
    [],
    ["Chimica dei Materiali","Scienze Naturali","Laboratorio della Figurazione","Discipline Pittoriche e/o Discipline Plastiche e Scultoree","Laboratorio di Architettura","Discipline Progettuali Architettura e Ambiente","Laboratorio del Design","Discipline Progettuali Design","Laboratorio Audiovisivo e Multimediale","Discipline Audiovisive e Multimediali","Laboratorio di Grafica","Discipline Grafiche","Laboratorio di Scenografia","Discipline Geometriche e Scenotecniche","Discipline Progettuali Scenografiche"]
  ),
  "Liceo Musicale e Coreutico": lic(
    ["Italiano","Lingua Straniera (Inglese)","Storia e Geografia","Matematica","Scienze Naturali","Storia dell'Arte","Religione / Attività alternativa"],
    ["Italiano","Lingua Straniera (Inglese)","Storia","Filosofia","Matematica","Fisica","Storia dell'Arte","Religione / Attività alternativa"],
    ["Scienze Motorie e Sportive","Esecuzione e Interpretazione","Teoria, Analisi e Composizione","Storia della Musica","Laboratorio di Musica d'Insieme","Tecnologie Musicali","Tecniche della Danza","Laboratorio Coreutico","Teoria e Pratica Musicale della Danza"],
    ["Scienze Motorie e Sportive","Esecuzione e Interpretazione","Teoria, Analisi e Composizione","Storia della Musica","Laboratorio di Musica d'Insieme","Tecnologie Musicali","Storia della Danza","Tecniche della Danza","Laboratorio Coreografico"]
  ),
  "IT – Amministrazione, finanza e marketing": it(
    ["Scienze Integrate (Fisica)","Scienze Integrate (Chimica)","Geografia","Informatica","Seconda Lingua Straniera","Economia Aziendale"],
    ["Informatica","Seconda Lingua Straniera","Economia Aziendale","Diritto","Economia Politica"],
    ["Terza Lingua Straniera","Economia Aziendale e Geo-politica","Relazioni Internazionali","Tecnologie della Comunicazione"],
    ["Scienze Sperimentali","Economia Aziendale","Tecnologie dell'Informazione e della Comunicazione (TIC)","Geografia Economica","Seconda Lingua Straniera"],
    ["Economia Aziendale","Informatica Applicata","Diritto","Economia Politica","Seconda Lingua Straniera"],
    ["Relazioni Internazionali","Terza Lingua Straniera"]
  ),
  "IT – Turismo": it(
    ["Scienze Integrate (Fisica)","Scienze Integrate (Chimica)","Geografia","Informatica","Seconda Lingua Straniera","Economia Aziendale"],
    ["Seconda Lingua Straniera","Terza Lingua Straniera","Discipline Turistiche e Aziendali","Geografia Turistica","Diritto e Legislazione Turistica","Arte e Territorio"],
    [],
    ["Scienze Sperimentali","Seconda Lingua Straniera","Tecnologie dell'Informazione e della Comunicazione (TIC)","Economia Aziendale","Geografia Turistica"],
    ["Seconda Lingua Straniera","Terza Lingua Straniera","Discipline Turistiche Aziendali","Legislazione Turistica, dei Beni Culturali e Ambientali","Territorio e Turismo"],
    []
  ),
  "IT – Meccanica, meccatronica ed energia": it(
    ["Scienze Integrate (Fisica)","Scienze Integrate (Chimica)","Tecnologie e Tecniche di Rappresentazione Grafica","Tecnologie Informatiche","Scienze e Tecnologie Applicate"],
    ["Complementi di Matematica","Meccanica, Macchine ed Energia","Sistemi e Automazione","Tecnologie Meccaniche di Processo e Prodotto"],
    ["Disegno, Progettazione e Organizzazione Industriale","Impianti Energetici, Disegno e Progettazione"],
    ["Scienze Sperimentali","Tecnologie dell'Informazione e della Comunicazione (TIC)","Tecnologie e Tecniche di Rappresentazione Grafica","Fondamenti di Meccanica ed Elementi di Disegno","Elementi di Elettrotecnica ed Elettronica per la Meccatronica","Tecnologie dei Materiali"],
    [],
    ["Meccanica, Meccatronica e Robotica Industriale","Tecniche di Produzione e Digitalizzazione del Processo","Organizzazione e Manutenzione dei Processi e dei Sistemi Produttivi","Disegno, Modellazione 3D e Prototipazione","Impianti, Macchine e Sistemi Automatici per l'Energia","Gestione dei Progetti, Disegno e Manutenzione di Impianti","Meccanica Applicata alle Macchine","Tecnologie dei Materiali e Tecniche di Produzione"]
  ),
  "IT – Trasporti e logistica": it(
    ["Scienze Integrate (Fisica)","Scienze Integrate (Chimica)","Tecnologie e Tecniche di Rappresentazione Grafica","Tecnologie Informatiche","Scienze e Tecnologie Applicate"],
    ["Complementi di Matematica","Elettrotecnica, Elettronica e Automazione","Diritto ed Economia","Logistica"],
    ["Struttura, Costruzione, Sistemi e Impianti del Mezzo","Meccanica, Macchine e Sistemi Propulsivi","Scienze della Navigazione, Struttura e Costruzione del Mezzo","Meccanica e Macchine","Scienze della Navigazione e Struttura dei Mezzi di Trasporto"],
    ["Scienze Sperimentali","Tecnologie dell'Informazione e della Comunicazione (TIC)","Tecnologie e Tecniche di Rappresentazione Grafica","Scienze e Tecnologie dei Trasporti"],
    [],
    ["Progettazione e Costruzioni Navali","Meccanica, Impianti e Allestimento Navale","Logistica del Cantiere Navale","Progettazione e Costruzioni Aeronautiche","Meccanica e Sistemi Propulsivi","Elettrotecnica ed Avionica","Logistica Industriale e Aeronautica","Aeronavigabilità e Sistemi di Bordo","Struttura, Costruzione, Sistemi e Impianti del Mezzo","Meccanica, Macchine e Sistemi Propulsivi","Elettrotecnica, Elettronica ed Automazione","Diritto","Logistica","Scienze della Navigazione e Tecnologie Nautiche","Scienze e Tecnologie Elettriche ed Elettroniche","Scienze e Tecnologie Meccaniche","Diritto del Mare e dei Trasporti","Logistica dei Trasporti e Gestione Portuale","Scienze della Navigazione e Tecnologie Aeronautiche","Meccanica del Mezzo Aereo","Elettrotecnica, Elettronica e Radartecnica","Diritto Aeronautico","Logistica Aeroportuale e Gestione del Traffico Aereo","Scienze della Navigazione, Struttura e Costruzione del Mezzo","Meccanica e Macchine","Struttura dei Mezzi e delle Infrastrutture di Trasporto","Tecnologie e Impianti di Trasporto","Tecnologie Digitali e Sistemi Informativi della Logistica","Diritto ed Economia dei Trasporti"]
  ),
  "IT – Elettronica ed elettrotecnica": it(
    ["Scienze Integrate (Fisica)","Scienze Integrate (Chimica)","Tecnologie e Tecniche di Rappresentazione Grafica","Tecnologie Informatiche","Scienze e Tecnologie Applicate"],
    ["Complementi di Matematica","Tecnologie e Progettazione di Sistemi Elettrici ed Elettronici","Elettrotecnica ed Elettronica","Sistemi Automatici"],
    [],
    ["Scienze Sperimentali","Tecnologie dell'Informazione e della Comunicazione (TIC)","Tecnologie e Tecniche di Rappresentazione Grafica","Fondamenti di Elettrotecnica ed Elettronica"],
    ["Elettrotecnica ed Elettronica","Sistemi Automatici","Tecnologie e Progettazione","Complementi di Matematica"],
    []
  ),
  "IT – Informatica e telecomunicazioni": it(
    ["Scienze Integrate (Fisica)","Scienze Integrate (Chimica)","Tecnologie e Tecniche di Rappresentazione Grafica","Tecnologie Informatiche","Scienze e Tecnologie Applicate"],
    ["Complementi di Matematica","Sistemi e Reti","Tecnologie e Progettazione di Sistemi Informatici e di Telecomunicazioni","Gestione Progetto, Organizzazione d'Impresa","Informatica","Telecomunicazioni"],
    [],
    ["Scienze Sperimentali","Tecnologie e Tecniche di Rappresentazione Grafica","Informatica e Reti di Comunicazione"],
    ["Sistemi e Reti","Tecnologie e Progettazione di Sistemi Informatici e di Telecomunicazioni","Informatica","Telecomunicazioni","Complementi di Matematica"],
    []
  ),
  "IT – Grafica e comunicazione": it(
    ["Scienze Integrate (Fisica)","Scienze Integrate (Chimica)","Tecnologie e Tecniche di Rappresentazione Grafica","Tecnologie Informatiche","Scienze e Tecnologie Applicate"],
    ["Complementi di Matematica","Teoria della Comunicazione","Progettazione Multimediale","Tecnologie dei Processi di Produzione","Organizzazione e Gestione dei Processi Produttivi","Laboratori Tecnici"],
    [],
    ["Scienze Sperimentali","Tecnologie e Tecniche di Rappresentazione Grafica","Laboratorio di Tecnologie Digitali","Teoria e Tecnica della Comunicazione"],
    ["Teoria e Tecnica della Comunicazione","Progettazione Multimediale","Tecnologie, Organizzazione e Gestione dei Processi Produttivi","Laboratori Tecnici"],
    []
  ),
  "IT – Chimica, materiali e biotecnologie": it(
    ["Scienze Integrate (Fisica)","Scienze Integrate (Chimica)","Tecnologie e Tecniche di Rappresentazione Grafica","Tecnologie Informatiche","Scienze e Tecnologie Applicate"],
    ["Complementi di Matematica","Chimica Analitica e Strumentale","Chimica Organica e Biochimica"],
    ["Tecnologie Chimiche Industriali","Biologia, Microbiologia e Tecnologie di Controllo Ambientale","Fisica Ambientale","Biologia, Microbiologia e Tecnologie di Controllo Sanitario","Igiene, Anatomia, Fisiologia, Patologia","Legislazione Sanitaria"],
    ["Scienze Sperimentali","Tecnologie dell'Informazione e della Comunicazione (TIC)","Tecnologie e Tecniche di Rappresentazione Grafica","Chimica Applicata"],
    [],
    ["Tecnologie Chimiche","Chimica Analitica","Chimica Organica","Chimica Organica e Biochimica","Chimica Analitica e Strumentale","Biologia, Microbiologia e Tecnologie di Controllo Ambientale","Fisica Ambientale","Igiene, Anatomia e Patologia","Biologia, Microbiologia e Tecnologie di Controllo Sanitario","Legislazione Sanitaria"]
  ),
  "IT – Sistema moda": it(
    ["Scienze Integrate (Fisica)","Scienze Integrate (Chimica)","Tecnologie e Tecniche di Rappresentazione Grafica","Tecnologie Informatiche","Scienze e Tecnologie Applicate"],
    ["Complementi di Matematica","Chimica Applicata e Nobilitazione dei Materiali per i Prodotti Moda","Economia e Marketing delle Aziende della Moda","Tecnologie dei Materiali e dei Processi Produttivi e Organizzativi della Moda","Ideazione, Progettazione e Industrializzazione dei Prodotti Moda"],
    [],
    ["Scienze Sperimentali","Tecnologie dell'Informazione e della Comunicazione (TIC)","Tecnologie e Tecniche di Rappresentazione Grafica","Laboratorio di Tecniche Creative per il Tessile/Moda"],
    ["Tecnologie dei Materiali e Processi Produttivi","Economia e Marketing delle Aziende della Moda"],
    ["Ideazione e Progettazione Prodotti Tessili/Moda e Laboratorio CAD","Chimica Applicata, Nobilitazione e Sostenibilità dei Prodotti Tessili/Moda","Ideazione e Progettazione Calzatura Moda e Laboratorio CAD","Chimica Applicata, Nobilitazione e Sostenibilità dei Componenti e Prodotti Calzatura"]
  ),
  "IT – Agraria, agroalimentare e agroindustria": it(
    ["Scienze Integrate (Fisica)","Scienze Integrate (Chimica)","Tecnologie e Tecniche di Rappresentazione Grafica","Tecnologie Informatiche","Scienze e Tecnologie Applicate"],
    ["Complementi di Matematica","Produzioni Animali","Produzioni Vegetali","Trasformazione dei Prodotti","Economia, Estimo, Marketing e Legislazione","Genio Rurale","Biotecnologie Agrarie","Gestione dell'Ambiente e del Territorio"],
    ["Viticoltura e Difesa della Vite","Enologia","Biotecnologie Vitivinicole"],
    ["Scienze Sperimentali","Informatica e Smart Farming","Tecnologie e Tecniche di Rappresentazione Grafica","Agrobiologia","Fondamenti di Scienze Agrarie"],
    ["Produzioni Animali","Produzioni Vegetali","Trasformazioni dei Prodotti","Economia, Estimo, Marketing e Legislazione","Genio Rurale"],
    ["Biotecnologie Agrarie e Sicurezza Alimentare","Gestione Ambiente e Territorio","Viticoltura e Difesa della Vite","Enologia","Microbiologia e Chimica Enologica"]
  ),
  "IT – Costruzioni, ambiente e territorio": it(
    ["Scienze Integrate (Fisica)","Scienze Integrate (Chimica)","Tecnologie e Tecniche di Rappresentazione Grafica","Tecnologie Informatiche","Scienze e Tecnologie Applicate"],
    ["Complementi di Matematica","Gestione del Cantiere e Sicurezza dell'Ambiente di Lavoro","Progettazione, Costruzioni e Impianti","Geopedologia, Economia ed Estimo","Topografia"],
    ["Geologia e Geologia Applicata","Topografia e Costruzioni","Tecnologie per la Gestione del Territorio e dell'Ambiente"],
    ["Scienze Sperimentali","Tecnologie dell'Informazione e della Comunicazione (TIC)","Tecnologie e Tecniche di Rappresentazione Grafica","Fondamenti di Progettazione Edilizia e Ambiente","Fisica Applicata alle Strutture e all'Ambiente"],
    ["Salvaguardia, Valorizzazione e Valutazione dei Beni e del Territorio","Rilievo e Geomatica"],
    ["Progettazione, Edilizia, Sostenibilità e Sicurezza","Progettazione e Tecnologie per la Gestione del Territorio e dell'Ambiente","Geologia e Geologia Applicata","Progettazione Sostenibile, Bioarchitettura, Tecnologie del Legno nelle Costruzioni e Sicurezza"]
  ),
  "IP – Agricoltura, sviluppo rurale, valorizzazione dei prodotti del territorio e gestione delle risorse forestali e montane": ip(
    ["Scienze Integrate","Ecologia e Pedologia","Tecnologie dell'Informazione e della Comunicazione (TIC)","Laboratorio di Scienze e Tecnologie Agrarie"],
    ["Laboratorio di Biologia e di Chimica Applicata ai Processi di Trasformazione","Agronomia del Territorio Agrario e Forestale","Tecniche delle Produzioni Vegetali e Zootecniche","Economia Agraria e Legislazione di Settore Agraria e Forestale","Gestione e Valorizzazione delle Attività Produttive e Sviluppo del Territorio e Sociologia Rurale"],
    ["Logistica e Marketing dei Prodotti Agroalimentari","Agricoltura Sostenibile e Biologica","Selvicoltura, Dendrometria e Utilizzazioni Forestali","Assestamento Forestale, Gestione Parchi, Aree Protette e Fauna Selvatica"]
  ),
  "IP – Pesca commerciale e produzioni ittiche": ip(
    ["Scienze Integrate","Tecnologie dell'Informazione e della Comunicazione (TIC)","Laboratori Tecnologici ed Esercitazioni","Ecologia Applicata alla Pesca e all'Acquacoltura"],
    ["Ecologia Applicata alla Pesca e all'Acquacoltura","Tecnologie e Tecniche di Gestione e Conduzione delle Imbarcazioni da Pesca","Tecnologie e Tecniche di Pesca ed Acquacoltura Sostenibili","Diritto ed Economia della Filiera Ittica","Tecnologie e Tecniche di Conduzione e Manutenzione di Apparati ed Impianti"],
    []
  ),
  "IP – Industria e artigianato per il Made in Italy": ip(
    ["Scienze Integrate","Tecnologie dell'Informazione e della Comunicazione (TIC)","Laboratori Tecnologici ed Esercitazioni","Tecnologie, Disegno e Progettazione"],
    ["Laboratori Tecnologici ed Esercitazioni","Tecnologie Applicate ai Materiali e ai Processi Produttivi","Progettazione e Produzione"],
    ["Tecniche di Gestione e Organizzazione del Processo Produttivo","Tecniche di Distribuzione e Marketing","Storia delle Arti Applicate"]
  ),
  "IP – Manutenzione e assistenza tecnica": ip(
    ["Scienze Integrate","Tecnologie dell'Informazione e della Comunicazione (TIC)","Tecnologie e Tecniche di Rappresentazione Grafica","Laboratori Tecnologici ed Esercitazioni"],
    ["Tecnologie Meccaniche e Applicazioni","Tecnologie Elettriche-Elettroniche e Applicazioni","Tecnologie e Tecniche di Installazione e di Manutenzione e di Diagnostica","Laboratori Tecnologici ed Esercitazioni"],
    []
  ),
  "IP – Gestione delle acque e risanamento ambientale": ip(
    ["Scienze Integrate","Tecnologie dell'Informazione e della Comunicazione (TIC)","Laboratori Tecnologici ed Esercitazioni","Tecnologie delle Risorse Idriche e Geologiche"],
    ["Tecnologie delle Risorse Idriche e Geologiche","Chimica Applicata alla Gestione delle Risorse Idriche e Risanamento Ambientale","Microbiologia Applicata alla Gestione e Risanamento Ambientale","Tecniche di Gestione e Controllo delle Reti ed Impianti Civili ed Industriali"],
    []
  ),
  "IP – Servizi commerciali": ip(
    ["Scienze Integrate","Tecnologie dell'Informazione e della Comunicazione (TIC)","Seconda Lingua Straniera","Tecniche Professionali dei Servizi Commerciali","Laboratorio di Espressioni Grafico-Artistiche"],
    ["Seconda Lingua Straniera","Tecniche Professionali dei Servizi Commerciali"],
    ["Diritto/Economia","Tecniche di Comunicazione","Informatica","Economia Aziendale","Storia dell'Arte ed Espressioni Grafico-Artistiche"]
  ),
  "IP – Enogastronomia e ospitalità alberghiera": ip(
    ["Seconda Lingua Straniera","Scienze Integrate","Tecnologie dell'Informazione e della Comunicazione (TIC)","Scienza degli Alimenti","Laboratorio dei Servizi Enogastronomici – Cucina","Laboratorio dei Servizi Enogastronomici – Bar, Sala e Vendita","Laboratorio dei Servizi di Accoglienza Turistica"],
    ["Seconda Lingua Straniera","Diritto e Tecniche Amministrative"],
    ["Scienza e Cultura dell'Alimentazione","Laboratorio Enogastronomia – Cucina","Laboratorio Enogastronomia – Bar, Sala e Vendita","Laboratorio di Accoglienza Turistica","Laboratorio di Arte Bianca e Pasticceria","Tecniche di Comunicazione","Arte e Territorio","Tecniche di Organizzazione e Gestione dei Processi Produttivi"]
  ),
  "IP – Servizi culturali e dello spettacolo": ip(
    ["Scienze Integrate","Tecnologie dell'Informazione e della Comunicazione (TIC)","Tecniche e Tecnologie della Comunicazione Visiva","Linguaggi Fotografici e dell'Audiovisivo","Laboratori Tecnologici ed Esercitazioni"],
    ["Laboratori Tecnologici ed Esercitazioni","Tecnologie della Fotografia e degli Audiovisivi","Progettazione e Realizzazione del Prodotto Fotografico e Audiovisivo","Storia delle Arti Visive","Linguaggi e Tecniche della Fotografia e dell'Audiovisivo"],
    []
  ),
  "IP – Servizi per la sanità e l'assistenza sociale": ip(
    ["Seconda Lingua Straniera","Tecnologie dell'Informazione e della Comunicazione (TIC)","Scienze Integrate","Metodologie Operative","Scienze Umane e Sociali"],
    ["Seconda Lingua Straniera","Metodologie Operative","Igiene e Cultura Medico-Sanitaria","Psicologia Generale e Applicata","Diritto, Economia e Tecnica Amministrativa del Settore Socio-Sanitario"],
    []
  ),
  "IP – Arti ausiliarie delle professioni sanitarie: odontotecnico": ip(
    ["Scienze Integrate","Tecnologie dell'Informazione e della Comunicazione (TIC)","Anatomia Fisiologia Igiene","Rappresentazione e Modellazione Odontotecnica","Esercitazioni di Laboratorio di Odontotecnica"],
    ["Anatomia Fisiologia Igiene","Gnatologia","Rappresentazione e Modellazione Odontotecnica","Esercitazioni di Laboratorio di Odontotecnica","Scienze dei Materiali Dentali","Diritto e Legislazione Socio-Sanitaria"],
    []
  ),
  "IP – Arti ausiliarie delle professioni sanitarie: ottico": ip(
    ["Scienze Integrate","Tecnologie dell'Informazione e della Comunicazione (TIC)","Discipline Sanitarie","Ottica, Ottica Applicata","Esercitazioni di Lenti Oftalmiche"],
    ["Discipline Sanitarie","Ottica, Ottica Applicata","Esercitazioni di Lenti Oftalmiche","Esercitazioni di Optometria","Esercitazioni di Contattologia","Diritto e Legislazione Socio-Sanitaria"],
    []
  ),
};

const _unione = v => {
  if (Array.isArray(v)) return v;
  const liste = [v.biennio, v.triennio, ...(v.nuovoOrdinamento ? [v.nuovoOrdinamento.biennio, v.nuovoOrdinamento.triennio] : [])];
  return [...new Set(liste.flat())];
};
// Elenco piatto (unione di biennio+triennio e, per i Tecnici, di entrambi gli ordinamenti) per compatibilità
const ISTITUTI_SEC2 = Object.fromEntries(Object.entries(QUADRI_ORARI_SEC2).map(([k, v]) => [k, _unione(v)]));

// Anno di corso (1-5) dall'età, stessa formula di calcolaClasse() in pei-prompt.js
function annoCorsoSec2(eta) {
  const e = parseInt(eta, 10) || 0;
  return Math.min(Math.max(e - 13, 1), 5);
}
// Anno scolastico corrente (anno di inizio): da settembre in poi è l'anno solare, altrimenti quello precedente
function annoScolasticoInizio(data = new Date()) {
  return data.getMonth() >= 8 ? data.getFullYear() : data.getFullYear() - 1;
}
// Ordinamento che si applica a un indirizzo per la classe corrispondente all'età nell'anno scolastico dato:
//   'nuovo'   = nuovoOrdinamento (Tecnici, D.M. 29/2026: dal 2026/27 le sole classi prime, poi una classe in più ogni anno)
//   'vigente' = quadro orario vigente (Professionali, Licei, Tecnici per le classi non ancora passate)
function getOrdinamentoSec2(istituto, eta, asInizio = annoScolasticoInizio()) {
  const v = QUADRI_ORARI_SEC2[istituto];
  if (!v || Array.isArray(v) || !v.nuovoOrdinamento) return 'vigente';
  return annoCorsoSec2(eta) <= (asInizio - v.nuovoOrdinamento.dal + 1) ? 'nuovo' : 'vigente';
}
function _quadro(istituto, eta, asInizio) {
  const v = QUADRI_ORARI_SEC2[istituto];
  if (!v || Array.isArray(v)) return v || null;
  return getOrdinamentoSec2(istituto, eta, asInizio) === 'nuovo' ? v.nuovoOrdinamento : v;
}
// Discipline di un indirizzo sec2 per la classe corrispondente all'età (biennio se 1ª-2ª, triennio altrimenti)
function getDisciplineSec2(istituto, eta, asInizio = annoScolasticoInizio()) {
  const q = _quadro(istituto, eta, asInizio);
  if (!q) return [];
  if (Array.isArray(q)) return q;
  return annoCorsoSec2(eta) <= 2 ? q.biennio : q.triennio;
}
// Discipline opzionali/alternative presenti nell'elenco per la classe (se definite per quel biennio/triennio)
function getOpzionaliSec2(istituto, eta, asInizio = annoScolasticoInizio()) {
  const q = _quadro(istituto, eta, asInizio);
  if (!q || Array.isArray(q)) return [];
  return (annoCorsoSec2(eta) <= 2 ? q.biennioOpzionali : q.triennioOpzionali) || [];
}

/**
 * Ritorna la configurazione completa per un grado scolastico dato.
 * @param {string} grado  "infanzia" | "primaria" | "sec1" | "sec2"
 * @param {string} [istituto]  solo per sec2
 * @param {number|string} [eta]  solo per sec2: seleziona l'elenco del biennio o del triennio
 */
function getConfig(grado, istituto = null, eta = null, asInizio = annoScolasticoInizio()) {
  const term   = TERMINOLOGIA[grado];
  const sez8   = STRUTTURA_SEZ8[grado];
  const std81  = testoStandard81(term);

  let discipline = [];
  if (grado === 'infanzia') discipline = CAMPI_ESPERIENZA;
  else if (grado === 'primaria') discipline = DISCIPLINE_PRIMARIA;
  else if (grado === 'sec1') discipline = DISCIPLINE_SEC1;
  else if (grado === 'sec2' && istituto) discipline = getDisciplineSec2(istituto, eta, asInizio);

  return { term, sez8, std81, discipline, istituti: grado === 'sec2' ? ISTITUTI_SEC2 : null };
}

export {
  TERMINOLOGIA,
  STRUTTURA_SEZ8,
  CAMPI_ESPERIENZA,
  DISCIPLINE_PRIMARIA,
  DISCIPLINE_SEC1,
  ISTITUTI_SEC2,
  QUADRI_ORARI_SEC2,
  getDisciplineSec2,
  getOpzionaliSec2,
  getOrdinamentoSec2,
  annoScolasticoInizio,
  annoCorsoSec2,
  testoStandard81,
  getConfig,
};
