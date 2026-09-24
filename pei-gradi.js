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
function ip(biennioInd, triennioInd, opz = []) {
  return {
    biennio: [...IP_GEN_BIENNIO, ...biennioInd],
    triennio: [...IP_GEN_TRIENNIO, ...triennioInd, ...opz],
    triennioOpzionali: [...opz],
  };
}

const QUADRI_ORARI_SEC2 = {
  "Liceo Classico": [
    "Italiano","Latino","Greco","Storia e Filosofia","Geografia",
    "Matematica","Fisica","Scienze Naturali","Storia dell'Arte",
    "Lingua Straniera (Inglese)","Scienze Motorie e Sportive","Religione / Attività alternativa",
  ],
  "Liceo Scientifico": [
    "Italiano","Latino","Storia e Filosofia","Geografia","Matematica","Fisica",
    "Scienze Naturali","Disegno e Storia dell'Arte","Lingua Straniera (Inglese)",
    "Scienze Motorie e Sportive","Religione / Attività alternativa",
  ],
  "Liceo Scientifico – opzione Scienze Applicate": [
    "Italiano","Storia e Filosofia","Geografia","Matematica","Fisica","Scienze Naturali",
    "Informatica","Disegno e Storia dell'Arte","Lingua Straniera (Inglese)",
    "Scienze Motorie e Sportive","Religione / Attività alternativa",
  ],
  "Liceo Scientifico – sezione a indirizzo sportivo": [
    "Italiano","Storia e Filosofia","Geografia","Matematica","Fisica",
    "Scienze Naturali","Lingua Straniera (Inglese)",
    "Diritto ed Economia dello Sport","Discipline Sportive",
    "Scienze Motorie e Sportive","Religione / Attività alternativa",
  ],
  "Liceo Linguistico": [
    "Italiano","Latino","Prima Lingua Straniera (Inglese)","Seconda Lingua Straniera",
    "Terza Lingua Straniera","Storia e Filosofia","Geografia","Matematica","Fisica",
    "Scienze Naturali","Storia dell'Arte","Scienze Motorie e Sportive","Religione / Attività alternativa",
  ],
  "Liceo delle Scienze Umane": [
    "Italiano","Latino","Scienze Umane","Storia e Filosofia","Geografia",
    "Diritto ed Economia","Matematica","Fisica","Scienze Naturali","Storia dell'Arte",
    "Lingua Straniera (Inglese)","Scienze Motorie e Sportive","Religione / Attività alternativa",
  ],
  "Liceo delle Scienze Umane – opzione economico-sociale": [
    "Italiano","Storia e Filosofia","Geografia","Scienze Umane (Sociologia e Metodologia della Ricerca)",
    "Matematica","Fisica","Scienze Naturali","Storia dell'Arte",
    "Lingua Straniera (Inglese)","Seconda Lingua Straniera",
    "Diritto ed Economia Politica","Scienze Motorie e Sportive","Religione / Attività alternativa",
  ],
  "Liceo Artistico": [
    "Italiano","Storia e Filosofia","Geografia","Matematica","Fisica","Scienze Naturali",
    "Lingua Straniera (Inglese)","Storia dell'Arte",
    "Discipline Pittoriche / Plastiche / Geometriche","Laboratorio Artistico",
    "Scienze Motorie e Sportive","Religione / Attività alternativa",
  ],
  "Liceo del Made in Italy": [
    "Italiano","Storia e Filosofia","Geografia","Matematica","Fisica","Lingua Straniera (Inglese)",
    "Seconda Lingua Straniera","Economia e Diritto",
    "Storia dell'Arte e del Design","Design e Progettazione",
    "Scienze Naturali","Scienze Motorie e Sportive","Religione / Attività alternativa",
  ],
  "Liceo Musicale e Coreutico": [
    "Italiano","Storia e Filosofia","Geografia","Matematica","Fisica","Scienze Naturali",
    "Storia dell'Arte","Lingua Straniera (Inglese)",
    "Laboratorio di Musica d'Insieme","Tecnologie Musicali",
    "Storia della Musica / della Danza",
    "Teoria, Analisi e Composizione / Tecniche della Danza",
    "Esecuzione e Interpretazione / Laboratorio Coreutico",
    "Scienze Motorie e Sportive","Religione / Attività alternativa",
  ],
  "IT – Amministrazione, finanza e marketing": [
    "Italiano","Storia","Matematica","Lingua Straniera (Inglese)",
    "Seconda Lingua Straniera","Economia Aziendale",
    "Diritto","Economia Politica","Informatica",
    "Scienze Motorie e Sportive","Religione / Attività alternativa",
  ],
  "IT – Turismo": [
    "Italiano","Storia","Matematica","Lingua Straniera (Inglese)",
    "Seconda Lingua Straniera","Terza Lingua Straniera",
    "Discipline Turistiche e Aziendali",
    "Diritto e Legislazione Turistica","Arte e Territorio",
    "Scienze Motorie e Sportive","Religione / Attività alternativa",
  ],
  "IT – Meccanica, meccatronica ed energia": [
    "Italiano","Storia","Matematica","Lingua Straniera (Inglese)",
    "Meccanica, Macchine ed Energia","Sistemi e Automazione",
    "Tecnologie Meccaniche di Processo e di Prodotto",
    "Disegno, Progettazione e Organizzazione Industriale",
    "Scienze Motorie e Sportive","Religione / Attività alternativa",
  ],
  "IT – Trasporti e logistica": [
    "Italiano","Storia","Matematica","Lingua Straniera (Inglese)",
    "Scienze della Navigazione, Struttura e Costruzione del Mezzo",
    "Meccanica e Macchine","Logistica",
    "Diritto e Legislazione Nautica",
    "Scienze Motorie e Sportive","Religione / Attività alternativa",
  ],
  "IT – Elettronica ed elettrotecnica": [
    "Italiano","Storia","Matematica","Lingua Straniera (Inglese)",
    "Elettrotecnica ed Elettronica","Sistemi Automatici",
    "Tecnologie e Progettazione di Sistemi Elettrici ed Elettronici",
    "Scienze Motorie e Sportive","Religione / Attività alternativa",
  ],
  "IT – Informatica e telecomunicazioni": [
    "Italiano","Storia","Matematica","Lingua Straniera (Inglese)",
    "Informatica","Sistemi e Reti","Telecomunicazioni",
    "Tecnologie e Progettazione di Sistemi Informatici e di Telecomunicazioni",
    "Scienze Motorie e Sportive","Religione / Attività alternativa",
  ],
  "IT – Grafica e comunicazione": [
    "Italiano","Storia","Matematica","Lingua Straniera (Inglese)",
    "Progettazione Multimediale",
    "Tecnologie dei Processi di Produzione",
    "Organizzazione e Gestione dei Processi Produttivi",
    "Scienze Motorie e Sportive","Religione / Attività alternativa",
  ],
  "IT – Chimica, materiali e biotecnologie": [
    "Italiano","Storia","Matematica","Lingua Straniera (Inglese)",
    "Chimica Analitica e Strumentale","Chimica Organica e Biochimica",
    "Biologia, Microbiologia e Tecnologie di Controllo Ambientale",
    "Scienze Motorie e Sportive","Religione / Attività alternativa",
  ],
  "IT – Sistema moda": [
    "Italiano","Storia","Matematica","Lingua Straniera (Inglese)",
    "Progettazione Tessile-Abbigliamento, Moda e Costume",
    "Tecnologie Applicate ai Materiali e ai Processi Produttivi Tessili",
    "Economia e Marketing nel Sistema Moda",
    "Scienze Motorie e Sportive","Religione / Attività alternativa",
  ],
  "IT – Agraria, agroalimentare e agroindustria": [
    "Italiano","Storia","Matematica","Lingua Straniera (Inglese)",
    "Produzioni Vegetali","Produzioni Animali",
    "Trasformazione dei Prodotti","Gestione dell'Ambiente e del Territorio",
    "Economia Agraria e dello Sviluppo Rurale",
    "Scienze Motorie e Sportive","Religione / Attività alternativa",
  ],
  "IT – Costruzioni, ambiente e territorio": [
    "Italiano","Storia","Matematica","Lingua Straniera (Inglese)",
    "Progettazione, Costruzioni e Impianti","Topografia",
    "Geopedologia, Economia ed Estimo",
    "Gestione del Cantiere e Sicurezza dell'Ambiente di Lavoro",
    "Scienze Motorie e Sportive","Religione / Attività alternativa",
  ],
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

const _unione = v => Array.isArray(v) ? v : [...new Set([...v.biennio, ...v.triennio])];
// Elenco piatto (unione biennio+triennio) per compatibilità: chiavi = indirizzi, valori = tutte le discipline
const ISTITUTI_SEC2 = Object.fromEntries(Object.entries(QUADRI_ORARI_SEC2).map(([k, v]) => [k, _unione(v)]));

// Anno di corso (1-5) dall'età, stessa formula di calcolaClasse() in pei-prompt.js
function annoCorsoSec2(eta) {
  const e = parseInt(eta, 10) || 0;
  return Math.min(Math.max(e - 13, 1), 5);
}
// Discipline di un indirizzo sec2 per la classe corrispondente all'età (biennio se 1ª-2ª, triennio altrimenti)
function getDisciplineSec2(istituto, eta) {
  const v = QUADRI_ORARI_SEC2[istituto];
  if (!v) return [];
  if (Array.isArray(v)) return v;
  return annoCorsoSec2(eta) <= 2 ? v.biennio : v.triennio;
}
// Discipline opzionali/alternative presenti nell'elenco per la classe (solo triennio, solo se definite)
function getOpzionaliSec2(istituto, eta) {
  const v = QUADRI_ORARI_SEC2[istituto];
  if (!v || Array.isArray(v) || annoCorsoSec2(eta) <= 2) return [];
  return v.triennioOpzionali || [];
}

/**
 * Ritorna la configurazione completa per un grado scolastico dato.
 * @param {string} grado  "infanzia" | "primaria" | "sec1" | "sec2"
 * @param {string} [istituto]  solo per sec2
 * @param {number|string} [eta]  solo per sec2: seleziona l'elenco del biennio o del triennio
 */
function getConfig(grado, istituto = null, eta = null) {
  const term   = TERMINOLOGIA[grado];
  const sez8   = STRUTTURA_SEZ8[grado];
  const std81  = testoStandard81(term);

  let discipline = [];
  if (grado === 'infanzia') discipline = CAMPI_ESPERIENZA;
  else if (grado === 'primaria') discipline = DISCIPLINE_PRIMARIA;
  else if (grado === 'sec1') discipline = DISCIPLINE_SEC1;
  else if (grado === 'sec2' && istituto) discipline = getDisciplineSec2(istituto, eta);

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
  annoCorsoSec2,
  testoStandard81,
  getConfig,
};
