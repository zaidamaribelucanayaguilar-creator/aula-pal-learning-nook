import { createFileRoute } from "@tanstack/react-router";
import { AulaPlus } from "@/components/aulaplus";
export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AulaPlus · Tu aventura de aprendizaje" },
      {
        name: "description",
        content:
          "Cuadernos, mascotas y grandes descubrimientos. Un espacio educativo para estudiantes y profesores.",
      },
      { property: "og:title", content: "AulaPlus · Tu aventura de aprendizaje" },
      {
        property: "og:description",
        content:
          "Aprende a tu ritmo con cuadernos por asignatura, compañeros de aventura y herramientas para tu clase.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AulaPlus,
});
