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
    const { file, fileName, fileType } = await req.json();

    if (!file || !fileName) {
      return new Response(
        JSON.stringify({ error: "Arquivo e nome são obrigatórios" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Decode base64 file
    const binaryData = Uint8Array.from(atob(file), c => c.charCodeAt(0));
    
    const lowerFileName = fileName.toLowerCase();
    let extractedText = "";

    // Handle PDF files
    if (fileType === "application/pdf" || lowerFileName.endsWith(".pdf")) {
      extractedText = extractPDFText(binaryData);
    }
    // Handle Word documents (.docx)
    else if (
      fileType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      lowerFileName.endsWith(".docx")
    ) {
      extractedText = await extractDocxText(binaryData);
    }
    // Handle older Word documents (.doc)
    else if (fileType === "application/msword" || lowerFileName.endsWith(".doc")) {
      extractedText = extractDocText(binaryData);
    }
    // Handle PowerPoint (.pptx)
    else if (
      fileType === "application/vnd.openxmlformats-officedocument.presentationml.presentation" ||
      lowerFileName.endsWith(".pptx")
    ) {
      extractedText = await extractPptxText(binaryData);
    }
    else {
      return new Response(
        JSON.stringify({ error: "Formato de arquivo não suportado para extração" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Limit content size
    const MAX_CHARS = 100000;
    if (extractedText.length > MAX_CHARS) {
      extractedText = extractedText.substring(0, MAX_CHARS) + "\n\n[... conteúdo truncado ...]";
    }

    return new Response(
      JSON.stringify({ content: extractedText }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("parse-document error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Erro ao processar documento" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

// Simple PDF text extraction (extracts visible text from PDF streams)
function extractPDFText(data: Uint8Array): string {
  const text = new TextDecoder("utf-8", { fatal: false }).decode(data);
  const textContent: string[] = [];
  
  // Extract text between BT and ET markers (text blocks)
  const btEtRegex = /BT\s*([\s\S]*?)\s*ET/g;
  let match;
  
  while ((match = btEtRegex.exec(text)) !== null) {
    const block = match[1];
    // Extract text from Tj and TJ operators
    const tjRegex = /\(([^)]*)\)\s*Tj/g;
    const tjArrayRegex = /\[(.*?)\]\s*TJ/g;
    
    let tjMatch;
    while ((tjMatch = tjRegex.exec(block)) !== null) {
      const decoded = decodePDFString(tjMatch[1]);
      if (decoded.trim()) textContent.push(decoded);
    }
    
    while ((tjMatch = tjArrayRegex.exec(block)) !== null) {
      const arr = tjMatch[1];
      const stringRegex = /\(([^)]*)\)/g;
      let strMatch;
      let lineText = "";
      while ((strMatch = stringRegex.exec(arr)) !== null) {
        lineText += decodePDFString(strMatch[1]);
      }
      if (lineText.trim()) textContent.push(lineText);
    }
  }

  // If no text found with markers, try to find readable text
  if (textContent.length === 0) {
    // Look for common text patterns
    const readableRegex = /[A-Za-zÀ-ÿ0-9\s.,;:!?()-]{20,}/g;
    const readable = text.match(readableRegex);
    if (readable) {
      textContent.push(...readable.filter(t => t.trim().length > 20));
    }
  }

  const result = textContent.join("\n").trim();
  
  if (!result || result.length < 50) {
    return "⚠️ Não foi possível extrair texto legível deste PDF. Por favor, copie o conteúdo manualmente ou use um arquivo de texto (.txt, .md).";
  }

  return result;
}

function decodePDFString(str: string): string {
  return str
    .replace(/\\n/g, "\n")
    .replace(/\\r/g, "\r")
    .replace(/\\t/g, "\t")
    .replace(/\\\(/g, "(")
    .replace(/\\\)/g, ")")
    .replace(/\\\\/g, "\\");
}

// Extract text from DOCX (ZIP with XML)
async function extractDocxText(data: Uint8Array): Promise<string> {
  try {
    // DOCX is a ZIP file containing XML
    const text = new TextDecoder("utf-8", { fatal: false }).decode(data);
    
    // Look for word/document.xml content
    const textContent: string[] = [];
    
    // Simple XML text extraction
    const textRegex = /<w:t[^>]*>([^<]*)<\/w:t>/g;
    let match;
    
    while ((match = textRegex.exec(text)) !== null) {
      if (match[1].trim()) {
        textContent.push(match[1]);
      }
    }

    // Also try paragraph-level extraction
    const paraRegex = /<w:p[^>]*>([\s\S]*?)<\/w:p>/g;
    const paragraphs: string[] = [];
    
    while ((match = paraRegex.exec(text)) !== null) {
      const paraContent = match[1];
      const innerTextRegex = /<w:t[^>]*>([^<]*)<\/w:t>/g;
      let innerMatch;
      let para = "";
      
      while ((innerMatch = innerTextRegex.exec(paraContent)) !== null) {
        para += innerMatch[1];
      }
      
      if (para.trim()) {
        paragraphs.push(para.trim());
      }
    }

    const result = paragraphs.length > 0 
      ? paragraphs.join("\n\n") 
      : textContent.join(" ");

    if (!result || result.length < 20) {
      return "⚠️ Não foi possível extrair texto deste documento Word. Por favor, copie o conteúdo manualmente.";
    }

    return result;
  } catch (e) {
    console.error("DOCX extraction error:", e);
    return "⚠️ Erro ao processar documento Word.";
  }
}

// Extract text from older DOC format
function extractDocText(data: Uint8Array): string {
  const text = new TextDecoder("utf-8", { fatal: false }).decode(data);
  
  // DOC format is complex binary, try to find readable text
  const readableRegex = /[A-Za-zÀ-ÿ0-9\s.,;:!?()-]{15,}/g;
  const matches = text.match(readableRegex);
  
  if (matches && matches.length > 0) {
    return matches.filter(m => m.trim().length > 15).join("\n");
  }

  return "⚠️ Formato .doc antigo. Por favor, converta para .docx ou copie o conteúdo manualmente.";
}

// Extract text from PPTX
async function extractPptxText(data: Uint8Array): Promise<string> {
  try {
    const text = new TextDecoder("utf-8", { fatal: false }).decode(data);
    const textContent: string[] = [];
    
    // Extract text from PowerPoint XML
    const textRegex = /<a:t>([^<]*)<\/a:t>/g;
    let match;
    
    while ((match = textRegex.exec(text)) !== null) {
      if (match[1].trim()) {
        textContent.push(match[1]);
      }
    }

    const result = textContent.join("\n");
    
    if (!result || result.length < 20) {
      return "⚠️ Não foi possível extrair texto desta apresentação. Por favor, copie o conteúdo manualmente.";
    }

    return result;
  } catch (e) {
    console.error("PPTX extraction error:", e);
    return "⚠️ Erro ao processar apresentação PowerPoint.";
  }
}
