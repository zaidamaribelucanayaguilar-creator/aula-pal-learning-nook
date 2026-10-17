# Aula Pal Buddy

Crea un prototipo web interactivo completo, moderno, amigable y caricaturesco para una aplicación educativa llamada "AulaPlus" (estilo ClassDojo + NotebookLM/Gemini Notebooks). 

La aplicación debe contar con los siguientes elementos y flujos:

1. PANTALLA DE BIENVENIDA Y SELECCIÓN DE ROL (Onboarding):

- Pantalla de carga con logo interactivo.

- Selector claro de rol: "¿Eres Profesor o Estudiante?".

- Al hacer clic en un rol, la app debe adaptar su interfaz según el usuario.

2. VISTA DE ESTUDIANTE:

- Módulo de Cuadernos por Asignatura (estilo NotebookLM): El estudiante puede ver sus cuadernos actuales, pero TIENE la opción funcional de "+ Crear Nuevo Cuaderno" para agregar y nombrar todos los cuadernos que desee dinámicamente.

- Al entrar a un cuaderno:

  * Mostrar herramientas de estudio: Chat de orientación con IA (para dudas de estudio), Flashcards, Resúmenes, Apuntes y Tareas.

  * Mascota de Racha y Evolución por Cuaderno: Cada cuaderno tiene su propia mascota individual (estilo Duolingo/ClassDojo) que evoluciona según la calificación recibida (Perfecto = +2 pts, Bien = +1 pt, Necesita Repaso = 0 pts). Incluir una barra visual de nivel/progreso de la mascota.

- Calendario de Actividades: Para anotar exámenes, entregas de tareas, proyectos y rutinas de estudio.

3. VISTA DE PROFESOR:

- Panel de control de clase con la lista de estudiantes y sus mascotas.

- Creador de grupos interactivo (seleccionar cuántos estudiantes por grupo: 2, 3, 4, 5, 6+).

- Sistema de Feedback/Evaluación a estudiantes (otorgar o restar puntos por habilidades como "Trabajo en equipo", "Participó en clase", "Tarea sin hacer", etc.).

- Herramientas de Aula: Temporizador / Pomodoro, Medidor de ruido visual, Generador de alumnos al azar y Tablón de anuncios.

4. DISEÑO Y ESTILO VISUAL:

- Interfaz limpia, colorida, intuitiva y responsive (que se adapte perfectamente tanto a vista de Laptop/PC como a vista de Celular).

- Usar componentes de UI modernos (Shadcn UI / Tailwind CSS), iconos bonitos y badges de colores para los puntos y niveles.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://aula-pal-buddy.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/9d29f1de-afc1-5a7e-b3cd-d55621831670).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
