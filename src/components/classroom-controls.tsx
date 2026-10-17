import { useState } from "react";
import { Plus, School, Users, Trash2, Check, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { type Classroom, type Student } from "@/lib/aulaplus";

export function ClassroomControls({ classes, active, teacher, select, create, rename, updateStudents }: {
  classes: Classroom[]; active: Classroom; teacher: boolean;
  select: (id: string) => void; create: (name: string) => void; rename: (name: string) => void;
  updateStudents: (update: (students: Student[]) => Student[]) => void;
}) {
  const [creating, setCreating] = useState(false);
  const [managing, setManaging] = useState(false);
  const [name, setName] = useState("");
  const [studentName, setStudentName] = useState("");
  const [editing, setEditing] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  return <>
    <div className="classroom-bar">
      <div className="classroom-picker"><label htmlFor="class-picker"><School size={16} />Tus Aulas / Clases</label>
        <Select value={active.id} onValueChange={select}><SelectTrigger id="class-picker" aria-label="Tus Aulas / Clases"><SelectValue /></SelectTrigger><SelectContent>
          {classes.map((c) => <SelectItem value={c.id} key={c.id}>{c.name}</SelectItem>)}
        </SelectContent></Select>
      </div>
      {teacher && <div className="classroom-actions">
        <Button variant="outline" onClick={() => { setName(active.name); setManaging(true); }}><Users />Gestionar estudiantes</Button>
        <Button onClick={() => { setName(""); setCreating(true); }}><Plus />Crear Nueva Clase</Button>
      </div>}
    </div>
    <Dialog open={creating} onOpenChange={setCreating}><DialogContent>
      <DialogHeader><DialogTitle>Crear Nueva Clase</DialogTitle><DialogDescription>Una nueva aventura en equipo.</DialogDescription></DialogHeader>
      <form className="modal-form" onSubmit={(e) => { e.preventDefault(); if (!name.trim()) return; create(name); setCreating(false); }}>
        <label>Nombre de la clase<input className="field" value={name} onChange={(e) => setName(e.target.value)} placeholder={'Por ejemplo, 4° Secundaria "D"'} required maxLength={70} autoFocus /></label>
        <Button type="submit"><Plus />Crear clase</Button>
      </form>
    </DialogContent></Dialog>
    <Dialog open={managing} onOpenChange={setManaging}><DialogContent className="roster-dialog">
      <DialogHeader><DialogTitle>Gestionar estudiantes</DialogTitle><DialogDescription>{active.name} · {active.workspace.students.length} estudiantes</DialogDescription></DialogHeader>
      <form className="roster-form" onSubmit={(e) => { e.preventDefault(); if (name.trim()) rename(name.trim()); }}>
        <label htmlFor="class-name">Nombre de la clase</label><div className="roster-entry"><input id="class-name" className="field" value={name} onChange={(e) => setName(e.target.value)} maxLength={70} required /><Button type="submit" size="icon" aria-label="Guardar nombre de clase" title="Guardar nombre"><Check /></Button></div>
      </form>
      <form className="roster-form" onSubmit={(e) => { e.preventDefault(); if (!studentName.trim()) return; const s: Student = { id: crypto.randomUUID(), name: studentName.trim(), points: 0, tone: "mint" }; updateStudents((rows) => [...rows, s]); setStudentName(""); }}>
        <label htmlFor="student-name">Nuevo estudiante</label><div className="roster-entry"><input id="student-name" className="field" placeholder="Nombre y apellido" value={studentName} onChange={(e) => setStudentName(e.target.value)} maxLength={70} required /><Button type="submit" aria-label="Agregar estudiante"><Plus /></Button></div>
      </form>
      <div className="roster-list">
        {active.workspace.students.length === 0 && <p className="text-muted-foreground">Aún no hay estudiantes.</p>}
        {active.workspace.students.map((s) => <div className="roster-row" key={s.id}>
          {editing === s.id ? <form className="roster-entry" onSubmit={(e) => { e.preventDefault(); if (!editName.trim()) return; updateStudents((rows) => rows.map((row) => row.id === s.id ? { ...row, name: editName.trim() } : row)); setEditing(null); }}>
            <input aria-label="Editar nombre del estudiante" className="field" value={editName} onChange={(e) => setEditName(e.target.value)} required maxLength={70} /><Button size="icon" type="submit" aria-label="Guardar nombre del estudiante"><Check /></Button>
          </form> : <><span>{s.name}</span><Button variant="ghost" size="icon" aria-label={`Editar a ${s.name}`} title="Editar nombre" onClick={() => { setEditing(s.id); setEditName(s.name); }}><Pencil /></Button></>}
          <Button variant="ghost" size="icon" className="text-destructive" aria-label={`Eliminar a ${s.name}`} title="Eliminar estudiante" onClick={() => updateStudents((rows) => rows.filter((row) => row.id !== s.id))}><Trash2 /></Button>
        </div>)}
      </div>
    </DialogContent></Dialog>
  </>;
}