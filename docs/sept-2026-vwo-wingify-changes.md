# September 2026 VWO → Wingify update — what changed

Generated from *Convert Comparison Tables Latest - All competitors Sept 26 (2).csv*
(the Wingify columns, which Victoria updated) against the table as it stood on `main`.
The Asana task *VWO update detected – September 2026* explains each change.
Row numbers below are rows in that sheet.

Following the rule from `dcafce1`, every cell matches the sheet's value exactly.
The one exception is the spelling "Gated pricing" (see below).

## Structural

| Change | Detail |
|---|---|
| Rebrand | VWO and AB Tasty merged (announced 20 Jan 2026). Since about Jul 2026 both ship as **Wingify**: vwo.com → wingify.com, help.vwo.com → help.wingify.com. The sheet header now reads "Wingify". |
| Column label | **VWO → Wingify**, with "(formerly VWO)" on a smaller second line (Nahuel's call, for a while). It comes from a new optional `formerly` field on the competitor, so the note can be removed later by deleting one line. It shows in the setup cards, the sidebar, the table header, the mobile header and picker, and the PDF. Search still finds "vwo". Plan ids stay `vwo-*`. |
| Tiers | Unchanged: Growth / Pro / Enterprise. Wingify's own feature matrix lists them Enterprise / Pro / Growth, but the sheet and this table keep Growth / Pro / Enterprise. |
| Help-doc URLs | All 21 moved to help.wingify.com in the sheet notes. The widget stores no VWO URLs, so nothing changes here. |

## Cell changes — Wingify (36)

| Row | Attribute | Plan | Was | Now | Why (Asana notes) |
|---|---|---|---|---|---|
| 4 | Number of Tested Users per month | Growth | Up to 250K MTU (max) | Custom (MAU-based) | Billing moved from MTU to MAU. The old MTU caps came from a retired help article, and no per-plan MAU caps are published. |
| 4 | Number of Tested Users per month | Pro | Up to 1M MTU (max) | Custom (MAU-based) | 〃 |
| 4 | Number of Tested Users per month | Enterprise | 1M+ MTU (custom) | Custom (MAU-based) | 〃 |
| 5 | Price per month (monthly plan) | Growth | Not publicly available / Contact Sales | Gated pricing | Normalised to the house standard; the new site publishes no figures |
| 5 | Price per month (monthly plan) | Pro | Not publicly available / Contact Sales | Gated pricing | 〃 |
| 5 | Price per month (monthly plan) | Enterprise | Not publicly available / Contact Sales | Gated pricing | 〃 |
| 6 | Price per month (annual plan) | Growth | Not publicly available / Contact Sales | Gated pricing | 〃 |
| 6 | Price per month (annual plan) | Pro | Not publicly available / Contact Sales | Gated pricing | 〃 |
| 6 | Price per month (annual plan) | Enterprise | Not publicly available / Contact Sales | Gated pricing | 〃 |
| 7 | Annual price for whole year | Growth | Not publicly available / Contact Sales | Gated pricing | 〃 |
| 7 | Annual price for whole year | Pro | Not publicly available / Contact Sales | Gated pricing | 〃 |
| 7 | Annual price for whole year | Enterprise | Not publicly available / Contact Sales | Gated pricing | 〃 |
| 58 | Unique JS/CSS per Project | Growth | Unknown | No | Unknown resolved ("Sitewide JS") |
| 58 | Unique JS/CSS per Project | Pro | Unknown | No | 〃 |
| 58 | Unique JS/CSS per Project | Enterprise | Unknown | Yes | 〃 |
| 60 | Deploys | Growth | Add-on required | Yes | Rollout Campaigns are now part of the core product on all plans |
| 60 | Deploys | Pro | Add-on required | Yes | 〃 |
| 60 | Deploys | Enterprise | Add-on required | Yes | 〃 |
| 79 | Campaign Data Retention | Growth | Unlimited | 13 months | Applies to every product except Behavioural Analytics, which keeps data 30 / 60 / 90 days. Add-ons extend retention. |
| 79 | Campaign Data Retention | Pro | Unlimited | 13 months | 〃 |
| 79 | Campaign Data Retention | Enterprise | Unlimited | 13 months | 〃 |
| 90 | Live Log | Growth | Unknown | No | Unknown resolved ("Campaign Live Audit") |
| 90 | Live Log | Pro | Unknown | Yes | 〃 |
| 90 | Live Log | Enterprise | Unknown | Yes | 〃 |
| 96 | MCP Server | Growth | No | Yes | No longer Enterprise-only. It is part of Wingz Core, which comes free with every paid product. |
| 96 | MCP Server | Pro | No | Yes | 〃 |
| 97 | Shopify price testing | Growth | Yes | No | Correction: the feature is listed as "coming soon", and tracking skips checkout, so it is not checkout-safe |
| 97 | Shopify price testing | Pro | Yes | No | 〃 |
| 97 | Shopify price testing | Enterprise | Yes | No | 〃 |
| 11 | Auto-upgrade | Growth | No | Yes | Not in the notes; the sheet changed it. Nahuel: follow the sheet. |
| 11 | Auto-upgrade | Pro | No | Yes | 〃 |
| 11 | Auto-upgrade | Enterprise | No | Yes | 〃 |
| 43 | Custom Tag Targeting | Growth | No | 0 | 〃 |
| 66 | Frequentist & Bayesian Stats Engine | Growth | Bayesian only | Yes | 〃 |
| 66 | Frequentist & Bayesian Stats Engine | Pro | Bayesian only | Yes | 〃 |
| 66 | Frequentist & Bayesian Stats Engine | Enterprise | Bayesian only | Yes | 〃 |

MCP Server on Enterprise was already Yes.

The sheet writes **"Gated Pricing"** for Wingify. The table writes **"Gated pricing"** to match Kameleoon and Dynamic Yield (Nahuel's call). These 9 cells are the only Wingify cells that differ from the sheet, so fix the sheet too or the next sync brings the capital P back.

## Noted, no cell change

| Row | Attribute | Note |
|---|---|---|
| 98 | AI Assistant | "VWO Copilot" / "Wandz" is now **Wingz**. Value stays Yes / Yes / Yes. |
| 102 | EU based servers | Now published outright: data storage in the USA, Belgium (EU) and India on every plan. Value stays Yes / Yes / Yes. |

## Flagged by Victoria

| Row | Attribute | Now (Growth / Pro / Enterprise) | Status |
|---|---|---|---|
| 50 | Post Segmentation | No / Yes / Yes | Matches the sheet. Still needs a ruling: Wingify's matrix splits this into "Report Segmentation" (Enterprise only) and a set of report filters (Pro and up). |
| 11 | Auto-upgrade | Yes / Yes / Yes | Changed to follow the sheet (above). The pre-rebrand source is gone, so the value needs a recheck. |
| 77 | Raw test data export | No / Yes / Yes | Pre-rebrand source is gone, so the value needs a recheck |
| 103 | Non-PII Cookie lifetime | 100 days (default) ×3 | Pre-rebrand source is gone, so the value needs a recheck |
| 107 | Data Protection Addendum | Yes ×3 | Pre-rebrand source is gone, so the value needs a recheck |

## Check

After this change, every non-VWO cell still matches the sheet except the known Convert exceptions:
- the three Tested Users cells corrected in `ba8f62e`;
- the hover tooltips on SOC 2, ISO 27001 and Mobile App Testing;
- a doubled space in the Pro annual price.

The only Wingify cells that differ from the sheet are the 9 "Gated pricing" spellings.
