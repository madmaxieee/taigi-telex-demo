# Agent Instructions for taigi-telex-demo

This is a Svelte 5 + TypeScript project for Taiwanese Telex input method.

## Build Commands

```bash
# Development server
bun run dev

# Build for production
bun run build

# Preview production build (uses Wrangler)
bun run preview

# Type checking
bun run check
bun run check:watch
```

## Lint & Format Commands

```bash
# Run linting (prettier + eslint)
bun run lint

# Fix formatting
bun run format
```

**Note:** This project does not have a test framework configured yet. If adding tests, use Vitest with `@testing-library/svelte` and run single tests with `vitest run -t "test name pattern"`.

## Database Commands (Drizzle ORM)

```bash
# Push schema changes to database
bun run db:push

# Generate migration files
bun run db:generate

# Run migrations
bun run db:migrate

# Open Drizzle Studio
bun run db:studio

# Generate Wrangler types
bun run gen
```

## Code Style Guidelines

### Formatting (Prettier)

- **Indentation:** Tabs (not spaces)
- **Quotes:** Single quotes
- **Trailing commas:** Never
- **Print width:** 100 characters
- **Plugins:** prettier-plugin-svelte, prettier-plugin-tailwindcss

### TypeScript

- **Strict mode:** Enabled
- **Import style:** ES modules (`"type": "module"`)
- **File extensions:** Use `.ts` for scripts, `.svelte` for components
- **Relative imports:** Rewrite extensions enabled

### Naming Conventions

- **Variables/functions:** camelCase
- **Components:** PascalCase (Svelte files)
- **Constants:** UPPER_SNAKE_CASE for true constants
- **Types/Interfaces:** PascalCase
- **Database tables:** snake_case (Drizzle convention)

### Import Patterns

```typescript
// Svelte imports
import { $state, $effect, $props } from 'svelte';

// Library imports (use $lib alias)
import { myUtil } from '$lib/myUtil';
import { db } from '$lib/server/db';

// Node built-ins
import { randomUUID } from 'node:crypto';
import path from 'node:path';
```

### Svelte 5 Patterns

- Use **runes mode** (enabled globally in `svelte.config.js`)
- State: `let count = $state(0)`
- Props: `let { propName } = $props()`
- Effects: `$effect(() => { ... })`
- Event handlers: Use native `onclick`, `onkeydown` (not `on:click`)

### Error Handling

- Prefer early returns over nested conditionals
- Use TypeScript strict null checks
- Handle edge cases explicitly

### Linting Rules

- ESLint + TypeScript ESLint + Svelte plugin
- Prettier integration (conflicts resolved)
- `no-undef` is disabled (TypeScript handles this)
- Ignores paths from `.gitignore`

### File Organization

```
src/
  lib/
    server/          # Server-only code (db, API)
    index.ts         # Public exports
  routes/
    +page.svelte     # Pages
    +layout.svelte   # Layouts
    layout.css       # Global styles
```

### Database (Drizzle)

- Use `sqliteTable` for table definitions
- Use `text()`, `integer()` column types
- Default UUIDs: `.$defaultFn(() => crypto.randomUUID())`
- Export schemas from `src/lib/server/db/schema.ts`

### CSS/Tailwind

- Tailwind classes follow plugin sorting
- Custom styles in `src/routes/layout.css`
- Use arbitrary values sparingly: `bg-slate-50`

## Tech Stack

- **Framework:** SvelteKit 2.x (Svelte 5 runes mode)
- **Adapter:** Cloudflare Workers
- **Database:** Drizzle ORM + Cloudflare D1
- **Styling:** Tailwind CSS 4.x + Typography plugin
- **Build:** Vite 7.x
- **Runtime:** Bun (preferred) or Node

## Deployment

- Production builds target Cloudflare Workers
- Database: Cloudflare D1
- Run `bun run build` then deploy via Wrangler

## Version Control (Jujutsu/jj)

This repository uses **Jujutsu (jj)** for version control, not Git.

**IMPORTANT: Only use READONLY jj commands. Do NOT create new revisions, amend, or push - this is the user's responsibility.**

```bash
# View repository status
jj status

# View current change/revision
jj show

# View log (readonly)
jj log
jj log -r '@'

# View diff (readonly)
jj diff

# Identify files
jj identify
```

### Allowed Commands (READONLY only)

- `jj status` - Check working copy state
- `jj show` - Show current change details
- `jj log` - View revision history
- `jj diff` - View differences
- `jj identify` - Show current revision ID

### Forbidden Commands (DO NOT USE)

- `jj commit` or `jj describe` - Creating/amending revisions
- `jj push` - Pushing changes
- `jj new` - Creating new changes
- `jj squash` - Combining changes
- Any command that modifies repository state

## Notes for Agents

- Always run `bun run check` after TypeScript changes
- Run `bun run lint` before committing
- Svelte 5 syntax differs from Svelte 4 (no `export let`, use `$props()`)
- Database changes require `bun run db:push` or migrations
- Wrangler types are auto-generated via `bun run gen`
- **Use jj instead of git for VCS operations (readonly commands only)**
