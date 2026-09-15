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

test('nessuna disciplina/campo/indirizzo (infanzia+primaria+sec1+sec2) senza voce curata', () => {
  const missing = checkCoverage({
    campiEsperienza: CAMPI_ESPERIENZA,
    disciplinePrimaria: DISCIPLINE_PRIMARIA,
    disciplineSec1: DISCIPLINE_SEC1,
    istitutiSec2: ISTITUTI_SEC2,
  });
  assert(missing.length === 0, `voci mancanti: ${missing.join(', ')}`);
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

test('Religione / Attività alternativa in sec2: nessun errore, degrado silenzioso voluto', () => {
  const testo = getProgrammiPerDiscipline('sec2', ['Religione / Attività alternativa'], 'Liceo Classico');
  assert(testo === '', 'ci si aspettava un blocco vuoto per Religione (fonte diversa, non curata)');
});

console.log(`\n${passed} test superati${failed ? `, ${failed} FALLITI` : ''}.`);
if (failed > 0) process.exit(1);
