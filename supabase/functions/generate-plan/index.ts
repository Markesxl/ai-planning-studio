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
    const { subject, prompt, fileContent } = await req.json();

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

    // Calculate example dates for better distribution
    const exampleDates: string[] = [];
    for (let i = 0; i < 30; i += 3) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);
      exampleDates.push(date.toISOString().split("T")[0]);
    }

    let fileContextSection = "";
    if (fileContent) {
      fileContextSection = `
CONTEÚDO DO ARQUIVO ANEXADO:
"""
${fileContent}
"""

Você DEVE analisar o conteúdo do arquivo acima e criar tarefas de estudo baseadas nele. 
O arquivo pode conter:
- Cronograma de aulas ou provas
- Lista de tópicos ou capítulos
- Ementa de disciplina
- Qualquer conteúdo educacional

Extraia os tópicos principais e distribua-os como tarefas de estudo.
`;
    }

    const systemPrompt = `Você é um assistente especializado em criar planejamentos de estudo personalizados e detalhados.

TAREFA: Crie um cronograma de estudos baseado nas informações do usuário, DISTRIBUINDO as tarefas ao longo do período especificado.

MATÉRIA/CURSO: ${subject}

INFORMAÇÕES DO USUÁRIO:
${prompt}
${fileContextSection}

DATA DE INÍCIO (HOJE): ${todayStr}

INSTRUÇÕES CRÍTICAS PARA DISTRIBUIÇÃO DE DATAS:
1. Analise o tempo disponível, objetivos e nível do usuário
2. Divida o conteúdo em tarefas específicas e realizáveis
3. Crie entre 10-25 tarefas (dependendo do prazo)
4. DISTRIBUA AS TAREFAS AO LONGO DE TODO O PERÍODO:
   - Se "30 dias": distribua de ${todayStr} até +30 dias
   - Se "1 semana": distribua de ${todayStr} até +7 dias
   - Se "5 meses": distribua uniformemente ao longo dos meses
5. NÃO coloque todas as tarefas no mesmo dia ou dias consecutivos
6. Use datas espaçadas: ${exampleDates.slice(0, 5).join(", ")}...
7. Inclua tempo estimado para cada tarefa (ex: "30min", "1h", "2h")
8. Ordene as tarefas de forma lógica e progressiva

REGRA DE OURO: Se o usuário pedir um prazo de X dias, as tarefas DEVEM estar distribuídas ao longo de X dias, não concentradas nos primeiros dias!

Responda APENAS com um array JSON válido, sem texto adicional, markdown ou explicações.

FORMATO OBRIGATÓRIO:
[
  {"text": "📚 Descrição da tarefa 1 (tempo estimado)", "priority": "high", "date": "YYYY-MM-DD"},
  {"text": "📝 Descrição da tarefa 2 (tempo estimado)", "priority": "medium", "date": "YYYY-MM-DD"}
]

Prioridades: "high" para fundamentos, "medium" para prática, "low" para revisões
Use emojis relevantes no início de cada tarefa: 📚 📝 🧪 📖 💡 🎯 ✍️ 🔬`;

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
          { role: "user", content: `Crie um planejamento de estudos detalhado para: ${subject}. ${prompt}${fileContent ? " Baseie-se também no conteúdo do arquivo anexado." : ""}` }
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

    console.log("AI Response:", aiResponse.substring(0, 500));

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

      // Validate and fix dates
      tasks = tasks.map((task: any, index: number) => {
        // If date is missing or invalid, calculate a distributed date
        if (!task.date || !/^\d{4}-\d{2}-\d{2}$/.test(task.date)) {
          const daysToAdd = Math.floor(index * 2); // Spread tasks every 2 days
          const newDate = new Date(today);
          newDate.setDate(newDate.getDate() + daysToAdd);
          task.date = newDate.toISOString().split("T")[0];
        }
        return task;
      });

      console.log("Parsed tasks with dates:", tasks.map((t: any) => ({ text: t.text.substring(0, 30), date: t.date })));
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