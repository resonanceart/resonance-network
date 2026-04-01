# Contributing to Resonance Network

## Workflow

1. **Create a feature branch** from `main`:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Build locally** before pushing:
   ```bash
   npm run build
   ```
   Fix any errors before proceeding. Every failed Vercel deploy wastes build minutes.

3. **Push your branch** to trigger a Vercel preview deploy:
   ```bash
   git push -u origin feature/your-feature-name
   ```

4. **Test the preview URL** — Vercel comments it on the PR automatically.
   Verify on both desktop and mobile (375px).

5. **Open a pull request** against `main` using the PR template.

6. **Merge to `main`** once approved — this triggers the production deploy.

## Rules

- Never push directly to `main`.
- Never run `vercel deploy --prod` manually — use git integration.
- Batch changes into one branch; avoid many small pushes to `main`.
