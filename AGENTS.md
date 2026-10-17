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
- The prototype keeps app state in React and mirrors it to localStorage (one versioned key); tutor replies are local, web lookups use public Wikipedia and a URL-reader server function; no auth, database or AI services so previews work without connections.
- Classroom workspaces own notebooks, activities, student rosters and announcements; all updates target the active classroom ID so classes cannot leak changes into each other.
- Pet model rendering, appearance controls and classroom controls live in focused components; shared classroom and pet types remain in the browser-safe domain module so isolation can be unit tested.
