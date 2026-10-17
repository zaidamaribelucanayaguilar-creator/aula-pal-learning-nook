import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Pet } from "@/components/pet";
import { isValidEmail } from "@/lib/aulaplus";

export function LoginScreen({ onDone }: { onDone: (name: string, email: string) => void }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  return (
    <div className="login-screen">
      <div className="login-card">
        <div className="login-pets">
          <Pet species="dragon" /><Pet species="monster" /><Pet species="owl" />
        </div>
        <h1>¡Bienvenido a AulaPlus!</h1>
        <p className="text-muted-foreground">Crea tu espacio para empezar la aventura.</p>
        <form className="modal-form" onSubmit={(e) => {
          e.preventDefault();
          if (!name.trim()) return setError("Escribe tu nombre.");
          if (!isValidEmail(email)) return setError("Escribe un correo válido.");
          onDone(name.trim(), email.trim());
        }}>
          <label>Tu nombre<input className="field" value={name} onChange={(e) => setName(e.target.value)} maxLength={40} placeholder="¿Cómo te llamas?" autoFocus required /></label>
          <label>Correo electrónico<input className="field" type="email" value={email} onChange={(e) => setEmail(e.target.value)} maxLength={120} placeholder="tucorreo@ejemplo.com" required /></label>
          {error && <p className="text-destructive text-sm">{error}</p>}
          <Button type="submit">Continuar<ArrowRight /></Button>
        </form>
        <small className="text-muted-foreground">Tus datos se guardan solo en este navegador.</small>
      </div>
    </div>
  );
}
