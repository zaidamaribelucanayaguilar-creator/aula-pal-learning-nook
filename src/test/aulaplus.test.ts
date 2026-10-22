import { describe, expect, it } from "vitest";
import { evaluate, makeGroups, initialWorkspace, petSpecies, createClassroom, createInitialClassrooms, updateClassWorkspace } from "@/lib/aulaplus";
describe("Notebook evaluation", () => {
  it("Perfecto adds exactly 2 points", () => expect(evaluate(10, "Perfecto")).toBe(12));
  it("Bien adds exactly 1 point", () => expect(evaluate(10, "Bien")).toBe(11));
  it("Necesita Repaso adds no points", () => expect(evaluate(10, "Necesita Repaso")).toBe(10));
});
describe("Class groups", () => {
  for (const size of [2, 3, 4, 5, 6])
    it(`keeps every student once in groups of up to ${size}`, () => {
      const students = Array.from({ length: 12 }, (_, i) => i);
      const groups = makeGroups(students, size);
      expect(groups.flat()).toEqual(students);
      expect(groups.every((g) => g.length <= size)).toBe(true);
      expect(groups[0]?.length).toBe(size);
    });
});
describe("Distinct notebook pets", () => {
  it("offers five species with a different pet in each initial notebook", () => {
    expect(petSpecies).toEqual(["monster", "cat", "owl", "dragon", "bear"]);
    expect(new Set(initialWorkspace.notebooks.map((n) => n.species)).size).toBe(5);
  });
});
describe("Independent classrooms", () => {
  it("creates a named class with an empty roster", () => {
    const c = createClassroom("new", ' 4° Secundaria "D" ');
    expect(c.name).toBe('4° Secundaria "D"');
    expect(c.workspace.students).toEqual([]);
  });
  it("adds students only to the selected class", () => {
    const classes = createInitialClassrooms();
    const updated = updateClassWorkspace(classes, "class-1", (w) => ({ ...w, students: [...w.students, { id: "new", name: "Ana", points: 0, tone: "mint" }] }));
    expect(updated[1]?.workspace.students.length).toBe(7);
    expect(updated[0]?.workspace.students.length).toBe(12);
    expect(updated[2]?.workspace.students.length).toBe(6);
    expect(classes[1]?.workspace.students.length).toBe(6);
  });
  it("removes and renames students without changing another roster", () => {
    const classes = createInitialClassrooms();
    const updated = updateClassWorkspace(classes, "class-0", (w) => ({ ...w, students: w.students.slice(1).map((s, i) => i === 0 ? { ...s, name: "Nuevo nombre" } : s) }));
    expect(updated[0]?.workspace.students.length).toBe(11);
    expect(updated[0]?.workspace.students[0]?.name).toBe("Nuevo nombre");
    expect(updated[1]?.workspace.students).toEqual(classes[1]?.workspace.students);
  });
  it("keeps notebook scores isolated between classes", () => {
    const classes = createInitialClassrooms();
    const updated = updateClassWorkspace(classes, "class-0", (w) => ({ ...w, notebooks: w.notebooks.map((n, i) => i === 0 ? { ...n, points: evaluate(n.points, "Perfecto") } : n) }));
    expect(updated[0]?.workspace.notebooks[0]?.points).toBe(26);
    expect(updated[1]?.workspace.notebooks[0]?.points).toBe(24);
  });
});

import { tutorReply, solveMath } from "@/lib/tutor";
describe("tutor general", () => {
  it("resuelve 2*2 aunque haya apuntes", () => {
    expect(solveMath("cuánto es 2*2")?.result).toBe(4);
    expect(tutorReply("cuánto es 2*2", "Las fracciones son partes.", "Historia")).toContain("= 4");
  });
  it("explica la fotosíntesis sin apuntes", () => {
    expect(tutorReply("explícame la fotosíntesis", "", "Matemáticas")).toContain("clorofila");
  });
  it("da consejos de estudio", () => {
    expect(tutorReply("dame un consejo de estudio", "", "Arte")).toContain("Pomodoro");
    expect(tutorReply("quién inventó el ajedrez", "", "Arte")).toContain("búsqueda en la web");
  });
});

import { createEmptyClassrooms, isValidEmail } from "@/lib/aulaplus";
import { makeQuiz } from "@/lib/tutor";
describe("inicio limpio y login", () => {
  it("empieza sin cuadernos ni alumnos", () => {
    const [c] = createEmptyClassrooms();
    expect(c!.workspace.notebooks).toHaveLength(0);
    expect(c!.workspace.students).toHaveLength(0);
  });
  it("valida el correo", () => {
    expect(isValidEmail("ana@colegio.pe")).toBe(true);
    expect(isValidEmail("ana@")).toBe(false);
  });
  it("crea cuestionario desde apuntes", () => {
    const q = makeQuiz("La fotosíntesis transforma energía solar. Las plantas utilizan agua y dióxido. La clorofila captura energía en las hojas verdes. Las raíces absorben agua del suelo húmedo.");
    expect(q.length).toBeGreaterThan(0);
  });
});

import { streakPets, accessories, skins, initialWallet, canBuy, buyItem, equipPet, toggleAccessory, sessionReward, nextReviewDays } from "@/lib/aulaplus";
describe("Sistema de mascotas de racha", () => {
  it("ofrece 8 mascotas: nube gratis y 7 formas con costo", () => {
    expect(streakPets).toHaveLength(8);
    expect(streakPets[0]).toMatchObject({ id: "cloud", cost: 0 });
    expect(streakPets.slice(1).every((p) => p.cost > 0)).toBe(true);
  });
  it("tiene 30 accesorios en 3 categorías y 10 pieles", () => {
    expect(accessories).toHaveLength(30);
    for (const cat of ["lentes", "gorros", "manos"])
      expect(accessories.filter((a) => a.category === cat)).toHaveLength(10);
    expect(skins).toHaveLength(10);
  });
  it("compra solo con monedas suficientes y descuenta el costo", () => {
    expect(canBuy(initialWallet, "heart")).toBe(false);
    const rich = { ...initialWallet, coins: 100 };
    const bought = buyItem(rich, "star");
    expect(bought.coins).toBe(50);
    expect(bought.owned).toContain("star");
    expect(buyItem(bought, "star")).toBe(bought);
  });
  it("no equipa mascotas sin desbloquear", () => {
    expect(equipPet(initialWallet, "heart")).toBe(initialWallet);
    expect(equipPet(initialWallet, "cloud").custom.pet).toBe("cloud");
  });
  it("permite un accesorio por categoría y alterna equipar/quitar", () => {
    let w = { ...initialWallet, owned: [...initialWallet.owned, "len-sol", "len-nerd", "gor-corona"] };
    w = toggleAccessory(w, "len-sol");
    w = toggleAccessory(w, "len-nerd");
    expect(w.custom.accessories).toEqual(["len-nerd"]);
    w = toggleAccessory(w, "gor-corona");
    expect(w.custom.accessories).toEqual(["len-nerd", "gor-corona"]);
    w = toggleAccessory(w, "len-nerd");
    expect(w.custom.accessories).toEqual(["gor-corona"]);
  });
  it("recompensa por precisión y racha (máx. +5 de racha)", () => {
    expect(sessionReward(1, 3)).toBe(13);
    expect(sessionReward(0.5, 0)).toBe(5);
    expect(sessionReward(1, 99)).toBe(15);
    expect(sessionReward(0, 0)).toBe(0);
  });
  it("autoevaluación ajusta el próximo repaso: 4/2/1 días", () => {
    expect(nextReviewDays("facil")).toBe(4);
    expect(nextReviewDays("regular")).toBe(2);
    expect(nextReviewDays("dificil")).toBe(1);
  });
});
