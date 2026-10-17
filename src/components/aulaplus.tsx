import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  BookOpen,
  LayoutGrid,
  CalendarDays,
  PawPrint,
  HelpCircle,
  ChevronDown,
  Bell,
  Flame,
  Star,
  Plus,
  ArrowUpRight,
  ArrowRight,
  ArrowLeft,
  Calculator,
  Leaf,
  MessageCircle,
  Landmark,
  GraduationCap,
  School,
  Users,
  Timer,
  Volume2,
  Shuffle,
  Megaphone,
  Check,
  Sparkles,
  X,
  Menu,
  Lightbulb,
  Trophy,
  Target,
  CheckCircle2,
  FileText,
  Layers,
  ListTodo,
  Send,
  RotateCcw,
  Play,
  Pause,
  Save,
  Cloud,
  Heart,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Pet, speciesLabels } from "./pet";
export { Pet } from "./pet";
import { ThemeSettings } from "./theme-settings";
import { ClassroomControls } from "./classroom-controls";
import { LoginScreen } from "./login-screen";
import { SourcesPanel } from "./sources-panel";
import { HelpCenter } from "./help-center";
import { StudyTools } from "./study-tools";
import { languages, t as tr } from "@/lib/i18n";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import {
  createEmptyClassrooms,
  toneOptions,
  type UserProfile,
  createClassroom,
  updateClassWorkspace,
  petSpecies,
  petNames,
  type PetSpecies,
  evaluate,
  petLevel,
  makeGroups,
  type Workspace,
  type Notebook,
  type Role,
  type Evaluation,
  type Student,
} from "@/lib/aulaplus";
import { toast } from "sonner";
import { StudyChat } from "./study-chat";

const icons = [Calculator, Leaf, MessageCircle, Landmark];
const tones = toneOptions;
export function Logo() {
  return (
    <div className="logo">
      <span className="logo-mark">
        <BookOpen size={23} strokeWidth={2.7} />
      </span>
      <span>
        Aula<span className="logo-plus">Plus</span>
        <span className="logo-plus">.</span>
      </span>
    </div>
  );
}
function Progress({ points, name }: { points: number; name: string }) {
  return (
    <div className="pet-progress">
      <div className="progress-label">
        <span>
          {name} · Nivel {petLevel(points)}
        </span>
        <span>{points % 10}/10 pts</span>
      </div>
      <div className="progress-track">
        <div className="progress-fill" style={{ width: `${(points % 10) * 10}%` }} />
      </div>
    </div>
  );
}
function Modal({
  open,
  onOpenChange,
  title,
  description,
  children,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {description || "Tu próxima aventura de aprendizaje empieza aquí."}
          </DialogDescription>
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  );
}

const STORE_KEY = "aulaplus:v1";

export function AulaPlus() {
  const [classes, setClasses] = useState(createEmptyClassrooms);
  const [activeId, setActiveId] = useState("class-0");
  const activeClass = classes.find((c) => c.id === activeId) ?? classes[0];
  const workspace = activeClass?.workspace;
  const setWorkspace = (update: (w: Workspace) => Workspace) =>
    setClasses((rows) => updateClassWorkspace(rows, activeId, update));
  const [role, setRole] = useState<Role>("student");
  const [roleModal, setRoleModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [nav, setNav] = useState("notebooks");
  const [mobile, setMobile] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [create, setCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [tone, setTone] = useState("mint");
  const [species, setSpecies] = useState<PetSpecies>("monster");
  const [help, setHelp] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loginOpen, setLoginOpen] = useState(false);
  const [profileMode, setProfileMode] = useState<"account" | "settings" | "edit">("account");
  const [draftName, setDraftName] = useState("");
  const userName = user?.name ?? "";
  const lang = user?.lang ?? "es";
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<Student | null>(null);
  const [notifications, setNotifications] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [restored, setRestored] = useState(false);
  useEffect(() => {
    let saved: { user?: UserProfile; classes?: typeof classes; activeId?: string; role?: Role } | null = null;
    try { saved = JSON.parse(localStorage.getItem(STORE_KEY) ?? "null"); } catch { saved = null; }
    if (saved?.classes?.length) setClasses(saved.classes);
    if (saved?.activeId) setActiveId(saved.activeId);
    if (saved?.role) { setRole(saved.role); setNav(saved.role === "student" ? "notebooks" : "class"); }
    if (saved?.user) setUser(saved.user);
    setRestored(true);
    const timeout = setTimeout(() => {
      setLoading(false);
      if (!saved?.user) setLoginOpen(true);
    }, 1400);
    return () => clearTimeout(timeout);
  }, []);
  useEffect(() => {
    if (!restored) return;
    try { localStorage.setItem(STORE_KEY, JSON.stringify({ user, classes, activeId, role })); } catch { /* almacenamiento lleno */ }
  }, [restored, user, classes, activeId, role]);
  async function save() {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 300));
    setSaving(false);
    toast.success("Avances guardados en este navegador.");
  }
  const changeNav = (key: string) => {
    setNav(key);
    setSelected(null);
    setMobile(false);
  };
  const chooseRole = (value: Role) => {
    setRole(value);
    setNav(value === "student" ? "notebooks" : "class");
    setSelected(null);
    setRoleModal(false);
  };
  if (!activeClass || !workspace) return null;
  const updateNotebook = (nb: Notebook) =>
    setWorkspace((w) => ({ ...w, notebooks: w.notebooks.map((n) => (n.id === nb.id ? nb : n)) }));
  const notebook = workspace.notebooks.find((n) => n.id === selected);
  const studentNav = [
    { key: "notebooks", label: tr(lang, "notebooks"), icon: LayoutGrid },
    { key: "calendar", label: tr(lang, "calendar"), icon: CalendarDays },
    { key: "pets", label: tr(lang, "pets"), icon: PawPrint },
  ];
  const teacherNav = [
    { key: "class", label: tr(lang, "class"), icon: School },
    { key: "groups", label: tr(lang, "groups"), icon: Users },
    { key: "tools", label: tr(lang, "tools"), icon: Timer },
    { key: "announcements", label: tr(lang, "announcements"), icon: Megaphone },
    { key: "calendar", label: "Calendario", icon: CalendarDays },
  ];
  const navItems = role === "student" ? studentNav : teacherNav;
  const pageTitle = notebook?.name || navItems.find((n) => n.key === nav)?.label || "AulaPlus";
  function addNotebook(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;
    const nb: Notebook = {
      id: crypto.randomUUID(),
      name: newName.trim(),
      subject: "Una nueva aventura por comenzar",
      tone,
      pet: petNames[species],
      species,
      points: 0,
      streak: 0,
      notes: "",
      tasks: [],
    };
    setWorkspace((w) => ({ ...w, notebooks: [...w.notebooks, nb] }));
    setCreate(false);
    setNewName("");
    toast.success(`¡Tu cuaderno de ${nb.name} está listo!`);
  }
  return (
    <>
      {loading && (
        <div className="loading-screen">
          <Button variant="ghost" onClick={() => setLoading(false)} aria-label="Abrir AulaPlus">
            <Logo />
          </Button>
          <p>Preparando tu próxima aventura…</p>
        </div>
      )}
      {loginOpen && !user && <LoginScreen onDone={(name, email) => { setUser({ name, email, lang: "es" }); setLoginOpen(false); setRoleModal(true); }} />}
      <div className="app-shell">
        <div
          className={`mobile-overlay ${mobile ? "open" : ""}`}
          onClick={() => setMobile(false)}
        />
        <aside className={`sidebar ${mobile ? "open" : ""}`}>
          <Logo />
          <div className="sidebar-label">MI ESPACIO DE APRENDIZAJE</div>
          <nav>
            {navItems.map((item) => (
              <Button
                variant="ghost"
                className={`nav-item ${nav === item.key ? "active" : ""}`}
                key={item.key}
                onClick={() => changeNav(item.key)}
              >
                <item.icon />
                {item.label}
              </Button>
            ))}
          </nav>
          <div className="sidebar-label">UN POCO MÁS</div>
          <Button variant="ghost" className="nav-item" onClick={() => setHelp(true)}>
            <HelpCircle />
            {tr(lang, "help")}
          </Button>
          <div className="side-mascot">
            <Pet />
            <h3 className="text-sm">¡Pequeños pasos, grandes logros!</h3>
            <p>Tu esfuerzo te hace crecer.</p>
          </div>
          <div className="profile">
            <span className="avatar">{userName.slice(0, 1)}</span>
            <div>
              <strong className="text-xs">
                {userName}
              </strong>
              <br />
              <small>
                {role === "student" ? "Estudiante" : "Profesor"}
              </small>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button title="Mi cuenta" aria-label="Mi cuenta" variant="ghost" size="icon" className="ml-auto">
                  <ChevronDown />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" side="top">
                {([["account", "Cuenta"], ["settings", "Configuración"], ["edit", "Editar Perfil"]] as const).map(([m, label]) => (
                  <DropdownMenuItem key={m} onSelect={() => { setProfileMode(m); setDraftName(userName); setProfileOpen(true); }}>{label}</DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </aside>
        <div className="main-shell">
          <header className="topbar">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                className="menu-toggle"
                onClick={() => setMobile(true)}
                aria-label="Abrir menú"
              >
                <Menu />
              </Button>
              <span className="topbar-title">{pageTitle}</span>
            </div>
            <div className="topbar-actions">
              <ThemeSettings />
              <Button variant="outline" className="role-pill" onClick={() => setRoleModal(true)}>
                {role === "student" ? <GraduationCap /> : <School />}
                {role === "student" ? "Modo estudiante" : "Modo profesor"}
                <ChevronDown />
              </Button>
              <Button
                title="Guardar avances"
                aria-label="Guardar avances"
                variant="ghost"
                size="icon"
                disabled={saving}
                onClick={() => void save()}
              >
                <Cloud />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="notification"
                aria-label="Notificaciones"
                onClick={() => setNotifications(true)}
              >
                <Bell size={19} />
              </Button>
              <span className="avatar">{userName.slice(0, 1)}</span>
            </div>
          </header>
          <main className="page">
            {role === "teacher" && <ClassroomControls
              classes={classes} active={activeClass} teacher
              select={(id) => { setActiveId(id); setSelected(null); setFeedback(null); }}
              create={(name) => {
                const c = createClassroom(crypto.randomUUID(), name);
                setClasses((rows) => [...rows, c]); setActiveId(c.id); setSelected(null); setNav("class");
                toast.success(`¡${c.name} está lista!`);
              }}
              rename={(name) => setClasses((rows) => rows.map((c) => c.id === activeId ? { ...c, name } : c))}
              updateStudents={(update) => setWorkspace((w) => ({ ...w, students: update(w.students) }))}
            />}
            {notebook ? (
              <NotebookView
                key={notebook.id}
                notebook={notebook}
                userName={userName}
                update={updateNotebook}
                back={() => setSelected(null)}
              />
            ) : nav === "calendar" ? (
              <CalendarView
                key={activeId}
                activities={workspace.activities}
                notebooks={workspace.notebooks}
                update={(activities) => setWorkspace((w) => ({ ...w, activities }))}
              />
            ) : nav === "pets" ? (
              <PetsView
                notebooks={workspace.notebooks}
                open={(id) => {
                  setNav("notebooks");
                  setSelected(id);
                }}
              />
            ) : nav === "class" ? (
              <>
                <div className="page-heading">
                  <div>
                    <h1>
                      {tr(lang, "hello")}, profe {userName}! <span className="text-primary">☀</span>
                    </h1>
                    <p className="subtitle">Tu clase está lista para una nueva aventura.</p>
                  </div>
                  <span className="pill mint">
                    <School size={13} />
                    {activeClass.name}
                  </span>
                </div>
                <div className="welcome-band">
                  <div className="welcome-copy">
                    <span className="pill mint">UN EQUIPO EXTRAORDINARIO</span>
                    <h2 className="mt-2">Juntos aprendemos más.</h2>
                    <p>
                      Cada participación cuenta. Celebra el esfuerzo y acompaña a tu clase en cada
                      paso.
                    </p>
                    <Button onClick={() => changeNav("groups")}>
                      <Users />
                      Crear grupos
                      <ArrowRight />
                    </Button>
                  </div>
                  <Pet />
                  <Star className="welcome-star" size={27} />
                </div>
                <div className="stats">
                  <Stat icon={Users} value={workspace.students.length} label="Estudiantes" />
                  <Stat
                    icon={Star}
                    value={workspace.students.reduce((s, n) => s + n.points, 0)}
                    label="Puntos de la clase"
                  />
                  <Stat icon={Trophy} value={activeClass.name} label="Mi gran equipo" />
                </div>
                <div className="section-heading">
                  <h2>Mi clase</h2>
                  <span className="pill mint">{workspace.students.length} presentes</span>
                </div>
                <div className="students-grid">
                  {workspace.students.map((s) => (
                    <article className="student-tile" key={s.id}>
                      <Button
                        variant="ghost"
                        className="student-select"
                        onClick={() => setFeedback(s)}
                      >
                        <Pet species={petSpecies[workspace.students.indexOf(s) % petSpecies.length] ?? "monster"} />
                        <h3>{s.name}</h3>
                        <span className="pill mint">
                          <Star size={12} />
                          {s.points} puntos
                        </span>
                      </Button>
                    </article>
                  ))}
                </div>
              </>
            ) : nav === "groups" ? (
              <GroupsView key={activeId} students={workspace.students} />
            ) : nav === "tools" ? (
              <ToolsView key={activeId} students={workspace.students} />
            ) : nav === "announcements" ? (
              <Announcements
                items={workspace.announcements}
                update={(announcements) => setWorkspace((w) => ({ ...w, announcements }))}
              />
            ) : (
              <>
                <div className="page-heading">
                  <div>
                    <h1>
                      {tr(lang, "hello")}, {userName}! <span className="text-primary">☀</span>
                    </h1>
                    <p className="subtitle">Un buen día para aprender algo increíble.</p>
                  </div>
                  <span className="date-chip">
                    <CalendarDays size={15} />
                    Viernes, 9 de octubre
                  </span>
                </div>
                <div className="welcome-band">
                  <div className="welcome-copy">
                    <span className="pill mint">
                      <Star size={11} />
                      CADA DÍA CUENTA
                    </span>
                    <h2 className="mt-2">
                      Tu próxima aventura
                      <br />
                      empieza en un cuaderno.
                    </h2>
                    <p>
                      Descubre, pregunta y aprende a tu ritmo.
                      <br />
                      Tus mascotas crecen contigo.
                    </p>
                    <Button
                      onClick={() => {
                        const first = workspace.notebooks[0];
                        if (first) setSelected(first.id);
                        else setCreate(true);
                      }}
                    >
                      ¡Vamos a aprender!
                      <ArrowRight />
                    </Button>
                  </div>
                  <Pet />
                  <Star className="welcome-star" size={27} />
                </div>
                <div className="stats">
                  <Stat
                    icon={BookOpen}
                    value={workspace.notebooks.length}
                    label="Cuadernos por explorar"
                  />
                  <Stat
                    icon={Flame}
                    value={Math.max(0, ...workspace.notebooks.map((n) => n.streak))}
                    label="Días de mejor racha"
                  />
                  <Stat
                    icon={Star}
                    value={workspace.notebooks.reduce((a, n) => a + n.points, 0)}
                    label="Puntos de aprendizaje"
                  />
                </div>
                <div className="dashboard-grid">
                  <section>
                    <div className="section-heading">
                      <div>
                        <h2>Mis cuadernos</h2>
                        <p>Un mundo nuevo en cada asignatura.</p>
                      </div>
                      <Button size="sm" onClick={() => setCreate(true)}>
                        <Plus />
                        Crear cuaderno
                      </Button>
                    </div>
                    <div className="notebook-grid">
                      {workspace.notebooks.map((n, i) => (
                        <NotebookCard
                          key={n.id}
                          notebook={n}
                          index={i}
                          open={() => setSelected(n.id)}
                        />
                      ))}
                    </div>
                  </section>
                  <aside className="dashboard-aside">
                    <section className="side-section">
                      <div className="section-heading">
                        <h3>Lo que viene</h3>
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label="Abrir calendario"
                          onClick={() => changeNav("calendar")}
                        >
                          <ArrowUpRight />
                        </Button>
                      </div>
                      {workspace.activities.slice(0, 3).map((a) => (
                        <ActivityRow key={a.id} activity={a} />
                      ))}
                      <Button
                        variant="link"
                        className="text-xs px-0 mt-3"
                        onClick={() => changeNav("calendar")}
                      >
                        Ver mi calendario
                        <ArrowRight />
                      </Button>
                    </section>
                    <section className="side-section">
                      <div className="section-heading">
                        <h3>Tu pequeño equipo</h3>
                        <span className="pill peach">
                          <Heart size={10} />
                          {workspace.notebooks.length}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">¡Tus compañeros de aventura!</p>
                      <div className="mini-pets">
                        {workspace.notebooks.slice(0, 3).map((n) => (
                          <div className="mini-pet" key={n.id}>
                            <Pet species={n.species} tone={n.tone} />
                            <p>{n.pet}</p>
                            <span className="text-[9px] text-muted-foreground">
                              Nivel {petLevel(n.points)}
                            </span>
                          </div>
                        ))}
                      </div>
                      <Button
                        variant="link"
                        className="text-xs px-0"
                        onClick={() => changeNav("pets")}
                      >
                        Conocer a mis mascotas
                        <ArrowRight />
                      </Button>
                    </section>
                    <div className="tip">
                      <h3>
                        <Lightbulb size={16} />
                        Un consejo de Milo
                      </h3>
                      <p>
                        Estudiar un poquito cada día es mejor que hacerlo todo de una vez. ¡Tú
                        puedes!
                      </p>
                    </div>
                  </aside>
                </div>
              </>
            )}
            <footer className="page-foot">
              <Heart size={11} />
              Hecho para aprender, crecer y disfrutar.
            </footer>
          </main>
        </div>
      </div>
      <Modal
        open={roleModal}
        onOpenChange={setRoleModal}
        title="¡Bienvenido a AulaPlus!"
        description="Un lugar para aprender y crecer juntos."
      >
        <div className="role-content">
          <Pet />
          <h1>¿Eres Profesor o Estudiante?</h1>
          <p className="onboarding-desc">Elige tu espacio y comienza la aventura.</p>
          <div className="role-options">
            <Button variant="outline" className="role-option" onClick={() => chooseRole("student")}>
              <GraduationCap />
              Soy estudiante<small>Mi curiosidad no tiene límites</small>
            </Button>
            <Button variant="outline" className="role-option" onClick={() => chooseRole("teacher")}>
              <School />
              Soy profesor<small>Inspiramos grandes ideas</small>
            </Button>
          </div>
          <p className="role-banner">Puedes cambiar de espacio cuando quieras.</p>
        </div>
      </Modal>
      <Modal open={create} onOpenChange={setCreate} title="Un nuevo cuaderno">
        <form className="modal-form" onSubmit={addNotebook}>
          <label>
            Nombre de tu cuaderno
            <input
              autoFocus
              className="field"
              placeholder="Por ejemplo, Inglés"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              required
              maxLength={70}
            />
          </label>
          <label>Tu compañero de aventura</label>
          <div className="pet-options">
            {petSpecies.map((kind) => <Button type="button" variant="outline" key={kind} className={`pet-option ${species === kind ? "selected" : ""}`} onClick={() => setSpecies(kind)} aria-label={speciesLabels[kind]} aria-pressed={species === kind}>
              <Pet species={kind} /><span>{speciesLabels[kind]}</span>{species === kind && <Check size={14} />}
            </Button>)}
          </div>
          <label>Elige un color</label>
          <div className="color-options">
            {tones.map((t) => (
              <Button
                variant="ghost"
                aria-label={`Color ${t}`}
                title={t}
                key={t}
                className={`color-choice tone-${t} ${tone === t ? "selected" : ""}`}
                onClick={() => setTone(t)}
                type="button"
              >
                {tone === t && <Check size={14} />}
              </Button>
            ))}
          </div>
          <Button type="submit">
            <Plus />
            Crear mi cuaderno
          </Button>
        </form>
      </Modal>
      <Modal
        open={help}
        onOpenChange={setHelp}
        title="Estamos para acompañarte"
        description="Preguntas frecuentes, guías y respuestas rápidas"
      >
        <HelpCenter />
      </Modal>
      <Modal
        open={notifications}
        onOpenChange={setNotifications}
        title="Tu buzón de novedades"
        description="Pequeñas noticias, grandes sonrisas."
      >
        {workspace.announcements.map((a) => (
          <div className="announcement" key={a.id}>
            <h3>{a.title}</h3>
            <p>{a.body}</p>
          </div>
        ))}
      </Modal>
      <Modal
        open={profileOpen}
        onOpenChange={setProfileOpen}
        title={profileMode === "account" ? "Mi cuenta" : profileMode === "settings" ? "Configuración" : "Editar Perfil"}
        description="Modo demo: tus datos viven en esta pestaña."
      >
        <div className="modal-form">
          {profileMode === "account" && <>
            <p><strong>{userName}</strong><br /><span className="text-muted-foreground">{user?.email}</span></p>
            <p className="text-sm">Rol: {role === "student" ? "Estudiante" : "Profesor"}</p>
            <Button onClick={() => void save()} disabled={saving}><Cloud />Guardar mis avances</Button>
          </>}
          {profileMode === "edit" && <form className="modal-form" onSubmit={(e) => { e.preventDefault(); if (!draftName.trim() || !user) return; setUser({ ...user, name: draftName.trim() }); toast.success("Nombre actualizado"); setProfileOpen(false); }}>
            <label>Tu nombre<input className="field" value={draftName} onChange={(e) => setDraftName(e.target.value)} maxLength={40} required /></label>
            <Button type="submit"><Check />Guardar</Button>
          </form>}
          {profileMode === "settings" && <label>Idioma
            <select className="field" value={lang} onChange={(e) => { if (user) setUser({ ...user, lang: e.target.value }); document.documentElement.lang = e.target.value; }}>
              {languages.map((l) => <option key={l.code} value={l.code}>{l.label}</option>)}
            </select>
            <small className="text-muted-foreground">El menú y los saludos cambian de idioma; el resto del contenido sigue en español por ahora.</small>
          </label>}
        </div>
      </Modal>
      <Modal
        open={Boolean(feedback)}
        onOpenChange={(v) => {
          if (!v) setFeedback(null);
        }}
        title={feedback ? `¡Un paso más, ${feedback.name.split(" ")[0] || ""}!` : "Evaluación"}
        description="Celebra habilidades y acompaña el aprendizaje."
      >
        <div className="modal-form">
          {[
            { name: "Trabajo en equipo", pts: 2, icon: Users },
            { name: "Participó en clase", pts: 1, icon: MessageCircle },
            { name: "Ayudó a un compañero", pts: 2, icon: Heart },
            { name: "Tarea sin hacer", pts: -1, icon: ListTodo },
          ].map((skill) => (
            <Button
              variant="outline"
              className="justify-between h-12"
              key={skill.name}
              onClick={() => {
                if (!feedback) return;
                setWorkspace((w) => ({
                  ...w,
                  students: w.students.map((s) =>
                    s.id === feedback.id ? { ...s, points: Math.max(0, s.points + skill.pts) } : s,
                  ),
                }));
                toast.success(
                  `${skill.name}: ${skill.pts > 0 ? "+" : ""}${skill.pts} ${Math.abs(skill.pts) === 1 ? "punto" : "puntos"}`,
                );
                setFeedback(null);
              }}
            >
              <span className="flex items-center gap-3">
                <skill.icon />
                {skill.name}
              </span>
              <span className={`pill ${skill.pts > 0 ? "mint" : "peach"}`}>
                {skill.pts > 0 ? "+" : ""}
                {skill.pts}
              </span>
            </Button>
          ))}
        </div>
      </Modal>
    </>
  );
}
function Stat({
  icon: Icon,
  value,
  label,
}: {
  icon: typeof BookOpen;
  value: number | string;
  label: string;
}) {
  return (
    <div className="stat">
      <div className="stat-icon">
        <Icon size={22} />
      </div>
      <div>
        <strong>{value}</strong>
        <small>{label}</small>
      </div>
    </div>
  );
}
function NotebookCard({
  notebook: n,
  index,
  open,
}: {
  notebook: Notebook;
  index: number;
  open: () => void;
}) {
  const Icon = icons[index % 4] || BookOpen;
  return (
    <article className={`notebook tone-${n.tone}`}>
      <div className="notebook-cover">
        <span className="subject-icon">
          <Icon size={18} />
        </span>
        <span className={`pill ${n.tone}`}>
          <Star size={10} />
          Nivel {petLevel(n.points)}
        </span>
        <Pet species={n.species} tone={n.tone} />
      </div>
      <div className="notebook-body">
        <h3>{n.name}</h3>
        <p>{n.subject}</p>
        <Progress points={n.points} name={n.pet} />
        <div className="notebook-footer">
          <span>
            <Flame size={13} />
            {n.streak} días de racha
          </span>
          <Button variant="ghost" className="open-notebook" onClick={open}>
            Abrir cuaderno
            <ArrowUpRight size={14} />
          </Button>
        </div>
      </div>
    </article>
  );
}
function ActivityRow({ activity: a }: { activity: Workspace["activities"][number] }) {
  const day = Number(a.date.split("-")[2]);
  const month = Number(a.date.split("-")[1]);
  return (
    <div className="activity">
      <div className="activity-date">
        <strong>{day}</strong>
        <small>
          {
            ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"][
              month - 1
            ]
          }
        </small>
      </div>
      <div>
        <h4>{a.title}</h4>
        <span
          className={`pill ${a.type === "Examen" ? "peach" : a.type === "Proyecto" ? "sky" : "mint"}`}
        >
          {a.type}
        </span>
        <p>{a.subject}</p>
      </div>
    </div>
  );
}
function NotebookView({
  notebook: n,
  update,
  back,
  userName = "",
}: {
  notebook: Notebook;
  update: (n: Notebook) => void;
  back: () => void;
  userName?: string;
}) {
  const [tab, setTab] = useState("chat");
  const card = n.studio?.card ?? 0;
  const [flipped, setFlipped] = useState(false);
  const [note, setNote] = useState(n.notes);
  const [task, setTask] = useState("");
  const sentences = n.notes.split(/[.!?]\s*/).filter((s) => s.trim().length > 3);
  const cards = sentences.length
    ? sentences.slice(0, 40).map((s, i) => ({
        question: `¿Qué recuerdas de la idea ${i + 1} en ${n.name}?`,
        answer: s,
      }))
    : [
        {
          question: `¿Qué te gustaría aprender en ${n.name}?`,
          answer: "Añade tus apuntes y crea tu primera idea de estudio.",
        },
      ];
  const known = n.studio?.known ?? [];
  const review = n.studio?.review ?? [];
  const cur = card % cards.length;
  const goCard = (i: number) => { setFlipped(false); update({ ...n, studio: { ...n.studio, card: (i + cards.length) % cards.length } }); };
  const mark = (kind: "known" | "review") => {
    const k = known.filter((x) => x !== cur), r = review.filter((x) => x !== cur);
    (kind === "known" ? k : r).push(cur);
    setFlipped(false);
    update({ ...n, studio: { ...n.studio, known: k, review: r, card: (cur + 1) % cards.length } });
    toast.success(kind === "known" ? "¡Genial! Tarjeta dominada 💚" : "La repasaremos pronto 📌");
  };
  return (
    <>
      <Button variant="ghost" className="px-0 text-muted-foreground mb-4" onClick={back}>
        <ArrowLeft />
        Mis cuadernos
      </Button>
      <div className="page-heading">
        <div>
          <h1>{n.name}</h1>
          <p className="subtitle">Una pregunta, un descubrimiento, un paso más.</p>
        </div>
        <span className="pill peach">
          <Flame size={14} />
          {n.streak} días
        </span>
      </div>
      <div className="tab-row">
        {[
          { id: "chat", label: "Chat de orientación", icon: MessageCircle },
          { id: "flashcards", label: "Flashcards", icon: Layers },
          { id: "summary", label: "Resúmenes", icon: FileText },
          { id: "sources", label: "Fuentes", icon: FileText },
          { id: "notes", label: "Apuntes", icon: BookOpen },
          { id: "tasks", label: "Tareas", icon: ListTodo },
          { id: "studyplus", label: "Estudio+", icon: Sparkles },
        ].map((t) => (
          <Button
            variant="ghost"
            className={`study-tab ${tab === t.id ? "active" : ""}`}
            key={t.id}
            onClick={() => setTab(t.id)}
          >
            <t.icon />
            {t.label}
          </Button>
        ))}
      </div>
      <div className="study-layout">
        <section>
          {tab === "chat" ? (
            <StudyChat key={n.id} notebook={n} userName={userName} addNotes={(txt) => update({ ...n, notes: n.notes ? `${n.notes}\n\n${txt}` : txt })} />
          ) : tab === "studyplus" ? (
            <StudyTools notebook={n} update={update} />
          ) : tab === "sources" ? (
            <SourcesPanel notebook={n} update={update} />
          ) : tab === "flashcards" ? (
            <div className="flash-studio">
              <div className="flash-meta">
                <span className="pill lilac">Tarjeta {(card % cards.length) + 1} de {cards.length}</span>
                <span className="pill mint"><Check size={14} />Lo sé: {known.length}</span>
                <span className="pill peach">Repasar: {review.length}</span>
              </div>
              <div className="flash-progress" aria-label="Progreso"><span style={{ width: `${Math.round(((known.length + review.length) / cards.length) * 100)}%` }} /></div>
              <button type="button" className={`flip-card ${flipped ? "flipped" : ""}`} onClick={() => setFlipped((v) => !v)} aria-label="Voltear tarjeta">
                <span className="flip-inner">
                  <span className="flip-face front"><small>PREGUNTA</small><strong>{cards[card % cards.length]?.question}</strong><em><RotateCcw size={14} /> Toca para voltear</em></span>
                  <span className="flip-face back"><small>RESPUESTA</small><strong>{cards[card % cards.length]?.answer}</strong><em><RotateCcw size={14} /> Toca para volver</em></span>
                </span>
              </button>
              <div className="flash-nav">
                <Button variant="outline" size="icon" aria-label="Tarjeta anterior" onClick={() => goCard(card - 1)}><ChevronLeft /></Button>
                <Button variant="outline" className="flash-review" onClick={() => mark("review")}>Necesita repaso</Button>
                <Button className="flash-known" onClick={() => mark("known")}><Check />Lo sé</Button>
                <Button variant="outline" size="icon" aria-label="Siguiente tarjeta" onClick={() => goCard(card + 1)}><ChevronRight /></Button>
              </div>
              {known.length + review.length > 0 && <Button variant="ghost" size="sm" className="justify-self-center" onClick={() => update({ ...n, studio: { ...n.studio, known: [], review: [], card: 0 } })}><RotateCcw />Reiniciar mazo</Button>}
            </div>
          ) : tab === "summary" ? (
            <div className="study-text">
              <h2>Las ideas más importantes</h2>
              {sentences.length ? (
                <ul className="list-disc pl-6 mt-5">
                  {sentences.map((s, i) => (
                    <li key={i}>{s}.</li>
                  ))}
                </ul>
              ) : (
                <p className="subtitle">
                  Añade apuntes a este cuaderno para reunir tus ideas más importantes.
                </p>
              )}
              <div className="tip mt-8">
                <h3>
                  <Lightbulb size={16} />
                  Un paso más
                </h3>
                <p>¿Puedes explicar estas ideas con tus propias palabras?</p>
              </div>
            </div>
          ) : tab === "notes" ? (
            <>
              <div className="section-heading">
                <h2>Mis apuntes</h2>
                <Button
                  onClick={() => {
                    update({ ...n, notes: note });
                    toast.success("Apuntes actualizados");
                  }}
                >
                  <Save />
                  Guardar
                </Button>
              </div>
              <textarea
                className="field notes-editor study-text"
                aria-label="Mis apuntes"
                placeholder="Escribe aquí lo que aprendiste hoy…"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </>
          ) : (
            <>
              <h2>Mis tareas</h2>
              <form
                className="inline-form"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (task.trim()) {
                    update({
                      ...n,
                      tasks: [
                        ...n.tasks,
                        { id: crypto.randomUUID(), title: task.trim(), done: false },
                      ],
                    });
                    setTask("");
                  }
                }}
              >
                <input
                  aria-label="Nueva tarea"
                  className="field"
                  placeholder="Una nueva misión…"
                  value={task}
                  onChange={(e) => setTask(e.target.value)}
                  required
                />
                <Button type="submit" size="icon" aria-label="Agregar tarea">
                  <Plus />
                </Button>
              </form>
              {n.tasks.length ? (
                n.tasks.map((t) => (
                  <div className={`task-row ${t.done ? "done" : ""}`} key={t.id}>
                    <input
                      type="checkbox"
                      aria-label={`Completar ${t.title}`}
                      checked={t.done}
                      onChange={() =>
                        update({
                          ...n,
                          tasks: n.tasks.map((v) => (v.id === t.id ? { ...v, done: !v.done } : v)),
                        })
                      }
                    />
                    <span>{t.title}</span>
                    <Button
                      className="ml-auto"
                      variant="ghost"
                      size="icon"
                      aria-label={`Eliminar ${t.title}`}
                      onClick={() => update({ ...n, tasks: n.tasks.filter((v) => v.id !== t.id) })}
                    >
                      <X />
                    </Button>
                  </div>
                ))
              ) : (
                <div className="empty">¡Todo al día! Agrega tu próxima misión.</div>
              )}
            </>
          )}
        </section>
        <aside>
          <div className={`study-pet tone-${n.tone}`}>
            <Pet species={n.species} tone={n.tone} className={petLevel(n.points) >= 4 ? "evolved" : ""} />
            <div>
              <span className={`pill ${n.tone}`}>
                {petLevel(n.points) >= 4
                  ? "Explorador estrella"
                  : petLevel(n.points) >= 2
                    ? "Pequeño explorador"
                    : "Nuevo compañero"}
              </span>
              <h2 className="mt-3">{n.pet}</h2>
              <p className="text-xs mt-2">Tu compañero de {n.name}</p>
              <Progress points={n.points} name={n.pet} />
              <span className={`pill ${n.tone}`}>
                <Star size={12} />
                {n.points} puntos
              </span>
            </div>
          </div>
          <div className="grade-actions">
            <p className="text-xs text-muted-foreground text-center">
              ¿Cómo te fue en esta sesión?
            </p>
            {(["Perfecto", "Bien", "Necesita Repaso"] as Evaluation[]).map((g, i) => (
              <Button
                key={g}
                variant={i === 0 ? "default" : "outline"}
                onClick={() => {
                  update({ ...n, points: evaluate(n.points, g) });
                  toast.success(`${g}: +${i === 0 ? 2 : i === 1 ? 1 : 0} puntos para ${n.pet}`);
                }}
              >
                {i === 0 ? <Star /> : i === 1 ? <CheckCircle2 /> : <RotateCcw />}
                {g}
                <span className="ml-auto text-xs">+{i === 0 ? 2 : i === 1 ? 1 : 0}</span>
              </Button>
            ))}
          </div>
        </aside>
      </div>
    </>
  );
}
function PetsView({ notebooks, open }: { notebooks: Notebook[]; open: (id: string) => void }) {
  return (
    <>
      <div className="page-heading">
        <div>
          <h1>Mis compañeros de aventura</h1>
          <p className="subtitle">Cada uno crece con lo que aprendes en su cuaderno.</p>
        </div>
        <PawPrint className="text-primary" size={30} />
      </div>
      <div className="notebook-grid">
        {notebooks.map((n) => (
          <article className={`student-tile tone-${n.tone}`} key={n.id}>
            <Pet species={n.species} tone={n.tone} className={petLevel(n.points) >= 4 ? "evolved" : ""} />
            <h2>{n.pet}</h2>
            <p className="text-muted-foreground text-xs mt-2">{n.name}</p>
            <Progress points={n.points} name={n.pet} />
            <Button variant="outline" onClick={() => open(n.id)}>
              Seguir aprendiendo
              <ArrowRight />
            </Button>
          </article>
        ))}
      </div>
    </>
  );
}
function CalendarView({
  activities,
  notebooks,
  update,
}: {
  activities: Workspace["activities"];
  notebooks: Notebook[];
  update: (a: Workspace["activities"]) => void;
}) {
  const [month, setMonth] = useState(9);
  const [year, setYear] = useState(2026);
  const [date, setDate] = useState("2026-10-09");
  const [modal, setModal] = useState(false);
  const [title, setTitle] = useState("");
  const [type, setType] = useState("Examen");
  const [subject, setSubject] = useState(notebooks[0]?.name || "General");
  const [evTone, setEvTone] = useState<string>("mint");
  const monthNames = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ];
  const days = new Date(year, month + 1, 0).getDate();
  const offset = (new Date(year, month, 1).getDay() + 6) % 7;
  function move(delta: number) {
    const d = new Date(year, month + delta, 1);
    setYear(d.getFullYear());
    setMonth(d.getMonth());
  }
  return (
    <>
      <div className="page-heading">
        <div>
          <h1>Mi calendario</h1>
          <p className="subtitle">Un pequeño plan para grandes logros.</p>
        </div>
        <Button onClick={() => setModal(true)}>
          <Plus />
          Nueva actividad
        </Button>
      </div>
      <div className="calendar-layout">
        <div className="calendar">
          <div className="section-heading">
            <h2>
              {monthNames[month]} {year}
            </h2>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                aria-label="Mes anterior"
                onClick={() => move(-1)}
              >
                <ChevronLeft />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Mes siguiente"
                onClick={() => move(1)}
              >
                <ChevronRight />
              </Button>
            </div>
          </div>
          <div className="calendar-grid">
            {["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"].map((d) => (
              <div key={d} className="weekday">
                {d}
              </div>
            ))}
            {Array.from({ length: offset }, (_, i) => (
              <div className="day" key={`empty${i}`} />
            ))}
            {Array.from({ length: days }, (_, i) => {
              const day = i + 1;
              const iso = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
              return (
                <div className={`day ${iso === date ? "selected" : ""}`} key={day}>
                  <Button
                    variant="ghost"
                    className="calendar-day-btn"
                    aria-label={`Día ${day}`}
                    onClick={() => setDate(iso)}
                  >
                    {day}
                  </Button>
                  {activities
                    .filter((a) => a.date === iso)
                    .map((a) => (
                      <span className={`day-event tone-${a.tone ?? "mint"}`} key={a.id} title={a.title}>
                        {a.title}
                      </span>
                    ))}
                </div>
              );
            })}
          </div>
        </div>
        <section>
          <div className="section-heading">
            <h3>Mis actividades</h3>
            <span className="pill mint">{activities.length}</span>
          </div>
          {activities
            .slice()
            .sort((a, b) => a.date.localeCompare(b.date))
            .map((a) => (
              <div className="flex items-center gap-2" key={a.id}>
                <div className="flex-1">
                  <ActivityRow activity={a} />
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`Eliminar actividad ${a.title}`}
                  onClick={() => update(activities.filter((v) => v.id !== a.id))}
                >
                  <X />
                </Button>
              </div>
            ))}
        </section>
      </div>
      <Modal
        open={modal}
        onOpenChange={setModal}
        title="Una nueva actividad"
        description="Reserva un momento para tu aprendizaje."
      >
        <form
          className="modal-form"
          onSubmit={(e) => {
            e.preventDefault();
            if (!title.trim()) return;
            update([
              ...activities,
              { id: crypto.randomUUID(), title: title.trim(), date, type, subject, tone: evTone },
            ]);
            setTitle("");
            setModal(false);
            toast.success("Actividad agregada al calendario");
          }}
        >
          <label>
            Nombre
            <input
              className="field"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="¿Qué tienes planeado?"
            />
          </label>
          <label>
            Fecha
            <input
              className="field"
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </label>
          <label>
            Tipo
            <select className="field" value={type} onChange={(e) => setType(e.target.value)}>
              {["Examen", "Tarea", "Proyecto", "Estudio"].map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </label>
          <label>
            Asignatura
            <select className="field" value={subject} onChange={(e) => setSubject(e.target.value)}>
              <option>General</option>
              {notebooks.map((n) => (
                <option key={n.id}>{n.name}</option>
              ))}
            </select>
          </label>
          <label>Color</label>
          <div className="color-options">
            {toneOptions.map((c) => (
              <Button type="button" variant="ghost" key={c} aria-label={`Color ${c}`} className={`color-choice tone-${c} ${evTone === c ? "selected" : ""}`} onClick={() => setEvTone(c)}>
                {evTone === c && <Check size={14} />}
              </Button>
            ))}
          </div>
          <Button type="submit">
            <CalendarDays />
            Agregar actividad
          </Button>
        </form>
      </Modal>
    </>
  );
}
function GroupsView({ students }: { students: Student[] }) {
  const [size, setSize] = useState(3);
  const [groups, setGroups] = useState<Student[][]>([]);
  return (
    <>
      <div className="page-heading">
        <div>
          <h1>¡Juntos somos un gran equipo!</h1>
          <p className="subtitle">Mezcla ideas y descubre nuevas formas de aprender.</p>
        </div>
        <Users className="text-primary" size={30} />
      </div>
      <div className="section-heading">
        <h3>Estudiantes por grupo</h3>
        <span className="pill mint">{students.length} estudiantes</span>
      </div>
      <div className="flex gap-3 flex-wrap">
        {[2, 3, 4, 5, 6].map((n) => (
          <Button variant={size === n ? "default" : "outline"} key={n} onClick={() => setSize(n)}>
            {n === 6 ? "6+" : n}
          </Button>
        ))}
        {size >= 6 && (
          <input
            type="number"
            className="field max-w-24"
            min={6}
            max={students.length}
            aria-label="Estudiantes por grupo 6 o más"
            value={size}
            onChange={(e) =>
              setSize(Math.max(6, Math.min(students.length, Number(e.target.value))))
            }
          />
        )}
        <Button
          className="ml-auto"
          onClick={() => {
            const shuffled = [...students];
            for (let i = shuffled.length - 1; i > 0; i--) {
              const j = Math.floor(Math.random() * (i + 1));
              const a = shuffled[i];
              const b = shuffled[j];
              if (a && b) {
                shuffled[i] = b;
                shuffled[j] = a;
              }
            }
            setGroups(makeGroups(shuffled, size));
            toast.success("¡Los equipos están listos!");
          }}
        >
          <Shuffle />
          {groups.length ? "Mezclar de nuevo" : "Crear grupos"}
        </Button>
      </div>
      {groups.length ? (
        <div className="group-grid">
          {groups.map((g, i) => (
            <div className="group-card" key={i}>
              <h3>
                Equipo {i + 1}
                <span className="pill mint ml-3">{g.length}</span>
              </h3>
              {g.map((s) => (
                <p key={s.id}>{s.name}</p>
              ))}
            </div>
          ))}
        </div>
      ) : (
        <div className="empty mt-10">
          <Pet className="w-40 h-40 mx-auto" />
          <h3>Hay grandes ideas esperando un equipo.</h3>
        </div>
      )}
    </>
  );
}
function ToolsView({ students }: { students: Student[] }) {
  const [seconds, setSeconds] = useState(1500);
  const [running, setRunning] = useState(false);
  const [duration, setDuration] = useState(25);
  const [random, setRandom] = useState<Student | null>(null);
  const [noise, setNoise] = useState(0);
  const [listening, setListening] = useState(false);
  const [noiseMode, setNoiseMode] = useState(false);
  const streamRef = useRef<MediaStream | null>(null);
  const contextRef = useRef<AudioContext | null>(null);
  const rafRef = useRef<number>(0);
  useEffect(() => {
    if (!running) return;
    const interval = setInterval(
      () =>
        setSeconds((s) => {
          if (s <= 1) {
            setRunning(false);
            toast.success("¡Tiempo cumplido! Una pausa bien merecida.");
            return 0;
          }
          return s - 1;
        }),
      1000,
    );
    return () => clearInterval(interval);
  }, [running]);
  useEffect(
    () => () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      void contextRef.current?.close();
      cancelAnimationFrame(rafRef.current);
    },
    [],
  );
  async function listen() {
    if (listening) {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      void contextRef.current?.close();
      cancelAnimationFrame(rafRef.current);
      setListening(false);
      setNoise(0);
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const context = new AudioContext();
      contextRef.current = context;
      const analyser = context.createAnalyser();
      context.createMediaStreamSource(stream).connect(analyser);
      analyser.fftSize = 256;
      const data = new Uint8Array(analyser.frequencyBinCount);
      setListening(true);
      setNoiseMode(false);
      const tick = () => {
        analyser.getByteFrequencyData(data);
        setNoise(Math.min(100, Math.round(data.reduce((a, b) => a + b, 0) / data.length / 1.3)));
        rafRef.current = requestAnimationFrame(tick);
      };
      tick();
    } catch {
      toast.error("No se pudo acceder al micrófono. Puedes probar el medidor manual.");
      setNoiseMode(true);
    }
  }
  return (
    <>
      <div className="page-heading">
        <div>
          <h1>Un aula llena de posibilidades</h1>
          <p className="subtitle">Más concentración, participación y buenos momentos.</p>
        </div>
      </div>
      <div className="tools-grid">
        <section className="tool-panel">
          <h2>
            <Timer className="text-primary" />
            Tiempo de concentración
          </h2>
          <div className="tool-controls mt-5">
            {[5, 15, 25].map((m) => (
              <Button
                key={m}
                size="sm"
                variant={duration === m ? "default" : "outline"}
                onClick={() => {
                  setDuration(m);
                  setSeconds(m * 60);
                  setRunning(false);
                }}
              >
                {m} min
              </Button>
            ))}
            <input
              type="number"
              className="field max-w-20"
              aria-label="Minutos del temporizador"
              min={1}
              max={180}
              value={duration}
              onChange={(e) => {
                const m = Math.max(1, Math.min(180, Number(e.target.value)));
                setDuration(m);
                setSeconds(m * 60);
                setRunning(false);
              }}
            />
          </div>
          <div className="timer-display">
            {String(Math.floor(seconds / 60)).padStart(2, "0")}:
            {String(seconds % 60).padStart(2, "0")}
          </div>
          <div className="tool-controls">
            <Button onClick={() => setRunning(!running)} disabled={seconds === 0}>
              {running ? <Pause /> : <Play />}
              {running ? "Pausar" : "Comenzar"}
            </Button>
            <Button
              variant="outline"
              aria-label="Reiniciar temporizador"
              onClick={() => {
                setRunning(false);
                setSeconds(duration * 60);
              }}
            >
              <RotateCcw />
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setRunning(false);
                setDuration(5);
                setSeconds(300);
              }}
            >
              Descanso
            </Button>
          </div>
        </section>
        <section className="tool-panel">
          <h2>
            <Volume2 className="text-primary" />
            El volumen de nuestra clase
          </h2>
          <div className="noise-bars">
            {Array.from({ length: 15 }, (_, i) => (
              <div
                className="noise-bar"
                key={i}
                style={{
                  height: `${12 + (noise / 100) * 72 * (1 - Math.abs(i - 7) / 10)}px`,
                  opacity: i < noise / 7 ? 1 : 0.2,
                }}
              />
            ))}
          </div>
          <div className="text-center mb-5">
            <span className={`pill ${noise > 65 ? "peach" : "mint"}`}>
              {noise > 65
                ? "¡Bajemos un poquito la voz!"
                : noise > 30
                  ? "Estamos conversando"
                  : "Un ambiente tranquilo"}
            </span>
          </div>
          <div className="tool-controls">
            <Button onClick={() => void listen()}>
              <Volume2 />
              {listening ? "Detener micrófono" : "Activar micrófono"}
            </Button>
            <Button variant="outline" onClick={() => setNoiseMode((v) => !v)}>
              Prueba manual
            </Button>
          </div>
          {noiseMode && (
            <input
              type="range"
              aria-label="Nivel de ruido manual"
              min={0}
              max={100}
              value={noise}
              onChange={(e) => setNoise(Number(e.target.value))}
              className="w-full mt-6"
            />
          )}
        </section>
        <section className="tool-panel">
          <h2>
            <Shuffle className="text-primary" />
            ¿Quién participa ahora?
          </h2>
          <div className="random-student">
            <Pet tone={random?.tone || "mint"} />
            <h2>{random?.name || "¡Todos tienen una oportunidad!"}</h2>
          </div>
          <div className="tool-controls">
            <Button
              onClick={() => {
                const next = students[Math.floor(Math.random() * students.length)];
                if (next) setRandom(next);
              }}
            >
              <Shuffle />
              Elegir estudiante
            </Button>
          </div>
        </section>
        <section className="tool-panel">
          <h2>
            <Target className="text-primary" />
            Nuestra pequeña meta
          </h2>
          <Pet className="w-36 h-36 mx-auto mt-5" />
          <p className="text-center text-muted-foreground leading-7">
            Hoy escuchamos con atención,
            <br />
            preguntamos con curiosidad
            <br />y aprendemos en equipo.
          </p>
        </section>
      </div>
    </>
  );
}
function Announcements({
  items,
  update,
}: {
  items: Workspace["announcements"];
  update: (n: Workspace["announcements"]) => void;
}) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  return (
    <>
      <div className="page-heading">
        <div>
          <h1>Noticias de nuestra clase</h1>
          <p className="subtitle">Todo lo importante, en un solo lugar.</p>
        </div>
        <Button onClick={() => setOpen(true)}>
          <Plus />
          Nuevo anuncio
        </Button>
      </div>
      {items.map((a) => (
        <article className="announcement" key={a.id}>
          <div className="flex items-center justify-between">
            <h2>{a.title}</h2>
            <Button
              variant="ghost"
              size="icon"
              aria-label={`Eliminar anuncio ${a.title}`}
              onClick={() => update(items.filter((v) => v.id !== a.id))}
            >
              <X />
            </Button>
          </div>
          <p>{a.body}</p>
          <span className="pill mint mt-4">
            <Megaphone size={12} />
            Para toda la clase
          </span>
        </article>
      ))}
      {!items.length && <div className="empty">Tu tablón está listo para una buena noticia.</div>}
      <Modal open={open} onOpenChange={setOpen} title="Una noticia para compartir">
        <form
          className="modal-form"
          onSubmit={(e) => {
            e.preventDefault();
            if (!title.trim() || !body.trim()) return;
            update([{ id: crypto.randomUUID(), title: title.trim(), body: body.trim() }, ...items]);
            setTitle("");
            setBody("");
            setOpen(false);
            toast.success("¡Anuncio publicado en el tablón!");
          }}
        >
          <label>
            Título
            <input
              className="field"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </label>
          <label>
            Mensaje
            <textarea
              className="field min-h-32"
              required
              value={body}
              onChange={(e) => setBody(e.target.value)}
            />
          </label>
          <Button type="submit">
            <Send />
            Publicar anuncio
          </Button>
        </form>
      </Modal>
    </>
  );
}
