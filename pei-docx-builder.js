// pei-docx-builder.js
// Porting ESM di server/docx_builder.js (progetto "Generatore PEI", G:\Il mio Drive\ICF_Scuola\PEI con Claude)
// Nessuna modifica di logica — solo require/module.exports -> import/export.

import {
  Document, Packer, Paragraph, TextRun, Table, TableRow as DocxTableRow, TableCell,
  AlignmentType, BorderStyle, WidthType, ShadingType,
  VerticalAlign, PageNumber, Footer, UnderlineType,
} from 'docx';
import { STRUTTURA_SEZ8, TERMINOLOGIA, testoStandard81, getOpzionaliSec2, getOrdinamentoSec2 } from './pei-gradi.js';
import { LICEI_2010_MIGRATI, riferimentoLiceo } from './pei-programmi.js';

// ── Palette ───────────────────────────────────────────────────────────────────
// Bianco e nero puro, come i modelli ministeriali ufficiali (Allegati A1-A4, D.I. 182/2020):
// nessuna colorazione/sfondo in nessuna pagina, solo bordi neri sottili e grassetto per
// evidenziare intestazioni. I nomi storici (BLUE/MIDBLUE/...) restano per non dover toccare
// ogni singolo punto del file che li referenzia — solo i valori esadecimali sono cambiati.
const C = {
  BLUE:      '000000', MIDBLUE:  '000000',
  LIGHTBLUE: 'FFFFFF', GREY:     'FFFFFF',
  DARKGREY:  '000000', WHITE:    'FFFFFF', BLACK: '000000',
};
// Bordi tabella neri sottili (il modello ministeriale non usa mai grigio) — il nome "bGrey"
// resta per non toccare i molti punti del file che lo referenziano come "allGrey".
const bGrey = { style: BorderStyle.SINGLE, size: 4, color: C.BLACK };
const bNone = { style: BorderStyle.NONE,   size: 0, color: C.WHITE };
const allGrey = { top: bGrey, bottom: bGrey, left: bGrey, right: bGrey };
const FULL = 9360;

// ── Impaginazione ─────────────────────────────────────────────────────────────
// Le righe di tabella non si spezzano tra due pagine; le intestazioni si ripetono; titoli, note e intestazioni di tabella
// restano con ciò che segue; le tabelle brevi (firme, orario, schede) restano intere (keepNext su ogni paragrafo).
let _keepAll = false;
function keepTogether(fn) { const prev = _keepAll; _keepAll = true; try { return fn(); } finally { _keepAll = prev; } }
const _kn = () => (_keepAll ? { keepNext: true } : {});
function TableRow(o) { return new DocxTableRow({ cantSplit: true, ...o }); }

// ── Forma del soggetto ────────────────────────────────────────────────────────
// Il sesso e il nome sono noti: le forme generiche con la barra ("Lo/la studente/essa", "del/della studente/essa",
// "sul/sulla alunno/a"…) prodotte dall'AI o presenti nei moduli vengono rese col nome proprio ("Giulia", "di Giulia", "su Giulia").
const _NOUN = '(?:studente\\/essa|alunno\\/a|bambino\\/a)';
const _RX_SOGG = new RegExp("\\b(dello|del|dell'|allo|al|all'|sullo|sul|sull'|dallo|dal|dall'|nello|nel|nell'|lo|il|l')(?:\\/(?:della|alla|sulla|dalla|nella|la|a))?\\s*(" + _NOUN + ')', 'gi');
function normalizzaSoggetto(text, nome, sesso) {
  const n = String(nome || '').trim().split(/\s+/)[0];
  if (!n) return text;
  return String(text)
    .replace(_RX_SOGG, (m, art) => {
      const a = art.toLowerCase();
      if (a.startsWith('del')) return 'di ' + n;
      if (a.startsWith('al')) return 'a ' + n;
      if (a.startsWith('sul')) return 'su ' + n;
      if (a.startsWith('dal')) return 'da ' + n;
      if (a.startsWith('nel')) return 'in ' + n;
      return n;
    })
    .replace(/\bstudente\/essa\b/g, sesso === 'F' ? 'studentessa' : 'studente')
    .replace(/\balunno\/a\b/g, sesso === 'F' ? 'alunna' : 'alunno')
    .replace(/\bbambino\/a\b/g, sesso === 'F' ? 'bambina' : 'bambino');
}
let _soggetto = { nome: '', sesso: '' };

// ── Primitivi ─────────────────────────────────────────────────────────────────
function txt(t, o = {}) {
  return new TextRun({
    text: normalizzaSoggetto(String(t ?? ''), _soggetto.nome, _soggetto.sesso), font: 'Calibri',
    size: o.size || 22, bold: !!o.bold, italics: !!o.italic,
    color: o.color || C.BLACK,
    underline: o.underline ? { type: UnderlineType.SINGLE } : undefined,
  });
}

function p(children, o = {}) {
  const runs = Array.isArray(children) ? children
    : typeof children === 'string' ? [txt(children, o)] : [children];
  return new Paragraph({
    children: runs,
    alignment: o.align || AlignmentType.LEFT,
    keepNext: o.keepNext ?? (_keepAll || !!o.italic),
    spacing: { before: o.before ?? 60, after: o.after ?? 60 },
    indent: o.indent ? { left: o.indent } : undefined,
    border: o.borderBottom
      ? { bottom: { style: BorderStyle.SINGLE, size: 6, color: C.MIDBLUE, space: 4 } }
      : undefined,
  });
}

function empty(n = 1) {
  return Array.from({ length: n }, () =>
    new Paragraph({ children: [txt('')], spacing: { before: 40, after: 40 } })
  );
}
// Riga vuota che resta attaccata all'elemento successivo (usata tra titolo/nota e tabella)
function emptyK(n = 1) {
  return Array.from({ length: n }, () =>
    new Paragraph({ children: [txt('')], keepNext: true, spacing: { before: 40, after: 40 } })
  );
}

// Converte una riga con **grassetto** in array di TextRun
function parseInline(line, size) {
  const runs = [];
  let rem = line.replace(/\*{3,}/g, '**'); // normalizza *** → **
  // Rimuovi marcatori *corsivo* (asterisco singolo, non parte di **grassetto**)
  // (?<!\*)\*(?!\*) = asterisco singolo; [^*]*? = testo senza asterischi
  rem = rem.replace(/(?<!\*)\*(?!\*)([^*]*?)(?<!\*)\*(?!\*)/g, '$1');
  while (rem.length > 0) {
    const i = rem.indexOf('**');
    if (i === -1) { runs.push(txt(rem, { size })); break; }
    if (i > 0) runs.push(txt(rem.slice(0, i), { size }));
    rem = rem.slice(i + 2);
    const j = rem.indexOf('**');
    if (j === -1) { runs.push(txt(rem, { size, bold: true })); break; }
    runs.push(txt(rem.slice(0, j), { size, bold: true }));
    rem = rem.slice(j + 2);
  }
  return runs.length ? runs : [txt('', { size })];
}

function lines(str, size = 21) {
  const result = [];
  for (const line of String(str || '').split('\n')) {
    const t = line.trim();
    if (!t || /^-{3,}$/.test(t)) continue;          // salta --- e vuote
    // Heading ## o ###
    const hm = t.match(/^#{2,3}\s+(.+)$/);
    if (hm) { result.push(h3(hm[1].replace(/\*\*/g, ''))); continue; }
    // Heading # (raro nel corpo)
    const h1m = t.match(/^#\s+(.+)$/);
    if (h1m) { result.push(h2(h1m[1].replace(/\*\*/g, ''))); continue; }
    // Riga di tabella markdown | cel1 | cel2 |
    if (t.startsWith('|') && t.endsWith('|')) {
      const cells = t.split('|').map(c => c.trim()).filter(Boolean);
      // Salta righe separatore |---|---|
      if (cells.length === 0 || cells.every(c => /^[-:]+$/.test(c))) continue;
      if (cells.length >= 2) {
        const key = cells[0].replace(/\*\*/g, '');
        const val = cells.slice(1).join(' – ');
        result.push(new Paragraph({
          children: [
            txt(key, { size, bold: true, color: C.BLUE }),
            txt(': ', { size }),
            ...parseInline(val, size),
          ],
          spacing: { before: 60, after: 40 }, ..._kn(),
        }));
      } else {
        result.push(new Paragraph({ children: parseInline(cells[0], size), spacing: { before: 40, after: 40 }, ..._kn() }));
      }
      continue;
    }
    result.push(new Paragraph({
      children: parseInline(t, size),
      spacing: { before: 40, after: 40 }, ..._kn(),
    }));
  }
  return result;
}

function h1(text) {
  return new Paragraph({
    children: [txt(text, { bold: true, size: 26, color: C.BLUE })], keepNext: true,
    spacing: { before: 280, after: 100 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 8, color: C.MIDBLUE, space: 6 } },
  });
}

function h2(text, color = C.MIDBLUE) {
  return new Paragraph({
    children: [txt(text, { bold: true, size: 23, color })], keepNext: true,
    spacing: { before: 160, after: 80 },
  });
}

function h3(text) {
  return new Paragraph({
    children: [txt(text, { bold: true, size: 21, color: C.DARKGREY })], keepNext: true,
    spacing: { before: 100, after: 60 },
  });
}

// ── Celle ─────────────────────────────────────────────────────────────────────
function cell(content, w, o = {}) {
  const children = typeof content === 'string' ? lines(content, o.size || 21)
    : Array.isArray(content) ? content : [content];
  return new TableCell({
    borders: o.borders || allGrey,
    shading: { fill: o.fill || C.WHITE, type: ShadingType.CLEAR },
    margins: { top: o.mt||80, bottom: o.mb||80, left: o.ml||120, right: o.mr||120 },
    width: { size: w, type: WidthType.DXA },
    verticalAlign: o.vAlign || VerticalAlign.TOP,
    columnSpan: o.span,
    children,
  });
}

// Il parametro fill resta nella firma per non dover toccare ogni chiamata esistente,
// ma viene ignorato: le intestazioni ministeriali sono sempre sfondo bianco, testo nero grassetto.
function hCell(text, w, fill = C.WHITE) {
  return cell([p(text, { bold: true, color: C.BLACK, size: 20, keepNext: true })], w, { fill: C.WHITE, borders: allGrey });
}

// ── Tabelle helper ────────────────────────────────────────────────────────────
function _twoCol(rows, wL = 3000, wR = null) {
  const wR2 = wR ?? (FULL - wL);
  return new Table({
    width: { size: FULL, type: WidthType.DXA },
    columnWidths: [wL, wR2],
    rows: rows.map(([label, value], i) => new TableRow({
      children: [
        cell([p(label, { bold: true, size: 20, color: C.BLUE })], wL,
          { fill: C.LIGHTBLUE, borders: allGrey }),
        cell(value, wR2,
          { fill: i % 2 === 0 ? C.WHITE : C.GREY, borders: allGrey }),
      ],
    })),
  });
}

function _dimTable(rawText) {
  // Parsa la tabella markdown dalla risposta AI
  const cols = [3400, 2400, 3560];
  const headers = ['Dimensione', 'Esito Analisi (∑P; N; Media)', 'Motivazione'];
  const dataRows = [];

  const lines2 = (rawText || '').split('\n');
  for (const line of lines2) {
    if (!line.trim().startsWith('|')) continue;
    const cells = line.split('|').map(c => c.trim()).filter(Boolean);
    if (cells.length >= 2 && !cells[0].match(/^-+$/) && !cells[0].toLowerCase().includes('dimensione')) {
      dataRows.push(cells);
    }
  }

  // Fallback se parsing fallisce
  if (dataRows.length === 0) {
    const dims = ['A – Relazione e Socializzazione','B – Comunicazione e Linguaggio','C – Autonomia e Orientamento','D – Cognitiva e Apprendimento'];
    dims.forEach(d => dataRows.push([d, 'Da calcolare', '']));
  }

  return new Table({
    width: { size: FULL, type: WidthType.DXA },
    columnWidths: cols,
    rows: [
      new TableRow({ tableHeader: true, children: headers.map((h, i) => hCell(h, cols[i])) }),
      ...dataRows.map((row, ri) => new TableRow({
        children: row.slice(0, 3).map((val, ci) => cell(
          [p(String(val), { size: 20, bold: ci === 1 && String(val).includes('DEFINITA') })],
          cols[ci], { fill: ri % 2 === 0 ? C.WHITE : C.GREY, borders: allGrey }
        )),
      })),
    ],
  });
}

// ── Parser marker univoci ────────────────────────────────────────────────────
// Legge un marker univoco nel testo AI: "SPEC81: testo" → "testo"
function parseMarker(text, marker) {
  const rx = new RegExp('^' + marker.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ':?\\s*(.+)', 'im');
  const m = (text || '').match(rx);
  return m ? m[1].trim() : '';
}

// Parsa righe "DISC: nome | opzione | personalizzazioni"
function parseDisciplineMarkers(text) {
  const rows = [];
  for (const line of (text || '').split('\n')) {
    const t = line.trim();
    if (!/^DISC:/i.test(t)) continue;
    const rest = t.slice(5).trim();
    const parts = rest.split('|').map(s => s.replace(/\*\*/g, '').trim());
    while (parts.length < 3) parts.push('');
    if (parts[0] && !/^\[/.test(parts[0])) rows.push(parts.slice(0, 3)); // scarta righe placeholder [...]
  }
  return rows;
}

// Anno di corso (1-5) per la sec2, stessa formula di calcolaClasse() in pei-prompt.js
function annoCorsoSec2(eta) {
  const e = parseInt(eta, 10) || 0;
  return Math.min(Math.max(e - 13, 1), 5);
}

// Deriva il riquadro di riepilogo A/B/C dalle opzioni scelte disciplina per disciplina
// (Linee Guida PEI, Decreto Interm. 153/2023: C se almeno una disciplina è C,
// altrimenti B se almeno una è B, altrimenti A).
function riepilogoPercorso(sez82text) {
  const rows = parseDisciplineMarkers(sez82text);
  const opzioni = rows.map(r => (r[1] || '').trim().toUpperCase());
  const esito = opzioni.includes('C') ? 'C' : opzioni.includes('B') ? 'B' : 'A';
  const box = (letter) => (esito === letter ? '☒' : '☐');
  return `Lo/a studente/essa segue un percorso didattico di tipo: ${box('A')} A. ordinario  ${box('B')} B. personalizzato (con prove equipollenti)  ${box('C')} C. differenziato`;
}

// Parser a blocchi per formato multi-riga delle discipline (legacy fallback):
//   Disciplina: X | Opzione: B | Personalizzazioni: testo
//   oppure su righe separate:
//     Disciplina: X
//     Opzione: B
//     Personalizzazioni: testo
function parseDisciplineBlocks(text, haABC) {
  const blocks = [];
  const lns = (text || '').split('\n');
  let cur = null;

  for (const raw of lns) {
    const t = raw.trim();
    // Riga "Disciplina: X" — strip ** prima del match per coprire "**Disciplina:**" e "**Disciplina**:"
    const tClean = t.replace(/\*\*/g, '');
    const dm = tClean.match(/^Disciplina:\s*([^|\n]+?)(?:\s*\|\s*Opzione:\s*([A-Ca-c]))?(?:\s*\|\s*Personalizzazioni[^:]*:\s*(.+))?$/i);
    if (dm) {
      if (cur) blocks.push(cur);
      cur = {
        disciplina: dm[1].replace(/\*\*/g, '').trim(),
        opzione:    (dm[2] || '').trim().toUpperCase(),
        pers:       (dm[3] || '').replace(/\*\*/g, '').trim(),
      };
      continue;
    }
    if (cur) {
      // Riga "Opzione: B" su riga separata
      const om = t.match(/^\*{0,2}Opzione\*{0,2}:\s*([A-Ca-c])\b/i);
      if (om) { cur.opzione = om[1].toUpperCase(); continue; }
      // Riga "Personalizzazioni: testo"
      const pm = t.match(/^\*{0,2}Personalizzazioni[^:]*\*{0,2}:\s*(.+)$/i);
      if (pm) {
        const add = pm[1].replace(/\*\*/g, '').trim();
        cur.pers = cur.pers ? cur.pers + '\n' + add : add;
      } else if (t && !t.match(/^#{1,4}\s/) && !t.match(/^\*{0,2}(?:Campo|Attività|Strategie)\*{0,2}:/i)) {
        // Riga di continuazione testo (non una nuova chiave nota)
        if (cur.pers) cur.pers += ' ' + t.replace(/\*\*/g, '');
      }
    }
  }
  if (cur) blocks.push(cur);

  return blocks.filter(b => b.disciplina).map(b => {
    if (haABC) return [b.disciplina, b.opzione, b.pers];
    return [b.disciplina, b.pers]; // primaria: no opzione
  });
}

// Label per dimensione ICF (A/B/C/D)
const DIM_LABEL = {
  A: 'A – Relazione, Interazione e Socializzazione',
  B: 'B – Comunicazione e Linguaggio',
  C: 'C – Autonomia e Orientamento',
  D: 'D – Cognitiva, Neuropsicologica e dell\'Apprendimento',
  _: 'Dimensione non specificata',
};

// Render sezione 5: PRIMA la Dimensione, POI gli obiettivi raggruppati sotto
function objectivesBlock(rawText) {
  const result = [];
  if (!rawText) return result;

  // ── 1. Parse obiettivi ────────────────────────────────────────────────────
  const objectives = [];
  let cur = null;
  for (const line of rawText.split('\n')) {
    const t = line.trim();
    const om = t.match(/^#{2,4}\s*Obiettivo\s+(\d+)\s*[–\-:]+\s*(.+)$/i);
    if (om) {
      if (cur) objectives.push(cur);
      cur = { num: om[1], title: om[2].replace(/\*\*/g, '').trim(), dim: '_', lines: [] };
    } else if (cur) {
      cur.lines.push(t);
      // Rileva dimensione — strip # (l'AI a volte scrive "## Dimensione B – ...") e **
      // prima di matchare, altrimenti "## Dimensione B" non combacia con "^Dimensione".
      if (cur.dim === '_') {
        const dm = t.replace(/^#{1,4}\s*/, '').replace(/\*\*/g, '').match(/^Dimensione[\s:]+([A-D])\b/i);
        if (dm) cur.dim = dm[1].toUpperCase();
      }
    }
  }
  if (cur) objectives.push(cur);
  if (objectives.length === 0) return lines(rawText);

  // ── 2. Raggruppa per dimensione (ordine di prima comparsa) ───────────────
  const dimOrder = [];
  const byDim = {};
  for (const obj of objectives) {
    if (!byDim[obj.dim]) { byDim[obj.dim] = []; dimOrder.push(obj.dim); }
    byDim[obj.dim].push(obj);
  }

  // ── 3. Rendering: Banner dimensione → obiettivi sotto ────────────────────
  // Bianco e nero, come il modello ministeriale (nessuno sfondo colorato per le dimensioni,
  // solo intestazione in grassetto con riga sottostante, coerente con h1()/h2()).
  for (const dim of dimOrder) {
    // Banner Dimensione (grassetto, nessuno sfondo)
    result.push(new Paragraph({
      children: [txt('DIMENSIONE ' + DIM_LABEL[dim], { bold: true, size: 22, color: C.BLACK })], keepNext: true,
      spacing: { before: 300, after: 100 },
      border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: C.BLACK, space: 4 } },
    }));

    // Obiettivi sotto questa dimensione
    for (const obj of byDim[dim]) {
      // Titolo obiettivo
      result.push(new Paragraph({
        children: [
          txt(`Obiettivo ${obj.num} – `, { bold: true, size: 22, color: C.BLACK }),
          txt(obj.title, { bold: true, size: 22, color: C.BLACK }),
        ],
        spacing: { before: 160, after: 40 }, keepNext: true,
      }));

      // Corpo obiettivo — salta la riga "Dimensione:" (già nel banner). Strip # e ** prima
      // di matchare: l'AI a volte scrive il divisore come intestazione "## Dimensione B – ...",
      // che altrimenti sopravvive al filtro e duplica il banner colorato sottostante.
      const bodyLines = obj.lines.filter(l => {
        const clean = l.replace(/^#{1,4}\s*/, '').replace(/\*\*/g, '');
        return !/^Dimensione[\s:]+[A-D_]/i.test(clean) && l.trim() !== '';
      });
      if (bodyLines.length) result.push(...lines(bodyLines.join('\n')));
      result.push(...empty(1));
    }
  }

  return result;
}

// Render sezione 7: 3 categorie ministeriali con tabella azioni 3 colonne
function _sez7Block(cat1, cat2, cat3, fallbackRaw) {
  const CAT_TITLES = [
    'Categoria 1 – Rimozione delle barriere',
    'Categoria 2 – Facilitatori universali',
    'Categoria 3 – Facilitatori personalizzati',
  ];
  const cats = [cat1, cat2, cat3];
  const hasCats = cats.some(c => c && c.trim().length > 10);

  const result = [];

  // Bianco e nero, come il modello ministeriale: nessuno sfondo colorato, grassetto con riga
  // sottostante (coerente con h1()/h2() e con il banner Dimensione della Sezione 5).
  const renderCat = (title, rawCat) => {
    result.push(new Paragraph({
      children: [txt(title, { bold: true, size: 21, color: C.BLACK })], keepNext: true,
      spacing: { before: 140, after: 80 },
      border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: C.BLACK, space: 4 } },
    }));

    const cols3 = [4400, 2600, 2360];
    const heads3 = ['Azione', 'Destinatari', 'Tempi'];
    const rows3 = [];

    for (const line of (rawCat || '').split('\n')) {
      const cells = parseCells(line);
      if (!cells) continue;
      if (cells.length >= 2 && !cells[0].toLowerCase().match(/^azione|^-+/)) {
        while (cells.length < 3) cells.push('');
        rows3.push(cells.slice(0, 3));
      }
    }

    if (rows3.length > 0) {
      result.push(new Table({
        width: { size: FULL, type: WidthType.DXA },
        columnWidths: cols3,
        rows: [
          new TableRow({ tableHeader: true, children: heads3.map((h, i) => hCell(h, cols3[i])) }),
          ...rows3.map((row, ri) => new TableRow({
            children: row.map((val, ci) => cell(
              [p(String(val), { size: 19 })], cols3[ci],
              { fill: ri % 2 === 0 ? C.WHITE : C.GREY, borders: allGrey }
            )),
          })),
        ],
      }));
    } else {
      result.push(...lines(rawCat));
    }
    result.push(...empty(1));
  };

  if (hasCats) {
    cats.forEach((c, i) => renderCat(CAT_TITLES[i], c));
  } else {
    // Fallback: vecchio formato Ambito 1/2/3 o testo libero
    result.push(...intervTable(fallbackRaw));
  }

  return result;
}

// Estrae celle da una riga, gestisce sia | v1 | v2 | che **K:** v1 | **K:** v2
function parseCells(line) {
  const t = line.trim();
  // Formato pipe classico: | v1 | v2 |
  if (t.startsWith('|') && t.endsWith('|')) {
    return t.split('|').map(c => c.trim()).filter(Boolean);
  }
  // Formato **Chiave:** valore | **Chiave:** valore
  if (t.includes('|') && t.includes(':') && /\*\*[^*]+\*\*/.test(t)) {
    return t.split('|').map(s => {
      const ci = s.indexOf(':');
      return ci !== -1 ? s.slice(ci + 1).replace(/\*\*/g, '').trim() : s.replace(/\*\*/g, '').trim();
    }).filter(Boolean);
  }
  return null;
}

// Restituisce SEMPRE un array di elementi (Table o paragrafi narrativi)
function _intervTable(rawText) {
  const cols = [3500, 1960, 2200, 1700];
  const heads = ['Azione', 'Tipo intervento', 'Destinatari', 'Tempi'];
  const dataRows = [];
  for (const line of (rawText || '').split('\n')) {
    const cells = parseCells(line);
    if (!cells) continue;
    if (cells.length >= 3 && !cells[0].match(/^-+$/) && !cells[0].toLowerCase().match(/^azione|^---/)) {
      while (cells.length < 4) cells.push('');
      dataRows.push(cells.slice(0, 4));
    }
  }
  // Fallback narrativo: se l'AI non ha usato il formato pipe, rende il testo com'è
  if (dataRows.length === 0) return lines(rawText);

  return [new Table({
    width: { size: FULL, type: WidthType.DXA },
    columnWidths: cols,
    rows: [
      new TableRow({ tableHeader: true, children: heads.map((h, i) => hCell(h, cols[i], C.MIDBLUE)) }),
      ...dataRows.map((row, ri) => new TableRow({
        children: row.map((val, ci) => cell(
          [p(String(val), { size: 19 })], cols[ci],
          { fill: ri % 2 === 0 ? C.WHITE : C.GREY, borders: allGrey }
        )),
      })),
    ],
  })];
}

const CAMPI_INFANZIA = ["Il sé e l'altro", 'Il corpo e il movimento', 'Immagini, suoni, colori', 'I discorsi e le parole', 'La conoscenza del mondo'];
function parseCampiBlocks(text) {
  const blocks = [];
  let cur = null;
  for (const raw of String(text || '').split('\n')) {
    const t = raw.replace(/\*\*/g, '').replace(/^\s*(?:[-•]|\d+[.)]|#{1,4})\s*/, '').replace(/[’‘]/g, "'").trim();
    if (!t) continue;
    if (/^nota\s*:/i.test(t)) { cur = null; continue; }
    const senzaEtichetta = t.replace(/^campo(?:\s+di\s+esperienza)?\s*:\s*/i, '');
    const canon = CAMPI_INFANZIA.find(c => senzaEtichetta.toLowerCase().startsWith(c.toLowerCase()));
    if (canon) { cur = { campo: canon, body: senzaEtichetta.slice(canon.length) }; blocks.push(cur); continue; }
    if (cur) cur.body += '\n' + t;
  }
  const pulisci = x => (x || '').replace(/^[\s|:–-]+|[\s|]+$/g, '').replace(/\s*\n\s*/g, ' ').trim();
  return blocks.map(b => {
    const a = b.body.match(/Attivit[àa]\s*:?\s*([\s\S]*?)(?=\|?\s*Strategie|$)/i);
    const st = b.body.match(/Strategie(?:\s+e\s+Strumenti)?\s*:?\s*([\s\S]*)$/i);
    return [b.campo, pulisci(a ? a[1] : b.body), pulisci(st ? st[1] : '')];
  }).filter(r => r[1] || r[2]);
}

function disciplineTable(rawText, grado) {
  // Parsa la tabella discipline dalla risposta AI
  const isInfanzia = grado === 'infanzia';
  const isPrimaria = grado === 'primaria';
  const haABC      = grado === 'sec1' || grado === 'sec2';

  const cols = haABC
    ? [2400, 1200, 5760]
    : isPrimaria ? [2400, 6960]
    : [2400, 2400, 4560]; // infanzia: campo, attività, strategie

  const headers = haABC
    ? ['Disciplina', 'Opzione', 'Personalizzazioni']
    : isPrimaria ? ['Disciplina', 'Personalizzazioni']
    : ['Campo di esperienza', 'Attività', 'Strategie e Strumenti'];

  const dataRows = [];

  // Parser 1 (prioritario): marker DISC: — formato "DISC: nome | opzione | personalizzazioni"
  const discRows = parseDisciplineMarkers(rawText);
  for (const row of discRows) {
    // Per gradi senza colonna Opzione (primaria): salta colonna centrale
    const r = haABC ? row : [row[0], row[2] || row[1]];
    while (r.length < headers.length) r.push('');
    dataRows.push(r.slice(0, headers.length));
  }

  // Parser 2: celle pipe  | val1 | val2 | (fallback se DISC: non trovato)
  if (dataRows.length === 0) {
    for (const line of (rawText || '').split('\n')) {
      const cells = parseCells(line);
      if (!cells) continue;
      const isHeader = cells.some(c => c.match(/^-+$/) || c.toLowerCase().match(/^disciplina|^campo|^opzione|^area/));
      if (cells.length >= 2 && !isHeader) {
        while (cells.length < headers.length) cells.push('');
        dataRows.push(cells.slice(0, headers.length));
      }
    }
  }

  // Parser 3: blocchi multi-riga "Disciplina: X" (fallback finale)
  if (dataRows.length === 0) {
    const blocks = parseDisciplineBlocks(rawText, haABC);
    for (const row of blocks) {
      const r = [...row];
      while (r.length < headers.length) r.push('');
      dataRows.push(r.slice(0, headers.length));
    }
  }

  // Parser 4 (infanzia): blocchi multi-riga "Campo: X / Attività: Y / Strategie e Strumenti: Z" o titoli coi nomi dei 5 campi
  if (dataRows.length === 0 && isInfanzia) {
    for (const r of parseCampiBlocks(rawText)) dataRows.push(r);
  }

  // Ultima difesa: mai perdere il testo generato dall'AI (prima compariva solo "Tabella discipline da completare")
  if (dataRows.length === 0) {
    const grezzo = isInfanzia
      ? String(rawText || '').split('\n').filter(l => /campo|attivit|strategi|s[eé] e l'altro|corpo e il movimento|immagini, suoni|discorsi e le parole|conoscenza del mondo/i.test(l)).join('\n')
      : rawText;
    const narrativo = lines(grezzo);
    return narrativo.length ? narrativo : [p('Tabella discipline da completare.', { size: 20, italic: true })];
  }

  return [new Table({
    width: { size: FULL, type: WidthType.DXA },
    columnWidths: cols,
    rows: [
      new TableRow({ tableHeader: true, children: headers.map((h, i) => hCell(h, cols[i], C.MIDBLUE)) }),
      ...dataRows.map((row, ri) => new TableRow({
        children: row.map((val, ci) => cell(
          [p(String(val), { size: 20 })], cols[ci],
          { fill: ci === 0 ? C.LIGHTBLUE : (ri % 2 === 0 ? C.WHITE : C.GREY), borders: allGrey }
        )),
      })),
    ],
  })];
}

function _gloTable() {
  const cols = [3600, 3760, 2000];
  return new Table({
    width: { size: FULL, type: WidthType.DXA },
    columnWidths: cols,
    rows: [
      new TableRow({ children: ['Nome e Cognome', 'Ruolo / Titolo', 'Firma'].map((h, i) => hCell(h, cols[i])) }),
      ...[1,2,3,4,5,6,7].map(n => new TableRow({
        children: [String(n), '', ''].map((v, ci) => cell(
          [p(v, { size: 20 })], cols[ci],
          { fill: n % 2 === 0 ? C.GREY : C.WHITE, borders: allGrey, mt: 100, mb: 100 }
        )),
      })),
    ],
  });
}

function _oraryCols() {
  const days = ['Lunedì','Martedì','Mercoledì','Giovedì','Venerdì','Sabato'];
  const cols  = [1200, 1360, 1360, 1360, 1360, 1360, 1360];
  const ore   = ['Prima ora','Seconda ora','Terza ora','Quarta ora','Quinta ora','Sesta ora'];
  return new Table({
    width: { size: FULL, type: WidthType.DXA },
    columnWidths: cols,
    rows: [
      new TableRow({ children: [hCell('Orario', cols[0]), ...days.map((d,i) => hCell(d, cols[i+1], C.MIDBLUE))] }),
      ...ore.map((ora, ri) => new TableRow({
        children: [
          cell([p(ora, { bold: true, size: 19, color: C.BLUE })], cols[0], { fill: C.LIGHTBLUE, borders: allGrey }),
          ...days.map((_, ci) => cell([p('Pres. □  Sost. □  Ass. □', { size: 17 })], cols[ci+1],
            { fill: ri % 2 === 0 ? C.WHITE : C.GREY, borders: allGrey })),
        ],
      })),
    ],
  });
}

// Tabelle brevi: restano intere sulla stessa pagina
const dimTable = (...a) => keepTogether(() => _dimTable(...a));
const gloTable = (...a) => keepTogether(() => _gloTable(...a));
const oraryCols = (...a) => keepTogether(() => _oraryCols(...a));
const intervTable = (...a) => keepTogether(() => _intervTable(...a));
const twoCol = (...a) => keepTogether(() => _twoCol(...a));
const sez7Block = (...a) => keepTogether(() => _sez7Block(...a));

// ── BUILDER PRINCIPALE ────────────────────────────────────────────────────────
function buildDocx(d, grado) {
  _soggetto = { nome: d.nomeStudente, sesso: d.sesso };
  const term  = TERMINOLOGIA[grado];
  const sez8  = STRUTTURA_SEZ8[grado];
  const std81 = testoStandard81(term);
  const children = [];

  // ── FRONTESPIZIO ─────────────────────────────────────────────────────────
  // Testo libero con spazi da compilare a mano (trattini bassi), non tabelle — così com'è
  // impaginato negli Allegati A1-A4 ministeriali (D.I. 182/2020). Ordine e dicitura dei campi
  // seguono esattamente il modello ufficiale.
  children.push(
    new Paragraph({
      children: [txt(term.intestazione, { bold: true, size: 20, color: C.BLACK })],
      alignment: AlignmentType.RIGHT, spacing: { before: 0, after: 200 },
    }),
    new Paragraph({
      children: [txt('[Intestazione della scuola]', { italic: true, size: 24, color: C.BLACK })],
      alignment: AlignmentType.CENTER, spacing: { before: 100, after: 200 },
    }),
    new Paragraph({
      children: [txt('Piano Educativo Individualizzato', { bold: true, size: 34, color: C.BLACK })],
      alignment: AlignmentType.CENTER, spacing: { before: 60, after: 40 },
    }),
    new Paragraph({
      children: [txt('(Art. 7, D.Lgs. 13 aprile 2017, n. 66 e s.m.i.)', { size: 20, italic: true, color: C.BLACK })],
      alignment: AlignmentType.CENTER, spacing: { before: 40, after: 240 },
    }),
    new Paragraph({
      children: [txt('Anno Scolastico ', { bold: true, size: 22 }), txt(d.annoScolastico || '__________', { size: 22 })],
      alignment: AlignmentType.CENTER, spacing: { before: 80, after: 240 },
    }),
    p([txt('ALUNNO/A ', { bold: true }), txt(d.nomeStudente || '____________________________', {})]),
    p([txt('codice sostitutivo personale ', {}), txt(d.codice || '____________', {})]),
    p([
      txt('Classe ', { bold: true }), txt(d.classe || '________________', {}),
      txt('     Plesso o sede ', { bold: true }), txt(d.plesso || '________________', {}),
    ]),
    ...empty(1),
    p(`Accertamento della condizione di disabilità in età evolutiva ai fini dell'inclusione scolastica rilasciato in data ${d.dataAccertamento || '_________'}`),
    p('Data scadenza o rivedibilità:  ☐ ______________     ☐ Non indicata'),
    ...empty(1),
    p([txt('Profilo di Funzionamento redatto in data ', { bold: true }), txt(d.dataPDF || '_______________', {})]),
    p('Nella fase transitoria:'),
    p('☐ Profilo di Funzionamento non disponibile', { indent: 240 }),
    p('Diagnosi Funzionale redatta in data ____________________', { indent: 480 }),
    p('Profilo Dinamico Funzionale approvato in data ______________', { indent: 480 }),
    ...empty(1),
    p([txt('Progetto Individuale   ', { bold: true }), txt('☐ redatto in data ___________     ☐ da redigere', {})]),
    ...empty(2),
    // Tabella PEI Provvisorio / Verifiche
    keepTogether(() => new Table({
      width: { size: FULL, type: WidthType.DXA },
      columnWidths: [2800, 3280, 3280],
      rows: [
        new TableRow({ children: ['Tipo atto','Data e Verbale allegato n.','Firma del Dirigente Scolastico'].map((h,i) => hCell(h, [2800,3280,3280][i])) }),
        ...['PEI Provvisorio','Approvazione del PEI e prima sottoscrizione','Verifica intermedia','Verifica finale e proposte per l\'a.s. successivo']
          .map((label, i) => new TableRow({
            children: [
              cell([p(label, { size: 19, bold: true })], 2800, { fill: i%2===0 ? C.WHITE : C.GREY, borders: allGrey }),
              cell('', 3280, { fill: i%2===0 ? C.WHITE : C.GREY, borders: allGrey }),
              cell('', 3280, { fill: i%2===0 ? C.WHITE : C.GREY, borders: allGrey }),
            ],
          })),
      ],
    })),
    ...empty(2),
  );

  // ── GLO ───────────────────────────────────────────────────────────────────
  children.push(
    h1('Composizione del GLO – Gruppo di Lavoro Operativo per l\'inclusione'),
    p('Art. 15, commi 10 e 11 della L. 104/1992 (come modif. dal D.Lgs 96/2019)', { size: 19, italic: true, color: C.DARKGREY }),
    ...emptyK(1), gloTable(), ...empty(2),
  );

  // ── SEZ. 1 ───────────────────────────────────────────────────────────────
  children.push(
    h1('Sezione 1 – Quadro Informativo'),
    p('A cura dei genitori o esercenti la responsabilità genitoriale ovvero di altri componenti del GLO', { size: 19, italic: true, color: C.DARKGREY }),
    ...empty(1),
    h2('a) Situazione familiare e contesto', C.BLUE),
    ...lines(d.sez1a), ...empty(1),
    ...(grado === 'sec2' ? [
      p([txt('Elementi desunti dalla descrizione di sé dello Studente o della Studentessa, attraverso interviste o colloqui: ', {}), txt('_'.repeat(60), {})]),
      ...empty(1),
    ] : []),
    h2('b) Profilo Biografico, Punti di Forza e Personalità', C.BLUE),
    ...lines(d.sez1b), ...empty(1),
  );

  // ── SEZ. 2 ───────────────────────────────────────────────────────────────
  children.push(
    h1('Sezione 2 – Dimensioni da definire nel PEI'),
    p('In base alle indicazioni del Profilo di Funzionamento, le dimensioni rispetto alle quali è necessario definire nel PEI specifici interventi:', { size: 19, italic: true, color: C.DARKGREY }),
    ...emptyK(1),
    dimTable(d.sez2Raw),
    ...empty(1),
  );

  // ── SEZ. 3 ───────────────────────────────────────────────────────────────
  children.push(
    h1('Sezione 3 – Raccordo con il Progetto di Vita (D.Lgs. 62/2024)'),
    ...lines(d.sez3), ...empty(1),
  );

  // ── SEZ. 4 ───────────────────────────────────────────────────────────────
  children.push(h1(`Sezione 4 – Osservazioni sul/sulla ${term.soggetto} per progettare gli interventi`));
  const dim4 = [
    { label: 'a) Dimensione della Relazione, Interazione e Socializzazione', key: 'sez4a' },
    { label: 'b) Dimensione della Comunicazione e del Linguaggio',           key: 'sez4b' },
    { label: 'c) Dimensione dell\'Autonomia e dell\'Orientamento',           key: 'sez4c' },
    { label: 'd) Dimensione Cognitiva, Neuropsicologica e dell\'Apprendimento', key: 'sez4d' },
  ];
  for (const dim of dim4) {
    children.push(h2(dim.label, C.BLUE), ...lines(d[dim.key]), ...empty(1));
  }

  // ── SEZ. 5 ───────────────────────────────────────────────────────────────
  children.push(
    h1('Sezione 5 – Obiettivi educativi e didattici'),
    ...objectivesBlock(d.sez5Raw), ...empty(1),
  );

  // ── SEZ. 6 ───────────────────────────────────────────────────────────────
  children.push(
    h1('Sezione 6 – Osservazioni sul contesto: barriere e facilitatori'),
    p('F++ facilitatore importante · F+ non sufficiente · B- barriera media · B+ elevata · B++ necessario ma assente', { size: 18, italic: true, color: C.DARKGREY }),
    ...empty(1),
    h2('Ambito 1 – Ambiente fisico, prodotti e tecnologie (e1, e2)', C.BLUE), ...lines(d.sez6a1), ...empty(1),
    h2('Ambito 2 – Relazioni e supporti sociali (e3)', C.BLUE),               ...lines(d.sez6a2), ...empty(1),
    h2('Ambito 3 – Atteggiamenti (e4)', C.BLUE),                              ...lines(d.sez6a3), ...empty(1),
  );

  // ── SEZ. 7 ───────────────────────────────────────────────────────────────
  children.push(
    h1('Sezione 7 – Interventi sul contesto per un ambiente di apprendimento inclusivo'),
    ...sez7Block(d.sez7cat1, d.sez7cat2, d.sez7cat3, d.sez7Raw),
  );

  // ── SEZ. 8 (differenziata per grado) ─────────────────────────────────────
  // Nota metodologica per il Consiglio di classe / team: nel modello ministeriale non ha una sezione propria, quindi
  // viene inserita nella 8.1 come testo continuo, senza titolo
  const notaMetod = lines(d.notaMetodologica);
  const notaIn81 = notaMetod.length ? [p(''), ...notaMetod] : [];

  children.push(h1('Sezione 8 – Interventi sul percorso ' + (grado === 'infanzia' ? 'educativo' : 'curricolare')));

  if (grado === 'infanzia') {
    children.push(
      h2(sez8.titolo81),
      ...lines(std81),
      ...notaIn81,
      ...emptyK(1),
      ...disciplineTable(d.sez8Raw, grado),
      ...empty(1),
      p(sez8.noteValutazione, { size: 19, italic: true, color: C.DARKGREY }),
      ...empty(2),
    );
  } else {
    // 8.1 — testo standard + eventuale aggiunta specifica studente (marker SPEC81:)
    const spec81 = parseMarker(d.sez8Raw, 'SPEC81');
    children.push(
      h2(sez8.titolo81),
      ...lines(std81),
      ...(spec81 ? [p(''), ...lines(spec81)] : []),
      ...notaIn81,
      ...empty(1),
    );

    // 8.2 — narrowing: cerca discipline SOLO tra "8.2" e "8.3" per evitare falsi positivi
    if (sez8.haProgettazioneDisciplinare) {
      const sez82text = extractSection(d.sez8Raw, '8.2', '8.3') || d.sez8Raw;
      children.push(
        h2('8.2 – Progettazione disciplinare'),
        p(sez8.note82 || '', { size: 18, italic: true, color: C.DARKGREY }),
        ...emptyK(1),
        ...disciplineTable(sez82text, grado),
        ...empty(1),
      );
      // I programmi ministeriali di riferimento per i Licei (pei-programmi.js) sono basati
      // sulla bozza delle nuove Indicazioni Nazionali (MIM 22/04/2026), non ancora adottata
      // in via definitiva — segnalarlo in ogni PEI liceale generato, non solo nel codice.
      if (grado === 'sec2' && (d.istituto || '').startsWith('Liceo')) {
        // Licei: Indicazioni nazionali vigenti (D.M. 211/2010) dove già curate; per gli altri licei ancora la bozza 2026
        const vigenti = LICEI_2010_MIGRATI.has(d.istituto);
        children.push(
          p(vigenti
            ? riferimentoLiceo(d.istituto).nota
            : 'Nota: i programmi ministeriali di riferimento per questo indirizzo liceale sono basati sulla bozza delle nuove Indicazioni Nazionali per i Licei (MIM, 22/04/2026), non ancora adottata in via definitiva — verificare eventuali aggiornamenti al momento della revisione del PEI.',
          { size: 17, italic: true, color: C.DARKGREY }),
          ...empty(1),
        );
      }
      // Istituti Tecnici: indica il quadro orario di riferimento (due ordinamenti in parallelo dal 2026/27)
      if (grado === 'sec2' && (d.istituto || '').startsWith('IT')) {
        const nuovo = getOrdinamentoSec2(d.istituto, d.eta) === 'nuovo';
        children.push(
          p(nuovo
            ? "Nota: elenco delle discipline secondo il nuovo ordinamento degli istituti tecnici (D.M. 29/2026, allegati B e C), in vigore dal 2026/27 per le classi prime e via via per le successive."
            : "Nota: elenco delle discipline secondo il quadro orario vigente per questa classe (DPR 88/2010); il nuovo ordinamento (D.M. 29/2026) si applica dal 2026/27 alle sole classi prime.",
          { size: 17, italic: true, color: C.DARKGREY }),
          ...empty(1),
        );
      }
      // Discipline opzionali/alternative del triennio: professionali (soglia minima 0 ore, scelte dall'istituto)
      // e tecnici (discipline specifiche delle articolazioni): l'elenco le include tutte.
      const opzionali = grado === 'sec2' ? getOpzionaliSec2(d.istituto, d.eta) : [];
      if (opzionali.length) {
        const ist = d.istituto || '';
        const motivo = ist.startsWith('IT')
          ? "sono specifiche delle articolazioni dell'indirizzo (alternative tra loro)"
          : ist === 'Liceo Artistico'
            ? "sono specifiche dei diversi indirizzi del liceo artistico (Arti figurative, Architettura e ambiente, Design, Audiovisivo e multimediale, Grafica, Scenografia), alternative tra loro"
            : ist === 'Liceo Musicale e Coreutico'
              ? "sono specifiche della sezione musicale o della sezione coreutica (alternative tra loro)"
              : "sono insegnamenti opzionali o alternativi, attivati secondo la caratterizzazione dell'istituto (art. 3 c. 5 D.Lgs. 61/2017)";
        children.push(
          p(`Nota: le seguenti discipline ${motivo}: ${opzionali.join('; ')}. Eliminare le righe relative alle discipline non attivate o non pertinenti all'indirizzo, all'articolazione o alla sezione frequentati.`, { size: 17, italic: true, color: C.DARKGREY }),
          ...empty(1),
        );
      }
      if (grado === 'sec2' && sez8.percorsoDifferenziato) {
        children.push(p(riepilogoPercorso(sez82text), { size: 20, bold: true }), ...empty(1));
      }
    }

    // 8.3 FSL — solo sec2, solo classi III/IV/V (Linee Guida PEI, Decreto Interm. 153/2023)
    if (sez8.haFSL && annoCorsoSec2(d.eta) >= 3) {
      children.push(
        h2('8.3 – FSL – Formazione Scuola-Lavoro'),
        p('Obbligatoria dalle classi III, IV e V (D.Lgs. 66/2017 art.7 c.2 lett.e; L. 145/2018 art.1 cc.784-787; Decreto Interm. n.153/2023 art.11; percorso rinominato FSL dalla L. 213/2023)', { size: 19, italic: true, color: C.DARKGREY }),
        ...emptyK(1),
        twoCol([
          ['Tipologia percorso',       extractPctoField(d.sez8Raw, 'Tipologia') || '□ A – Aziendale  □ B – Scolastico  □ C – Altra tipologia'],
          ['Ente / Azienda ospitante', extractPctoField(d.sez8Raw, 'Ente') || ''],
          ['Tutor scolastico (interno)', extractPctoField(d.sez8Raw, 'Tutor.*interno') || ''],
          ['Tutor aziendale (esterno)', extractPctoField(d.sez8Raw, 'Tutor.*esterno') || ''],
          ['Durata e organizzazione temporale', extractPctoField(d.sez8Raw, 'Durata') || ''],
          ['Obiettivi di competenza',  extractPctoField(d.sez8Raw, 'Obiettivi') || ''],
          ['Barriere e facilitatori',  extractPctoField(d.sez8Raw, 'Barriere') || ''],
          ['Monitoraggio e valutazione', extractPctoField(d.sez8Raw, 'Monitoraggio') || ''],
          ['Osservazioni dello/a studente/essa', extractPctoField(d.sez8Raw, 'Osservazioni') || ''],
        ], 2800, 6560),
        ...empty(1),
      );
    }

    // 8.4 Valutazione comportamento
    if (sez8.haValutazioneComportamento) {
      // Marker CRIT84: [A – ... oppure B – criteri personalizzati: ...]
      const crit84raw = parseMarker(d.sez8Raw, 'CRIT84');
      const comportamento = crit84raw ||
        extractSection(d.sez8Raw, '8.4', 'Certificazione') ||
        extractSection(d.sez8Raw, '8.4', 'Nota Metodologica') ||
        extractSection(d.sez8Raw, '8.4', '') ||
        '□ A – valutato in base agli stessi criteri adottati per la classe\n□ B – valutato in base ai seguenti criteri personalizzati: ___';
      children.push(
        h2('8.4 – Criteri di valutazione del comportamento ed eventuali obiettivi specifici'),
        twoCol([['Comportamento', comportamento]], 2800, 6560),
        ...empty(1),
      );
    }

    // Nota valutazione
    children.push(
      p(sez8.noteValutazione || '', { size: 19, italic: true, color: C.DARKGREY }),
      ...empty(1),
    );

    // Certificazione competenze
    if (sez8.certCompetenze) {
      children.push(
        h2('Certificazione delle Competenze'),
        p(sez8.certCompetenze, { size: 19, italic: true, color: C.DARKGREY }),
        ...empty(2),
      );
    }
  }

  // ── SEZ. 9 ───────────────────────────────────────────────────────────────
  children.push(
    h1('Sezione 9 – Organizzazione generale del progetto di inclusione e utilizzo delle risorse'),
    h2('Tabella orario settimanale'),
    p('Pres. = presente a scuola · Sost. = insegnante di sostegno presente · Ass. = assistente presente', { size: 18, italic: true, color: C.DARKGREY }),
    ...emptyK(1), oraryCols(), ...empty(1),
    twoCol([
      [`Il/la ${term.soggetto} frequenta con orario ridotto?`,
        '□ Sì: ___ ore settimanali, nel periodo ___, per le seguenti motivazioni: ___\n□ No, frequenta regolarmente tutte le ore previste'],
      [`Il/la ${term.soggetto} è sempre nel gruppo ${term.sezione}?`,
        '□ Sì\n□ No: svolge ___ ore in altri spazi per le seguenti attività: ___'],
      ['Insegnante per le attività di sostegno', 'Numero di ore settimanali: ___'],
      ['Assistenza igienica e di base', 'Descrizione del servizio svolto dai collaboratori scolastici: ___'],
      ['Assistenza autonomia e/o comunicazione', 'Tipologia: ___\nFigura professionale: ___\nOre settimanali: ___'],
      ['Altre risorse professionali', '□ Docenti specializzati  □ Organico autonomia  □ Altro'],
      ['Uscite didattiche e visite guidate', 'Interventi previsti: ___'],
      ['Strategie per comportamenti problematici', ''],
      ['Attività o progetti per l\'inclusione', ''],
      ['Trasporto scolastico', ''],
    ], 3200, 6160),
    ...empty(1),
    h2('Interventi e attività extrascolastiche attive'),
    keepTogether(() => new Table({
      width: { size: FULL, type: WidthType.DXA },
      columnWidths: [2200, 800, 1800, 2860, 1700],
      rows: [
        new TableRow({ children: ['Attività','N° ore','Struttura','Obiettivi e raccordi con il PEI','Note'].map((h,i) => hCell(h, [2200,800,1800,2860,1700][i], C.MIDBLUE)) }),
        new TableRow({ children: [
          cell([p('Attività terapeutico-riabilitative', { size:19, bold:true })], 2200, { fill:C.LIGHTBLUE, borders:allGrey }),
          ...['','','',''].map((v,i) => cell(v, [800,1800,2860,1700][i], { borders:allGrey })),
        ]}),
        new TableRow({ children: [
          cell([p('Attività extrascolastiche (ludiche, motorie, artistiche…)', { size:19, bold:true })], 2200, { fill:C.LIGHTBLUE, borders:allGrey }),
          ...['','','',''].map((v,i) => cell(v, [800,1800,2860,1700][i], { fill:C.GREY, borders:allGrey })),
        ]}),
      ],
    })),
    ...empty(2),
  );

  // ── VERIFICA FINALE + FABBISOGNO ─────────────────────────────────────────
  children.push(
    h1('Verifica finale del PEI e proposte per l\'a.s. successivo'),
    h2('Valutazione globale dei risultati raggiunti'),
    p('Da compilare a fine anno scolastico a cura del GLO.', { size: 20, italic: true, color: C.DARKGREY }),
    ...emptyK(1),
    twoCol([
      ['Proposta ore di sostegno per l\'a.s. successivo',
        'Ore richieste: ___\nMotivazione: ___'],
      ['Fabbisogno assistenza igienica e di base',
        '□ igienica  □ spostamenti  □ mensa  □ altro'],
      ['Fabbisogno assistenza autonomia/comunicazione',
        'Tipologia: ___\nFigura professionale: ___\nOre: ___'],
      ['Aggiornamento condizioni di contesto [Sez. 5-6-7]',
        'Strategie efficaci da riproporre:\nCriticità da affrontare:'],
      [`Esigenze trasporto del/della ${term.soggetto}`, ''],
    ], 3200, 6160),
    ...empty(2),
  );

  // ── FIRME GLO ────────────────────────────────────────────────────────────
  children.push(
    h1('Approvazione finale – Firme del GLO'),
    p(`La verifica finale con proposta di fabbisogno per l'a.s. successivo è stata approvata dal GLO in data ___ come risulta da verbale n. ___ allegato`, { size: 20, italic: true }),
    ...emptyK(1), gloTable(), ...empty(2),
    new Paragraph({
      children: [
        txt('Documento redatto con supporto AI sulla base del profilo ICF osservativo – ', { size: 18, italic: true, color: C.DARKGREY }),
        txt('Da revisionare e sottoscrivere a cura del GLO', { size: 18, italic: true, bold: true, color: C.MIDBLUE }),
      ],
      alignment: AlignmentType.CENTER, spacing: { before: 120, after: 60 },
    }),
  );

  // ── DOCUMENT ─────────────────────────────────────────────────────────────
  return new Document({
    styles: { default: { document: { run: { font: 'Calibri', size: 22 } } } },
    sections: [{
      properties: {
        page: {
          size: { width: 11906, height: 16838 },
          margin: { top: 1020, right: 1020, bottom: 1020, left: 1020 },
        },
      },
      // Nessuna intestazione/piè di pagina "brandizzati": il modello ministeriale non ne ha —
      // solo un numero di pagina in basso, senza etichette né bordi.
      footers: {
        default: new Footer({
          children: [new Paragraph({
            children: [new TextRun({ children: [PageNumber.CURRENT], font: 'Calibri', size: 20, color: C.BLACK })],
            alignment: AlignmentType.RIGHT, spacing: { before: 0 },
          })],
        }),
      },
      children,
    }],
  });
}

// ── Utility di parsing ────────────────────────────────────────────────────────
function extractSection(text, from, to) {
  if (!text) return '';
  const esc = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const rx = new RegExp(`(?:${esc(from)}[^\n]*\n)([\s\S]*?)(?=${to ? esc(to) : '$'})`, 'i');
  const m = text.match(rx);
  return m ? m[1].trim() : '';
}

function extractPctoField(text, field) {
  if (!text) return '';
  // Formato pipe: | Campo | valore |
  const rx1 = new RegExp(`\\|\\s*${field}[^|]*\\|\\s*([^|\n]+)`, 'i');
  const m1  = text.match(rx1);
  if (m1) return m1[1].trim();
  // Formato **Campo:** valore
  const rx2 = new RegExp(`\\*{1,2}\\s*${field}[^:*]*:\\*{0,2}\\s*([^\n|]+)`, 'i');
  const m2  = text.match(rx2);
  return m2 ? m2[1].trim() : '';
}

export { buildDocx, normalizzaSoggetto };
