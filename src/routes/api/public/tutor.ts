import { createFileRoute } from "@tanstack/react-router";
import { handleTutorRequest, type TutorRequestBody } from "@/lib/ai/tutor.server";

export const Route = createFileRoute("/api/public/tutor")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let body: TutorRequestBody;
        try {
          body = (await request.json()) as TutorRequestBody;
        } catch {
          return new Response(JSON.stringify({ error: "Petición inválida." }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
          });
        }
        if (!body.question?.trim() || typeof body.notebook !== "string" || typeof body.notes !== "string") {
          return new Response(JSON.stringify({ error: "Faltan datos de la pregunta." }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
          });
        }
        return handleTutorRequest(request, body);
      },
    },
  },
});
