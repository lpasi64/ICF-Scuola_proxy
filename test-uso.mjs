// test-uso.mjs — log dei consumi (token, caratteri voce) e riepilogo dei costi: nei log solo numeri, mai testi
import assert from 'node:assert';
import fs from 'node:fs';
import { rigaUso, leggiRigaUso, stimaCostoUsd, riepilogaLog, formattaRiepilogo, usoChat, usoClaude } from './uso.js';

let passed = 0, failed = false;
function test(name, fn) { try { fn(); passed++; console.log(`  ok  - ${name}`); } catch (e) { failed = true; console.error(`FAIL  - ${name}\n        ${e.message}`); } }
console.log('log dei consumi — test\n');

test('rigaUso: riga a campi chiave=valore con prefisso [USO], leggibile di nuovo identica', () => {
  const r = rigaUso('chat', { modello: 'deepseek-flash', turni: 12, in: 13500, out: 210, cache: 9000 });
  assert.strictEqual(r, '[USO] chat modello=deepseek-flash turni=12 in=13500 out=210 cache=9000');
  assert.deepStrictEqual(leggiRigaUso('2026-10-11T10:00:00Z ' + r), { tipo: 'chat', modello: 'deepseek-flash', turni: 12, in: 13500, out: 210, cache: 9000 });
  assert.strictEqual(leggiRigaUso('[TTS] ok 120 caratteri'), null);
});

test('usoChat: legge i token dalla risposta OpenAI-compatibile (DeepSeek/GLM) e tollera i campi assenti', () => {
  const u = usoChat({ usage: { prompt_tokens: 100, completion_tokens: 20, prompt_cache_hit_tokens: 60 } });
  assert.deepStrictEqual(u, { in: 100, out: 20, cache: 60 });
  assert.deepStrictEqual(usoChat({}), { in: 0, out: 0, cache: 0 });
  assert.deepStrictEqual(usoChat(null), { in: 0, out: 0, cache: 0 });
});

test('usoClaude: somma i token delle quattro chiamate del PEI', () => {
  const u = usoClaude([{ usage: { input_tokens: 1000, output_tokens: 3000 } }, { usage: { input_tokens: 500, output_tokens: 4000 } }, {}, null]);
  assert.deepStrictEqual(u, { chiamate: 4, in: 1500, out: 7000 });
});

test('stimaCostoUsd: prezzi per milione di token e di caratteri; la voce in cache non costa', () => {
  assert.ok(Math.abs(stimaCostoUsd({ tipo: 'chat', modello: 'deepseek-flash', in: 1e6, out: 1e6 }) - 0.75) < 1e-9);
  assert.ok(Math.abs(stimaCostoUsd({ tipo: 'pei', modello: 'claude-sonnet-5', in: 1e6, out: 1e6 }) - 12) < 1e-9);
  assert.ok(Math.abs(stimaCostoUsd({ tipo: 'tts', caratteri: 1e6, cache: 'no' }) - 16) < 1e-9);
  assert.strictEqual(stimaCostoUsd({ tipo: 'tts', caratteri: 5000, cache: 'si' }), 0);
  assert.strictEqual(stimaCostoUsd({ tipo: 'chat', modello: 'modello-sconosciuto', in: 1000, out: 1000 }), 0);
});

const LOG = [
  '2026-10-11T10:00:01Z [USO] chat modello=deepseek-flash turni=1 in=10000 out=200 cache=0',
  '2026-10-11T10:00:09Z [USO] chat modello=deepseek-flash turni=2 in=10500 out=250 cache=9000',
  '2026-10-11T10:00:20Z [USO] tts caratteri=400 cache=no',
  '2026-10-11T10:00:25Z [USO] tts caratteri=400 cache=si',
  '2026-10-11T10:05:00Z [USO] pei modello=claude-sonnet-5 chiamate=4 in=30000 out=15000',
  '2026-10-11T10:05:01Z [PEI] ✅ Generato PEI (91234 bytes)',
  'riga qualunque',
].join('\n');

test('riepilogaLog: totali per tipo, voce fatturata solo se non in cache, costo medio per PEI generato', () => {
  const r = riepilogaLog(LOG);
  assert.strictEqual(r.chat.chiamate, 2);
  assert.strictEqual(r.chat.in, 20500);
  assert.strictEqual(r.chat.out, 450);
  assert.strictEqual(r.pei.generazioni, 1);
  assert.strictEqual(r.tts.richieste, 2);
  assert.strictEqual(r.tts.caratteriFatturati, 400);
  assert.strictEqual(r.tts.caratteriInCache, 400);
  const chat = (20500 * 0.15 + 450 * 0.60) / 1e6, pei = (30000 * 2 + 15000 * 10) / 1e6, tts = 400 * 16 / 1e6;
  assert.ok(Math.abs(r.totaleUsd - (chat + pei + tts)) < 1e-9);
  assert.ok(Math.abs(r.perPeiUsd - (chat + pei + tts)) < 1e-9, 'con un solo PEI il costo per PEI è il totale');
});

test('riepilogaLog: senza PEI generati non divide per zero; log vuoto ammesso', () => {
  assert.strictEqual(riepilogaLog('').perPeiUsd, null);
  assert.strictEqual(riepilogaLog('[USO] chat modello=deepseek-flash turni=1 in=10 out=1 cache=0').perPeiUsd, null);
});

test('formattaRiepilogo: testo leggibile in italiano con i totali e l\'avvertenza sulla stima', () => {
  const t = formattaRiepilogo(riepilogaLog(LOG));
  assert.ok(/PEI generati: 1/.test(t) && /Colloquio/.test(t) && /Voce/.test(t) && /per PEI/.test(t), t);
  assert.ok(/stima/i.test(t), t);
});

test('server: ogni chiamata a pagamento scrive una riga [USO] fatta solo di numeri (chat, PEI, voce), senza testi', () => {
  const s = fs.readFileSync('server.js', 'utf8');
  assert.ok(/import \{[^}]*rigaUso[^}]*\} from ['"]\.\/uso\.js['"]/.test(s), 'import di uso.js mancante');
  assert.ok(/rigaUso\('chat'/.test(s), 'log chat mancante');
  assert.ok(/rigaUso\('pei'/.test(s), 'log PEI mancante');
  assert.ok(/rigaUso\('tts'/.test(s), 'log voce mancante');
  for (const m of s.matchAll(/rigaUso\('[a-z]+',\s*\{([^}]*)\}/g)) {
    assert.ok(!/\btext\b|\bmessages\b(?!\.length)|\bnome\b|content/i.test(m[1]), 'campi non numerici nel log: ' + m[1]);
  }
});

console.log(`\n${passed} test superati${failed ? ', ALCUNI FALLITI' : ''}.`);
if (failed) process.exitCode = 1;
