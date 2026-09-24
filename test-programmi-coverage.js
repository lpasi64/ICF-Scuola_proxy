// test-programmi-coverage.js
// Verifica che ogni disciplina/campo di esperienza realmente in uso in pei-gradi.js abbia
// una voce risolvibile in pei-programmi.js (base o override), per intercettare eventuali
// buchi introdotti aggiungendo un grado/indirizzo senza curare il contenuto corrispondente.
// Lotto 1 (infanzia/primaria/sec1) e Lotto 2 (sec2, tutti i 32 indirizzi) completi.
// Unica eccezione voluta: Religione / Attività alternativa (fonte diversa, non curata).

import {
  CAMPI_ESPERIENZA,
  DISCIPLINE_PRIMARIA,
  DISCIPLINE_SEC1,
  ISTITUTI_SEC2,
  QUADRI_ORARI_SEC2,
  getConfig,
  getDisciplineSec2,
  getOpzionaliSec2,
  getOrdinamentoSec2,
  annoCorsoSec2,
} from './pei-gradi.js';
import { checkCoverage, getProgrammiPerDiscipline, getProgrammaDisciplina, PROGRAMMI_SEC2_ALIAS, PROGRAMMI_SEC2_BASE } from './pei-programmi.js';

let passed = 0;
let failed = 0;

function test(desc, fn) {
  try {
    fn();
    console.log(`  ok  - ${desc}`);
    passed++;
  } catch (e) {
    console.log(`  FAIL - ${desc}`);
    console.log(`         ${e.message}`);
    failed++;
  }
}

function assert(cond, msg) {
  if (!cond) throw new Error(msg || 'assertion failed');
}

console.log('pei-programmi.js — test di copertura\n');

// Indirizzi sec2 già migrati ai quadri orari per biennio/triennio (forma oggetto): le discipline con
// il nome ufficiale del quadro orario sono in corso di curatela in pei-programmi.js; finché non sono
// curate il programma non viene iniettato nel prompt (degrado silenzioso, come per Religione).
// Tutti gli altri indirizzi (forma array, non ancora migrati) devono essere coperti al 100%.
const migrati = new Set(Object.entries(QUADRI_ORARI_SEC2).filter(([, v]) => !Array.isArray(v)).map(([k]) => k));

test('infanzia+primaria+sec1 e indirizzi sec2 non migrati: nessuna disciplina senza voce curata', () => {
  const missing = checkCoverage({
    campiEsperienza: CAMPI_ESPERIENZA,
    disciplinePrimaria: DISCIPLINE_PRIMARIA,
    disciplineSec1: DISCIPLINE_SEC1,
    istitutiSec2: ISTITUTI_SEC2,
  }).filter(m => ![...migrati].some(k => m.startsWith(`sec2 (${k}): `)));
  assert(missing.length === 0, `voci mancanti: ${missing.join(', ')}`);
});

test('indirizzi migrati: discipline ancora da curare (informativo, non bloccante)', () => {
  const missing = checkCoverage({ campiEsperienza: [], disciplinePrimaria: [], disciplineSec1: [], istitutiSec2: Object.fromEntries(Object.entries(ISTITUTI_SEC2).filter(([k]) => migrati.has(k))) });
  const nomi = new Set(missing.map(m => m.slice(m.indexOf('): ') + 3)));
  console.log(`         [info] ${migrati.size} indirizzi migrati; ${nomi.size} discipline distinte senza voce curata (${missing.length} occorrenze)`);
});

test('quadri orari migrati: biennio e triennio non vuoti, opzionali contenute nel triennio, senza duplicati', () => {
  for (const [k, v] of Object.entries(QUADRI_ORARI_SEC2)) {
    if (Array.isArray(v)) continue;
    assert(v.biennio.length > 0 && v.triennio.length > 0, `elenco vuoto: ${k}`);
    assert(new Set(v.biennio).size === v.biennio.length, `duplicati nel biennio: ${k}`);
    assert(new Set(v.triennio).size === v.triennio.length, `duplicati nel triennio: ${k}`);
    for (const o of v.triennioOpzionali) assert(v.triennio.includes(o), `opzionale non nel triennio: ${k} / ${o}`);
  }
});

test('IP: Scienze Integrate, Geografia e Diritto ed Economia solo nel biennio (quadro orario D.I. 92/2018)', () => {
  const man = 'IP – Manutenzione e assistenza tecnica';
  const b = getDisciplineSec2(man, 14), t = getDisciplineSec2(man, 17);
  for (const n of ['Scienze Integrate', 'Geografia', 'Diritto ed Economia']) {
    assert(b.includes(n), `biennio senza ${n}`);
    assert(!t.includes(n), `triennio con ${n}`);
  }
  assert(t.includes('Tecnologie Meccaniche e Applicazioni') && t.includes('Tecnologie Elettriche-Elettroniche e Applicazioni'), 'triennio Manutenzione: tecnologie separate mancanti');
  assert(getConfig('sec2', man, 17).discipline.join() === t.join(), "getConfig non usa l'età (triennio)");
  assert(getConfig('sec2', man, 14).discipline.join() === b.join(), "getConfig non usa l'età (biennio)");
});

test('opzionali: solo nel triennio e solo per gli indirizzi che le prevedono', () => {
  const agr = Object.keys(QUADRI_ORARI_SEC2).find(k => k.startsWith('IP – Agricoltura'));
  assert(getOpzionaliSec2(agr, 14).length === 0, 'opzionali nel biennio');
  assert(getOpzionaliSec2(agr, 17).length > 0, 'opzionali del triennio assenti');
  assert(getOpzionaliSec2('IP – Manutenzione e assistenza tecnica', 17).length === 0, 'Manutenzione non ha opzionali');
  assert(getOpzionaliSec2('Liceo Classico', 17).length === 0, 'i licei (forma legacy) non hanno opzionali');
});

test('Tecnici: regola di transizione D.M. 29/2026 (nuovo dalle classi prime 2026/27, una classe in più ogni anno)', () => {
  const m = 'IT – Meccanica, meccatronica ed energia';
  const casi = [ // [età, a.s. inizio, atteso]
    [14, 2026, 'nuovo'], [15, 2026, 'vigente'], [17, 2026, 'vigente'],
    [14, 2027, 'nuovo'], [15, 2027, 'nuovo'], [16, 2027, 'vigente'],
    [17, 2029, 'nuovo'], [18, 2029, 'vigente'], [18, 2030, 'nuovo'],
  ];
  for (const [eta, as, atteso] of casi) {
    assert(getOrdinamentoSec2(m, eta, as) === atteso, `età ${eta} (anno ${annoCorsoSec2(eta)}) a.s. ${as}/${as + 1}: atteso ${atteso}`);
  }
  // Licei e Professionali non hanno nuovo ordinamento: sempre 'vigente'
  for (const k of ['Liceo Classico', 'IP – Manutenzione e assistenza tecnica']) {
    for (const eta of [14, 18]) assert(getOrdinamentoSec2(k, eta, 2030) === 'vigente', `${k} deve restare vigente`);
  }
});

test('Tecnici: elenchi coerenti con i due ordinamenti (1ª nuovo, 3ª vigente)', () => {
  const m = 'IT – Meccanica, meccatronica ed energia';
  const n1 = getDisciplineSec2(m, 14, 2026), v3 = getDisciplineSec2(m, 16, 2026);
  assert(n1.includes('Scienze Sperimentali') && n1.includes('Geografia'), 'nuovo biennio: Scienze Sperimentali/Geografia mancanti');
  assert(!n1.includes('Scienze Integrate (Fisica)') && !n1.includes('Scienze Integrate (Scienze della Terra e Biologia)'), 'nuovo biennio non deve avere le Scienze integrate');
  assert(v3.includes('Meccanica, Macchine ed Energia') && !v3.includes('Scienze Sperimentali'), 'vigente triennio errato');
  assert(getDisciplineSec2(m, 14, 2026).join() !== getDisciplineSec2(m, 14, 2025).join(), 'a.s. 2025/26: la 1ª è ancora nel vecchio ordinamento');
  // tutti gli 11 IT hanno entrambi gli ordinamenti con elenchi non vuoti e opzionali contenute
  for (const [k, v] of Object.entries(QUADRI_ORARI_SEC2)) {
    if (!k.startsWith('IT')) continue;
    const n = v.nuovoOrdinamento;
    assert(n && n.biennio.length > 0 && n.triennio.length > 0, `nuovo ordinamento mancante: ${k}`);
    for (const o of n.triennioOpzionali) assert(n.triennio.includes(o), `opzionale (nuovo) non nel triennio: ${k} / ${o}`);
    assert(new Set(n.biennio).size === n.biennio.length && new Set(n.triennio).size === n.triennio.length, `duplicati nel nuovo ordinamento: ${k}`);
  }
});

test('voci scritte per un solo tipo di scuola non vengono iniettate negli altri (soloPer)', () => {
  const man = 'IP – Manutenzione e assistenza tecnica', mec = 'IT – Meccanica, meccatronica ed energia', cla = 'Liceo Classico', su = 'Liceo delle Scienze Umane';
  assert(getProgrammaDisciplina('sec2', 'Geografia', cla), 'Geografia (bozza Licei) deve valere per i licei');
  assert(!getProgrammaDisciplina('sec2', 'Geografia', man) && !getProgrammaDisciplina('sec2', 'Geografia', mec), 'Geografia dei licei non deve arrivare a IP/IT');
  assert(getProgrammaDisciplina('sec2', 'Diritto ed Economia', man), 'Diritto ed Economia (professionali) deve valere per gli IP');
  assert(!getProgrammaDisciplina('sec2', 'Diritto ed Economia', mec), 'Diritto ed Economia dei professionali non deve arrivare agli IT');
  assert(getProgrammaDisciplina('sec2', 'Diritto ed Economia', su).competenze.includes('Liceo') || getProgrammaDisciplina('sec2', 'Diritto ed Economia', su).competenze.includes('Licei'), 'override del Liceo Scienze Umane perso');
  assert(getProgrammaDisciplina('sec2', 'Scienze Integrate', man) && !getProgrammaDisciplina('sec2', 'Scienze Integrate', mec), 'Scienze Integrate: solo IP');
});

test('alias: ogni alias punta a una voce base esistente e restituisce lo stesso contenuto', () => {
  for (const [nuovo, vecchio] of Object.entries(PROGRAMMI_SEC2_ALIAS)) {
    assert(PROGRAMMI_SEC2_BASE[vecchio], `alias verso voce inesistente: ${nuovo} -> ${vecchio}`);
    assert(!PROGRAMMI_SEC2_BASE[nuovo], `alias inutile, la voce esiste già: ${nuovo}`);
    assert(getProgrammaDisciplina('sec2', nuovo, 'IT – Turismo') === PROGRAMMI_SEC2_BASE[vecchio], `alias non risolto: ${nuovo}`);
  }
});

test('getProgrammiPerDiscipline produce un blocco non vuoto per infanzia', () => {
  const testo = getProgrammiPerDiscipline('infanzia', CAMPI_ESPERIENZA);
  assert(testo.includes('Programmi ministeriali di riferimento'), 'intestazione mancante');
  for (const campo of CAMPI_ESPERIENZA) {
    assert(testo.includes(campo), `campo mancante nel testo: ${campo}`);
  }
});

test('getProgrammiPerDiscipline produce un blocco non vuoto per primaria', () => {
  const testo = getProgrammiPerDiscipline('primaria', DISCIPLINE_PRIMARIA);
  assert(testo.includes('Programmi ministeriali di riferimento'), 'intestazione mancante');
});

test('getProgrammiPerDiscipline produce un blocco non vuoto per sec1', () => {
  const testo = getProgrammiPerDiscipline('sec1', DISCIPLINE_SEC1);
  assert(testo.includes('Programmi ministeriali di riferimento'), 'intestazione mancante');
});

test('Religione / Attività alternativa non compare nel testo (nessuna voce curata, degrado silenzioso)', () => {
  const testo = getProgrammiPerDiscipline('primaria', ['Religione / Attività alternativa']);
  assert(testo === '', 'ci si aspettava un blocco vuoto');
});

test('sec2 con discipline curate produce un blocco non vuoto (Lotto 2 completo)', () => {
  const testo = getProgrammiPerDiscipline('sec2', ['Italiano', 'Matematica'], 'Liceo Scientifico');
  assert(testo.includes('Italiano') && testo.includes('Matematica'), 'contenuto atteso mancante');
});

test('sec2 per ogni indirizzo produce un blocco non vuoto per le sue discipline', () => {
  for (const [istituto, discipline] of Object.entries(ISTITUTI_SEC2)) {
    const testo = getProgrammiPerDiscipline('sec2', discipline, istituto);
    assert(testo.length > 0, `blocco vuoto per l'indirizzo: ${istituto}`);
  }
});

test('sec2 migrati: sia il biennio sia il triennio producono un blocco non vuoto', () => {
  for (const k of migrati) {
    for (const eta of [14, 17]) {
      const testo = getProgrammiPerDiscipline('sec2', getDisciplineSec2(k, eta), k);
      assert(testo.length > 0, `blocco vuoto: ${k} età ${eta}`);
    }
  }
});

test('Religione / Attività alternativa in sec2: nessun errore, degrado silenzioso voluto', () => {
  const testo = getProgrammiPerDiscipline('sec2', ['Religione / Attività alternativa'], 'Liceo Classico');
  assert(testo === '', 'ci si aspettava un blocco vuoto per Religione (fonte diversa, non curata)');
});

console.log(`\n${passed} test superati${failed ? `, ${failed} FALLITI` : ''}.`);
if (failed > 0) process.exit(1);
