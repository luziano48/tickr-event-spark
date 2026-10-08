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

- Keep the shared Tickr visual language in semantic CSS tokens and the Screen/BottomNav shell so color changes stay consistent across routes.
- Keep scroll-direction visibility and floating navigation inside BottomNav, with passive frame-throttled listeners, so page content and layouts remain unchanged.
- Use TanStack Router native view transitions for route changes and scope fades to Screen content, leaving navigation stationary and respecting reduced motion.
