# PDF Export Redesign — Attribute Cards Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the existing horizontal-table PDF export with an attribute-card layout that scales to any number of competitors and renders legibly on A4 landscape.

**Architecture:** Each selected dimension becomes one or more PDF pages (react-pdf paginates automatically). Within each page, attributes are rendered as self-contained cards with a 3-column grid (competitor | plan | value), Convert rows highlighted in blue. The Convert SVG logo is converted to a PNG data URI client-side via canvas before PDF generation.

**Tech Stack:** `@react-pdf/renderer` v4, React 19, Vite, TypeScript

---

## Task 1: Copy logo to public/

**Files:**
- Create: `public/logo.svg`

No test framework exists in this project — visual verification is done via the dev server.

- [ ] **Step 1: Copy the logo SVG**

```bash
cp "/Users/nahuelmz/Convert/Logo/Full_Logo_convert_blue.svg" "/Users/nahuelmz/Convert/Comparison Widget/public/logo.svg"
```

- [ ] **Step 2: Verify it's served by Vite**

Open `http://localhost:5173/logo.svg` in the browser — the SVG logo should display.

- [ ] **Step 3: Commit**

```bash
cd "/Users/nahuelmz/Convert/Comparison Widget"
git add public/logo.svg
git commit -m "feat: add Convert logo to public assets for PDF export"
```

---

## Task 2: Rewrite ComparisonPdfDocument.tsx

**Files:**
- Modify: `src/components/generated/ComparisonPdfDocument.tsx`

This is a full rewrite. Replace the entire file content with the attribute-card layout.

- [ ] **Step 1: Replace the file with the new implementation**

```tsx
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer'

type ValueType = string | boolean | 'Unknown' | 'Gated' | 'Not disclosed' | 'Not available'

export interface PlanRow {
  competitorName: string
  planName: string
  value: ValueType | undefined
  isConvert: boolean
  isFirstInGroup: boolean
  groupIndex: number
}

export interface AttributeCard {
  attribute: string
  rows: PlanRow[]
}

export interface DimensionPage {
  dimensionLabel: string
  cards: AttributeCard[]
}

export interface ComparisonPdfDocumentProps {
  pages: DimensionPage[]
  logoPng: string
  generatedAt: string
  comparingText: string
}

function renderValue(val: ValueType | undefined): { text: string; variant: 'normal' | 'muted' | 'true' } {
  if (val === undefined || val === null) return { text: '—', variant: 'muted' }
  if (val === true) return { text: '✓', variant: 'true' }
  if (val === false) return { text: '✗', variant: 'muted' }
  if (
    val === 'Unknown' ||
    val === 'Not disclosed' ||
    val === 'Not available' ||
    val === 'Gated'
  ) {
    return { text: String(val), variant: 'muted' }
  }
  return { text: String(val), variant: 'normal' }
}

const s = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 8,
    paddingHorizontal: 30,
    paddingTop: 20,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  logo: {
    height: 24,
    width: 110,
  },
  dimensionTitle: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 11,
    color: '#2A3441',
  },
  dateText: {
    fontSize: 7,
    color: '#6B7280',
  },
  divider: {
    height: 1.5,
    backgroundColor: '#2A3441',
    marginBottom: 4,
  },
  comparing: {
    fontSize: 6.5,
    color: '#6B7280',
    marginBottom: 8,
  },
  card: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderStyle: 'solid',
    borderRadius: 3,
    marginBottom: 6,
  },
  cardHeader: {
    backgroundColor: '#2A3441',
    padding: 5,
    paddingLeft: 8,
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
  },
  cardHeaderText: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 7.5,
    color: '#FFFFFF',
  },
  row: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    borderTopStyle: 'solid',
    minHeight: 18,
  },
  rowConvert: {
    backgroundColor: '#EBF3FF',
  },
  rowAlt: {
    backgroundColor: '#F9FAFB',
  },
  rowSeparator: {
    borderTopColor: '#CBD5E1',
    borderTopStyle: 'dashed',
  },
  cellCompetitor: {
    width: 140,
    padding: 4,
    paddingLeft: 8,
    paddingTop: 5,
    borderRightWidth: 1,
    borderRightColor: '#E2E8F0',
    borderRightStyle: 'solid',
  },
  cellPlan: {
    width: 130,
    padding: 4,
    paddingTop: 5,
    borderRightWidth: 1,
    borderRightColor: '#E2E8F0',
    borderRightStyle: 'solid',
  },
  cellValue: {
    flex: 1,
    padding: 4,
    paddingTop: 5,
    paddingRight: 8,
  },
  textConvert: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 7.5,
    color: '#0066FF',
  },
  textCompetitor: {
    fontSize: 7.5,
    color: '#374151',
    fontFamily: 'Helvetica-Bold',
  },
  textPlan: {
    fontSize: 7.5,
    color: '#374151',
  },
  textValue: {
    fontSize: 7.5,
    color: '#2A3441',
    lineHeight: 1.4,
  },
  textMuted: {
    color: '#9CA3AF',
  },
  textTrue: {
    color: '#16A34A',
    fontFamily: 'Helvetica-Bold',
  },
  footer: {
    marginTop: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footerText: {
    fontSize: 6,
    color: '#9CA3AF',
  },
})

export function ComparisonPdfDocument({
  pages,
  logoPng,
  generatedAt,
  comparingText,
}: ComparisonPdfDocumentProps) {
  return (
    <Document>
      {pages.map((pageData, pageIdx) => (
        <Page key={pageIdx} size="A4" orientation="landscape" style={s.page}>
          {/* Header */}
          <View style={s.header}>
            <Image src={logoPng} style={s.logo} />
            <Text style={s.dimensionTitle}>{pageData.dimensionLabel}</Text>
            <Text style={s.dateText}>{generatedAt}</Text>
          </View>
          <View style={s.divider} />
          <Text style={s.comparing}>Comparing: {comparingText}</Text>

          {/* Attribute cards */}
          {pageData.cards.map((card, cardIdx) => (
            <View key={cardIdx} style={s.card}>
              <View style={s.cardHeader}>
                <Text style={s.cardHeaderText}>{card.attribute.toUpperCase()}</Text>
              </View>
              {card.rows.map((row, rowIdx) => {
                const isFirstOverall = rowIdx === 0
                const needsSeparator = row.isFirstInGroup && !isFirstOverall
                const isEvenGroup = row.groupIndex % 2 === 1
                const rowStyle = row.isConvert
                  ? s.rowConvert
                  : isEvenGroup
                  ? s.rowAlt
                  : {}

                return (
                  <View
                    key={rowIdx}
                    style={[s.row, rowStyle, needsSeparator ? s.rowSeparator : {}]}
                  >
                    <View style={s.cellCompetitor}>
                      {row.isFirstInGroup && (
                        <Text style={row.isConvert ? s.textConvert : s.textCompetitor}>
                          {row.competitorName}
                        </Text>
                      )}
                    </View>
                    <View style={s.cellPlan}>
                      <Text style={s.textPlan}>{row.planName}</Text>
                    </View>
                    <View style={s.cellValue}>
                      {(() => {
                        const { text, variant } = renderValue(row.value)
                        return (
                          <Text
                            style={[
                              s.textValue,
                              variant === 'muted' ? s.textMuted : {},
                              variant === 'true' ? s.textTrue : {},
                            ]}
                          >
                            {text}
                          </Text>
                        )
                      })()}
                    </View>
                  </View>
                )
              })}
            </View>
          ))}

          {/* Footer */}
          <View style={s.footer}>
            <Text style={s.footerText}>convert.com — Competitor Comparison Report</Text>
            <Text style={s.footerText}>
              {pageIdx + 1} / {pages.length}
            </Text>
          </View>
        </Page>
      ))}
    </Document>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/generated/ComparisonPdfDocument.tsx
git commit -m "feat: rewrite ComparisonPdfDocument with attribute-card layout"
```

---

## Task 3: Update ConvertComparisonFramework.tsx

**Files:**
- Modify: `src/components/generated/ConvertComparisonFramework.tsx`

Three changes: (1) add `svgToPng` helper, (2) add `buildComparingText` helper, (3) replace `handleExportPdf` body.

- [ ] **Step 1: Add svgToPng helper and buildComparingText helper**

Find this line in `ConvertComparisonFramework.tsx`:

```ts
  const handleExportPdf = async () => {
```

Insert **before** it:

```ts
  const svgToPng = (url: string, width: number, height: number): Promise<string> =>
    new Promise((resolve, reject) => {
      const img = new window.Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => {
        const canvas = document.createElement('canvas')
        canvas.width = width * 2
        canvas.height = height * 2
        const ctx = canvas.getContext('2d')!
        ctx.scale(2, 2)
        ctx.drawImage(img, 0, 0, width, height)
        resolve(canvas.toDataURL('image/png'))
      }
      img.onerror = reject
      img.src = url
    })

  const buildComparingText = (selectedCompetitorIds: string[]): string => {
    const convertPart = `Convert (${CONVERT_PLANS.map(p => p.name).join(', ')})`
    const competitorParts = COMPETITORS
      .filter(c => selectedCompetitorIds.includes(c.id))
      .map(c => `${c.name} (${c.plans.map(p => p.name).join(', ')})`)
      .join(' | ')
    return competitorParts ? `${convertPart} vs. ${competitorParts}` : convertPart
  }

```

- [ ] **Step 2: Replace the handleExportPdf body**

Replace the existing `handleExportPdf` function entirely with:

```ts
  const handleExportPdf = async () => {
    setIsExporting(true)
    try {
      const logoPng = await svgToPng('/logo.svg', 220, 48)

      const competitorGroups = [
        { name: 'Convert', plans: CONVERT_PLANS as { id: string; name: string }[], isConvert: true },
        ...COMPETITORS
          .filter(c => selectedCompetitors.includes(c.id))
          .map(c => ({ name: c.name, plans: c.plans as { id: string; name: string }[], isConvert: false })),
      ]

      const pages = DIMENSIONS
        .filter(d => selectedDimensions.includes(d.id))
        .map(dim => ({
          dimensionLabel: dim.label,
          cards: COMPARISON_DATA
            .filter(item => item.dimension === dim.id)
            .map(item => ({
              attribute: item.attribute,
              rows: competitorGroups.flatMap((group, groupIdx) =>
                group.plans.map((plan, planIdx) => ({
                  competitorName: group.name,
                  planName: plan.name,
                  value: item.values[plan.id],
                  isConvert: group.isConvert,
                  isFirstInGroup: planIdx === 0,
                  groupIndex: groupIdx,
                }))
              ),
            })),
        }))

      const today = new Date().toISOString().split('T')[0]
      const blob = await pdf(
        <ComparisonPdfDocument
          pages={pages}
          logoPng={logoPng}
          generatedAt={today}
          comparingText={buildComparingText(selectedCompetitors)}
        />
      ).toBlob()

      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `Convert_Comparison_${today}.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } finally {
      setIsExporting(false)
    }
  }
```

- [ ] **Step 3: Run the TypeScript build to check for errors**

```bash
cd "/Users/nahuelmz/Convert/Comparison Widget" && yarn build 2>&1 | tail -15
```

Expected output ends with: `✓ built in X.XXs`

If there are type errors, fix them before committing.

- [ ] **Step 5: Commit**

```bash
git add src/components/generated/ConvertComparisonFramework.tsx
git commit -m "feat: update PDF export handler with attribute-card data shape and logo"
```

---

## Task 4: Visual Verification

**Files:** none (read-only verification)

- [ ] **Step 1: Start the dev server if not running**

```bash
cd "/Users/nahuelmz/Convert/Comparison Widget" && yarn dev --port 5173
```

- [ ] **Step 2: Open the app and configure the comparison**

Navigate to `http://localhost:5173`. Click "Select all" for both Alternatives and Dimensions. Click "Generate comparison →".

- [ ] **Step 3: Click "Export PDF"**

The button is in the top-right of the table header. Click it. After a few seconds (logo conversion + PDF generation), a file named `Convert_Comparison_YYYY-MM-DD.pdf` should download.

- [ ] **Step 4: Verify the PDF**

Open the downloaded PDF and check:
- [ ] Logo appears in the top-left of every page
- [ ] Dimension name is centered in the header
- [ ] Date appears top-right
- [ ] "Comparing: ..." subheader lists all selected competitors with their plans
- [ ] Each attribute is a dark-header card
- [ ] Convert rows have blue background (`#EBF3FF`) and `CONVERT` label in blue bold
- [ ] Competitor groups are separated by a dashed line
- [ ] Muted values (Unknown, Gated, Not available) appear in gray
- [ ] `✓` appears in green for boolean true values
- [ ] Footer shows page number and convert.com attribution
- [ ] File downloads as `Convert_Comparison_YYYY-MM-DD.pdf`

- [ ] **Step 5: Final commit**

```bash
git add -A
git commit -m "feat: complete PDF export redesign with attribute-card layout"
```
