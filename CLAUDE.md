# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Critical: This is NOT the Next.js you know

Next.js 16 / shadcn v4 have breaking changes. Read `node_modules/next/dist/docs/` before writing code. Key differences:

- **shadcn/ui v4 uses `@base-ui/react`, NOT Radix UI.** All primitives are different.
- `asChild` prop does not exist — use `render` prop instead: `<SheetTrigger render={<Button />}>…</SheetTrigger>`
- `Select.Root` value is `string | null` (not `string | undefined`). Use `null` for "no selection" (shows placeholder). Never use a sentinel string like `__all__` as the root value — base-ui renders the raw value string, not the item label.
- `ToggleGroup` value is `readonly string[]` — not usable for single-select without a wrapper.
- `DropdownMenuLabel` requires a `<DropdownMenuGroup>` ancestor.

## Commands

```bash
npm run dev -- --port 3000   # dev server (always specify port to avoid conflicts)
npm run build                # production build
npx tsc --noEmit             # type-check only — run before every commit
npm run lint                 # eslint
```

No test suite exists.

## Architecture

### Data flow (server-side)

All drug data lives in a **module-level in-memory singleton** (`src/lib/drug-store.ts`). It lazy-loads on the first API request and persists for the lifetime of the Node process. The store holds:
- `rows` — all ~22K drug records
- `activeRows` — status === 'Active' only (used by default)
- `dosageForms`, `dispenseModes` — pre-built unique sorted lists

**Load priority on init:** `data/uploaded.{xlsx,csv}` → `public/data/Drugs_bundled.xlsx` → `public/data/Drugs_bundled.csv`. Uploaded files are saved to `data/` (gitignored) with a `data/upload-meta.json` sidecar so they survive server restarts.

**Parse pipeline:** `xlsx` buffer → `csv-parser.ts` (reads the `Drugs` sheet by name, falls back to sheet 0) → `drug-normalizer.ts` (maps raw CSV column names to `DrugRecord` fields, normalizes 20+ dispense mode variants to 6 canonical values, converts Yes/No strings to booleans).

**The Thiqa column** has an unusual name in the source file: `"Included in Thiqa/ ABM - other than 1&7- Drug Formulary"` — always access by exact column name, not index.

### API routes (`src/app/api/`)

| Route | Purpose |
|---|---|
| `GET /api/drugs` | Filtered, sorted, paginated search. Uses `store.activeRows` by default; switches to `store.rows` when `status` param is explicitly set. |
| `GET /api/meta` | Returns pre-built `dosageForms` and `dispenseModes` arrays for populating filter dropdowns. |
| `GET /api/status` | Returns `StoreStatus` (source, rowCount, dates). |
| `POST /api/upload` | Parses CSV/XLSX, saves to disk, calls `setDrugStore`. Max 15MB. |
| `POST /api/chat` | SSE stream. Reads API key from `x-api-key` header only — never env vars. Calls `getTopMatches(store.activeRows, message, 100)` to build drug context. |

### Search (`src/lib/drug-search.ts`)

`filterAndPaginate()` runs entirely in memory — no database. Token-based text search on `packageName + genericName`. All filtering is server-side via `GET /api/drugs`. The client-side column filters in `ResultsTable` apply only to the current page (50 rows) using TanStack Table's `getFilteredRowModel`.

### Frontend

- **`src/app/page.tsx`** — single page, owns all filter/sort/page state, wires `useDrugSearch` → `ResultsTable` and `SearchPanel`.
- **`src/components/results/ResultsTable.tsx`** — TanStack Table v8 with `manualPagination: true, manualSorting: true`. Column `filterFn` must be defined inline in the column definition (not mutated after table creation). Numeric columns use `>= AED` filter; categorical columns use exact match.
- **`src/hooks/useDrugSearch.ts`** — debounces text queries 300ms, fires immediately for non-text filter changes.
- **`src/hooks/useApiKey.ts`** — persists `{ provider, model, apiKey }` to localStorage. API key is sent as `x-api-key` request header and never stored server-side.

### AI chat

`POST /api/chat` dispatches to `src/lib/claude-client.ts` or `src/lib/openai-client.ts` based on `provider`. The system prompt (in `src/lib/ai-context.ts`) includes Abu Dhabi insurance system context and injects the top 100 drug rows matching the user's message as `<DRUG_DATA>`. Chat context uses keyword matching against all active rows — it does **not** use the current sidebar filter state.
