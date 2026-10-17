import monster from "@/assets/mascot.png";
import dragon from "@/assets/pet-dragon.png";
import cat from "@/assets/pet-cat.png";
import owl from "@/assets/pet-owl.png";
import bear from "@/assets/pet-bear.png";
import { type PetSpecies } from "@/lib/aulaplus";

const models = { monster, dragon, cat, owl, bear };
export const speciesLabels: Record<PetSpecies, string> = {
  monster: "Monstruito verde", dragon: "Dragoncito", cat: "Gatito astronauta", owl: "Búho sabio", bear: "Osito",
};
export function Pet({ species = "monster", tone: _tone, className = "" }: { species?: PetSpecies; tone?: string; className?: string }) {
  return <img src={models[species]} width={816} height={816} loading="lazy" alt={speciesLabels[species]} className={`pet ${className}`} />;
}