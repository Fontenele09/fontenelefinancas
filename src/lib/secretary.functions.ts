import { createServerFn } from "@tanstack/react-start";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface ChatInput {
  messages: ChatMessage[];
  context: string;
}

export const askAria = createServerFn({ method: "POST" })
  .inputValidator((input: ChatInput) => input)
  .handler(async ({ data }) => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("LOVABLE_API_KEY não configurada");

    const systemPrompt = `Você é Aria, a secretária pessoal de luxo do usuário (Fontenele). Fale em português brasileiro, com tom sofisticado, caloroso, eficiente e bem direto — como uma chief of staff de alto padrão. Use formatação markdown (negrito, listas) quando ajudar a leitura. Seja concisa por padrão; só se aprofunde quando pedirem.

Você tem acesso ao snapshot atual da vida do usuário (finanças, contas recorrentes, metas, orçamentos e checklist/rotina). Use esses dados para:
- Resumir a situação financeira (saldo, receitas/despesas do mês, contas a pagar)
- Lembrar das contas recorrentes ainda não pagas no mês
- Comentar sobre o progresso do checklist do dia / mês
- Dar conselhos práticos sobre orçamento, hábitos e prioridades

Se algum dado estiver vazio, sugira gentilmente o que o usuário pode cadastrar para você ajudar melhor.

=== SNAPSHOT ATUAL ===
${data.context}
=== FIM DO SNAPSHOT ===`;

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          ...data.messages,
        ],
      }),
    });

    if (!res.ok) {
      if (res.status === 429) throw new Error("Muitas requisições. Aguarde um momento.");
      if (res.status === 402) throw new Error("Créditos da IA esgotados. Adicione créditos em Settings → Workspace → Usage.");
      const t = await res.text();
      console.error("AI gateway error:", res.status, t);
      throw new Error("Erro ao falar com a Aria");
    }

    const json = await res.json();
    const reply = json.choices?.[0]?.message?.content ?? "";
    return { reply };
  });
