# PDF Export Redesign — Attribute Cards Layout

**Date:** 2026-04-23  
**Status:** Approved

---

## Context

The comparison widget allows users to select competitors and evaluation dimensions, then view a side-by-side table. The existing PDF export (`@react-pdf/renderer`) renders the same horizontal table format, which becomes unreadable when many competitors are selected (up to 21+ columns on A4 landscape).

---

## Goal

Replace the current horizontal table PDF with an **attribute-card layout** that scales to any number of competitors and plans while remaining legible as a shared internal reference document.

---

## Layout

### Page Structure

- **Orientation:** A4 landscape
- **One page per selected dimension** (react-pdf paginates automatically when content overflows)
- **Dimensions covered:** Pricing & TCO, Scale & Limits, Experimentation Features, Governance & Security, Support & SLA

Each page contains:
1. **Header** — logo (left), dimension name (center), date (right)
2. **Divider** — 1.5pt line in `#2A3441`
3. **Subheader** — "Comparing: Convert (Growth, Pro, Enterprise) vs. Optimizely (...) | VWO (...)"
4. **Attribute cards** — stacked vertically, one per attribute in the dimension
5. **Footer** — "convert.com — Competitor Comparison Report" (left), "Page N / Total" (right)

### Attribute Card Anatomy

Each card is a self-contained block with a three-column grid:

```
┌─────────────────────────────────────────────────────────────────┐
│ ATTRIBUTE NAME                                                   │  ← header: #2A3441 bg, white text, uppercase
├───────────────────┬──────────────────┬──────────────────────────┤
│ CONVERT           │ Growth           │ 100k - 750k              │  ← #EBF3FF bg, "CONVERT" in #0066FF bold
│                   │ Pro              │ 100k - 2m                │
│                   │ Enterprise       │ 1m - 5m+                 │
├ ┄ ┄ ┄ ┄ ┄ ┄ ┄ ┄ ┄ ┄ ┄ ┄ ┄ ┄ ┄ ┄ ┄ ┄ ┄ ┄ ┄ ┄ ┄ ┄ ┄ ┄ ┄ ┄ ┄ ┄ ┄ ┤  ← dashed separator between competitors
│ Optimizely        │ Essential        │ 250k - 2.5m              │  ← white/light gray alternating per group
│                   │ Enhanced         │ 500k - Unlimited         │
│                   │ Advanced         │ 500k - Unlimited         │
│                   │ Ultimate         │ 1m - Unlimited           │
├ ┄ ┄ ┄ ┄ ┄ ┄ ┄ ┄ ┄ ┄ ┄ ┄ ┄ ┄ ┄ ┄ ┄ ┄ ┄ ┄ ┄ ┄ ┄ ┄ ┄ ┄ ┄ ┄ ┄ ┄ ┄ ┤
│ VWO               │ Growth           │ Up to 250K MTU           │
│                   │ ...              │ ...                      │
└───────────────────┴──────────────────┴──────────────────────────┘
```

**Column widths** (781pt usable on A4 landscape):
- Competitor name: 140pt (fixed)
- Plan name: 130pt (fixed)
- Value: ~511pt (remaining, text wraps automatically)

**Competitor name rendering:** Only shown on the first row of each competitor group. Subsequent rows leave the competitor cell empty.

### Color System

| Element | Color |
|---|---|
| Card attribute header bg | `#2A3441` |
| Card attribute header text | `#FFFFFF` |
| Convert rows bg | `#EBF3FF` |
| Convert label | `#0066FF` bold |
| Competitor rows (odd group) | `#FFFFFF` |
| Competitor rows (even group) | `#F9FAFB` |
| Separator between groups | `#CBD5E1` dashed |
| Muted values (Unknown/Gated/N/A) | `#9CA3AF` |
| `true` value | `✓` in `#16A34A` |
| `false` value | `✗` in `#9CA3AF` |

---

## Logo

The Convert SVG logo uses `<mask>` and opacity group features that react-pdf's Image renderer does not support. 

**Solution:** Convert SVG to PNG client-side via canvas before PDF generation:
1. Copy `Full_Logo_convert_blue.svg` to `public/logo.svg` in the widget project
2. On "Export PDF" click, before calling `pdf()`: create an offscreen `<canvas>`, draw the SVG via an `Image` element, call `canvas.toDataURL('image/png')` to get a PNG data URI
3. Pass the PNG data URI as a prop to `ComparisonPdfDocument`
4. Use `<Image src={pngDataUri} />` in the react-pdf header

Logo dimensions in PDF header: height 24pt, width proportional (~110pt).

---

## File Naming

Downloaded file: `Convert_Comparison_YYYY-MM-DD.pdf`

---

## Files Affected

| File | Change |
|---|---|
| `src/components/generated/ComparisonPdfDocument.tsx` | Full rewrite — new attribute-card layout |
| `src/components/generated/ConvertComparisonFramework.tsx` | Add `svgToPng()` helper, update `handleExportPdf` to pass logo + new data shape |
| `public/logo.svg` | New file — copy of Convert full logo SVG |
