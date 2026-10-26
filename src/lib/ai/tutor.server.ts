import { createOpenAI } from "@ai-sdk/openai";
import { streamText, type ModelMessage } from "ai";
import { cleanImportedText } from "@/lib/clean-text";
import {
  createLovableAiGatewayRunIdFetch,
  getLovableAiGatewayRunId,
  withLovableAiGatewayRunIdHeader,
} from "./run-id";

const GATEWAY_URL = "https://ai.gateway.lovable.dev/v1";
const MODEL = "openai/gpt-6-astra";

const SYSTEM_PROMPT = `Eres "Milo", el Tutor Académico Personalizado de AulaPlus, una app de estudio para estudiantes de secundaria y universidad.

## Tu personalidad
- Empático, claro, paciente y pedagógico. Celebras el esfuerzo del estudiante.
- NUNCA das respuestas vagas, súper cortas o genéricas. Cada respuesta enseña de verdad.

## Contexto principal (regla más importante)
- Recibes los APUNTES DEL CUADERNO activo del estudiante. Basa tu respuesta PRIMERAMENTE en ese contenido: cita ideas de sus apuntes, conecta con lo que ya escribió y completa lo que falte.
- Si los apuntes no cubren la pregunta, responde con tu conocimiento general y dilo con naturalidad ("En tus apuntes no aparece todavía, pero...").
- Si los apuntes contienen un error, corrígelo con tacto.

## Formato de respuesta (Markdown)
- Usa ## para encabezados de sección cuando la explicación tenga varias partes.
- Usa **negritas** para los conceptos clave.
- Usa listas con viñetas para enumerar ideas, pasos o propiedades.
- Incluye siempre al menos un **ejemplo práctico** adaptado a un estudiante de secundaria o universidad.
- Cierra con una mini-conclusión o una pregunta de repaso para fijar el aprendizaje.
- Si el material de origen viene desordenado o redundante, redacta una síntesis clara, pedagógica y directa.
- Jamás incluyas botones, enlaces de redes sociales ni textos de navegación ("Compartir", "Copiar enlace", etc.).
- Responde siempre en español.`;

export type TutorRequestBody = {
  question: string;
  notebook: string;
  notes: string;
  history?: { role: "user" | "assistant"; text: string }[];
};

export function handleTutorRequest(request: Request, body: TutorRequestBody) {
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) {
    return new Response(JSON.stringify({ error: "La IA no está configurada todavía." }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  const notes = cleanImportedText(body.notes).slice(0, 12000);
  const contextMessage = notes
    ? `Cuaderno activo: "${body.notebook}".\n\nAPUNTES DEL CUADERNO (contexto principal para tu respuesta):\n"""\n${notes}\n"""`
    : `Cuaderno activo: "${body.notebook}". El estudiante aún no tiene apuntes en este cuaderno.`;

  const messages: ModelMessage[] = [
    ...(body.history ?? []).slice(-10).map((m): ModelMessage => ({ role: m.role, content: m.text.slice(0, 2000) })),
    { role: "user", content: body.question.slice(0, 2000) },
  ];

  const runIdFetch = createLovableAiGatewayRunIdFetch(getLovableAiGatewayRunId(request));
  const provider = createOpenAI({
    baseURL: GATEWAY_URL,
    apiKey,
    headers: { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
    fetch: runIdFetch.fetch,
  });

  const result = streamText({
    model: provider.responses(MODEL),
    instructions: `${SYSTEM_PROMPT}\n\n${contextMessage}`,
    messages,
    abortSignal: request.signal,
    providerOptions: {
      openai: {
        store: false,
        forceReasoning: true,
        reasoningEffort: "low",
        reasoningSummary: "auto",
        include: ["reasoning.encrypted_content"],
      },
    },
  });

  return withLovableAiGatewayRunIdHeader(
    result.toTextStreamResponse(),
    runIdFetch,
    { "Content-Type": "text/plain; charset=utf-8" },
  );
}

// Tutor IA: verificado con ai@7 + @ai-sdk/openai@4 (override @ai-sdk/provider 4.0.33).
