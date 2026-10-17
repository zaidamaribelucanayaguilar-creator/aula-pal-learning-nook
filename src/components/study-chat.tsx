import { useEffect, useRef, useState } from "react";
import { Paperclip, Globe } from "lucide-react";
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { Message, MessageContent, MessageResponse } from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputTextarea,
  PromptInputFooter,
  PromptInputSubmit,
} from "@/components/ai-elements/prompt-input";
import { Shimmer } from "@/components/ai-elements/shimmer";
import { Button } from "@/components/ui/button";
import type { Notebook } from "@/lib/aulaplus";
import { tutorReply, followUps, webSearchMany, formatWebAnswer, WEB_OFFER } from "@/lib/tutor";
import { readStudyFile } from "@/lib/file-reader";
import mascot from "@/assets/mascot.png";

type ChatMsg = { id: string; role: "user" | "assistant"; text: string; chips?: string[]; webQuery?: string };

// Conversación por cuaderno guardada en localStorage (sobrevive a recargas).
const chatKey = (id: string) => `aulaplus-chat-v1:${id}`;
function loadChat(id: string): ChatMsg[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(chatKey(id)) ?? "[]"); } catch { return []; }
}
const ACCEPT = ".pdf,.docx,.xlsx,.xls,.ods,.pptx,.txt,.md,.csv,.json,image/*";

export function StudyChat({ notebook, addNotes, userName = "" }: { notebook: Notebook; addNotes: (text: string) => void; userName?: string }) {
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  useEffect(() => { setMessages(loadChat(notebook.id)); }, [notebook.id]);
  const [thinking, setThinking] = useState(false);
  const [lastQuestion, setLastQuestion] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const push = (list: ChatMsg[]) => {
    try { localStorage.setItem(chatKey(notebook.id), JSON.stringify(list.slice(-80))); } catch { /* lleno */ }
    setMessages(list);
  };
  const first = userName.split(" ")[0] ?? "";

  async function ask(text: string) {
    if (!text.trim() || thinking) return;
    const withUser = [...messages, { id: crypto.randomUUID(), role: "user" as const, text }];
    push(withUser);
    setLastQuestion(text);
    setThinking(true);
    await new Promise((r) => setTimeout(r, 450));
    let reply = tutorReply(text, notebook.notes, notebook.name);
    if (first && /^¡Hola!/.test(reply)) reply = reply.replace("¡Hola!", `¡Hola, ${first}!`);
    const offer = reply.includes(WEB_OFFER);
    push([...withUser, { id: crypto.randomUUID(), role: "assistant", text: reply, chips: offer ? [] : followUps(text, notebook.name), ...(offer ? { webQuery: text } : {}) }]);
    setThinking(false);
  }

  async function searchWeb(query: string) {
    const withUser = [...messages, { id: crypto.randomUUID(), role: "user" as const, text: "Sí, busca en la web 🌐" }];
    push(withUser);
    setThinking(true);
    const hits = await webSearchMany(query, 3);
    push([...withUser, { id: crypto.randomUUID(), role: "assistant", text: formatWebAnswer(query, hits), chips: followUps(query, notebook.name) }]);
    setThinking(false);
  }

  async function onFiles(files: FileList | null) {
    if (!files?.length) return;
    setThinking(true);
    let list = messages;
    const added: string[] = [];
    for (const file of Array.from(files)) {
      list = [...list, { id: crypto.randomUUID(), role: "user", text: `📎 ${file.name}` }];
      push(list);
      const r = await readStudyFile(file);
      if (r.text.trim()) {
        added.push(`📎 ${r.name}\n${r.text.trim().slice(0, 20000)}`);
        const preview = r.text.replace(/\s+/g, " ").slice(0, 220);
        list = [...list, { id: crypto.randomUUID(), role: "assistant", text: `¡Listo! Leí tu archivo **${r.kind}** "${r.name}" 📚 y lo añadí a tus apuntes.\n\n> ${preview}…\n\nAhora puedes preguntarme sobre él o crear un mapa mental o un cuestionario en **Estudio+**.` }];
      } else {
        list = [...list, { id: crypto.randomUUID(), role: "assistant", text: `Recibí "${r.name}". ${r.note ?? "No encontré texto."}` }];
      }
      push(list);
    }
    if (added.length) addNotes(added.join("\n\n"));
    setThinking(false);
    if (fileRef.current) fileRef.current.value = "";
  }

  return (
    <div className="chat-panel">
      <Conversation className="flex-1 min-h-0">
        <ConversationContent>
          {!messages.length && (
            <div className="chat-empty">
              <img src={mascot} alt="Milo" width={1024} height={1024} />
              <h3>{first ? `¡Hola, ${first}! Pregúntame lo que quieras` : "¡Pregúntame lo que quieras!"}</h3>
              <p className="text-muted-foreground">
                Matemáticas, ciencias, historia, anatomía, psicología… o sube un archivo de {notebook.name}.
              </p>
            </div>
          )}
          {messages.map((m, i) => (
            <Message key={m.id} from={m.role}>
              <MessageContent className={m.role === "user" ? "chat-user" : ""}>
                <MessageResponse>{m.text}</MessageResponse>
                {i === messages.length - 1 && !thinking && (m.webQuery || m.chips?.length) ? (
                  <div className="chat-chips">
                    {m.webQuery && <Button size="sm" onClick={() => void searchWeb(m.webQuery!)}><Globe />Sí, buscar en la web</Button>}
                    {m.chips?.map((c) => <Button key={c} size="sm" variant="outline" onClick={() => void ask(c)}>{c}</Button>)}
                  </div>
                ) : null}
              </MessageContent>
            </Message>
          ))}
          {thinking && <Shimmer>Milo está pensando…</Shimmer>}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>
      <input ref={fileRef} type="file" hidden multiple accept={ACCEPT} onChange={(e) => void onFiles(e.target.files)} />
      <PromptInput onSubmit={({ text }) => ask(text)}>
        <PromptInputTextarea autoFocus placeholder="Escribe tu duda de estudio…" aria-label="Pregunta a Milo" />
        <PromptInputFooter className="justify-between">
          <div className="flex gap-1">
            <Button type="button" variant="ghost" size="sm" onClick={() => fileRef.current?.click()} aria-label="Subir archivo">
              <Paperclip />Archivo
            </Button>
            <Button type="button" variant="ghost" size="sm" disabled={!lastQuestion} aria-label="Buscar en la web"
              onClick={() => window.open(`https://es.wikipedia.org/w/index.php?search=${encodeURIComponent(lastQuestion)}`, "_blank", "noopener")}>
              <Globe />Buscar en la web
            </Button>
          </div>
          <PromptInputSubmit aria-label="Enviar pregunta" status={thinking ? "submitted" : "ready"} />
        </PromptInputFooter>
      </PromptInput>
    </div>
  );
}
