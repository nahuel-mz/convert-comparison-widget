import { Document, Page, Text, View, StyleSheet, Image, Font, Svg, Path } from '@react-pdf/renderer'

// Geist, the web's typeface. Google Fonts CSS can't reach inside a PDF, so the widget
// ships subset TTFs in public/fonts (Latin + punctuation — covers every character in
// the comparison data). TrueType outlines because react-pdf's CFF/OTF support is unreliable.
Font.register({
  family: 'Geist',
  fonts: [
    { src: '/fonts/Geist-Regular.ttf', fontWeight: 400 },
    { src: '/fonts/Geist-Medium.ttf', fontWeight: 500 },
    { src: '/fonts/Geist-SemiBold.ttf', fontWeight: 600 },
    { src: '/fonts/Geist-Italic.ttf', fontWeight: 400, fontStyle: 'italic' },
  ],
})

// Convert web tokens (convert-lps `_shared/tokens.css`). No grey — navy ink scale + cream.
const INK_900 = '#2A3442'
const INK_700 = '#586478'
const INK_600 = '#647084'
const INK_400 = '#D0D7E1'
const INK_300 = '#E7EBF1'
const BLUE_600 = '#0066FF'
const BLUE_50 = '#EEF4FF'
const CREAM = '#FAFAF7'

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

function renderValue(val: ValueType | undefined): { text: string; variant: 'normal' | 'muted' | 'check' | 'cross' } {
  if (val === undefined || val === null) return { text: '—', variant: 'muted' }
  if (typeof val === 'string') {
    // The PDF is static and can't show tooltips — strip any `HOVER:` annotation
    // and coerce the literal 'true'/'false' primaries to checks/crosses.
    const hoverIndex = val.search(/\s*(?:\(?ON-)?HOVER:/)
    if (hoverIndex !== -1) val = val.slice(0, hoverIndex).trim().replace(/\($/, '').trim() as ValueType
    if (val === 'true') return { text: 'Yes', variant: 'check' }
    if (val === 'false') return { text: 'No', variant: 'cross' }
  }
  if (val === true) return { text: 'Yes', variant: 'check' }
  if (val === false) return { text: 'No', variant: 'cross' }
  if (
    val === 'Unknown' ||
    val === 'Not specified' ||
    val === 'Not publicly listed' ||
    val === 'Not disclosed' ||
    val === 'Not available' ||
    val === 'Gated'
  ) {
    return { text: String(val), variant: 'muted' }
  }
  return { text: String(val), variant: 'normal' }
}

const CheckIcon = () => (
  <Svg width={9} height={9} viewBox="0 0 14 14">
    <Path d="M2.5 7L5.5 10L11.5 4" stroke={BLUE_600} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" fill="none" />
  </Svg>
)
const CrossIcon = () => (
  <Svg width={8} height={8} viewBox="0 0 12 12">
    <Path d="M2 2L10 10M10 2L2 10" stroke={INK_400} strokeWidth={1.75} strokeLinecap="round" fill="none" />
  </Svg>
)

// Type: the web's 12px reading floor is 9pt in print, so nothing here is set below 9.
const s = StyleSheet.create({
  page: {
    fontFamily: 'Geist',
    fontSize: 9,
    color: INK_900,
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
    fontWeight: 600,
    fontSize: 14,
    color: INK_900,
    letterSpacing: -0.2,
  },
  dateText: {
    fontSize: 9,
    color: INK_600,
  },
  divider: {
    height: 1.5,
    backgroundColor: INK_900,
    marginBottom: 5,
  },
  comparing: {
    fontSize: 9,
    color: INK_700,
    lineHeight: 1.4,
    marginBottom: 10,
  },
  card: {
    borderWidth: 1,
    borderColor: INK_300,
    borderStyle: 'solid',
    borderRadius: 4,
    marginBottom: 8,
  },
  cardHeader: {
    backgroundColor: INK_900,
    padding: 5,
    paddingLeft: 8,
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
  },
  cardHeaderText: {
    fontWeight: 600,
    fontSize: 9,
    letterSpacing: 0.6,
    color: '#FFFFFF',
  },
  row: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: INK_300,
    borderTopStyle: 'solid',
    minHeight: 20,
  },
  rowConvert: {
    backgroundColor: BLUE_50,
  },
  rowAlt: {
    backgroundColor: CREAM,
  },
  rowSeparator: {
    borderTopWidth: 1,
    borderTopColor: INK_400,
    borderTopStyle: 'solid',
  },
  cellCompetitor: {
    width: 140,
    padding: 4,
    paddingLeft: 8,
    paddingTop: 5,
    borderRightWidth: 1,
    borderRightColor: INK_300,
    borderRightStyle: 'solid',
  },
  cellPlan: {
    width: 130,
    padding: 4,
    paddingTop: 5,
    borderRightWidth: 1,
    borderRightColor: INK_300,
    borderRightStyle: 'solid',
  },
  cellValue: {
    flex: 1,
    padding: 4,
    paddingTop: 5,
    paddingRight: 8,
  },
  textConvert: {
    fontWeight: 600,
    fontSize: 9,
    color: BLUE_600,
  },
  textCompetitor: {
    fontSize: 9,
    color: INK_900,
    fontWeight: 600,
  },
  textPlan: {
    fontSize: 9,
    color: INK_700,
  },
  textValue: {
    fontSize: 9,
    color: INK_900,
    lineHeight: 1.4,
  },
  textMuted: {
    color: INK_600,
    fontStyle: 'italic',
  },
  iconCell: {
    paddingTop: 2,
  },
  footer: {
    marginTop: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footerText: {
    fontSize: 9,
    color: INK_600,
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
        <Page key={pageIdx} size="A4" orientation="portrait" style={s.page}>
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
            <View key={cardIdx} style={s.card} minPresenceAhead={40}>
              <View style={s.cardHeader} wrap={false}>
                <Text style={s.cardHeaderText}>{card.attribute.toUpperCase()}</Text>
              </View>
              {card.rows.map((row, rowIdx) => {
                const isFirstOverall = rowIdx === 0
                const needsSeparator = row.isFirstInGroup && !isFirstOverall
                const isOddGroup = row.groupIndex % 2 === 1
                const rowStyle = row.isConvert
                  ? s.rowConvert
                  : isOddGroup
                  ? s.rowAlt
                  : {}

                return (
                  <View
                    key={rowIdx}
                    wrap={false}
                    style={[s.row, rowStyle, needsSeparator && s.rowSeparator]}
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
                        if (variant === 'check' || variant === 'cross') {
                          return <View style={s.iconCell} wrap={false}>{variant === 'check' ? <CheckIcon /> : <CrossIcon />}</View>
                        }
                        return (
                          <Text style={variant === 'muted' ? [s.textValue, s.textMuted] : s.textValue}>
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
