import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface AnalysisResult {
  dificuldade_estimada: number;
  horas_totais: number;
  dias_recomendados: number;
  modulos: string[];
  tasks: TaskItem[];
}

interface TaskItem {
  text: string;
  description: string;
  priority: "high" | "medium" | "low";
  date: string;
  category: string;
  subject: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { subject, topic, prompt, fileContent } = await req.json();

    if (!subject) {
      return new Response(
        JSON.stringify({ error: "Subject is required" }),
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
    for (let i = 0; i < 30; i++) {
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
`;
    }

    const topicInfo = topic ? `\nASSUNTO/TÓPICO: ${topic}` : "";
    const userContext = prompt ? `\nCONTEXTO ADICIONAL DO USUÁRIO: ${prompt}` : "";
    
    const systemPrompt = `Você é um especialista em pedagogia e planejamento de estudos com IA avançada.

TAREFA: Analise o conteúdo de estudo e gere um cronograma inteligente.

MATÉRIA/CURSO: ${subject}${topicInfo}
${userContext}
${fileContextSection}

DATA DE INÍCIO (HOJE): ${todayStr}

## FASE 1: ANÁLISE INTERNA (faça antes de gerar tarefas)

1. **CLASSIFICAR COMPLEXIDADE** (1 a 5):
   - 1: Introdutório (ex: "Introdução ao HTML", "Básico de Excel")
   - 2: Básico-Intermediário (ex: "CSS Flexbox", "Fórmulas Excel")
   - 3: Intermediário (ex: "JavaScript ES6", "Python OOP")
   - 4: Avançado (ex: "React Hooks", "Machine Learning Básico")
   - 5: Expert (ex: "Micro-serviços com Go", "Deep Learning", "Kubernetes")

2. **ESTIMAR EXTENSÃO**:
   - Identifique quantos sub-módulos/conceitos são necessários
   - Estime horas totais de estudo (considere 1-2h por sessão)
   - Calcule dias necessários baseado na complexidade

3. **FÓRMULA DE DIAS**:
   - Complexidade 1: 3-5 dias (5-10h total)
   - Complexidade 2: 5-10 dias (10-20h total)
   - Complexidade 3: 10-15 dias (20-30h total)
   - Complexidade 4: 15-25 dias (30-50h total)
   - Complexidade 5: 25-30 dias (50-80h total)

## FASE 2: GERAÇÃO DO CRONOGRAMA

REGRAS OBRIGATÓRIAS:
1. Use SEMPRE dias CONSECUTIVOS (${exampleDates.slice(0, 7).join(", ")}, ...)
2. NUNCA pule dias no cronograma
3. Uma tarefa principal por dia
4. Inclua revisões a cada 5-7 dias
5. Comece pelo básico, avance progressivamente

EXEMPLO DE DATAS CORRETAS para 7 dias:
${exampleDates.slice(0, 7).map((d, i) => `Dia ${i + 1}: ${d}`).join("\n")}

## FORMATO DE RESPOSTA OBRIGATÓRIO

Responda APENAS com um JSON válido, sem texto adicional ou markdown:

{
  "dificuldade_estimada": 3,
  "horas_totais": 25,
  "dias_recomendados": 12,
  "modulos": ["Módulo 1: Fundamentos", "Módulo 2: Prática", "Módulo 3: Avançado"],
  "tasks": [
    {
      "text": "📚 Título curto da tarefa",
      "description": "Descrição detalhada do que estudar (tempo estimado: 1h30min)",
      "priority": "high",
      "date": "${todayStr}",
      "category": "${subject}",
      "subject": "${topic || "Geral"}"
    }
  ]
}

CAMPOS DAS TAREFAS:
- "text": Título curto com emoji (máx 50 chars). Emojis: 📚 📝 🧪 📖 💡 🎯 ✍️ 🔬 📊 🧠 🎓 ✨ 🚀 💻 📱
- "description": Descrição detalhada com tempo estimado
- "priority": "high" (fundamentos), "medium" (prática), "low" (revisão)
- "date": YYYY-MM-DD em dias CONSECUTIVOS
- "category": "${subject}"
- "subject": "${topic || "Geral"}"

Gere entre 5 e 30 tarefas dependendo da complexidade analisada.`;

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
          { role: "user", content: `Analise e crie um planejamento inteligente para: ${subject}${topic ? ` - ${topic}` : ""}` }
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
    let result: AnalysisResult;
    try {
      // Remove markdown code blocks if present
      let jsonText = aiResponse.trim();
      jsonText = jsonText.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      
      result = JSON.parse(jsonText);
      
      if (!result.tasks || !Array.isArray(result.tasks)) {
        throw new Error("Response missing tasks array");
      }

      // Validate and fix dates to ensure consecutive
      result.tasks = result.tasks.map((task: TaskItem, index: number) => {
        // Ensure consecutive dates
        const newDate = new Date(today);
        newDate.setDate(newDate.getDate() + index);
        
        return {
          ...task,
          date: newDate.toISOString().split("T")[0],
          category: task.category || subject,
          subject: task.subject || topic || "Geral",
          priority: task.priority || "medium"
        };
      });

      console.log("Parsed analysis:", {
        dificuldade: result.dificuldade_estimada,
        horas: result.horas_totais,
        dias: result.dias_recomendados,
        modulos: result.modulos?.length,
        tasks: result.tasks.length
      });

    } catch (parseError) {
      console.error("Failed to parse AI response:", aiResponse);
      throw new Error("Falha ao processar resposta da IA");
    }

    return new Response(
      JSON.stringify({
        analysis: {
          dificuldade_estimada: result.dificuldade_estimada,
          horas_totais: result.horas_totais,
          dias_recomendados: result.dias_recomendados,
          modulos: result.modulos
        },
        tasks: result.tasks
      }),
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
