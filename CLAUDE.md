# Comparison Widget — Working Guide

Read this before any work in this directory. It governs every session.

---

## Project overview

Interactive A/B testing tools comparison widget. Built with React + Vite + TypeScript. Single embedded widget — not a landing page. No backend, no API: all data is hardcoded in the component.

**Stack:** React 18, Vite, TypeScript, Tailwind CSS, @react-pdf/renderer, Framer Motion, Lucide React, Geist font.

---

## File map

```
Comparison Widget/
  src/
    components/generated/
      ConvertComparisonFramework.tsx   ← THE component. All data + all UI. ~4100 lines.
      ComparisonPdfDocument.tsx        ← PDF export layout (reads same data)
    hooks/use-mobile.ts
    settings/theme.ts
    settings/types.d.ts
  docs/
    magicpath-prompts.md               ← ARCHIVED. MagicPath is no longer used.
    superpowers/                       ← SDD planning artifacts (historical)
  CLAUDE.md                           ← this file
```

**Single source of truth:** `ConvertComparisonFramework.tsx`. All data changes happen here. `ComparisonPdfDocument.tsx` consumes the same constants — if you add a competitor or row to the main component, the PDF picks it up automatically.

---

## Data architecture

The component has three data constants at the top:

### 1. `CONVERT_PLANS` — Convert baseline (never changes)
```ts
const CONVERT_PLANS: PlanData[] = [
  { id: 'convert-growth', name: 'Growth', isConvert: true },
  { id: 'convert-pro',    name: 'Pro',    isConvert: true },
  { id: 'convert-enterprise', name: 'Enterprise', isConvert: true },
]
```

### 2. `COMPETITORS` — ordered array of competitors
```ts
interface Competitor {
  id: string;       // kebab-case, e.g. 'optimizely'
  name: string;     // display name
  plans: PlanData[];
}
```

Current competitors **in order:**
| id | name | plans |
|----|------|-------|
| `optimizely` | Optimizely | `opt-essential`, `opt-enhanced`, `opt-advanced`, `opt-ultimate` |
| `vwo` | VWO | `vwo-growth`, `vwo-pro`, `vwo-enterprise` |
| `abtasty` | AB Tasty | `abt-single` |
| `kameleoon` | Kameleoon | `kam-standard`, `kam-enterprise` |
| `dynamicyield` | Dynamic Yield | `dy-single` |
| `intelligems` | Intelligems | `ig-core`, `ig-plus`, `ig-blue` |
| `amplitude` | Amplitude | `amp-starter`, `amp-plus`, `amp-growth`, `amp-enterprise` |

**Plan ID naming convention:** `{2-3 char abbrev}-{planname}` all lowercase, kebab-case. Examples: `ig-core`, `amp-starter`, `sl-pro`.

### 3. `COMPARISON_DATA` — array of 101 `ComparisonDataPoint` entries
```ts
interface ComparisonDataPoint {
  attribute: string;           // exact display name — never change once set
  dimension: ComparisonDimension;
  tooltip?: string;            // shown via ⓘ icon on the row label
  values: Record<string, string | boolean | 'Unknown' | 'Gated' | 'Not disclosed' | 'Not available'>;
}
```

The `values` object keys are plan IDs. Every plan from every competitor + Convert must have an entry in every row.

**5 dimensions (in display order):**
1. `pricing` — Pricing & TCO
2. `scale` — Scale & Limits
3. `features` — Experimentation Features
4. `governance` — Governance & Security
5. `support` — Support & SLA

---

## Value type system

The UI renders values differently based on their type. Use the right type:

| Value | Renders as | When to use |
|-------|-----------|-------------|
| `true` | Blue ✓ checkmark | Feature is confirmed available |
| `false` | Gray × cross | Feature is confirmed NOT available |
| `"Unknown"` | Italic gray "Unknown" | Feature status is not publicly confirmed |
| `"N/A"` | Muted "N/A" | Feature concept doesn't apply (e.g. Shopify-native tools have no "Projects") |
| `"Not available"` | Italic "Not available" | Plan doesn't offer this (e.g. Enterprise-only pricing) |
| `"Not disclosed"` | Italic "Not disclosed" | Vendor exists but actively hides the info |
| `"Gated pricing"` | Italic "Gated pricing" | Pricing is gated behind sales contact |
| `"Separate product"` | Yellow badge | Feature exists but as a separate paid product |
| Any other string | Plain text | Nuanced value (e.g. `"Bayesian only"`, `"10+"`, `"Login via Shopify"`) |

**The HOVER: syntax** — append inline tooltip to any string value:
```
"Yes — JS API HOVER: Available via the JavaScript API, not through the UI"
```
This renders the main text + an ⓘ icon that shows the tooltip on hover. The `HOVER:` keyword (or `ON-HOVER:`) triggers this behavior in `parseValueTooltip()`.

---

## How to add a new competitor

This is the most common operation. Follow these steps **in order:**

### Step 1 — Add to COMPETITORS array

Insert the new competitor object at the END of the `COMPETITORS` array (after the last existing competitor). Never reorder existing competitors.

```ts
{
  id: 'shoplift',
  name: 'Shoplift',
  plans: [
    { id: 'sl-core',     name: 'Core' },
    { id: 'sl-advanced', name: 'Advanced' },
    { id: 'sl-pro',      name: 'Pro' },
  ]
}
```

### Step 2 — Add plan keys to every COMPARISON_DATA entry

For each of the 101 entries in `COMPARISON_DATA`, add the new plan IDs to the `values` object. New keys go **at the end** of `values`, after all existing plan keys.

```ts
// BEFORE
values: {
  'convert-growth': true,
  ...
  'amp-enterprise': true,
}

// AFTER
values: {
  'convert-growth': true,
  ...
  'amp-enterprise': true,
  'sl-core':     true,   // ← new
  'sl-advanced': true,   // ← new
  'sl-pro':      true,   // ← new
}
```

### Step 3 — Verify

Run `yarn dev` (or use the `comparison-widget` preview server). Open the widget, select the new competitor, check that:
- It appears in the Setup screen competitor list
- All 5 dimensions show data for the new plans
- No `undefined` or blank cells

### Guardrails — NEVER do these
- Never modify values for existing competitors when adding a new one
- Never change the `attribute` string of an existing row (it's a de-facto ID)
- Never reorder the COMPETITORS array
- Never reorder keys inside a `values` object within a single row (for readability, maintain competitor order)
- Never add a competitor to COMPETITORS without also adding its plan keys to all 101 rows — partial data breaks the PDF export

---

## How to add a new comparison row

1. Find the right location in `COMPARISON_DATA` (group by dimension, place near semantically related rows)
2. Add a new `ComparisonDataPoint` object with:
   - `attribute`: unique display name — once set, treat as immutable
   - `dimension`: one of the 5 dimension ids
   - `tooltip` (optional): short description shown on ⓘ hover
   - `values`: one entry for **every plan** across Convert + all competitors
3. Verify in the preview that the row appears in the right dimension section

---

## How to update existing values

Edit the value directly in the `values` object of the relevant `COMPARISON_DATA` entry. Nothing else needs to change.

If updating a competitor's values (e.g. after re-researching their pricing):
- Only touch that competitor's plan keys
- Leave all other plan keys unchanged
- Note what changed and why in your session summary / engram

---

## Development workflow

```bash
# Start the dev server (via Claude Preview)
# Server name: comparison-widget
# Port: 5173
# Command: yarn --cwd "/Users/nahuelmz/Convert/Comparison Widget" dev --port 5173
```

The preview server is registered in `/Users/nahuelmz/Convert/.claude/launch.json` as `comparison-widget`.

**Never run a build** after making changes — the user does not want builds triggered automatically.

---

## Before committing — local test checklist

Always verify locally before committing. Steps in order:

1. **Start the dev server** via the `comparison-widget` preview (`yarn dev --port 5173`)
2. **Open the widget** and click "Select all" for both Alternatives and Dimensions
3. **Generate comparison** and confirm:
   - The counter shows the correct number of columns (`ATTRIBUTES • N COLUMNS`)
   - New competitor appears in the sidebar ALTERNATIVES list
   - Scroll to the far right of the table — new columns are visible with data (no blank/undefined cells)
   - Boolean rows show ✓ or ✗ (not raw `true`/`false` strings)
   - String values render as plain text
   - `Unknown` values render italic gray
   - `N/A` values render muted
4. **Spot-check plan-differentiated rows** — verify Core ≠ Advanced ≠ Pro where expected (e.g. Pricing, Dedicated account manager)
5. Only after passing all checks above: proceed to commit

## Commit workflow

```bash
git add src/components/generated/ConvertComparisonFramework.tsx
git add CLAUDE.md   # if updated
git commit -m "feat: add <CompetitorName> as competitor"
git push origin main
```

**Rules:**
- Conventional commits only — `feat:`, `fix:`, `chore:`, `docs:`
- No AI attribution in commits
- Never commit `node_modules/`, build artifacts, or `.env` files
- Always push to `origin main` after committing

## Engram memory

Save discoveries, decisions, and data updates to engram with `project: "Convert"`. Useful topic keys:
- `comparison-widget/architecture` — component structure, data model
- `comparison-widget/competitors` — current competitor list and status
- `comparison-widget/data-updates` — when specific competitor values were last updated
