import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { subject, prompt } = await req.json();

    if (!subject || !prompt) {
      return new Response(
        JSON.stringify({ error: "Subject and prompt are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const today = new Date();
    const todayStr = today.toISOString().split("T")[0];

    const systemPrompt = `Você é um assistente especializado em criar planejamentos de estudo personalizados e detalhados.

TAREFA: Crie um cronograma de estudos baseado nas informações do usuário, DISTRIBUINDO as tarefas ao longo do período especificado.

MATÉRIA/CURSO: ${subject}

INFORMAÇÕES DO USUÁRIO:
${prompt}

DATA DE INÍCIO: ${todayStr}

INSTRUÇÕES:
1. Analise o tempo disponível, objetivos e nível do usuário
2. Divida o conteúdo em tarefas específicas e realizáveis
3. Crie entre 7-20 tarefas (dependendo do prazo)
4. DISTRIBUA as tarefas ao longo dos dias/semanas especificados pelo usuário
5. Cada tarefa deve ter uma data específica no formato YYYY-MM-DD
6. Se o usuário mencionar "30 dias", distribua as tarefas ao longo de 30 dias a partir de hoje
7. Se mencionar "1 semana", distribua ao longo de 7 dias
8. Se mencionar "5 meses", distribua ao longo dos meses
9. Ordene as tarefas de forma lógica e progressiva
10. Inclua tempo estimado para cada tarefa

IMPORTANTE: Responda APENAS com um array JSON válido, sem texto adicional, markdown ou explicações.

FORMATO OBRIGATÓRIO:
[
  {"text": "Descrição clara da tarefa 1 (tempo estimado)", "priority": "high", "date": "YYYY-MM-DD"},
  {"text": "Descrição clara da tarefa 2 (tempo estimado)", "priority": "medium", "date": "YYYY-MM-DD"}
]

Prioridades válidas: "high", "medium", "low"
Datas: Use datas reais a partir de ${todayStr}, distribuídas conforme o prazo do usuário.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Por favor, crie um planejamento de estudos detalhado para: ${subject}. ${prompt}` }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Limite de requisições atingido. Tente novamente em alguns segundos." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Créditos insuficientes. Adicione mais créditos na sua conta." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("Erro ao conectar com a IA");
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content || "";

    // Parse JSON from AI response
    let tasks;
    try {
      // Remove markdown code blocks if present
      let jsonText = aiResponse.trim();
      jsonText = jsonText.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      
      tasks = JSON.parse(jsonText);
      
      if (!Array.isArray(tasks)) {
        throw new Error("Response is not an array");
      }
    } catch (parseError) {
      console.error("Failed to parse AI response:", aiResponse);
      throw new Error("Falha ao processar resposta da IA");
    }

    return new Response(
      JSON.stringify({ tasks }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("generate-plan error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Erro desconhecido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
