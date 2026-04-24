# MagicPath Prompts — Comparison Table Updates

Use these prompts in MagicPath to replicate the changes. Apply them in order.

---

## Prompt 1: Update Dynamic Yield Values

```
Update the Dynamic Yield (dy-single) values in the comparison table. Make these exact changes to the existing dy-single values across all dimensions:

PRICING:
- "Number of Tested Users per month": change from "Unknown" to "Not specified"
- "Price per month (monthly plan)": change from "Unknown (gated pricing)" to "Gated pricing"
- "Price per month (annual plan)": change from "Unknown (gated pricing)" to "Gated pricing"
- "Annual price for whole year": change from "Unknown (gated pricing)" to "Gated pricing"
- "Auto-upgrade": change from "Unknown" to "Not publicly stated"

SCALE:
- "Campaign Data Retention": change from "No limit" to "Not publicly specified"
- "Number of Active Domains for A/B testing": change from "Unlimited" to "Unlimited (enterprise)"
- "Unlimited sub-domains": change from "Unknown" to "Not specified"
- "Active goals": change from "Unknown" to "Not publicly specified"
- "No. of Active Experiences": change from "20 experiences per campaign" to "Not publicly specified"
- "Number of Active Projects": change from true to "Not specified"
- "Deploys": change from true to "N/A"

FEATURES:
- "Custom Tag Targeting": change from "Unknown" to true
- "Custom segments per project": change from "Unknown" to true
- "Collision prevention": change to false
- "Frequentist & Bayesian Stats Engine": change from "Bayesian only" to "Yes — both"
- "Sequential": change from true to "Not specified"
- "GA Automatic Revenue Tracking": change from false to true
- "Advanced goals": change from "Unknown" to true
- "Live Duration Insights": change from true to "N/A"
- "Traffic Allocation across projects": change from true to false
- "Projects available to agencies": change from "Unknown" to true
- "Live Log": change from false to true
- "Number of 3rd party integrations": change from "61" to "60+"
- "Experiment Heatmaps": change from false to "Not specified"
- "Convert Signals": change from false to "N/A"
- "Knowledge base": change from "Unknown" to "Not specified"
- "Add observations": change from "Unknown" to "Not specified"
- "Remove Report Data": change from true to "Not specified"

GOVERNANCE:
- "SOC 2 compliance": change from true to "Yes — SOC 2 Type II"
- "ISO 27001 Certified": change from "Unknown" to "Yes — ISO 27001 + 27017/27018/27701"
- "PCI-DSS compliance": change from false to "Not specified"
- "EU based servers": change from true to "Yes — AWS Frankfurt (EU)"
- "Third Party cookies": change from true to "365 days"
- "Do Not Track Browser": change from "Unknown" to "Not specified"
- "Non-PII Cookie lifetime": change from "Max 365 days" to "Not publicly specified"

Only change dy-single values. Do not modify any other competitor's values.
```

---

## Prompt 2: Add Intelligems as New Competitor

```
Add a new competitor called "Intelligems" to the comparison table. It has 3 plans: Core (id: ig-core), Plus (id: ig-plus), and Blue (id: ig-blue).

Add it to the COMPETITORS array after Dynamic Yield and before Amplitude:

{
  id: 'intelligems',
  name: 'Intelligems',
  plans: [
    { id: 'ig-core', name: 'Core' },
    { id: 'ig-plus', name: 'Plus' },
    { id: 'ig-blue', name: 'Blue' }
  ]
}

Then add ig-core, ig-plus, ig-blue values to EVERY existing COMPARISON_DATA entry. Insert them after dy-single and before the first amp-* key. Here are ALL the values by row:

PRICING:
- Number of Tested Users per month: all 3 = "Unlimited visitors (pricing scales by order volume)"
- Price per month (monthly plan): Core "$79/month - $1540", Plus "$499/month - $3375", Blue "$999/month - $4500"
- Price per month (annual plan): Core "$59/month - $1230", Plus "$374/month - $2625", Blue "$749/month - $3562"
- Annual price for whole year: Core "$708/year - $14760", Plus "$4,488/year - $31500", Blue "$8,988/year - $42744"
- Forced plan upgrades: all 3 = "Not publicly stated"
- Discounts 2 years: all 3 = "Not publicly listed"
- Discounts 3 years: all 3 = "Not publicly listed"
- Auto-upgrade: all 3 = "Not publicly stated"

SUPPORT:
- Email support (priority): all 3 = true
- Chat support: all 3 = "Slack (shared channel)"
- Phone support: all 3 = false
- Dedicated account manager: Core = false, Plus = "Yes — Annual plan only", Blue = "Yes — Annual plan only"
- Premium Onboarding: Core = false, Plus = "Yes — Intelligems-led integration", Blue = "Yes — Intelligems-led integration"

SCALE:
- Campaign Data Retention: all 3 = "Not specified"
- Number of Active Domains for A/B testing: all 3 = "No limits specified"
- Unlimited sub-domains: all 3 = true
- Custom domains (CNAME): all 3 = false
- Unlimited Tests: all 3 = true
- Unlimited Variations: all 3 = true
- Active goals: all 3 = "No limits specified"
- No. of Active Experiences: all 3 = "Unlimited"
- Number of Active Projects: all 3 = "Not specified"
- Unlimited Collaborators: all 3 = "Not specified"
- Deploys: all 3 = true

FEATURES:
- A/B Testing: Core = "Yes — themes, content, offers, checkout A/B tests", Plus = "Yes — includes price & shipping tests", Blue = "Yes — full suite incl. subscriptions & custom tests"
- Split URL Testing: all 3 = true
- Multipage Testing: all 3 = true
- Multivariate Testing: Core = false, Plus = false, Blue = "Partial — Combination tests (price + shipping)"
- Full Stack & Feature Flags: all 3 = false
- Multi-armed bandit: all 3 = true
- Mobile App Testing: all 3 = false
- Visual Editor: all 3 = "In beta"
- Advanced Code editor: all 3 = true
- Traffic Source Targeting: all 3 = true
- Time of Day Targeting: all 3 = false
- Language Targeting: all 3 = false
- IP Targeting: all 3 = false
- Custom Tag Targeting: all 3 = true
- Custom Javascript Targeting: all 3 = true
- Cookie Targeting: all 3 = true
- Geo Targeting: all 3 = true
- Advanced / Custom Targeting: all 3 = true
- AND/OR Audience: all 3 = true
- Custom segments per project: all 3 = true
- Post Segmentation: all 3 = true
- Personalize experiences for segments: Core = "Yes — offers/promotions + content personalizations", Plus = true, Blue = true
- Personalize experiences with behavior based targeting: all 3 = "Not specified"
- Collision prevention: all 3 = true
- QA Wizard: all 3 = true
- Environments: all 3 = "Not specified"
- Projects available to agencies: all 3 = "Not specified"
- Traffic Allocation across projects: all 3 = "Not applicable"
- Data segregation: all 3 = "Not specified"
- Anti-flicker protection: all 3 = true
- Javascript Event Pushing: all 3 = true
- Manual Activation: all 3 = "Unknown"
- Dynamic web triggers: all 3 = "Unknown"
- Frequentist & Bayesian Stats Engine: all 3 = "Not specified"
- Sequential: all 3 = "Not specified"
- Cross-domain Testing and Tracking: all 3 = false
- Dynamic Revenue Tracking: all 3 = true
- Google Analytics Goal Import: all 3 = "Not specified"
- GA Automatic Revenue Tracking: all 3 = true
- Advanced goals: all 3 = false
- Real Time Results: all 3 = true
- Live Duration Insights: all 3 = false
- Reports csv Export: all 3 = true
- Raw test data export: all 3 = true
- Remove Report Data: all 3 = "Not specified"
- Import & Export Templates: all 3 = "Not specified"
- Role Based Permissions: all 3 = "Dependent on Shopify plan"
- API Access: Core = "Yes — Javascript API", Plus = true, Blue = "Yes — Javascript API + Custom integrations (Blue)"
- Number of 3rd party integrations: all 3 = "Not publicly listed"
- SRM tests: all 3 = "Not specified"
- Version Control System for Tracking Script: all 3 = "Not specified"
- Change History: all 3 = "Not specified"
- Live Log: all 3 = "Not specified"
- Knowledge base: all 3 = false
- Add observations: all 3 = false
- Experiment Heatmaps: all 3 = false
- Convert Signals: all 3 = "N/A"

GOVERNANCE:
- Single Sign On (SSO): all 3 = "Login via Shopify"
- Bring your own ID (BYOID): all 3 = "Not specified"
- EU based servers: all 3 = false
- Non-PII Cookie lifetime: all 3 = "Not specified"
- Third Party cookies: all 3 = false
- Do Not Track Browser: all 3 = "Not specified"
- Support Opt Out Feature: all 3 = "Not specified"
- Data Protection Addendum: all 3 = "Not specified"
- PCI-DSS compliance: all 3 = "Not specified"
- SOC 2 compliance: all 3 = false
- ISO 27001 Certified: all 3 = false
```

---

## Prompt 3: Add 9 New Comparison Rows

```
Add these 9 new rows to the COMPARISON_DATA array. Each row needs values for ALL competitors. Place them in the features dimension section near related rows.

1. "Real-Time Reports" (dimension: features, tooltip: "Test report data updates in real time") — place near "Real Time Results":
   convert-growth: true, convert-pro: true, convert-enterprise: true,
   opt-essential: true, opt-enhanced: true, opt-advanced: true, opt-ultimate: true,
   vwo-growth: true, vwo-pro: true, vwo-enterprise: true,
   abt-single: true,
   kam-standard: true, kam-enterprise: true,
   dy-single: true,
   ig-core: true, ig-plus: true, ig-blue: true,
   amp-starter: "Unknown", amp-plus: "Unknown", amp-growth: true, amp-enterprise: true

2. "Custom Popups" (dimension: features, tooltip: "Design and launch pop-up messages from the Visual Editor") — place near "Convert Signals":
   convert-growth: true, convert-pro: true, convert-enterprise: true,
   opt-essential: "Unknown", opt-enhanced: "Unknown", opt-advanced: "Unknown", opt-ultimate: "Unknown",
   vwo-growth: "Separate product", vwo-pro: "Separate product", vwo-enterprise: "Separate product",
   abt-single: "Unknown",
   kam-standard: false, kam-enterprise: "Yes — Widget Studio",
   dy-single: true,
   ig-core: false, ig-plus: false, ig-blue: false,
   amp-starter: "Unknown", amp-plus: "Unknown", amp-growth: "Unknown", amp-enterprise: "Unknown"

3. "Easy One Tag Integrations" (dimension: features) — place near "Number of 3rd party integrations":
   convert-growth: true, convert-pro: true, convert-enterprise: true,
   opt-essential: true, opt-enhanced: true, opt-advanced: true, opt-ultimate: true,
   vwo-growth: true, vwo-pro: true, vwo-enterprise: true,
   abt-single: true,
   kam-standard: true, kam-enterprise: true,
   dy-single: true,
   ig-core: true, ig-plus: true, ig-blue: true,
   amp-starter: "For some integrations there are modals that allow you to easily integrate with selected apps", amp-plus: "Unknown", amp-growth: "Unknown", amp-enterprise: "Unknown"

4. "Unique JS/CSS per Variation" (dimension: features, tooltip: "Customize your variation by adding custom code") — place after "Advanced Code editor":
   convert-growth: true, convert-pro: true, convert-enterprise: true,
   opt-essential: true, opt-enhanced: true, opt-advanced: true, opt-ultimate: true,
   vwo-growth: true, vwo-pro: true, vwo-enterprise: true,
   abt-single: "Unknown",
   kam-standard: false, kam-enterprise: true,
   dy-single: true,
   ig-core: true, ig-plus: true, ig-blue: true,
   amp-starter: false, amp-plus: false, amp-growth: true, amp-enterprise: true

5. "Unique JS/CSS per Experiment" (dimension: features, tooltip: "Customize your experience by adding custom code") — place after "Unique JS/CSS per Variation":
   convert-growth: true, convert-pro: true, convert-enterprise: true,
   opt-essential: false, opt-enhanced: true, opt-advanced: true, opt-ultimate: true,
   vwo-growth: false, vwo-pro: true, vwo-enterprise: true,
   abt-single: "Unknown",
   kam-standard: false, kam-enterprise: true,
   dy-single: true,
   ig-core: true, ig-plus: true, ig-blue: true,
   amp-starter: "Unknown", amp-plus: "Unknown", amp-growth: "Unknown", amp-enterprise: "Unknown"

6. "Unique JS/CSS per Project" (dimension: features, tooltip: "Customize your project by adding custom code") — place after "Unique JS/CSS per Experiment":
   convert-growth: true, convert-pro: true, convert-enterprise: true,
   opt-essential: true, opt-enhanced: true, opt-advanced: true, opt-ultimate: true,
   vwo-growth: "Unknown", vwo-pro: "Unknown", vwo-enterprise: "Unknown",
   abt-single: "Unknown",
   kam-standard: false, kam-enterprise: true,
   dy-single: true,
   ig-core: "Not specified", ig-plus: "Not specified", ig-blue: "Not specified",
   amp-starter: "Unknown", amp-plus: "Unknown", amp-growth: "Unknown", amp-enterprise: "Unknown"

7. "Bulk Editing" (dimension: features, tooltip: "Activate, pause, archive, and unarchive experiences in bulk") — place near "Data segregation":
   convert-growth: true, convert-pro: true, convert-enterprise: true,
   opt-essential: false, opt-enhanced: false, opt-advanced: false, opt-ultimate: false,
   vwo-growth: true, vwo-pro: true, vwo-enterprise: true,
   abt-single: "Unknown",
   kam-standard: "Unknown", kam-enterprise: true,
   dy-single: true,
   ig-core: "Not specified", ig-plus: "Not specified", ig-blue: "Not specified",
   amp-starter: "Unknown", amp-plus: "Unknown", amp-growth: "Unknown", amp-enterprise: "Unknown"

8. "Advanced rule builder" (dimension: features, tooltip: "Enables detailed conditions for when tests should run") — place near "Post Segmentation":
   convert-growth: true, convert-pro: true, convert-enterprise: true,
   opt-essential: "Unknown", opt-enhanced: "Unknown", opt-advanced: "Unknown", opt-ultimate: "Unknown",
   vwo-growth: "Unknown", vwo-pro: "Unknown", vwo-enterprise: "Unknown",
   abt-single: "Unknown",
   kam-standard: true, kam-enterprise: true,
   dy-single: true,
   ig-core: "Not specified", ig-plus: "Not specified", ig-blue: "Not specified",
   amp-starter: "Unknown", amp-plus: "Unknown", amp-growth: "Unknown", amp-enterprise: "Unknown"

9. "Traffic Allocation availability for agencies" (dimension: features) — place right after "Traffic Allocation across projects":
   convert-growth: true, convert-pro: true, convert-enterprise: true,
   opt-essential: "Unknown", opt-enhanced: "Unknown", opt-advanced: "Unknown", opt-ultimate: "Unknown",
   vwo-growth: "Unknown", vwo-pro: "Unknown", vwo-enterprise: "Unknown",
   abt-single: "Unknown",
   kam-standard: "N/A", kam-enterprise: "N/A",
   dy-single: "Not specified",
   ig-core: "N/A", ig-plus: "N/A", ig-blue: "N/A",
   amp-starter: "Unknown", amp-plus: "Unknown", amp-growth: "Unknown", amp-enterprise: "Unknown"
```

---

## Prompt 4: Add Checkboxes to Setup Screen Options

```
In the comparison widget setup screen (ConvertComparisonFramework.tsx), update the competitor and dimension selection buttons to always show a checkbox indicator — not just when selected.

COMPETITOR BUTTONS:
Currently, the check icon only appears when selected (inside a conditional: `selectedCompetitors.includes(comp.id) && <div>...</div>`). Change this so the checkbox area ALWAYS renders:
- When UNSELECTED: show an empty 18x18px box with a 1.5px #CFD9E6 border, rounded 4px, white background
- When SELECTED: keep the current filled blue (#0066FF) square with white Check icon

The checkbox should be on the RIGHT side of each competitor button (it already is, just make it always visible).

DIMENSION BUTTONS:
Same change — the check icon currently only appears when selected. Make it always render:
- When UNSELECTED: show an empty 18x18px box with a 1.5px #CFD9E6 border, rounded 4px, white background  
- When SELECTED: keep the current filled purple (#6D28D9) square with white Check icon

The checkbox should be on the RIGHT side of each dimension button.

This makes it visually obvious that the options are multi-selectable checkboxes, not radio buttons or just clickable cards.
```

---

## Prompt 5: Update Setup Screen Heading to Clarify Multi-Select

```
In the comparison widget setup screen (ConvertComparisonFramework.tsx), update the subtitle text on the configuration screen.

Change the current subtitle:
"Choose which alternatives to benchmark against Convert (baseline) and which dimensions to evaluate."

To:
"Select one or more alternatives to benchmark against Convert (baseline) and choose which dimensions to evaluate."

This makes it explicit that multiple selections are supported.
```

---

## Prompt 6: Add PDF Download Button with Convert Logo

```
Add a "Download PDF" feature to the comparison table view in ConvertComparisonFramework.tsx.

SETUP:
1. Install html2canvas and jspdf: `yarn add html2canvas jspdf`
2. Import them at the top of the file:
   import html2canvas from 'html2canvas';
   import jsPDF from 'jspdf';

BUTTON PLACEMENT:
Add a "Download PDF" button in the Top Bar of the comparison table view (the div with className "p-2 border-b border-gray-200 bg-card flex items-center justify-between"). Place it between the "Show Filters" button and the "attributes • columns" counter. Style it consistently with the "Show Filters" button:
- White background, 1.5px solid #CFD9E6 border, 10px border-radius
- Font: 13px, weight 500, color #2A3342, Geist font family
- Use the lucide-react Download icon (import it) at 16px, color #647790
- Text: "Download PDF"

PDF GENERATION LOGIC:
When clicked:
1. Show a brief loading state on the button (change text to "Generating..." and disable it)
2. Target the table scroll container (the div right after the Top Bar that contains the <table> element)
3. Temporarily remove overflow:hidden/auto from the scroll container so the FULL table is captured (not just the visible portion)
4. Use html2canvas to capture the full table at scale 2 for high quality
5. Create a jsPDF document in landscape orientation, A3 size (to fit the wide table)
6. Add a header area at the top of the PDF (before the table):
   - Convert logo: draw a blue (#0066FF) rectangle 40x12px at top-left as a simple brand mark, with "CONVERT" text next to it in 14px bold #2A3342 font
   - Title: "Comparison Report" in 11px #647790 below the logo
   - Date: current date formatted as "Generated on April 8, 2026" in 9px #647790
   - A thin #E2E8F0 line separator below the header
7. Add the captured table image below the header, scaled to fit the page width with proper margins (15mm on each side)
8. Add a footer: "© 2024 Convert Comparison Framework • Proprietary Asset" in 8px #94A3B8, centered at the bottom
9. If the table is taller than one page, allow it to span multiple pages
10. Save the PDF as "Convert_Comparison_Report_YYYY-MM-DD.pdf"
11. Restore the scroll container's original overflow styles
12. Reset the button state

Also add this button to the MOBILE view comparison header, in the same position relative to the filters button.

IMPORTANT: Make sure the PDF captures the COMPLETE table including all scrollable content, not just what's visible in the viewport.
```
