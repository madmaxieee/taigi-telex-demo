# Agent Instructions for taigi-telex-demo

This is a Svelte 5 + TypeScript project for Taiwanese Telex input method (Tâi-lô romanization).

## Build Commands

```bash
# Development server
bun run dev

# Build for production (static site)
bun run build

# Preview production build
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

**Note:** This project does not have a test framework configured yet.

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
- **Relative imports:** `rewriteRelativeImportExtensions` enabled in tsconfig

### Naming Conventions

- **Variables/functions:** camelCase
- **Components:** PascalCase (Svelte files)
- **Constants:** UPPER_SNAKE_CASE for true constants
- **Types/Interfaces:** PascalCase

### Import Patterns

```typescript
// Svelte imports
import { $state, $effect, tick } from 'svelte';
import { _ } from 'svelte-i18n';
import { browser } from '$app/environment';

// Library imports (use $lib alias)
import { processTelexInput } from '$lib/telex';
import { setStoredLocale } from '$lib/i18n';

// Node built-ins
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
- Prettier integration (conflicts resolved via eslint-config-prettier)
- `no-undef` is disabled (TypeScript handles this)
- Ignores paths from `.gitignore`

### File Organization

```
src/
  lib/
    components/      # Svelte components
    i18n/           # Internationalization (svelte-i18n)
      locales/      # Translation files (en.json, zh-TW.json, nan.json)
      index.ts      # i18n initialization
    telex.ts        # Telex transformation logic
    index.ts        # Public exports
  routes/
    +page.svelte    # Main page
    +layout.svelte  # Root layout
    layout.css      # Global styles (Tailwind entry)
```

### CSS/Tailwind

- Tailwind CSS 4.x with Vite plugin
- Tailwind Typography plugin for prose content
- Custom styles in `src/routes/layout.css`
- Use arbitrary values sparingly: `bg-slate-50`, `text-teal-600`

### Internationalization (i18n)

- Uses `svelte-i18n` library
- Three locales: `zh-TW` (Chinese), `en` (English), `nan` (Taiwanese)
- Store preference in localStorage
- Use `$_('key')` for translations in templates

## Tech Stack

- **Framework:** SvelteKit 2.x (Svelte 5 runes mode)
- **Adapter:** @sveltejs/adapter-static (static site generation)
- **Styling:** Tailwind CSS 4.x + Typography plugin
- **Build:** Vite 7.x
- **Runtime:** Bun (preferred) or Node
- **i18n:** svelte-i18n

## Deployment

- Production builds are static sites output to `build/` directory
- No server-side rendering or API routes
- Deploy to any static hosting (CDN, GitHub Pages, etc.)

## Version Control (Jujutsu/jj)

This repository uses **Jujutsu (jj)** for version control, not Git.

**IMPORTANT: Only use READONLY jj commands. Do NOT create new revisions, amend, or push - this is the user's responsibility.**

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
- Telex logic handles Taiwanese romanization with tone marks
- **Use jj instead of git for VCS operations (readonly commands only)**
