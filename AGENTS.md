# AGENTS.md — Repository Invariants & Harness Contract
# samuelj90.github.io (Astro 5 + Tailwind + GitHub Pages)

## 1. Architectural Guardrails
- **Framework**: Astro 5 (Static Site Generation mode).
- **Styling**: Tailwind CSS with explicit dark mode support (`darkMode: 'class'`).
- **Zero FOUC (Flash of Unstyled Content)**: All themes must be initialized in `<head>` via an inline zero-flash script before rendering.
- **Routing**: Clean directory routes (`/blog/`, `/blog/<slug>/`). No hardcoded `.html` internal links in navigation or card anchors.

## 2. Content & Blog Contracts
- All engineering and product articles live in `src/content/blog/` as Markdown (`.md`).
- Every post schema must conform to `src/content.config.ts`:
  - `title`: string
  - `description`: string
  - `date`: string (YYYY-MM-DD)
  - `category`: string
  - `readingTime`: optional string
  - `tags`: string array
- Product architecture articles must include `tags: ["Product Showcase"]` to automatically trigger `SoftwareApplication` Schema.org JSON-LD structured data.

## 3. Commit & Identity Verification
- Author: strictly `Samuel J Mathew <samuelj90@gmail.com>`.
- Commit format: Conventional Commits (`feat:`, `fix:`, `docs:`, `ci:`, `refactor:`).
- Pre-commit quality gate verifies author email and prevents accidental secret/credential commits.

## 4. Verification Loop
Before pushing changes:
1. `npm run build` must complete with 0 errors.
2. Check routes in `dist/` to confirm all pages generated as clean directory routes.
