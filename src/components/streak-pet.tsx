import { useState } from "react";
import { Lock, Coins, Check, Glasses, HardHat, Hand, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import cloudImg from "@/assets/pet-cloud.png";
import {
  accessories,
  skins,
  streakPets,
  canBuy,
  buyItem,
  equipPet,
  equipSkin,
  toggleAccessory,
  unlockPet,
  type PetCustomization,
  type StreakPetId,
  type Wallet,
} from "@/lib/aulaplus";

/** Nubi sin accesorios, para tarjetas y rincones de la app. */
export function NubiAvatar({ size = 80, animated = false }: { size?: number; animated?: boolean }) {
  return <StreakPetAvatar custom={{ pet: "cloud", skin: "normal", accessories: [] }} size={size} animated={animated} />;
}

const shapePaths: Record<string, string> = {
  circle: "M50 6a44 44 0 1 1 0 88 44 44 0 0 1 0-88z",
  square: "M14 14h72v72H14z",
  triangle: "M50 8 92 88H8z",
  star: "M50 4l13 28 31 4-23 21 6 31-27-15-27 15 6-31L6 36l31-4z",
  hexagon: "M50 4 89 27v46L50 96 11 73V27z",
  diamond: "M50 4 92 50 50 96 8 50z",
  heart: "M50 88C20 66 6 48 6 32 6 16 18 6 30 6c9 0 16 5 20 12C54 11 61 6 70 6c12 0 24 10 24 26 0 16-14 34-44 56z",
};

const shapeColors: Record<string, string> = {
  circle: "#f7941e",
  square: "#43a047",
  triangle: "#e53935",
  star: "#fdd835",
  hexagon: "#3b5bdb",
  diamond: "#4dd0e1",
  heart: "#ec407a",
};

function Face() {
  return (
    <g className="streak-face">
      <ellipse cx="40" cy="46" rx="3.4" ry="7" fill="#1f1f2e" />
      <ellipse cx="60" cy="46" rx="3.4" ry="7" fill="#1f1f2e" />
      <path d="M45 62q5 4 10 0" stroke="#1f1f2e" strokeWidth="2.6" fill="none" strokeLinecap="round" />
    </g>
  );
}

export function StreakPetAvatar({
  custom,
  size = 120,
  animated = true,
}: {
  custom: PetCustomization;
  size?: number;
  animated?: boolean;
}) {
  const worn = accessories.filter((a) => custom.accessories.includes(a.id));
  const lentes = worn.find((a) => a.category === "lentes");
  const gorro = worn.find((a) => a.category === "gorros");
  const manos = worn.find((a) => a.category === "manos");
  return (
    <div
      className={`streak-pet skin-${custom.skin} ${animated ? "floating" : ""}`}
      style={{ width: size, height: size }}
      role="img"
      aria-label="Tu mascota de racha"
    >
      {custom.pet === "cloud" ? (
        <img src={cloudImg} width={size} height={size} alt="Nubi, la nube" className="streak-base" />
      ) : (
        <svg viewBox="0 0 100 100" width={size} height={size} className="streak-base streak-shape" aria-hidden>
          <path
            d={shapePaths[custom.pet]}
            className="streak-fill"
            style={custom.skin === "normal" ? { fill: shapeColors[custom.pet] } : undefined}
          />
          <Face />
        </svg>
      )}
      {gorro && <span className="acc acc-gorro" style={{ fontSize: size * 0.34 }}>{gorro.emoji}</span>}
      {lentes && <span className="acc acc-lentes" style={{ fontSize: size * 0.3 }}>{lentes.emoji}</span>}
      {manos && <span className="acc acc-manos" style={{ fontSize: size * 0.28 }}>{manos.emoji}</span>}
    </div>
  );
}

const wardrobeTabs = [
  { id: "lentes", label: "Lentes", icon: Glasses },
  { id: "gorros", label: "Gorros", icon: HardHat },
  { id: "manos", label: "Manos", icon: Hand },
  { id: "pieles", label: "Pieles", icon: Palette },
] as const;

export function Wardrobe({ wallet, onChange, totalPoints = 0 }: { wallet: Wallet; onChange: (w: Wallet) => void; totalPoints?: number }) {
  const [tab, setTab] = useState<(typeof wardrobeTabs)[number]["id"]>("lentes");
  const pet = streakPets.find((p) => p.id === wallet.custom.pet)!;

  const buy = (id: string) => {
    const next = buyItem(wallet, id);
    if (next !== wallet) onChange(next);
  };

  return (
    <div className="wardrobe">
      <div className="wardrobe-preview">
        <StreakPetAvatar custom={wallet.custom} size={160} />
        <h3>{pet.name}</h3>
        <span className="pill yellow">
          <Coins size={14} /> {wallet.coins} monedas
        </span>
      </div>

      <div className="wardrobe-section">
        <h4>Elige tu mascota</h4>
        <p className="text-muted-foreground text-sm" style={{ marginTop: -6 }}>
          Nubi, Círculo, Cuadrado y Triángulo te acompañan desde el nivel 1. Estrella, Hexágono, Rombo y Corazón se desbloquean acumulando puntos de aprendizaje (50, 60, 70 y 80). ¡Sin dinero real, solo tu esfuerzo!
        </p>
        <div className="wardrobe-pets">
          {streakPets.map((p) => {
            const owned = wallet.owned.includes(p.id);
            const active = wallet.custom.pet === p.id;
            const unlockable = !owned && p.cost > 0 && totalPoints >= p.cost;
            return (
              <button
                key={p.id}
                type="button"
                className={`wardrobe-item ${active ? "equipped" : ""}`}
                disabled={!owned && !unlockable}
                onClick={() => {
                  if (owned) return onChange(equipPet(wallet, p.id as StreakPetId));
                  const next = unlockPet(wallet, p.id as StreakPetId, totalPoints);
                  if (next !== wallet) onChange(equipPet(next, p.id as StreakPetId));
                }}
              >
                <StreakPetAvatar custom={{ pet: p.id, skin: "normal", accessories: [] }} size={56} animated={false} />
                <small>{p.name}</small>
                {active ? (
                  <span className="wardrobe-tag on"><Check size={11} /> Equipada</span>
                ) : owned ? (
                  <span className="wardrobe-tag">Usar</span>
                ) : unlockable ? (
                  <span className="wardrobe-tag on">¡Desbloquear!</span>
                ) : (
                  <span className="wardrobe-tag lock"><Lock size={11} /> {p.cost} pts</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="wardrobe-section">
        <div className="tab-row">
          {wardrobeTabs.map((t) => (
            <Button
              key={t.id}
              variant="ghost"
              className={`study-tab ${tab === t.id ? "active" : ""}`}
              onClick={() => setTab(t.id)}
            >
              <t.icon /> {t.label}
            </Button>
          ))}
        </div>
        <div className="wardrobe-grid">
          {tab === "pieles"
            ? skins.map((s) => {
                const owned = wallet.owned.includes(s.id);
                const active = wallet.custom.skin === s.id;
                return (
                  <button
                    key={s.id}
                    type="button"
                    className={`wardrobe-item ${active ? "equipped" : ""}`}
                    onClick={() => (owned ? onChange(equipSkin(wallet, s.id)) : buy(s.id))}
                  >
                    <span className={`skin-dot skin-${s.id}`} />
                    <small>{s.name}</small>
                    {active ? (
                      <span className="wardrobe-tag on"><Check size={11} /> Puesta</span>
                    ) : owned ? (
                      <span className="wardrobe-tag">Usar</span>
                    ) : (
                      <span className="wardrobe-tag lock"><Lock size={11} /> {s.cost}</span>
                    )}
                  </button>
                );
              })
            : accessories
                .filter((a) => a.category === tab)
                .map((a) => {
                  const owned = wallet.owned.includes(a.id);
                  const active = wallet.custom.accessories.includes(a.id);
                  const affordable = canBuy(wallet, a.id);
                  return (
                    <button
                      key={a.id}
                      type="button"
                      className={`wardrobe-item ${active ? "equipped" : ""}`}
                      disabled={!owned && !affordable}
                      onClick={() => (owned ? onChange(toggleAccessory(wallet, a.id)) : buy(a.id))}
                    >
                      <span className="wardrobe-emoji">{a.emoji}</span>
                      <small>{a.name}</small>
                      {active ? (
                        <span className="wardrobe-tag on"><Check size={11} /> Quitar</span>
                      ) : owned ? (
                        <span className="wardrobe-tag">Equipar</span>
                      ) : (
                        <span className="wardrobe-tag lock"><Lock size={11} /> {a.cost}</span>
                      )}
                    </button>
                  );
                })}
        </div>
      </div>
    </div>
  );
}
