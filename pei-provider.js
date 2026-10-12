// pei-provider.js — il modello che scrive le quattro parti del PEI: Claude (predefinito) oppure Mistral, scelto da PEI_PROVIDER.
// Entrambi espongono la stessa interfaccia: genera({ system, prompt, maxTokens }) → { text, usage, troncato }.
// Nei messaggi d'errore non finiscono mai i testi inviati (contengono i dati dell'alunno).

const MISTRAL_URL = "https://api.mistral.ai/v1/chat/completions";

// Mistral solo se richiesto e se la chiave c'è: in ogni altro caso si resta su Claude
export function scegliProvider(env) {
  const richiesto = String((env && env.PEI_PROVIDER) || "").trim().toLowerCase();
  return richiesto === "mistral" && env.MISTRAL_API_KEY ? "mistral" : "claude";
}

// Il contenuto può essere una stringa oppure una lista di blocchi (ragionamento + testo): si tiene solo il testo
function testoMistral(content) {
  if (typeof content === "string") return content;
  if (!Array.isArray(content)) return "";
  return content.filter(b => b && b.type === "text" && typeof b.text === "string").map(b => b.text).join("");
}

export function creaGeneratore({ provider, anthropicClient, claudeModel, thinking, mistralApiKey, mistralModel, reasoning, fetchImpl }) {
  if (provider === "mistral") {
    return {
      provider,
      modello: mistralModel,
      async genera({ system, prompt, maxTokens }) {
        const body = { model: mistralModel, messages: [{ role: "system", content: system }, { role: "user", content: prompt }], max_tokens: maxTokens };
        if (reasoning) body.reasoning_effort = reasoning;
        const r = await (fetchImpl || fetch)(MISTRAL_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${mistralApiKey}` },
          body: JSON.stringify(body),
        });
        if (!r.ok) throw new Error(`Mistral HTTP ${r.status}`);
        const data = await r.json();
        const scelta = (data.choices && data.choices[0]) || {};
        const u = data.usage || {};
        return {
          text: testoMistral(scelta.message && scelta.message.content),
          usage: { input_tokens: Number(u.prompt_tokens) || 0, output_tokens: Number(u.completion_tokens) || 0, thinking_tokens: 0 },
          troncato: scelta.finish_reason === "length",
        };
      },
    };
  }
  return {
    provider: "claude",
    modello: claudeModel,
    async genera({ system, prompt, maxTokens }) {
      // Sonnet 5 ragiona di propria iniziativa se il campo thinking manca, e i token di ragionamento si pagano come output:
      // con thinking = "disabled" si spegne; qualunque altro valore lascia il comportamento predefinito
      const richiesta = { model: claudeModel, max_tokens: maxTokens, system, messages: [{ role: "user", content: prompt }] };
      if (thinking === "disabled") richiesta.thinking = { type: "disabled" };
      const m = await anthropicClient.messages.create(richiesta);
      return {
        text: m.content.filter(b => b.type === "text").map(b => b.text).join("\n"),
        usage: {
          input_tokens: Number(m.usage && m.usage.input_tokens) || 0,
          output_tokens: Number(m.usage && m.usage.output_tokens) || 0,
          thinking_tokens: Number(m.usage && m.usage.output_tokens_details && m.usage.output_tokens_details.thinking_tokens) || 0,
        },
        troncato: m.stop_reason === "max_tokens",
      };
    },
  };
}
