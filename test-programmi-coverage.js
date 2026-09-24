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
import { riferimentoLiceo, checkCoverage, getProgrammiPerDiscipline, getProgrammaDisciplina, PROGRAMMI_SEC2_ALIAS, PROGRAMMI_SEC2_BASE, LICEI_2010_MIGRATI, PROGRAMMI_LICEI_2010, PROGRAMMI_TECNICI_VIGENTE } from './pei-programmi.js';

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
  const man = 'IP – Manutenzione e assistenza tecnica', mec = 'IT – Meccanica, meccatronica ed energia', cla = 'Liceo Classico', su = 'Liceo Classico';
  assert(!getProgrammaDisciplina('sec2', 'Geografia', cla), 'Geografia della bozza non deve raggiungere i licei migrati');
  assert(!getProgrammaDisciplina('sec2', 'Geografia', man), 'Geografia dei licei non deve arrivare agli IP');
  assert(getProgrammaDisciplina('sec2', 'Geografia', mec) === PROGRAMMI_TECNICI_VIGENTE['Geografia'], 'per gli IT Geografia deve essere la voce delle Linee guida tecniche, non quella dei licei');
  assert(getProgrammaDisciplina('sec2', 'Diritto ed Economia', man), 'Diritto ed Economia (professionali) deve valere per gli IP');
  assert(getProgrammaDisciplina('sec2', 'Diritto ed Economia', mec) === PROGRAMMI_TECNICI_VIGENTE['Diritto ed Economia'] && getProgrammaDisciplina('sec2', 'Diritto ed Economia', mec) !== getProgrammaDisciplina('sec2', 'Diritto ed Economia', man), 'Diritto ed Economia dei professionali non deve arrivare agli IT');
  assert(getProgrammaDisciplina('sec2', 'Scienze Integrate', man) && !getProgrammaDisciplina('sec2', 'Scienze Integrate', mec), 'Scienze Integrate (voce generica): solo IP; gli IT hanno le tre voci per materia');
});

test('Licei migrati (Lotto 1): programmi vigenti D.M. 211/2010, copertura completa in biennio e triennio, mai la bozza 2026', () => {
  assert(LICEI_2010_MIGRATI.size === 10, 'attesi 10 licei migrati (Lotti 1-3): tutti');
  for (const k of LICEI_2010_MIGRATI) {
    for (const eta of [14, 17]) {
      const mancanti = getDisciplineSec2(k, eta).filter(n => n !== 'Religione / Attività alternativa' && !getProgrammaDisciplina('sec2', n, k));
      assert(mancanti.length === 0, `${k} età ${eta}: senza voce ${mancanti.join(', ')}`);
    }
    const testo = getProgrammiPerDiscipline('sec2', getDisciplineSec2(k, 17), k);
    assert(testo.startsWith(riferimentoLiceo(k).intestazione), `intestazione errata: ${k}`);
    assert(!/bozza|2026/i.test(testo), `testo con riferimenti alla bozza 2026: ${k}`);
  }
  // le voci della bozza non devono raggiungere i licei migrati
  const cla = 'Liceo Classico';
  assert(!getProgrammaDisciplina('sec2', 'Storia e Filosofia', cla) && !getProgrammaDisciplina('sec2', 'Geografia', cla), 'voce della bozza trapelata nel Classico');
  // varianti per liceo
  const sc = getProgrammaDisciplina('sec2', 'Matematica', 'Liceo Scientifico'), cl = getProgrammaDisciplina('sec2', 'Matematica', cla);
  assert(sc && cl && sc !== cl && sc.competenze.includes('Liceo scientifico'), 'variante Matematica dello Scientifico assente');
  assert(getProgrammaDisciplina('sec2', 'Latino', 'Liceo Linguistico').competenze.includes('Liceo linguistico'), 'Latino del Linguistico');
  assert(getProgrammaDisciplina('sec2', 'Scienze Umane', 'Liceo delle Scienze Umane – opzione economico-sociale').competenze.includes('economico-sociale'), 'Scienze umane LES');
  // tutti i licei dell'app sono migrati: nessuno usa più le voci della bozza
  for (const k of Object.keys(QUADRI_ORARI_SEC2).filter(x => x.startsWith('Liceo'))) assert(LICEI_2010_MIGRATI.has(k), `liceo non migrato: ${k}`);
});

test('Lotto 2 (Artistico, Musicale e coreutico): elenchi ufficiali DPR 89/2010 e alternative di indirizzo/sezione', () => {
  const art = 'Liceo Artistico', mus = 'Liceo Musicale e Coreutico';
  const b = getDisciplineSec2(art, 14), t = getDisciplineSec2(art, 17);
  assert(b.includes('Storia e Geografia') && b.includes('Laboratorio Artistico') && !b.includes('Filosofia'), 'biennio Artistico errato');
  assert(t.includes('Storia') && t.includes('Filosofia') && t.includes('Fisica') && !t.includes('Laboratorio Artistico'), 'triennio Artistico errato');
  const opzA = getOpzionaliSec2(art, 17);
  for (const n of ['Laboratorio della Figurazione', 'Laboratorio di Architettura', 'Laboratorio del Design', 'Laboratorio Audiovisivo e Multimediale', 'Laboratorio di Grafica', 'Laboratorio di Scenografia']) {
    assert(opzA.includes(n) && t.includes(n), 'indirizzo mancante: ' + n);
  }
  assert(getOpzionaliSec2(art, 14).length === 0, 'biennio Artistico senza opzionali');
  const bm = getDisciplineSec2(mus, 14), tm = getDisciplineSec2(mus, 17);
  assert(bm.includes('Laboratorio Coreutico') && bm.includes('Tecnologie Musicali') && !tm.includes('Laboratorio Coreutico'), 'Laboratorio coreutico solo nel biennio');
  assert(tm.includes('Storia della Danza') && !bm.includes('Storia della Danza') && tm.includes('Laboratorio Coreografico'), 'Storia della danza e Laboratorio coreografico solo nel triennio');
  assert(getOpzionaliSec2(mus, 14).length === 9 && getOpzionaliSec2(mus, 17).length === 9, 'opzionali della sezione musicale/coreutica');
  for (const k of [art, mus]) {
    const v = QUADRI_ORARI_SEC2[k];
    for (const o of v.biennioOpzionali) assert(v.biennio.includes(o), "opzionale biennio non nell'elenco: " + o);
  }
  assert(getProgrammaDisciplina('sec2', "Storia dell'Arte", art).competenze.includes('Liceo artistico'), "Storia dell'arte Artistico");
  assert(getProgrammaDisciplina('sec2', "Storia dell'Arte", mus).competenze.includes('Indicazioni licei 2010'), "Storia dell'arte Musicale");
});

test('Lotto 3: sezione sportiva (DPR 52/2013) e Made in Italy (DPR 222/2024): fonti, elenchi e riferimenti', () => {
  const sp = 'Liceo Scientifico – sezione a indirizzo sportivo', mi = 'Liceo del Made in Italy';
  const bs = getDisciplineSec2(sp, 14), ts = getDisciplineSec2(sp, 17);
  assert(!bs.includes('Latino') && !ts.includes('Latino'), 'lo sportivo non ha il Latino');
  assert(!bs.includes('Diritto ed Economia dello Sport') && ts.includes('Diritto ed Economia dello Sport'), 'Diritto ed economia dello sport solo nel triennio');
  assert(bs.includes('Discipline Sportive') && ts.includes('Discipline Sportive'), 'Discipline sportive in tutto il quinquennio');
  assert(getProgrammaDisciplina('sec2', 'Italiano', sp).competenze.includes('Nella sezione sportiva'), 'Italiano sportivo: integrazione DPR 52/2013');
  assert(getProgrammaDisciplina('sec2', 'Italiano', 'Liceo Classico').competenze.indexOf('Nella sezione sportiva') < 0, 'integrazione sportiva non deve trapelare nel Classico');
  const bm = getDisciplineSec2(mi, 14), tm = getDisciplineSec2(mi, 17);
  assert(bm.includes('Diritto') && bm.includes('Economia Politica') && !tm.includes('Diritto'), 'biennio: Diritto ed Economia politica');
  assert(tm.includes('Scienze Giuridiche per il Made in Italy') && tm.includes('Scienze Economiche per il Made in Italy') && tm.includes('Laboratorio Interdisciplinare per il Made in Italy'), 'triennio Made in Italy');
  assert(!bm.includes('Filosofia') && tm.includes('Filosofia') && tm.includes('Fisica') && !bm.includes('Fisica'), 'Filosofia e Fisica solo nel triennio');
  assert(riferimentoLiceo(sp).nota.includes('DPR 52/2013') && riferimentoLiceo(mi).nota.includes('DPR 222/2024') && riferimentoLiceo('Liceo Classico').nota.includes('D.M. 211/2010'), 'riferimenti normativi per liceo');
  assert(getProgrammaDisciplina('sec2', 'Matematica', mi).competenze.includes('made in italy') || getProgrammaDisciplina('sec2', 'Matematica', mi).competenze.includes('Liceo del made in Italy'), 'Matematica MiI');
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

// ── Istituti Tecnici, ordinamento vigente (Linee guida DPR 88/2010) ──
const TECNICI = Object.keys(QUADRI_ORARI_SEC2).filter(k => k.startsWith('IT'));

test('Tecnici vigente: ogni disciplina del quadro vigente (biennio e triennio) ha una voce curata', () => {
  const missing = [];
  for (const k of TECNICI) {
    const q = QUADRI_ORARI_SEC2[k];
    for (const nome of [...q.biennio, ...q.triennio]) {
      if (nome === 'Religione / Attività alternativa') continue;
      if (!getProgrammaDisciplina('sec2', nome, k, 17)) missing.push(`${k}: ${nome}`);
    }
  }
  assert(missing.length === 0, `discipline Tecnici senza voce: ${missing.join('; ')}`);
});

test('Tecnici: Italiano/Matematica/Inglese usano le Linee guida tecniche, non la bozza dei licei', () => {
  for (const nome of ['Italiano', 'Matematica', 'Lingua Straniera (Inglese)']) {
    for (const k of TECNICI) {
      assert(getProgrammaDisciplina('sec2', nome, k, 17) === PROGRAMMI_TECNICI_VIGENTE[nome], `${nome} non risolto sulle Linee guida tecniche per ${k}`);
    }
  }
});

test('Tecnici: le voci di indirizzo non compaiono per altri tipi di scuola (Licei/Professionali)', () => {
  assert(getProgrammaDisciplina('sec2', 'Enologia', 'IP – Servizi commerciali') === null, 'Enologia non deve valere per i professionali');
  assert(getProgrammaDisciplina('sec2', 'Topografia e Costruzioni', 'Liceo Scientifico') === null, 'Topografia e Costruzioni non deve valere per i licei');
});

test('Tecnici Trasporti: Diritto ed Economia cambia tra biennio e triennio', () => {
  const t = 'IT – Trasporti e logistica';
  const bi = getProgrammaDisciplina('sec2', 'Diritto ed Economia', t, 14);
  const tri = getProgrammaDisciplina('sec2', 'Diritto ed Economia', t, 17);
  assert(bi && tri && bi !== tri, 'voce del triennio non distinta da quella del biennio');
  assert(tri.nuclei.join(' ').includes('navigazione'), 'la voce del triennio deve trattare il diritto della navigazione');
});

test('Tecnici: Complementi di Matematica è declinato per indirizzo (Trasporti ≠ Grafica)', () => {
  const a = getProgrammaDisciplina('sec2', 'Complementi di Matematica', 'IT – Trasporti e logistica', 17);
  const b = getProgrammaDisciplina('sec2', 'Complementi di Matematica', 'IT – Grafica e comunicazione', 17);
  assert(a !== b && a.nuclei.join(' ').includes('sferica') && !b.nuclei.join(' ').includes('sferica'), 'declinazione per indirizzo non rispettata');
});

test('Tecnici: intestazione con riferimento alle Linee guida; nota di cautela solo per il nuovo ordinamento', () => {
  const k = 'IT – Meccanica, meccatronica ed energia';
  const vig = getProgrammiPerDiscipline('sec2', getDisciplineSec2(k, 17), k, 17);
  assert(vig.startsWith('Programmi ministeriali di riferimento (Linee guida degli istituti tecnici'), 'intestazione vigente errata');
  assert(!vig.includes('non ancora consultate'), 'nota di cautela non attesa per il vigente');
  const nuovo = getProgrammiPerDiscipline('sec2', getDisciplineSec2(k, 14), k, 14);
  assert(nuovo.includes('D.M. 29/2026') && nuovo.includes('non ancora consultate'), 'nota di cautela mancante per il nuovo ordinamento');
});

test('Religione / Attività alternativa in sec2: nessun errore, degrado silenzioso voluto', () => {
  const testo = getProgrammiPerDiscipline('sec2', ['Religione / Attività alternativa'], 'Liceo Classico');
  assert(testo === '', 'ci si aspettava un blocco vuoto per Religione (fonte diversa, non curata)');
});

console.log(`\n${passed} test superati${failed ? `, ${failed} FALLITI` : ''}.`);
if (failed > 0) process.exit(1);
