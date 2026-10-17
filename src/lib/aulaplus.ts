export type Role = "student" | "teacher";
export const petSpecies = ["monster", "cat", "owl", "dragon", "bear"] as const;
export type PetSpecies = (typeof petSpecies)[number];
export const petNames: Record<PetSpecies, string> = {
  monster: "Milo", cat: "Cosmo", owl: "Blu", dragon: "Lumi", bear: "Coco",
};
export type Evaluation = "Perfecto" | "Bien" | "Necesita Repaso";
export const evaluationPoints: Record<Evaluation, number> = {
  Perfecto: 2,
  Bien: 1,
  "Necesita Repaso": 0,
};
export function evaluate(points: number, grade: Evaluation) {
  return points + evaluationPoints[grade];
}
export function petLevel(points: number) {
  return Math.floor(Math.max(0, points) / 10) + 1;
}
export function makeGroups<T>(students: T[], size: number): T[][] {
  const groups: T[][] = [];
  for (let i = 0; i < students.length; i += Math.max(2, Math.floor(size)))
    groups.push(students.slice(i, i + Math.max(2, Math.floor(size))));
  return groups;
}
export type Notebook = {
  id: string;
  name: string;
  subject: string;
  tone: string;
  pet: string;
  species: PetSpecies;
  points: number;
  streak: number;
  notes: string;
  tasks: { id: string; title: string; done: boolean }[];
  sources?: { id: string; title: string; kind: "link" | "texto" | "archivo"; url?: string; summary?: string[]; points?: string[]; ideas?: string[] }[];
  /** Estado del Studio (se guarda con el cuaderno en localStorage). */
  studio?: { known?: number[]; review?: number[]; quiz?: Record<string, string>; tool?: string; card?: number };
};
export type Activity = { id: string; title: string; date: string; type: string; subject: string; tone?: string };
export const toneOptions = ["mint", "sky", "peach", "lilac", "yellow", "coral", "rose", "teal", "ocean", "lime", "sand", "grape"] as const;
export type Student = { id: string; name: string; points: number; tone: string };
export type Workspace = {
  notebooks: Notebook[];
  activities: Activity[];
  students: Student[];
  announcements: { id: string; title: string; body: string }[];
};
export const initialWorkspace: Workspace = {
  notebooks: [
    {
      id: "math",
      name: "Matemáticas",
      subject: "Números que cuentan historias",
      tone: "mint",
      pet: "Milo",
      species: "monster",
      points: 24,
      streak: 5,
      notes:
        "Las fracciones representan partes de un todo. Para sumar fracciones, primero buscamos un denominador común.",
      tasks: [{ id: "m1", title: "Resolver los ejercicios de fracciones", done: false }],
    },
    {
      id: "science",
      name: "Ciencias Naturales",
      subject: "Un mundo por descubrir",
      tone: "sky",
      pet: "Cosmo",
      species: "cat",
      points: 16,
      streak: 3,
      notes:
        "La fotosíntesis transforma la energía solar en energía química. Las plantas utilizan agua y dióxido de carbono.",
      tasks: [{ id: "c1", title: "Dibujar las partes de una planta", done: false }],
    },
    {
      id: "language",
      name: "Comunicación",
      subject: "Cada palabra es una aventura",
      tone: "peach",
      pet: "Blu",
      species: "owl",
      points: 32,
      streak: 7,
      notes:
        "Un texto narrativo tiene inicio, desarrollo y desenlace. Sus personajes viven una historia en un tiempo y lugar.",
      tasks: [{ id: "l1", title: "Escribir un cuento corto", done: true }],
    },
    {
      id: "history",
      name: "Historia",
      subject: "Viajes a través del tiempo",
      tone: "lilac",
      pet: "Lumi",
      species: "dragon",
      points: 12,
      streak: 2,
      notes:
        "Las fuentes históricas nos ayudan a conocer el pasado. Pueden ser escritas, orales o materiales.",
      tasks: [],
    },
    {
      id: "art", name: "Arte y Creatividad", subject: "Ideas que toman color",
      tone: "peach", pet: "Coco", species: "bear", points: 8, streak: 2,
      notes: "Los colores primarios son rojo, amarillo y azul. Al mezclarlos obtenemos colores secundarios.",
      tasks: [{ id: "art1", title: "Crear un dibujo con colores primarios", done: false }],
    },
  ],
  activities: [
    {
      id: "a1",
      title: "Examen de fracciones",
      date: "2026-10-12",
      type: "Examen",
      subject: "Matemáticas",
    },
    {
      id: "a2",
      title: "Mi pequeña planta",
      date: "2026-10-14",
      type: "Proyecto",
      subject: "Ciencias Naturales",
    },
    {
      id: "a3",
      title: "Lectura de 20 minutos",
      date: "2026-10-09",
      type: "Estudio",
      subject: "Comunicación",
    },
  ],
  students: [
    "Valentina López",
    "Mateo García",
    "Sofía Torres",
    "Lucas Pérez",
    "Camila Ramos",
    "Diego Flores",
    "Emma Silva",
    "Nicolás Ruiz",
    "Isabella Vega",
    "Gabriel León",
    "Luciana Castro",
    "Sebastián Díaz",
  ].map((name, i) => ({
    id: String(i),
    name,
    points: 10 + i * 2,
    tone: ["mint", "sky", "peach", "lilac"][i % 4] || "mint",
  })),
  announcements: [
    {
      id: "n1",
      title: "¡Nuestra próxima aventura!",
      body: "El miércoles presentaremos nuestros proyectos de ciencias. Recuerda traer tu pequeña planta.",
    },
  ],
};

export type Classroom = { id: string; name: string; workspace: Workspace };
export function createClassroom(id: string, name: string): Classroom {
  return { id, name: name.trim(), workspace: { notebooks: [], activities: [], students: [], announcements: [] } };
}
export function updateClassWorkspace(classes: Classroom[], id: string, update: (w: Workspace) => Workspace) {
  return classes.map((c) => c.id === id ? { ...c, workspace: update(c.workspace) } : c);
}
export function createInitialClassrooms(): Classroom[] {
  return ['1° Secundaria "A"', '2° Secundaria "B"', '3° Secundaria "C"'].map((name, i) => ({
    id: `class-${i}`, name,
    workspace: {
      notebooks: initialWorkspace.notebooks.map((n) => ({ ...n, id: `class-${i}-${n.id}`, tasks: n.tasks.map((t) => ({ ...t })) })),
      activities: initialWorkspace.activities.map((a) => ({ ...a, id: `class-${i}-${a.id}` })),
      students: initialWorkspace.students.slice(i === 0 ? 0 : (i - 1) * 6, i === 0 ? 12 : i * 6).map((s) => ({ ...s, id: `class-${i}-${s.id}` })),
      announcements: initialWorkspace.announcements.map((a) => ({ ...a, id: `class-${i}-${a.id}` })),
    },
  }));
}

/** Inicio limpio: una sola clase vacía, sin cuadernos ni alumnos. */
export function createEmptyClassrooms(): Classroom[] {
  return [createClassroom("class-0", "Mi clase")];
}
export type UserProfile = { name: string; email: string; lang: string };
export function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());
}
