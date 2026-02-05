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
    const { subject, topic, prompt, fileContent } = await req.json();

    if (!subject || !prompt) {
      return new Response(
        JSON.stringify({ error: "Subject and prompt are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Limit file content to prevent token overflow (max ~50KB of text)
    const MAX_FILE_CHARS = 50000;
    let processedFileContent = fileContent || "";
    
    if (processedFileContent.length > MAX_FILE_CHARS) {
      console.log(`File content truncated from ${processedFileContent.length} to ${MAX_FILE_CHARS} chars`);
      processedFileContent = processedFileContent.substring(0, MAX_FILE_CHARS) + "\n\n[... conteúdo truncado por ser muito extenso ...]";
    }
    
    // Check if file content is binary/unreadable (PDF raw data)
    const binaryPattern = /[\x00-\x08\x0E-\x1F\x7F-\x9F]/;
    if (processedFileContent && binaryPattern.test(processedFileContent.substring(0, 1000))) {
      return new Response(
        JSON.stringify({ 
          error: "O arquivo parece ser um PDF ou binário. Por favor, use arquivos de texto (.txt, .md, .csv) ou copie o conteúdo diretamente no campo de prompt." 
        }),
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
    if (processedFileContent && processedFileContent.trim().length > 0) {
      fileContextSection = `
CONTEÚDO DO ARQUIVO ANEXADO:
"""
${processedFileContent}
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

    const topicInfo = topic ? `\nASSUNTO/TÓPICO: ${topic}` : "";
    
    const systemPrompt = `Você é um assistente especializado em criar planejamentos de estudo personalizados e detalhados.

TAREFA: Crie um cronograma de estudos baseado nas informações do usuário.

MATÉRIA/CURSO: ${subject}${topicInfo}

INFORMAÇÕES DO USUÁRIO:
${prompt}
${fileContextSection}

DATA DE INÍCIO (HOJE): ${todayStr}

INSTRUÇÕES CRÍTICAS PARA DISTRIBUIÇÃO DE DATAS:

1. **SE O USUÁRIO ESPECIFICOU QUANTIDADE DE DIAS**: Siga exatamente o que ele pediu.

2. **SE O USUÁRIO NÃO ESPECIFICOU DIAS**: Analise o conteúdo e determine automaticamente:
   - Para tópicos simples (1-2 conceitos): 3-5 dias de estudo
   - Para tópicos médios (3-5 conceitos): 7-14 dias de estudo
   - Para tópicos complexos (6+ conceitos ou matéria completa): 14-30 dias de estudo
   - Para preparação de provas/concursos: distribua proporcionalmente até a data da prova
   - Considere 1-2 horas de estudo por dia como padrão

3. **REGRAS OBRIGATÓRIAS DE DISTRIBUIÇÃO**:
   - SEMPRE use dias CONSECUTIVOS (dia após dia, sem pular)
   - Se pedir "7 dias": dias 1, 2, 3, 4, 5, 6, 7 (NUNCA 1, 3, 5, 7)
   - Se pedir "intensivo": pode colocar 2-3 tarefas por dia
   - Se pedir "espaçado" ou "revisão": pode alternar dias
   - Por padrão, coloque UMA tarefa por dia em dias consecutivos

4. **EXEMPLO DE DATAS CORRETAS** (para 7 dias a partir de ${todayStr}):
${exampleDates.slice(0, 7).map((d, i) => `   Dia ${i + 1}: ${d}`).join("\n")}

5. **ESTRUTURA DAS TAREFAS**:
   - Crie entre 5-25 tarefas dependendo da complexidade
   - Cada tarefa deve ter tempo estimado (ex: "30min", "1h", "2h")
   - Ordene de forma lógica e progressiva (básico → avançado)
   - Inclua revisões periódicas a cada 5-7 dias de conteúdo novo

Responda APENAS com um array JSON válido, sem texto adicional, markdown ou explicações.

FORMATO OBRIGATÓRIO:
[
  {"text": "📚 Título curto da tarefa", "description": "Descrição detalhada do que estudar (tempo estimado: Xh)", "priority": "high", "date": "YYYY-MM-DD", "category": "${subject}", "subject": "${topic || "Geral"}"},
  {"text": "📝 Título curto", "description": "Descrição do conteúdo a estudar (tempo estimado: Xmin)", "priority": "medium", "date": "YYYY-MM-DD", "category": "${subject}", "subject": "${topic || "Geral"}"}
]

CAMPOS OBRIGATÓRIOS:
- "text": Título curto da tarefa com emoji (máx 50 caracteres)
- "description": Descrição detalhada do que será estudado com tempo estimado
- "category": Sempre "${subject}"
- "subject": Sempre "${topic || "Geral"}"
- "priority": "high" para fundamentos importantes, "medium" para prática, "low" para revisões
- "date": Data no formato YYYY-MM-DD (OBRIGATORIAMENTE em dias consecutivos!)

Use emojis variados no início do texto: 📚 📝 🧪 📖 💡 🎯 ✍️ 🔬 📊 🧠 🎓 ✨`;

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