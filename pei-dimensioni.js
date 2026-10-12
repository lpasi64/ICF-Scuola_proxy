// pei-dimensioni.js — esito delle quattro dimensioni del PEI (Sezione 2): VA DEFINITA oppure OMISSIBILE.
// Lo calcola il programma sui qualificatori di performance (P) del questionario, non il modello: i conti fatti a mente dal modello
// sbagliano (una media di 1,21 su 19 item è stata scritta VA DEFINITA), e la Sezione 2 deve concordare con gli obiettivi della Sezione 5.
//
// Regola (progetto originale del generatore PEI): per ogni dimensione, media dei P degli item validi (0-4; il 9 «non applicabile» e i
// valori mancanti non contano); media ≥ 1,50 → VA DEFINITA; altrimenti OMISSIBILE, e se almeno un item ha P ≥ 3 l'area è di
// monitoraggio prioritario per il Progetto di Vita.
// Raggruppamento degli item secondo le Linee guida sul profilo di funzionamento (come nel profilo di ICF Applicazioni):
//   A – Relazione, interazione e socializzazione: d7*, d9*     B – Comunicazione e linguaggio: d3*
//   C – Autonomia e orientamento: d2*, d4*, d5*, d6*     D – Cognitiva, neuropsicologica e apprendimento: d1*, d8*

export const SOGLIA_VA_DEFINITA = 1.5;

export const DIMENSIONI = [
  { dim: 'A', etichetta: 'A – Relazione, interazione e socializzazione', codici: [/^d7/, /^d9/] },
  { dim: 'B', etichetta: 'B – Comunicazione e linguaggio', codici: [/^d3/] },
  { dim: 'C', etichetta: 'C – Autonomia e orientamento', codici: [/^d2/, /^d4/, /^d5/, /^d6/] },
  { dim: 'D', etichetta: "D – Cognitiva, neuropsicologica e dell'apprendimento", codici: [/^d1/, /^d8/] },
];

// mappa: { d137: { P: 2, C: 3 }, ... } (come la produce compactIcf). Esito null se la dimensione non ha alcun item valido.
export function calcolaEsitiDimensioni(mappa) {
  const out = {};
  for (const { dim, codici } of DIMENSIONI) {
    const valori = [];
    if (mappa && typeof mappa === 'object') {
      for (const [codice, e] of Object.entries(mappa)) {
        if (!codici.some(re => re.test(String(codice).toLowerCase()))) continue;
        const p = e && typeof e.P === 'number' ? e.P : NaN;
        if (Number.isInteger(p) && p >= 0 && p <= 4) valori.push(p);
      }
    }
    const n = valori.length, somma = valori.reduce((a, b) => a + b, 0);
    out[dim] = n === 0
      ? { media: null, n: 0, esito: null, monitoraggio: false }
      : { media: somma / n, n, esito: 2 * somma >= 3 * n ? 'VA DEFINITA' : 'OMISSIBILE', monitoraggio: 2 * somma < 3 * n && valori.some(p => p >= 3) };
  }
  return out;
}

const haEsiti = (esiti) => !!esiti && DIMENSIONI.some(({ dim }) => esiti[dim] && esiti[dim].esito);

// Tabella della Sezione 2 per il prompt della Parte 1: esiti già calcolati, da riportare così come sono (ripiego: scelta al modello)
export function tabellaSez2PerPrompt(esiti) {
  const calcolati = haEsiti(esiti);
  const righe = DIMENSIONI.map(({ dim, etichetta }) => `| ${etichetta} | ${(calcolati && esiti[dim] && esiti[dim].esito) || 'VA DEFINITA oppure OMISSIBILE'} |`).join('\n');
  const nota = calcolati
    ? 'Gli esiti qui sopra sono già calcolati dal programma sui dati: riportali ESATTAMENTE così, senza ricalcolarli, senza modificarli e senza aggiungere medie, conteggi, motivazioni o commenti. Una riga per ciascuna delle 4 dimensioni.'
    : 'Nella colonna Esito scrivi SOLO "VA DEFINITA" oppure "OMISSIBILE", calcolato dal JSON con le regole dell\'analisi interna: nessuna media, nessun conteggio, nessuna motivazione, nessun commento. Una riga per ciascuna delle 4 dimensioni.';
  return `| Dimensione | Esito |\n|---|---|\n${righe}\n\n${nota}`;
}

// Blocco per il prompt della Parte 2: esiti come dati, con la regola sul numero di obiettivi per ciascuna dimensione
export function esitiPerPrompt(esiti) {
  if (!haEsiti(esiti)) return '';
  const righe = DIMENSIONI.map(({ dim, etichetta }) => {
    const e = esiti[dim];
    if (!e || !e.esito) return `- ${etichetta}: esito non calcolabile (dati mancanti): determinalo tu con le regole dell'analisi interna`;
    if (e.esito === 'VA DEFINITA') return `- ${etichetta}: VA DEFINITA → scrivi 2 obiettivi`;
    return e.monitoraggio
      ? `- ${etichetta}: OMISSIBILE, con almeno un P≥3 (area di monitoraggio prioritario per il Progetto di Vita) → scrivi 2 obiettivi orientati al Progetto di Vita`
      : `- ${etichetta}: OMISSIBILE (nessun P≥3) → nessun obiettivo per questa dimensione`;
  });
  return `ESITI DELLE DIMENSIONI (già calcolati dal programma sui dati: usali così come sono, non ricalcolarli e non metterli in discussione):\n${righe.join('\n')}`;
}
