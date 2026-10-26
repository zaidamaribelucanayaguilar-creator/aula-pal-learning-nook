<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- AulaPlus uses a browser-safe domain module for notebook scoring and grouping so the same rules are unit tested.
- Student and teacher views are prototype modes, not authorization roles; feedback affects fictional demo students only.
- The prototype keeps app state in React and mirrors it to localStorage (one versioned key); web lookups use public Wikipedia and a URL-reader server function; no auth or database.
- The tutor chat streams from Lovable AI Gateway via the server route src/routes/api/public/tutor.ts (handler in src/lib/ai/tutor.server.ts, model openai/gpt-6-astra on Responses, ai@7 requires `instructions` instead of system messages); the local rule-based tutor in src/lib/tutor.ts is only the offline fallback.
- All imported text (web sources, files, notebook notes sent to the AI) passes through cleanImportedText in src/lib/clean-text.ts: HTML entity decoding plus web-junk line filtering; junk patterns must be line-anchored so educational lines mentioning "compartir" survive.
- Classroom workspaces own notebooks, activities, student rosters and announcements; all updates target the active classroom ID so classes cannot leak changes into each other.
- Pet model rendering, appearance controls and classroom controls live in focused components; shared classroom and pet types remain in the browser-safe domain module so isolation can be unit tested.
