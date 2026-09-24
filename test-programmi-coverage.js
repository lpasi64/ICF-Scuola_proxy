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
} from './pei-gradi.js';
import { checkCoverage, getProgrammiPerDiscipline } from './pei-programmi.js';

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
