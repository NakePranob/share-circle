# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Share Circle** — Thai Savings Group (วงแชร์) management app. Users track multiple groups, payment schedules, wallet balance, and cashflow calendar. All data persists in localStorage (no backend).

## Commands

```bash
pnpm dev              # dev server
pnpm build            # production build
pnpm preview          # preview build
pnpm check            # type check (svelte-check + tsc)
pnpm check:watch      # type check watch mode
pnpm lint             # prettier + eslint check
pnpm format           # prettier write
pnpm storybook        # Storybook on :6006
```

No test runner script — Vitest and Playwright are installed but no npm script is wired up yet.

## Stack Gotchas

- **Svelte 5 runes only** — `$state`, `$derived`, `$effect`. No Svelte 4 stores syntax.
- **Tailwind CSS v4** — uses `@import "tailwindcss"` + Vite plugin, not `tailwind.config.js`. No `tw-` prefix, no `bg-[value]` escape syntax from v3 docs.
- **TypeScript v6** with strict mode + `bundler` moduleResolution.
- **pnpm** only. `npm`/`yarn` will break lockfile.

## Architecture

Feature-based modules under `src/features/`, shared primitives in `src/lib/`.

### Path Aliases
- `$lib` → `src/lib/`
- `$features` → `src/features/`

### Feature Modules (`src/features/`)
Each feature owns its types, stores, composables, utils, schemas, components:

| Feature | Responsibility |
|---------|---------------|
| `groups/` | Group + Round CRUD, payment calculations |
| `wallet/` | Wallet balance + manual transactions |
| `calendar/` | Cashflow calendar, day-level breakdown |
| `dashboard/` | Summary view composable |
| `audit/` | Transaction history table |
| `shared/` | Cross-feature date helpers |

### State Management
Generic store factory at [src/lib/stores/genericStore.svelte.ts](src/lib/stores/genericStore.svelte.ts) — creates CRUD stores with localStorage persistence via [src/lib/stores/persisted.svelte.ts](src/lib/stores/persisted.svelte.ts).

Feature stores (`groups.svelte.ts`, `wallet.svelte.ts`) wrap the generic factory and expose domain methods (`markRoundPaid`, `toggleActive`, etc.).

Use `$derived` for computed values; avoid duplicating state.

### Key Data Flow
`groupsStore` → composables (`useGroupActions`, `useCalendar`, `useDashboard`) → route `+page.svelte` components. Wallet transactions are a separate store that overlaps with group round events.

### UI Components
- shadcn-svelte components live in `$lib/components/ui/` — use these, don't re-implement.
- Icons: `@lucide/svelte`
- Toasts: `svelte-sonner`
- Drawers/sheets: `vaul-svelte`
- Class merging: `clsx` + `tailwind-merge`

### Forms
sveltekit-superforms + zod schemas (in `feature/schemas/`) + formsnap for rendering. See `src/features/groups/schemas/` for example.

### i18n
Paraglide-js. Message files in `messages/en.json` and `messages/th.json`. Auto-generated runtime in `src/lib/paraglide/`. Thai is primary locale — use `Intl.DateTimeFormat('th-TH', ...)` for dates, THB for currency.

## Svelte MCP Server

This project has a Svelte MCP server. Use it when writing Svelte code:
- `svelte-autofixer` — validate Svelte 5 syntax before delivering code
- `get-documentation` / `list-sections` — look up official docs
