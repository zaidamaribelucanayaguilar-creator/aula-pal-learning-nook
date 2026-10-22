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
  studio?: { known?: number[]; review?: number[]; quiz?: Record<string, string>; tool?: string; card?: number; rewarded?: boolean; feeling?: string; nextReview?: string };
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

// ===== Sistema de Mascotas de Racha y Gamificación =====
export type StreakPetId = "cloud" | "circle" | "square" | "triangle" | "star" | "hexagon" | "diamond" | "heart";
export type StreakPet = { id: StreakPetId; name: string; shape: string; cost: number };
export const streakPets: StreakPet[] = [
  { id: "cloud", name: "Nubia", shape: "cloud", cost: 0 },
  { id: "circle", name: "Bola", shape: "circle", cost: 20 },
  { id: "square", name: "Cubito", shape: "square", cost: 30 },
  { id: "triangle", name: "Trino", shape: "triangle", cost: 40 },
  { id: "star", name: "Estrella", shape: "star", cost: 50 },
  { id: "hexagon", name: "Hexa", shape: "hexagon", cost: 60 },
  { id: "diamond", name: "Rombi", shape: "diamond", cost: 70 },
  { id: "heart", name: "Cora", shape: "heart", cost: 80 },
];

export type AccessoryCategory = "lentes" | "gorros" | "manos";
export type Accessory = { id: string; name: string; emoji: string; category: AccessoryCategory; cost: number };
export const accessories: Accessory[] = [
  { id: "len-sol", name: "Lentes de sol", emoji: "🕶️", category: "lentes", cost: 10 },
  { id: "len-redondos", name: "Lentes redondos", emoji: "👓", category: "lentes", cost: 10 },
  { id: "len-corazon", name: "Lentes corazón", emoji: "😍", category: "lentes", cost: 15 },
  { id: "len-estrella", name: "Lentes estrella", emoji: "🤩", category: "lentes", cost: 15 },
  { id: "len-gafas3d", name: "Gafas 3D", emoji: "🎬", category: "lentes", cost: 12 },
  { id: "len-monoculo", name: "Monóculo", emoji: "🧐", category: "lentes", cost: 18 },
  { id: "len-buceo", name: "Gafas de buceo", emoji: "🤿", category: "lentes", cost: 14 },
  { id: "len-nerd", name: "Lentes de genio", emoji: "🤓", category: "lentes", cost: 12 },
  { id: "len-fiesta", name: "Lentes de fiesta", emoji: "🥳", category: "lentes", cost: 16 },
  { id: "len-galaxia", name: "Lentes galaxia", emoji: "🌌", category: "lentes", cost: 20 },
  { id: "gor-fiesta", name: "Gorro de fiesta", emoji: "🎉", category: "gorros", cost: 10 },
  { id: "gor-gorra", name: "Gorra deportiva", emoji: "🧢", category: "gorros", cost: 10 },
  { id: "gor-corona", name: "Corona real", emoji: "👑", category: "gorros", cost: 25 },
  { id: "gor-mago", name: "Sombrero de mago", emoji: "🎩", category: "gorros", cost: 18 },
  { id: "gor-graduacion", name: "Birrete", emoji: "🎓", category: "gorros", cost: 20 },
  { id: "gor-astronauta", name: "Casco espacial", emoji: "🚀", category: "gorros", cost: 22 },
  { id: "gor-flor", name: "Corona de flores", emoji: "🌸", category: "gorros", cost: 14 },
  { id: "gor-pirata", name: "Sombrero pirata", emoji: "🏴‍☠️", category: "gorros", cost: 16 },
  { id: "gor-navidad", name: "Gorro navideño", emoji: "🎅", category: "gorros", cost: 12 },
  { id: "gor-audifonos", name: "Audífonos", emoji: "🎧", category: "gorros", cost: 15 },
  { id: "man-guantes", name: "Guantes mágicos", emoji: "🧤", category: "manos", cost: 10 },
  { id: "man-varita", name: "Varita mágica", emoji: "🪄", category: "manos", cost: 20 },
  { id: "man-libro", name: "Libro favorito", emoji: "📖", category: "manos", cost: 12 },
  { id: "man-lapiz", name: "Lápiz gigante", emoji: "✏️", category: "manos", cost: 8 },
  { id: "man-balón", name: "Balón", emoji: "⚽", category: "manos", cost: 12 },
  { id: "man-guitarra", name: "Guitarra", emoji: "🎸", category: "manos", cost: 18 },
  { id: "man-mando", name: "Mando de juegos", emoji: "🎮", category: "manos", cost: 15 },
  { id: "man-paleta", name: "Paleta de pintor", emoji: "🎨", category: "manos", cost: 14 },
  { id: "man-globo", name: "Globo", emoji: "🎈", category: "manos", cost: 8 },
  { id: "man-trofeo", name: "Trofeo", emoji: "🏆", category: "manos", cost: 25 },
];

export type Skin = { id: string; name: string; cost: number };
export const skins: Skin[] = [
  { id: "normal", name: "Clásica", cost: 0 },
  { id: "tierra", name: "Planeta Tierra", cost: 25 },
  { id: "futbol", name: "Pelota de fútbol", cost: 25 },
  { id: "galaxia", name: "Galaxia", cost: 40 },
  { id: "dorado", name: "Dorado", cost: 50 },
  { id: "arcoiris", name: "Arcoíris", cost: 35 },
  { id: "sandia", name: "Sandía", cost: 30 },
  { id: "oceano", name: "Océano", cost: 30 },
  { id: "lava", name: "Lava", cost: 45 },
  { id: "aurora", name: "Aurora", cost: 45 },
];

export type PetCustomization = { pet: StreakPetId; skin: string; accessories: string[] };
export type Wallet = { coins: number; owned: string[]; custom: PetCustomization };
export const initialWallet: Wallet = {
  coins: 15,
  owned: ["cloud", "normal"],
  custom: { pet: "cloud", skin: "normal", accessories: [] },
};

export function itemCost(id: string): number {
  return (
    streakPets.find((p) => p.id === id)?.cost ??
    accessories.find((a) => a.id === id)?.cost ??
    skins.find((s) => s.id === id)?.cost ??
    0
  );
}
export function canBuy(wallet: Wallet, id: string) {
  return !wallet.owned.includes(id) && wallet.coins >= itemCost(id);
}
export function buyItem(wallet: Wallet, id: string): Wallet {
  if (!canBuy(wallet, id)) return wallet;
  return { ...wallet, coins: wallet.coins - itemCost(id), owned: [...wallet.owned, id] };
}
export function equipPet(wallet: Wallet, pet: StreakPetId): Wallet {
  if (!wallet.owned.includes(pet)) return wallet;
  return { ...wallet, custom: { ...wallet.custom, pet } };
}
export function equipSkin(wallet: Wallet, skin: string): Wallet {
  if (!wallet.owned.includes(skin)) return wallet;
  return { ...wallet, custom: { ...wallet.custom, skin } };
}
/** Equipa o desequipa un accesorio; máximo uno por categoría. */
export function toggleAccessory(wallet: Wallet, id: string): Wallet {
  if (!wallet.owned.includes(id)) return wallet;
  const acc = accessories.find((a) => a.id === id);
  if (!acc) return wallet;
  const current = wallet.custom.accessories;
  const without = current.filter((x) => accessories.find((a) => a.id === x)?.category !== acc.category);
  const next = current.includes(id) ? without : [...without, id];
  return { ...wallet, custom: { ...wallet.custom, accessories: next } };
}

/** Monedas por sesión de repaso: precisión (0-1) y racha de días. */
export function sessionReward(accuracy: number, streak: number) {
  const a = Math.min(1, Math.max(0, accuracy));
  return Math.round(a * 10) + Math.min(Math.max(0, streak), 5);
}
export type SessionFeeling = "facil" | "regular" | "dificil";
/** Días hasta el próximo repaso según la autoevaluación. */
export function nextReviewDays(feeling: SessionFeeling) {
  return feeling === "facil" ? 4 : feeling === "regular" ? 2 : 1;
}
