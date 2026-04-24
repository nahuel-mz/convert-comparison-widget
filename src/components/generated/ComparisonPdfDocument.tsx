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
    borderTopWidth: 1,
    borderTopColor: '#CBD5E1',
    borderTopStyle: 'solid',
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
                        return (
                          <Text
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            style={[
                              s.textValue,
                              variant === 'muted' && s.textMuted,
                              variant === 'true' && s.textTrue,
                            ] as any}
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
