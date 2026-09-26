// pei-profilo.js
// Profilo funzionale per la progettazione disciplinare (Sezione 8.2), derivato in modo DETERMINISTICO dai
// qualificatori ICF di performance (P: 0 nessuna … 4 completa). Nessuna chiamata all'AI.
// Le "misure tipiche" sono suggerimenti generali (misure compensative/dispensative e adattamenti di verifica di uso
// comune), non norme: il prompt le presenta come esempi da scegliere solo se coerenti col profilo.

const AREE = [
  { id: 'lettura', etichetta: 'lettura e comprensione dei testi', codici: ['d166'],
    adattamenti: 'testi semplificati o ad alta leggibilità, lettura ad alta voce o sintesi vocale, mappe e schemi in luogo di lunghi brani',
    verifica: 'consegne brevi e chiare, consegne lette dal docente, tempi aggiuntivi' },
  { id: 'scrittura', etichetta: 'scrittura e produzione di testi', codici: ['d170'],
    adattamenti: 'videoscrittura con correttore, schemi guida per la produzione, riduzione della lunghezza richiesta',
    verifica: 'valutare il contenuto oltre alla forma, integrazione orale, meno quesiti a risposta aperta' },
  { id: 'calcolo', etichetta: 'calcolo e procedure numeriche', codici: ['d172'],
    adattamenti: 'calcolatrice, tabelle e formulari, esercizi scomposti in passaggi',
    verifica: 'meno esercizi a parità di obiettivi, procedimenti guidati, tempi aggiuntivi' },
  { id: 'problemi', etichetta: 'soluzione di problemi e presa di decisioni', codici: ['d175', 'd177'],
    adattamenti: 'scomposizione del problema in sotto-passaggi (task analysis), esempi svolti, organizzatori grafici',
    verifica: 'problemi presentati in sequenza passo-passo, punteggio anche ai passaggi corretti' },
  { id: 'attenzione', etichetta: 'attenzione e mantenimento sul compito', codici: ['d160'],
    adattamenti: 'attività suddivise in fasi brevi, pause programmate, ambiente con pochi stimoli',
    verifica: 'prove suddivise in parti brevi, pause programmate, un solo compito per volta' },
  { id: 'organizzazione', etichetta: 'organizzazione di compiti singoli e articolati', codici: ['d210', 'd220'],
    adattamenti: 'agenda visiva, checklist operative, consegne sequenziali',
    verifica: 'prove strutturate in sequenze, indicazioni scritte dei passaggi, tempi aggiuntivi' },
  { id: 'stress', etichetta: 'gestione dello stress e delle richieste', codici: ['d240'],
    adattamenti: 'anticipazione di attività e cambiamenti, momenti di decompressione, rinforzo positivo',
    verifica: 'verifiche programmate e annunciate, possibilità di ripetere, peso della valutazione formativa' },
  { id: 'orale', etichetta: 'comunicazione orale e conversazione', codici: ['d330', 'd350'],
    adattamenti: 'domande guidate, supporti visivi per l\'esposizione, tempi di risposta più lunghi',
    verifica: 'interrogazioni programmate e strutturate, domande a risposta breve, esposizione con supporti' },
  { id: 'comprensione', etichetta: 'comprensione di messaggi verbali', codici: ['d310'],
    adattamenti: 'consegne brevi e riformulate, supporti visivi, controllo della comprensione',
    verifica: 'consegne semplificate e ripetute, esempi svolti' },
  { id: 'motricita', etichetta: 'motricità fine e uso di strumenti', codici: ['d440'],
    adattamenti: 'strumenti alternativi (tastiera, ausili), riduzione delle richieste grafiche, moduli precompilati',
    verifica: 'prove con minore componente grafica, tempi aggiuntivi, risposte a scelta o orali' },
  { id: 'relazione', etichetta: 'lavoro con i pari e interazioni sociali', codici: ['d710', 'd720', 'd750'],
    adattamenti: 'lavori di gruppo strutturati con ruoli definiti, tutoring tra pari',
    verifica: 'verifiche individuali con supporto anziché prove di gruppo non strutturate' },
];

export function parseMappaIcf(jsonString) {
  try {
    const m = JSON.parse(jsonString);
    return m && typeof m === 'object' && !Array.isArray(m) ? m : {};
  } catch { return {}; }
}

export function derivaProfiloApprendimento(mappa) {
  const aree = [];
  if (mappa && typeof mappa === 'object') {
    for (const a of AREE) {
      let P = null;
      const presenti = [];
      for (const c of a.codici) {
        const e = mappa[c];
        if (!e || typeof e.P !== 'number' || e.P < 0 || e.P > 4) continue;   // 9 = non applicabile
        presenti.push(c);
        P = P === null ? e.P : Math.max(P, e.P);
      }
      if (P === null) continue;
      aree.push({ id: a.id, etichetta: a.etichetta, P, livello: P >= 3 ? 'marcata' : P === 2 ? 'moderata' : 'lieve', codici: presenti });
    }
  }
  const rilevanti = aree.filter(a => a.P >= 2);
  return { aree, rilevanti, vuoto: rilevanti.length === 0 };
}

export function formattaProfiloPerPrompt(profilo, { presente = true } = {}) {
  if (!presente) return '';
  const intest = 'PROFILO FUNZIONALE PER LA PROGETTAZIONE DISCIPLINARE (derivato dai qualificatori ICF di performance, P):';
  if (profilo.vuoto) {
    return `${intest}\nNessuna area di apprendimento con difficoltà rilevante (P≥2): per la maggior parte delle discipline scegli l'opzione A e non inventare adattamenti.`;
  }
  const righe = profilo.rilevanti.map(a => {
    const def = AREE.find(x => x.id === a.id);
    return `- ${a.etichetta}: difficoltà ${a.livello} (P${a.P}) [${a.codici.join(', ')}] → adattamenti possibili: ${def.adattamenti}; verifica: ${def.verifica}`;
  });
  const senza = profilo.aree.filter(a => a.P < 2).map(a => a.etichetta);
  return `${intest}\n${righe.join('\n')}${senza.length ? `\nAree senza difficoltà rilevante: ${senza.join('; ')}.` : ''}`;
}
