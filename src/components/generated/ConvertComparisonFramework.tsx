import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Info, X, BadgeDollarSign, Headphones, Database, ShieldCheck, Zap, ChevronLeft, ChevronDown, SlidersHorizontal, ArrowLeft, Search } from 'lucide-react';
import { pdf, PDFViewer } from '@react-pdf/renderer';
import { cn } from '../../lib/utils';
import { useIsMobile } from '../../hooks/use-mobile';
import { ComparisonPdfDocument, type ComparisonPdfDocumentProps } from './ComparisonPdfDocument';

// --- Types ---
type ComparisonDimension = 'pricing' | 'scale' | 'features' | 'governance' | 'support';
interface PlanData {
  name: string;
  id: string;
  isConvert?: boolean;
}
interface Competitor {
  id: string;
  name: string;
  plans: PlanData[];
}
interface ComparisonDataPoint {
  attribute: string;
  dimension: ComparisonDimension;
  tooltip?: string;
  values: Record<string, string | boolean | 'Unknown' | 'Gated' | 'Not disclosed' | 'Not available'>;
}
interface ParsedValue {
  primaryValue: string | boolean | 'Unknown' | 'Gated' | 'Not disclosed' | 'Not available';
  tooltip?: string;
}

// --- Constants ---
const SELECTED_OPTION_CLASSES = 'border-primary bg-accent text-foreground shadow-md';
const DIMENSIONS: {
  id: ComparisonDimension;
  label: string;
  icon: React.ReactNode;
}[] = [{
  id: 'pricing',
  label: 'Pricing & TCO',
  icon: <BadgeDollarSign className="w-4 h-4" />
}, {
  id: 'scale',
  label: 'Scale & Limits',
  icon: <Database className="w-4 h-4" />
}, {
  id: 'features',
  label: 'Experimentation Features',
  icon: <Zap className="w-4 h-4" />
}, {
  id: 'governance',
  label: 'Governance & Security',
  icon: <ShieldCheck className="w-4 h-4" />
}, {
  id: 'support',
  label: 'Support & SLA',
  icon: <Headphones className="w-4 h-4" />
}];
const COMPETITORS: Competitor[] = [{
  id: 'optimizely',
  name: 'Optimizely',
  plans: [{
    id: 'opt-essential',
    name: 'Essential'
  }, {
    id: 'opt-enhanced',
    name: 'Enhanced'
  }, {
    id: 'opt-advanced',
    name: 'Advanced'
  }, {
    id: 'opt-ultimate',
    name: 'Ultimate'
  }]
}, {
  id: 'vwo',
  name: 'VWO',
  plans: [{
    id: 'vwo-growth',
    name: 'Growth'
  }, {
    id: 'vwo-pro',
    name: 'Pro'
  }, {
    id: 'vwo-enterprise',
    name: 'Enterprise'
  }]
}, {
  id: 'abtasty',
  name: 'AB Tasty',
  plans: [{
    id: 'abt-single',
    name: 'One Plan'
  }]
}, {
  id: 'kameleoon',
  name: 'Kameleoon',
  plans: [{
    id: 'kam-standard',
    name: 'PBX Starter'
  }, {
    id: 'kam-enterprise',
    name: 'Enterprise'
  }]
}, {
  id: 'dynamicyield',
  name: 'Dynamic Yield',
  plans: [{
    id: 'dy-single',
    name: 'Enterprise'
  }]
}, {
  id: 'intelligems',
  name: 'Intelligems',
  plans: [{
    id: 'ig-core',
    name: 'Core'
  }, {
    id: 'ig-plus',
    name: 'Plus'
  }, {
    id: 'ig-blue',
    name: 'Blue'
  }]
}, {
  id: 'amplitude',
  name: 'Amplitude',
  plans: [{
    id: 'amp-starter',
    name: 'Starter'
  }, {
    id: 'amp-plus',
    name: 'Plus'
  }, {
    id: 'amp-growth',
    name: 'Growth'
  }, {
    id: 'amp-enterprise',
    name: 'Enterprise'
  }]
}, {
  id: 'shoplift',
  name: 'Shoplift',
  plans: [{
    id: 'sl-core',
    name: 'Core'
  }, {
    id: 'sl-advanced',
    name: 'Advanced'
  }, {
    id: 'sl-pro',
    name: 'Pro'
  }]
}];
const CONVERT_PLANS: PlanData[] = [{
  id: 'convert-growth',
  name: 'Growth',
  isConvert: true
}, {
  id: 'convert-pro',
  name: 'Pro',
  isConvert: true
}, {
  id: 'convert-enterprise',
  name: 'Enterprise',
  isConvert: true
}];
const COMPARISON_DATA: ComparisonDataPoint[] = [
// ─── PRICING ────────────────────────────────────────────────────────────────
{
  attribute: 'Number of Tested Users per month',
  dimension: 'pricing',
  values: {
    'convert-growth': '100k - 750k',
    'convert-pro': '100k - 2m',
    'convert-enterprise': '1m - 5m+',
    'opt-essential': '250k - 2.5m',
    'opt-enhanced': '500k - Unlimited',
    'opt-advanced': '500k - Unlimited',
    'opt-ultimate': '1m - Unlimited',
    'vwo-growth': 'Up to 250K MTU (max)',
    'vwo-pro': 'Up to 1M MTU (max)',
    'vwo-enterprise': '1M+ MTU (custom)',
    'abt-single': 'Unknown',
    'kam-standard': '50,000 MTUs/month',
    'kam-enterprise': 'Unlimited MTUs',
    'dy-single': 'Not specified',
    'ig-core': 'Unlimited visitors (pricing scales by order volume)',
    'ig-plus': 'Unlimited visitors (pricing scales by order volume)',
    'ig-blue': 'Unlimited visitors (pricing scales by order volume)',
    'amp-starter': 'Up to 50k MTUs',
    'amp-plus': 'Up to 300k MTUs',
    'amp-growth': 'Custom MTU Volume',
    'amp-enterprise': 'Custom MTU Volume',
    'sl-core': 'Up to 100k store visitors',
    'sl-advanced': 'Up to 1m store visitors',
    'sl-pro': 'Up to 1m store visitors — gated thereafter'
  }
}, {
  attribute: 'Price per month (monthly plan)',
  dimension: 'pricing',
  values: {
    'convert-growth': '$399 - $2199',
    'convert-pro': '$599 - $4982',
    'convert-enterprise': 'Not available',
    'opt-essential': 'Unknown (gated pricing)',
    'opt-enhanced': 'Unknown (gated pricing)',
    'opt-advanced': 'Unknown (gated pricing)',
    'opt-ultimate': 'Unknown (gated pricing)',
    'vwo-growth': 'Not publicly available / Contact Sales',
    'vwo-pro': 'Not publicly available / Contact Sales',
    'vwo-enterprise': 'Not publicly available / Contact Sales',
    'abt-single': 'Annual plans only',
    'kam-standard': 'From $495/month',
    'kam-enterprise': 'Custom (contact sales)',
    'dy-single': 'Gated pricing',
    'ig-core': '$79/month - $1540',
    'ig-plus': '$499/month - $3375',
    'ig-blue': '$999/month - $4500',
    'amp-starter': 'Free',
    'amp-plus': '$61 (1k MTUs) - $3150 (300k MTUs)',
    'amp-growth': 'Contact Sales for pricing',
    'amp-enterprise': 'Contact Sales for pricing',
    'sl-core': '$99/mo - $199/mo',
    'sl-advanced': '$399/mo - $999/mo',
    'sl-pro': 'Annual only'
  }
}, {
  attribute: 'Price per month (annual plan)',
  dimension: 'pricing',
  tooltip: 'Total cost per month when billed annually',
  values: {
    'convert-growth': '$299 - $1540',
    'convert-pro': '$420 - $3488',
    'convert-enterprise': 'Price on request',
    'opt-essential': 'Unknown (gated pricing)',
    'opt-enhanced': 'Unknown (gated pricing)',
    'opt-advanced': 'Unknown (gated pricing)',
    'opt-ultimate': 'Unknown (gated pricing)',
    'vwo-growth': 'Not publicly available / Contact Sales',
    'vwo-pro': 'Not publicly available / Contact Sales',
    'vwo-enterprise': 'Not publicly available / Contact Sales',
    'abt-single': 'Unknown',
    'kam-standard': 'Not publicly listed',
    'kam-enterprise': 'Custom (contact sales)',
    'dy-single': 'Gated pricing',
    'ig-core': '$59/month - $1230',
    'ig-plus': '$374/month - $2625',
    'ig-blue': '$749/month - $3562',
    'amp-starter': 'Free',
    'amp-plus': '$49 (1k MTUs) - $2520 (300k MTUs)',
    'amp-growth': 'Contact Sales for pricing',
    'amp-enterprise': 'Contact Sales for pricing',
    'sl-core': '$74/mo - $149/mo',
    'sl-advanced': '$299/mo - $749/mo, then gated',
    'sl-pro': '$699/mo - $1499/mo, then gated'
  }
}, {
  attribute: 'Annual price for whole year',
  dimension: 'pricing',
  tooltip: 'Total annual cost when paid annually',
  values: {
    'convert-growth': '$3588 - $18480',
    'convert-pro': '$5040 - $41856',
    'convert-enterprise': 'Price on request',
    'opt-essential': 'Unknown (gated pricing)',
    'opt-enhanced': 'Unknown (gated pricing)',
    'opt-advanced': 'Unknown (gated pricing)',
    'opt-ultimate': 'Unknown (gated pricing)',
    'vwo-growth': 'Not publicly available / Contact Sales',
    'vwo-pro': 'Not publicly available / Contact Sales',
    'vwo-enterprise': 'Not publicly available / Contact Sales',
    'abt-single': 'Unknown',
    'kam-standard': 'Not publicly listed',
    'kam-enterprise': 'Custom (contact sales)',
    'dy-single': 'Gated pricing',
    'ig-core': '$708/year - $14760',
    'ig-plus': '$4,488/year - $31500',
    'ig-blue': '$8,988/year - $42744',
    'amp-starter': 'Free',
    'amp-plus': '$588 - $30,240',
    'amp-growth': 'Contact Sales for pricing',
    'amp-enterprise': 'Contact Sales for pricing',
    'sl-core': '$888/yr - $1788/yr',
    'sl-advanced': '$3588/yr - $8988/yr',
    'sl-pro': '$8388/yr - $17988/yr'
  }
}, {
  attribute: 'Forced plan upgrades',
  dimension: 'pricing',
  tooltip: 'Whether the vendor forces you to upgrade when changing plans',
  values: {
    'convert-growth': false,
    'convert-pro': false,
    'convert-enterprise': false,
    'opt-essential': 'Unknown',
    'opt-enhanced': 'Unknown',
    'opt-advanced': 'Unknown',
    'opt-ultimate': 'Unknown',
    'vwo-growth': 'Unknown',
    'vwo-pro': 'Unknown',
    'vwo-enterprise': 'Unknown',
    'abt-single': 'Unknown',
    'kam-standard': false,
    'kam-enterprise': false,
    'dy-single': 'Unknown',
    'ig-core': 'Not publicly stated',
    'ig-plus': 'Not publicly stated',
    'ig-blue': 'Not publicly stated',
    'amp-starter': 'Unknown',
    'amp-plus': 'Unknown',
    'amp-growth': 'Unknown',
    'amp-enterprise': 'Unknown',
    'sl-core': false,
    'sl-advanced': false,
    'sl-pro': false
  }
}, {
  attribute: 'Discounts 2 years',
  dimension: 'pricing',
  values: {
    'convert-growth': true,
    'convert-pro': true,
    'convert-enterprise': true,
    'opt-essential': 'Unknown',
    'opt-enhanced': 'Unknown',
    'opt-advanced': 'Unknown',
    'opt-ultimate': 'Unknown',
    'vwo-growth': true,
    'vwo-pro': true,
    'vwo-enterprise': true,
    'abt-single': 'Unknown',
    'kam-standard': true,
    'kam-enterprise': true,
    'dy-single': 'Unknown',
    'ig-core': 'Not publicly listed',
    'ig-plus': 'Not publicly listed',
    'ig-blue': 'Not publicly listed',
    'amp-starter': 'Unknown',
    'amp-plus': 'Unknown',
    'amp-growth': 'Unknown',
    'amp-enterprise': 'Unknown',
    'sl-core': 'Unknown',
    'sl-advanced': 'Unknown',
    'sl-pro': 'Unknown'
  }
}, {
  attribute: 'Discounts 3 years',
  dimension: 'pricing',
  values: {
    'convert-growth': true,
    'convert-pro': true,
    'convert-enterprise': true,
    'opt-essential': 'Unknown',
    'opt-enhanced': 'Unknown',
    'opt-advanced': 'Unknown',
    'opt-ultimate': 'Unknown',
    'vwo-growth': true,
    'vwo-pro': true,
    'vwo-enterprise': true,
    'abt-single': 'Unknown',
    'kam-standard': true,
    'kam-enterprise': true,
    'dy-single': 'Unknown',
    'ig-core': 'Not publicly listed',
    'ig-plus': 'Not publicly listed',
    'ig-blue': 'Not publicly listed',
    'amp-starter': 'Unknown',
    'amp-plus': 'Unknown',
    'amp-growth': 'Unknown',
    'amp-enterprise': 'Unknown',
    'sl-core': 'Unknown',
    'sl-advanced': 'Unknown',
    'sl-pro': 'Unknown'
  }
}, {
  attribute: 'Auto-upgrade',
  dimension: 'pricing',
  tooltip: 'How overage is handled when limits are exceeded',
  values: {
    'convert-growth': 'No (overcharge per 100k $399)',
    'convert-pro': 'No (overcharge per 250k $699)',
    'convert-enterprise': 'No (overcharge per 250k $699)',
    'opt-essential': 'Unknown',
    'opt-enhanced': 'Unknown',
    'opt-advanced': 'Unknown',
    'opt-ultimate': 'Unknown',
    'vwo-growth': 'Yes - MTU add-on available',
    'vwo-pro': 'Yes - MTU add-on available',
    'vwo-enterprise': 'Yes - MTU add-on available',
    'abt-single': 'Unknown',
    'kam-standard': 'No — experiments pause at credit/MTU limit',
    'kam-enterprise': 'No — unlimited experiments; no auto-upgrade',
    'dy-single': 'Not publicly stated',
    'ig-core': 'Not publicly stated',
    'ig-plus': 'Not publicly stated',
    'ig-blue': 'Not publicly stated',
    'amp-starter': 'If data sent is over limit, user loses access to their account',
    'amp-plus': 'Dependent on Amplitude Analytics plan',
    'amp-growth': true,
    'amp-enterprise': true,
    'sl-core': 'No (tests pause)',
    'sl-advanced': 'No (tests pause)',
    'sl-pro': 'No (tests pause)'
  }
},
// ─── SCALE ──────────────────────────────────────────────────────────────────
{
  attribute: 'Campaign Data Retention',
  dimension: 'scale',
  values: {
    'convert-growth': 'No limit',
    'convert-pro': 'No limit',
    'convert-enterprise': 'No limit',
    'opt-essential': '18 months',
    'opt-enhanced': '18 months',
    'opt-advanced': '18 months',
    'opt-ultimate': '18 months',
    'vwo-growth': 'Unlimited',
    'vwo-pro': 'Unlimited',
    'vwo-enterprise': 'Unlimited',
    'abt-single': '25 months',
    'kam-standard': '2 years',
    'kam-enterprise': '2 years',
    'dy-single': 'Not publicly specified',
    'ig-core': 'Not specified',
    'ig-plus': 'Not specified',
    'ig-blue': 'Not specified',
    'amp-starter': '1 year',
    'amp-plus': '2 years',
    'amp-growth': 'Unlimited',
    'amp-enterprise': 'Unlimited',
    'sl-core': 'Unknown',
    'sl-advanced': 'Unknown',
    'sl-pro': 'Unknown'
  }
}, {
  attribute: 'Number of Active Domains for A/B testing',
  dimension: 'scale',
  values: {
    'convert-growth': '10',
    'convert-pro': 'Unlimited',
    'convert-enterprise': 'Unlimited',
    'opt-essential': 'Unlimited',
    'opt-enhanced': 'Unlimited',
    'opt-advanced': 'Unlimited',
    'opt-ultimate': 'Unlimited',
    'vwo-growth': '3',
    'vwo-pro': '5',
    'vwo-enterprise': '10',
    'abt-single': 'No limits specified',
    'kam-standard': 'Unknown',
    'kam-enterprise': 'Unlimited',
    'dy-single': 'Unlimited (enterprise)',
    'ig-core': 'No limits specified',
    'ig-plus': 'No limits specified',
    'ig-blue': 'No limits specified',
    'amp-starter': 'Unlimited',
    'amp-plus': 'Not available',
    'amp-growth': 'Unlimited',
    'amp-enterprise': 'Unlimited',
    'sl-core': '1 (Shopify store)',
    'sl-advanced': '1 (Shopify store)',
    'sl-pro': '1 (Shopify store)'
  }
}, {
  attribute: 'Unlimited sub-domains',
  dimension: 'scale',
  values: {
    'convert-growth': true,
    'convert-pro': true,
    'convert-enterprise': true,
    'opt-essential': 'Unlimited',
    'opt-enhanced': 'Unlimited',
    'opt-advanced': 'Unlimited',
    'opt-ultimate': 'Unlimited',
    'vwo-growth': true,
    'vwo-pro': true,
    'vwo-enterprise': true,
    'abt-single': 'No limits specified',
    'kam-standard': true,
    'kam-enterprise': true,
    'dy-single': 'Not specified',
    'ig-core': true,
    'ig-plus': true,
    'ig-blue': true,
    'amp-starter': true,
    'amp-plus': true,
    'amp-growth': true,
    'amp-enterprise': true,
    'sl-core': 'Unknown',
    'sl-advanced': 'Unknown',
    'sl-pro': 'Unknown'
  }
}, {
  attribute: 'Custom domains (CNAME)',
  dimension: 'scale',
  values: {
    'convert-growth': false,
    'convert-pro': true,
    'convert-enterprise': true,
    'opt-essential': false,
    'opt-enhanced': true,
    'opt-advanced': true,
    'opt-ultimate': true,
    'vwo-growth': true,
    'vwo-pro': true,
    'vwo-enterprise': true,
    'abt-single': true,
    'kam-standard': true,
    'kam-enterprise': true,
    'dy-single': true,
    'ig-core': false,
    'ig-plus': false,
    'ig-blue': false,
    'amp-starter': 'Unknown',
    'amp-plus': 'Unknown',
    'amp-growth': 'Unknown',
    'amp-enterprise': 'Unknown',
    'sl-core': 'Unknown',
    'sl-advanced': 'Unknown',
    'sl-pro': 'Unknown'
  }
}, {
  attribute: 'Unlimited Tests',
  dimension: 'scale',
  values: {
    'convert-growth': true,
    'convert-pro': true,
    'convert-enterprise': true,
    'opt-essential': true,
    'opt-enhanced': true,
    'opt-advanced': true,
    'opt-ultimate': true,
    'vwo-growth': 'Unlimited',
    'vwo-pro': 'Unlimited',
    'vwo-enterprise': 'Unlimited',
    'abt-single': true,
    'kam-standard': 'No — credit-limited (30–200 credits/month)',
    'kam-enterprise': 'Yes — unlimited',
    'dy-single': true,
    'ig-core': true,
    'ig-plus': true,
    'ig-blue': true,
    'amp-starter': 'Unknown',
    'amp-plus': 'Unknown',
    'amp-growth': 'Unknown',
    'amp-enterprise': 'Unknown',
    'sl-core': true,
    'sl-advanced': true,
    'sl-pro': true
  }
}, {
  attribute: 'Unlimited Variations',
  dimension: 'scale',
  values: {
    'convert-growth': true,
    'convert-pro': true,
    'convert-enterprise': true,
    'opt-essential': 'Unknown',
    'opt-enhanced': 'Unknown',
    'opt-advanced': 'Unknown',
    'opt-ultimate': 'Unknown',
    'vwo-growth': 'Unlimited',
    'vwo-pro': 'Unlimited',
    'vwo-enterprise': 'Unlimited',
    'abt-single': true,
    'kam-standard': 'No — credit-limited',
    'kam-enterprise': 'Yes — unlimited',
    'dy-single': true,
    'ig-core': true,
    'ig-plus': true,
    'ig-blue': true,
    'amp-starter': 'Unknown',
    'amp-plus': 'Unknown',
    'amp-growth': 'Unknown',
    'amp-enterprise': 'Unknown',
    'sl-core': true,
    'sl-advanced': true,
    'sl-pro': true
  }
}, {
  attribute: 'Active goals',
  dimension: 'scale',
  values: {
    'convert-growth': '30',
    'convert-pro': '100',
    'convert-enterprise': '200',
    'opt-essential': 'Unknown',
    'opt-enhanced': 'Unknown',
    'opt-advanced': 'Unknown',
    'opt-ultimate': 'Unknown',
    'vwo-growth': 'Unlimited',
    'vwo-pro': 'Unlimited',
    'vwo-enterprise': 'Unlimited',
    'abt-single': 'Unknown',
    'kam-standard': 'Unlimited',
    'kam-enterprise': 'Unlimited',
    'dy-single': 'Not publicly specified',
    'ig-core': 'No limits specified',
    'ig-plus': 'No limits specified',
    'ig-blue': 'No limits specified',
    'amp-starter': 'Unknown',
    'amp-plus': 'Unknown',
    'amp-growth': 'Unknown',
    'amp-enterprise': 'Unknown',
    'sl-core': 'Unknown',
    'sl-advanced': 'Unknown',
    'sl-pro': 'Unknown'
  }
}, {
  attribute: 'No. of Active Experiences',
  dimension: 'scale',
  values: {
    'convert-growth': '5',
    'convert-pro': 'Unlimited',
    'convert-enterprise': 'Unlimited',
    'opt-essential': 'Unlimited',
    'opt-enhanced': 'Unlimited',
    'opt-advanced': 'Unlimited',
    'opt-ultimate': 'Unlimited',
    'vwo-growth': 'Unlimited',
    'vwo-pro': 'Unlimited',
    'vwo-enterprise': 'Unlimited',
    'abt-single': 'Unknown',
    'kam-standard': 'Credit-limited (30–200 credits/month)',
    'kam-enterprise': 'Unlimited',
    'dy-single': 'Not publicly specified',
    'ig-core': 'Unlimited',
    'ig-plus': 'Unlimited',
    'ig-blue': 'Unlimited',
    'amp-starter': 'Unknown',
    'amp-plus': 'Unknown',
    'amp-growth': 'Unknown',
    'amp-enterprise': 'Unknown',
    'sl-core': 'Unlimited',
    'sl-advanced': 'Unlimited',
    'sl-pro': 'Unlimited'
  }
}, {
  attribute: 'Number of Active Projects',
  dimension: 'scale',
  values: {
    'convert-growth': '5',
    'convert-pro': '30',
    'convert-enterprise': 'Unlimited',
    'opt-essential': '1',
    'opt-enhanced': true,
    'opt-advanced': true,
    'opt-ultimate': true,
    'vwo-growth': '1',
    'vwo-pro': '3',
    'vwo-enterprise': '5',
    'abt-single': 'Unknown',
    'kam-standard': '1 project',
    'kam-enterprise': 'Unlimited',
    'dy-single': 'Not specified',
    'ig-core': 'Not specified',
    'ig-plus': 'Not specified',
    'ig-blue': 'Not specified',
    'amp-starter': '5',
    'amp-plus': '5',
    'amp-growth': '50',
    'amp-enterprise': '200',
    'sl-core': 'N/A',
    'sl-advanced': 'N/A',
    'sl-pro': 'N/A'
  }
}, {
  attribute: 'Unlimited Collaborators',
  dimension: 'scale',
  values: {
    'convert-growth': true,
    'convert-pro': true,
    'convert-enterprise': true,
    'opt-essential': 'Not available',
    'opt-enhanced': '10',
    'opt-advanced': '20',
    'opt-ultimate': '40',
    'vwo-growth': true,
    'vwo-pro': true,
    'vwo-enterprise': true,
    'abt-single': 'Unknown',
    'kam-standard': true,
    'kam-enterprise': true,
    'dy-single': true,
    'ig-core': 'Not specified',
    'ig-plus': 'Not specified',
    'ig-blue': 'Not specified',
    'amp-starter': true,
    'amp-plus': true,
    'amp-growth': true,
    'amp-enterprise': true,
    'sl-core': true,
    'sl-advanced': true,
    'sl-pro': true
  }
}, {
  attribute: 'Deploys',
  dimension: 'scale',
  tooltip: 'Personalization-like experiences with no traffic or time limits',
  values: {
    'convert-growth': '10',
    'convert-pro': '100',
    'convert-enterprise': '300',
    'opt-essential': false,
    'opt-enhanced': false,
    'opt-advanced': false,
    'opt-ultimate': true,
    'vwo-growth': 'Add-on required',
    'vwo-pro': 'Add-on required',
    'vwo-enterprise': 'Add-on required',
    'abt-single': 'Unknown',
    'kam-standard': false,
    'kam-enterprise': true,
    'dy-single': 'N/A',
    'ig-core': true,
    'ig-plus': true,
    'ig-blue': true,
    'amp-starter': false,
    'amp-plus': false,
    'amp-growth': true,
    'amp-enterprise': true,
    'sl-core': 'N/A',
    'sl-advanced': 'N/A',
    'sl-pro': 'N/A'
  }
},
// ─── FEATURES ────────────────────────────────────────────────────────────────
{
  attribute: 'A/B Testing',
  dimension: 'features',
  values: {
    'convert-growth': true,
    'convert-pro': true,
    'convert-enterprise': true,
    'opt-essential': true,
    'opt-enhanced': true,
    'opt-advanced': true,
    'opt-ultimate': true,
    'vwo-growth': true,
    'vwo-pro': true,
    'vwo-enterprise': true,
    'abt-single': true,
    'kam-standard': 'Yes — via Prompt-Based Experimentation (AI)',
    'kam-enterprise': 'Yes — full A/B testing suite',
    'dy-single': true,
    'ig-core': 'Yes — themes, content, offers, checkout A/B tests',
    'ig-plus': 'Yes — includes price & shipping tests',
    'ig-blue': 'Yes — full suite incl. subscriptions & custom tests',
    'amp-starter': true,
    'amp-plus': true,
    'amp-growth': true,
    'amp-enterprise': true,
    'sl-core': true,
    'sl-advanced': true,
    'sl-pro': true
  }
}, {
  attribute: 'Split URL Testing',
  dimension: 'features',
  values: {
    'convert-growth': true,
    'convert-pro': true,
    'convert-enterprise': true,
    'opt-essential': true,
    'opt-enhanced': true,
    'opt-advanced': true,
    'opt-ultimate': true,
    'vwo-growth': true,
    'vwo-pro': true,
    'vwo-enterprise': true,
    'abt-single': true,
    'kam-standard': true,
    'kam-enterprise': true,
    'dy-single': true,
    'ig-core': true,
    'ig-plus': true,
    'ig-blue': true,
    'amp-starter': 'Unknown',
    'amp-plus': 'Unknown',
    'amp-growth': 'Unknown',
    'amp-enterprise': 'Unknown',
    'sl-core': true,
    'sl-advanced': true,
    'sl-pro': true
  }
}, {
  attribute: 'Multipage Testing',
  dimension: 'features',
  values: {
    'convert-growth': false,
    'convert-pro': true,
    'convert-enterprise': true,
    'opt-essential': true,
    'opt-enhanced': true,
    'opt-advanced': true,
    'opt-ultimate': true,
    'vwo-growth': true,
    'vwo-pro': true,
    'vwo-enterprise': true,
    'abt-single': true,
    'kam-standard': true,
    'kam-enterprise': true,
    'dy-single': true,
    'ig-core': true,
    'ig-plus': true,
    'ig-blue': true,
    'amp-starter': 'Unknown',
    'amp-plus': 'Unknown',
    'amp-growth': 'Unknown',
    'amp-enterprise': 'Unknown',
    'sl-core': true,
    'sl-advanced': true,
    'sl-pro': true
  }
}, {
  attribute: 'Multivariate Testing',
  dimension: 'features',
  values: {
    'convert-growth': false,
    'convert-pro': true,
    'convert-enterprise': true,
    'opt-essential': false,
    'opt-enhanced': false,
    'opt-advanced': true,
    'opt-ultimate': true,
    'vwo-growth': false,
    'vwo-pro': true,
    'vwo-enterprise': true,
    'abt-single': true,
    'kam-standard': false,
    'kam-enterprise': true,
    'dy-single': true,
    'ig-core': false,
    'ig-plus': false,
    'ig-blue': 'Partial — Combination tests (price + shipping)',
    'amp-starter': true,
    'amp-plus': true,
    'amp-growth': true,
    'amp-enterprise': true,
    'sl-core': false,
    'sl-advanced': false,
    'sl-pro': false
  }
}, {
  attribute: 'Full Stack & Feature Flags',
  dimension: 'features',
  values: {
    'convert-growth': false,
    'convert-pro': true,
    'convert-enterprise': true,
    'opt-essential': 'Separate product',
    'opt-enhanced': 'Separate product',
    'opt-advanced': 'Separate product',
    'opt-ultimate': 'Separate product',
    'vwo-growth': 'Available via separate product',
    'vwo-pro': 'Available via separate product',
    'vwo-enterprise': 'Available via separate product',
    'abt-single': true,
    'kam-standard': false,
    'kam-enterprise': true,
    'dy-single': true,
    'ig-core': false,
    'ig-plus': false,
    'ig-blue': false,
    'amp-starter': true,
    'amp-plus': true,
    'amp-growth': true,
    'amp-enterprise': true,
    'sl-core': false,
    'sl-advanced': false,
    'sl-pro': false
  }
}, {
  attribute: 'Multi-armed bandit',
  dimension: 'features',
  tooltip: 'Automatically allocates traffic to better-performing variants',
  values: {
    'convert-growth': false,
    'convert-pro': true,
    'convert-enterprise': true,
    'opt-essential': false,
    'opt-enhanced': true,
    'opt-advanced': true,
    'opt-ultimate': true,
    'vwo-growth': true,
    'vwo-pro': true,
    'vwo-enterprise': true,
    'abt-single': 'Unknown',
    'kam-standard': true,
    'kam-enterprise': true,
    'dy-single': true,
    'ig-core': true,
    'ig-plus': true,
    'ig-blue': true,
    'amp-starter': true,
    'amp-plus': true,
    'amp-growth': true,
    'amp-enterprise': true,
    'sl-core': false,
    'sl-advanced': false,
    'sl-pro': false
  }
}, {
  attribute: 'Mobile App Testing',
  dimension: 'features',
  values: {
    'convert-growth': false,
    'convert-pro': false,
    'convert-enterprise': false,
    'opt-essential': 'With Feature Experimentation',
    'opt-enhanced': 'With Feature Experimentation',
    'opt-advanced': 'With Feature Experimentation',
    'opt-ultimate': 'With Feature Experimentation',
    'vwo-growth': 'Separate product',
    'vwo-pro': 'Separate product',
    'vwo-enterprise': 'Separate product',
    'abt-single': true,
    'kam-standard': false,
    'kam-enterprise': true,
    'dy-single': true,
    'ig-core': false,
    'ig-plus': false,
    'ig-blue': false,
    'amp-starter': false,
    'amp-plus': true,
    'amp-growth': true,
    'amp-enterprise': true,
    'sl-core': false,
    'sl-advanced': false,
    'sl-pro': false
  }
}, {
  attribute: 'Visual Editor',
  dimension: 'features',
  values: {
    'convert-growth': true,
    'convert-pro': true,
    'convert-enterprise': true,
    'opt-essential': true,
    'opt-enhanced': true,
    'opt-advanced': true,
    'opt-ultimate': true,
    'vwo-growth': true,
    'vwo-pro': true,
    'vwo-enterprise': true,
    'abt-single': true,
    'kam-standard': 'No — AI prompt-based only',
    'kam-enterprise': true,
    'dy-single': true,
    'ig-core': 'In beta',
    'ig-plus': 'In beta',
    'ig-blue': 'In beta',
    'amp-starter': true,
    'amp-plus': true,
    'amp-growth': true,
    'amp-enterprise': true,
    'sl-core': true,
    'sl-advanced': true,
    'sl-pro': true
  }
}, {
  attribute: 'Advanced Code Editor',
  dimension: 'features',
  values: {
    'convert-growth': true,
    'convert-pro': true,
    'convert-enterprise': true,
    'opt-essential': true,
    'opt-enhanced': true,
    'opt-advanced': true,
    'opt-ultimate': true,
    'vwo-growth': true,
    'vwo-pro': true,
    'vwo-enterprise': true,
    'abt-single': true,
    'kam-standard': false,
    'kam-enterprise': true,
    'dy-single': true,
    'ig-core': true,
    'ig-plus': true,
    'ig-blue': true,
    'amp-starter': false,
    'amp-plus': false,
    'amp-growth': true,
    'amp-enterprise': true,
    'sl-core': true,
    'sl-advanced': true,
    'sl-pro': true
  }
}, {
  attribute: 'Unique JS/CSS per Variation',
  dimension: 'features',
  tooltip: 'Customize your variation by adding custom code',
  values: {
    'convert-growth': true,
    'convert-pro': true,
    'convert-enterprise': true,
    'opt-essential': true,
    'opt-enhanced': true,
    'opt-advanced': true,
    'opt-ultimate': true,
    'vwo-growth': true,
    'vwo-pro': true,
    'vwo-enterprise': true,
    'abt-single': 'Unknown',
    'kam-standard': false,
    'kam-enterprise': true,
    'dy-single': true,
    'ig-core': true,
    'ig-plus': true,
    'ig-blue': true,
    'amp-starter': false,
    'amp-plus': false,
    'amp-growth': true,
    'amp-enterprise': true,
    'sl-core': true,
    'sl-advanced': true,
    'sl-pro': true
  }
}, {
  attribute: 'Unique JS/CSS per Experiment',
  dimension: 'features',
  tooltip: 'Customize your experience by adding custom code',
  values: {
    'convert-growth': true,
    'convert-pro': true,
    'convert-enterprise': true,
    'opt-essential': false,
    'opt-enhanced': true,
    'opt-advanced': true,
    'opt-ultimate': true,
    'vwo-growth': false,
    'vwo-pro': true,
    'vwo-enterprise': true,
    'abt-single': 'Unknown',
    'kam-standard': false,
    'kam-enterprise': true,
    'dy-single': true,
    'ig-core': true,
    'ig-plus': true,
    'ig-blue': true,
    'amp-starter': 'Unknown',
    'amp-plus': 'Unknown',
    'amp-growth': 'Unknown',
    'amp-enterprise': 'Unknown',
    'sl-core': true,
    'sl-advanced': true,
    'sl-pro': true
  }
}, {
  attribute: 'Unique JS/CSS per Project',
  dimension: 'features',
  tooltip: 'Customize your project by adding custom code',
  values: {
    'convert-growth': true,
    'convert-pro': true,
    'convert-enterprise': true,
    'opt-essential': true,
    'opt-enhanced': true,
    'opt-advanced': true,
    'opt-ultimate': true,
    'vwo-growth': 'Unknown',
    'vwo-pro': 'Unknown',
    'vwo-enterprise': 'Unknown',
    'abt-single': 'Unknown',
    'kam-standard': false,
    'kam-enterprise': true,
    'dy-single': true,
    'ig-core': 'Not specified',
    'ig-plus': 'Not specified',
    'ig-blue': 'Not specified',
    'amp-starter': 'Unknown',
    'amp-plus': 'Unknown',
    'amp-growth': 'Unknown',
    'amp-enterprise': 'Unknown',
    'sl-core': 'N/A',
    'sl-advanced': 'N/A',
    'sl-pro': 'N/A'
  }
}, {
  attribute: 'Traffic Source Targeting',
  dimension: 'features',
  values: {
    'convert-growth': true,
    'convert-pro': true,
    'convert-enterprise': true,
    'opt-essential': true,
    'opt-enhanced': true,
    'opt-advanced': true,
    'opt-ultimate': true,
    'vwo-growth': true,
    'vwo-pro': true,
    'vwo-enterprise': true,
    'abt-single': true,
    'kam-standard': true,
    'kam-enterprise': true,
    'dy-single': true,
    'ig-core': true,
    'ig-plus': true,
    'ig-blue': true,
    'amp-starter': false,
    'amp-plus': true,
    'amp-growth': true,
    'amp-enterprise': true,
    'sl-core': false,
    'sl-advanced': true,
    'sl-pro': true
  }
}, {
  attribute: 'Time of Day Targeting',
  dimension: 'features',
  values: {
    'convert-growth': true,
    'convert-pro': true,
    'convert-enterprise': true,
    'opt-essential': false,
    'opt-enhanced': true,
    'opt-advanced': true,
    'opt-ultimate': true,
    'vwo-growth': false,
    'vwo-pro': true,
    'vwo-enterprise': true,
    'abt-single': true,
    'kam-standard': true,
    'kam-enterprise': true,
    'dy-single': true,
    'ig-core': false,
    'ig-plus': false,
    'ig-blue': false,
    'amp-starter': false,
    'amp-plus': true,
    'amp-growth': true,
    'amp-enterprise': true,
    'sl-core': false,
    'sl-advanced': false,
    'sl-pro': false
  }
}, {
  attribute: 'Language Targeting',
  dimension: 'features',
  values: {
    'convert-growth': true,
    'convert-pro': true,
    'convert-enterprise': true,
    'opt-essential': true,
    'opt-enhanced': true,
    'opt-advanced': true,
    'opt-ultimate': true,
    'vwo-growth': false,
    'vwo-pro': true,
    'vwo-enterprise': true,
    'abt-single': true,
    'kam-standard': true,
    'kam-enterprise': true,
    'dy-single': false,
    'ig-core': false,
    'ig-plus': false,
    'ig-blue': false,
    'amp-starter': false,
    'amp-plus': true,
    'amp-growth': true,
    'amp-enterprise': true,
    'sl-core': false,
    'sl-advanced': false,
    'sl-pro': false
  }
}, {
  attribute: 'IP Targeting',
  dimension: 'features',
  values: {
    'convert-growth': false,
    'convert-pro': false,
    'convert-enterprise': false,
    'opt-essential': true,
    'opt-enhanced': true,
    'opt-advanced': true,
    'opt-ultimate': true,
    'vwo-growth': false,
    'vwo-pro': false,
    'vwo-enterprise': true,
    'abt-single': true,
    'kam-standard': true,
    'kam-enterprise': true,
    'dy-single': false,
    'ig-core': false,
    'ig-plus': false,
    'ig-blue': false,
    'amp-starter': false,
    'amp-plus': false,
    'amp-growth': true,
    'amp-enterprise': true,
    'sl-core': false,
    'sl-advanced': false,
    'sl-pro': false
  }
}, {
  attribute: 'Geo Targeting',
  dimension: 'features',
  values: {
    'convert-growth': false,
    'convert-pro': true,
    'convert-enterprise': true,
    'opt-essential': false,
    'opt-enhanced': true,
    'opt-advanced': true,
    'opt-ultimate': true,
    'vwo-growth': false,
    'vwo-pro': true,
    'vwo-enterprise': true,
    'abt-single': true,
    'kam-standard': true,
    'kam-enterprise': true,
    'dy-single': true,
    'ig-core': true,
    'ig-plus': true,
    'ig-blue': true,
    'amp-starter': false,
    'amp-plus': true,
    'amp-growth': true,
    'amp-enterprise': true,
    'sl-core': false,
    'sl-advanced': true,
    'sl-pro': true
  }
}, {
  attribute: 'Cookie Targeting',
  dimension: 'features',
  values: {
    'convert-growth': true,
    'convert-pro': true,
    'convert-enterprise': true,
    'opt-essential': true,
    'opt-enhanced': true,
    'opt-advanced': true,
    'opt-ultimate': true,
    'vwo-growth': false,
    'vwo-pro': true,
    'vwo-enterprise': true,
    'abt-single': true,
    'kam-standard': true,
    'kam-enterprise': true,
    'dy-single': true,
    'ig-core': true,
    'ig-plus': true,
    'ig-blue': true,
    'amp-starter': false,
    'amp-plus': true,
    'amp-growth': true,
    'amp-enterprise': true,
    'sl-core': false,
    'sl-advanced': false,
    'sl-pro': false
  }
}, {
  attribute: 'Custom Javascript Targeting',
  dimension: 'features',
  values: {
    'convert-growth': true,
    'convert-pro': true,
    'convert-enterprise': true,
    'opt-essential': true,
    'opt-enhanced': true,
    'opt-advanced': true,
    'opt-ultimate': true,
    'vwo-growth': false,
    'vwo-pro': true,
    'vwo-enterprise': true,
    'abt-single': true,
    'kam-standard': true,
    'kam-enterprise': true,
    'dy-single': true,
    'ig-core': true,
    'ig-plus': true,
    'ig-blue': true,
    'amp-starter': true,
    'amp-plus': true,
    'amp-growth': true,
    'amp-enterprise': true,
    'sl-core': false,
    'sl-advanced': 'Yes — JS API',
    'sl-pro': 'Yes — JS API'
  }
}, {
  attribute: 'Custom Tag Targeting',
  dimension: 'features',
  values: {
    'convert-growth': true,
    'convert-pro': true,
    'convert-enterprise': true,
    'opt-essential': true,
    'opt-enhanced': true,
    'opt-advanced': true,
    'opt-ultimate': true,
    'vwo-growth': '0',
    'vwo-pro': '5',
    'vwo-enterprise': '20',
    'abt-single': 'Unknown',
    'kam-standard': true,
    'kam-enterprise': true,
    'dy-single': true,
    'ig-core': true,
    'ig-plus': true,
    'ig-blue': true,
    'amp-starter': 'Unknown',
    'amp-plus': 'Unknown',
    'amp-growth': 'Unknown',
    'amp-enterprise': 'Unknown',
    'sl-core': false,
    'sl-advanced': false,
    'sl-pro': false
  }
}, {
  attribute: 'Advanced / Custom Targeting',
  dimension: 'features',
  tooltip: 'Includes custom JS targeting, tag targeting, UTM parameter targeting',
  values: {
    'convert-growth': true,
    'convert-pro': true,
    'convert-enterprise': true,
    'opt-essential': false,
    'opt-enhanced': true,
    'opt-advanced': true,
    'opt-ultimate': true,
    'vwo-growth': false,
    'vwo-pro': true,
    'vwo-enterprise': true,
    'abt-single': true,
    'kam-standard': 'Yes — 40+ user properties',
    'kam-enterprise': 'Yes — 40+ user properties',
    'dy-single': true,
    'ig-core': true,
    'ig-plus': true,
    'ig-blue': true,
    'amp-starter': false,
    'amp-plus': true,
    'amp-growth': true,
    'amp-enterprise': true,
    'sl-core': false,
    'sl-advanced': true,
    'sl-pro': true
  }
}, {
  attribute: 'AND/OR Audience',
  dimension: 'features',
  tooltip: 'Combine audience conditions using AND expressions in addition to default OR logic',
  values: {
    'convert-growth': true,
    'convert-pro': true,
    'convert-enterprise': true,
    'opt-essential': true,
    'opt-enhanced': true,
    'opt-advanced': true,
    'opt-ultimate': true,
    'vwo-growth': false,
    'vwo-pro': true,
    'vwo-enterprise': true,
    'abt-single': true,
    'kam-standard': true,
    'kam-enterprise': true,
    'dy-single': true,
    'ig-core': true,
    'ig-plus': true,
    'ig-blue': true,
    'amp-starter': false,
    'amp-plus': false,
    'amp-growth': false,
    'amp-enterprise': false,
    'sl-core': false,
    'sl-advanced': 'Yes — OR logic',
    'sl-pro': 'Yes — OR logic'
  }
}, {
  attribute: 'Custom segments per project',
  dimension: 'features',
  values: {
    'convert-growth': '5',
    'convert-pro': '10',
    'convert-enterprise': '20',
    'opt-essential': true,
    'opt-enhanced': true,
    'opt-advanced': true,
    'opt-ultimate': true,
    'vwo-growth': false,
    'vwo-pro': true,
    'vwo-enterprise': true,
    'abt-single': 'Unknown',
    'kam-standard': 'Unlimited',
    'kam-enterprise': 'Unlimited',
    'dy-single': true,
    'ig-core': true,
    'ig-plus': true,
    'ig-blue': true,
    'amp-starter': 'Unknown',
    'amp-plus': 'Unknown',
    'amp-growth': 'Unknown',
    'amp-enterprise': 'Unknown',
    'sl-core': 'N/A',
    'sl-advanced': 'N/A',
    'sl-pro': 'N/A'
  }
}, {
  attribute: 'Advanced rule builder',
  dimension: 'features',
  tooltip: 'Enables detailed conditions for when tests should run',
  values: {
    'convert-growth': true,
    'convert-pro': true,
    'convert-enterprise': true,
    'opt-essential': 'Unknown',
    'opt-enhanced': 'Unknown',
    'opt-advanced': 'Unknown',
    'opt-ultimate': 'Unknown',
    'vwo-growth': 'Unknown',
    'vwo-pro': 'Unknown',
    'vwo-enterprise': 'Unknown',
    'abt-single': 'Unknown',
    'kam-standard': true,
    'kam-enterprise': true,
    'dy-single': true,
    'ig-core': 'Not specified',
    'ig-plus': 'Not specified',
    'ig-blue': 'Not specified',
    'amp-starter': 'Unknown',
    'amp-plus': 'Unknown',
    'amp-growth': 'Unknown',
    'amp-enterprise': 'Unknown',
    'sl-core': false,
    'sl-advanced': true,
    'sl-pro': true
  }
}, {
  attribute: 'Post Segmentation',
  dimension: 'features',
  values: {
    'convert-growth': true,
    'convert-pro': true,
    'convert-enterprise': true,
    'opt-essential': true,
    'opt-enhanced': true,
    'opt-advanced': true,
    'opt-ultimate': true,
    'vwo-growth': false,
    'vwo-pro': true,
    'vwo-enterprise': true,
    'abt-single': true,
    'kam-standard': true,
    'kam-enterprise': true,
    'dy-single': true,
    'ig-core': true,
    'ig-plus': true,
    'ig-blue': true,
    'amp-starter': true,
    'amp-plus': true,
    'amp-growth': true,
    'amp-enterprise': true,
    'sl-core': true,
    'sl-advanced': true,
    'sl-pro': true
  }
}, {
  attribute: 'Collision Prevention',
  dimension: 'features',
  tooltip: 'People bucketed in one experiment are not added to other simultaneous experiments',
  values: {
    'convert-growth': true,
    'convert-pro': true,
    'convert-enterprise': true,
    'opt-essential': true,
    'opt-enhanced': true,
    'opt-advanced': true,
    'opt-ultimate': true,
    'vwo-growth': false,
    'vwo-pro': false,
    'vwo-enterprise': true,
    'abt-single': true,
    'kam-standard': 'Yes — Holdouts/Mutually Exclusive Groups',
    'kam-enterprise': true,
    'dy-single': false,
    'ig-core': true,
    'ig-plus': true,
    'ig-blue': true,
    'amp-starter': false,
    'amp-plus': false,
    'amp-growth': false,
    'amp-enterprise': true,
    'sl-core': 'Unknown',
    'sl-advanced': 'Unknown',
    'sl-pro': 'Unknown'
  }
}, {
  attribute: 'Personalize experiences for segments',
  dimension: 'features',
  values: {
    'convert-growth': true,
    'convert-pro': true,
    'convert-enterprise': true,
    'opt-essential': 'Add-on',
    'opt-enhanced': 'Add-on',
    'opt-advanced': 'Add-on',
    'opt-ultimate': 'Add-on',
    'vwo-growth': 'Add-on required',
    'vwo-pro': 'Add-on required',
    'vwo-enterprise': 'Add-on required',
    'abt-single': 'Unknown',
    'kam-standard': false,
    'kam-enterprise': true,
    'dy-single': true,
    'ig-core': 'Yes — offers/promotions + content personalizations',
    'ig-plus': true,
    'ig-blue': true,
    'amp-starter': 'Amplitude Audiences required',
    'amp-plus': 'Unknown',
    'amp-growth': 'Unknown',
    'amp-enterprise': 'Unknown',
    'sl-core': false,
    'sl-advanced': true,
    'sl-pro': true
  }
}, {
  attribute: 'Personalize experiences with behavior based targeting',
  dimension: 'features',
  values: {
    'convert-growth': true,
    'convert-pro': true,
    'convert-enterprise': true,
    'opt-essential': false,
    'opt-enhanced': true,
    'opt-advanced': true,
    'opt-ultimate': true,
    'vwo-growth': 'Add-on required',
    'vwo-pro': 'Add-on required',
    'vwo-enterprise': 'Add-on required',
    'abt-single': true,
    'kam-standard': false,
    'kam-enterprise': true,
    'dy-single': true,
    'ig-core': 'Not specified',
    'ig-plus': 'Not specified',
    'ig-blue': 'Not specified',
    'amp-starter': 'Amplitude Audiences required',
    'amp-plus': 'Unknown',
    'amp-growth': 'Unknown',
    'amp-enterprise': 'Unknown',
    'sl-core': true,
    'sl-advanced': true,
    'sl-pro': true
  }
}, {
  attribute: 'Frequentist & Bayesian Stats Engine',
  dimension: 'features',
  values: {
    'convert-growth': true,
    'convert-pro': true,
    'convert-enterprise': true,
    'opt-essential': 'Sequential testing and false discovery rate controls',
    'opt-enhanced': 'Sequential testing and false discovery rate controls',
    'opt-advanced': 'Sequential testing and false discovery rate controls',
    'opt-ultimate': 'Sequential testing and false discovery rate controls',
    'vwo-growth': 'Bayesian only',
    'vwo-pro': 'Bayesian only',
    'vwo-enterprise': 'Bayesian only',
    'abt-single': 'Bayesian',
    'kam-standard': false,
    'kam-enterprise': true,
    'dy-single': 'Yes — both',
    'ig-core': 'Not specified',
    'ig-plus': 'Not specified',
    'ig-blue': 'Not specified',
    'amp-starter': 'Sequential Testing or T Test',
    'amp-plus': 'Sequential Testing or T Test',
    'amp-growth': 'Sequential Testing or T Test',
    'amp-enterprise': 'Sequential Testing or T Test',
    'sl-core': 'Bayesian only',
    'sl-advanced': 'Bayesian only',
    'sl-pro': 'Bayesian only'
  }
}, {
  attribute: 'Sequential Testing',
  dimension: 'features',
  tooltip: 'Call tests faster while controlling for false positives',
  values: {
    'convert-growth': true,
    'convert-pro': true,
    'convert-enterprise': true,
    'opt-essential': true,
    'opt-enhanced': true,
    'opt-advanced': true,
    'opt-ultimate': true,
    'vwo-growth': true,
    'vwo-pro': true,
    'vwo-enterprise': true,
    'abt-single': true,
    'kam-standard': true,
    'kam-enterprise': true,
    'dy-single': 'Not specified',
    'ig-core': 'Not specified',
    'ig-plus': 'Not specified',
    'ig-blue': 'Not specified',
    'amp-starter': true,
    'amp-plus': true,
    'amp-growth': true,
    'amp-enterprise': true,
    'sl-core': 'Unknown',
    'sl-advanced': 'Unknown',
    'sl-pro': 'Unknown'
  }
}, {
  attribute: 'Cross-domain Testing and Tracking',
  dimension: 'features',
  values: {
    'convert-growth': true,
    'convert-pro': true,
    'convert-enterprise': true,
    'opt-essential': false,
    'opt-enhanced': false,
    'opt-advanced': true,
    'opt-ultimate': true,
    'vwo-growth': false,
    'vwo-pro': true,
    'vwo-enterprise': true,
    'abt-single': true,
    'kam-standard': true,
    'kam-enterprise': true,
    'dy-single': true,
    'ig-core': false,
    'ig-plus': false,
    'ig-blue': false,
    'amp-starter': true,
    'amp-plus': true,
    'amp-growth': true,
    'amp-enterprise': true,
    'sl-core': false,
    'sl-advanced': false,
    'sl-pro': false
  }
}, {
  attribute: 'Dynamic Revenue Tracking',
  dimension: 'features',
  values: {
    'convert-growth': true,
    'convert-pro': true,
    'convert-enterprise': true,
    'opt-essential': true,
    'opt-enhanced': true,
    'opt-advanced': true,
    'opt-ultimate': true,
    'vwo-growth': true,
    'vwo-pro': true,
    'vwo-enterprise': true,
    'abt-single': 'Unknown',
    'kam-standard': 'Unknown',
    'kam-enterprise': 'Unknown',
    'dy-single': true,
    'ig-core': true,
    'ig-plus': true,
    'ig-blue': true,
    'amp-starter': 'Unknown',
    'amp-plus': 'Unknown',
    'amp-growth': 'Unknown',
    'amp-enterprise': 'Unknown',
    'sl-core': true,
    'sl-advanced': true,
    'sl-pro': true
  }
}, {
  attribute: 'Google Analytics Goal Import',
  dimension: 'features',
  values: {
    'convert-growth': true,
    'convert-pro': true,
    'convert-enterprise': true,
    'opt-essential': 'Unknown',
    'opt-enhanced': 'Unknown',
    'opt-advanced': 'Unknown',
    'opt-ultimate': 'Unknown',
    'vwo-growth': false,
    'vwo-pro': true,
    'vwo-enterprise': true,
    'abt-single': 'Unknown',
    'kam-standard': 'Yes — via Google Analytics integration',
    'kam-enterprise': true,
    'dy-single': true,
    'ig-core': 'Not specified',
    'ig-plus': 'Not specified',
    'ig-blue': 'Not specified',
    'amp-starter': 'Unknown',
    'amp-plus': 'Unknown',
    'amp-growth': 'Unknown',
    'amp-enterprise': 'Unknown',
    'sl-core': false,
    'sl-advanced': 'Yes — GA4 Beta',
    'sl-pro': 'Yes — GA4 Beta'
  }
}, {
  attribute: 'GA Automatic Revenue Tracking',
  dimension: 'features',
  values: {
    'convert-growth': true,
    'convert-pro': true,
    'convert-enterprise': true,
    'opt-essential': 'Unknown',
    'opt-enhanced': 'Unknown',
    'opt-advanced': 'Unknown',
    'opt-ultimate': 'Unknown',
    'vwo-growth': 'Unknown',
    'vwo-pro': 'Unknown',
    'vwo-enterprise': 'Unknown',
    'abt-single': 'Unknown',
    'kam-standard': 'Unknown',
    'kam-enterprise': 'Unknown',
    'dy-single': true,
    'ig-core': true,
    'ig-plus': true,
    'ig-blue': true,
    'amp-starter': 'Unknown',
    'amp-plus': 'Unknown',
    'amp-growth': 'Unknown',
    'amp-enterprise': 'Unknown',
    'sl-core': false,
    'sl-advanced': true,
    'sl-pro': true
  }
}, {
  attribute: 'Advanced Goals',
  dimension: 'features',
  values: {
    'convert-growth': true,
    'convert-pro': true,
    'convert-enterprise': true,
    'opt-essential': true,
    'opt-enhanced': true,
    'opt-advanced': true,
    'opt-ultimate': true,
    'vwo-growth': true,
    'vwo-pro': true,
    'vwo-enterprise': true,
    'abt-single': true,
    'kam-standard': true,
    'kam-enterprise': true,
    'dy-single': true,
    'ig-core': false,
    'ig-plus': false,
    'ig-blue': false,
    'amp-starter': true,
    'amp-plus': true,
    'amp-growth': true,
    'amp-enterprise': true,
    'sl-core': false,
    'sl-advanced': false,
    'sl-pro': false
  }
}, {
  attribute: 'Real-Time Reports',
  dimension: 'features',
  tooltip: 'Test report data updates in real time',
  values: {
    'convert-growth': true,
    'convert-pro': true,
    'convert-enterprise': true,
    'opt-essential': true,
    'opt-enhanced': true,
    'opt-advanced': true,
    'opt-ultimate': true,
    'vwo-growth': true,
    'vwo-pro': true,
    'vwo-enterprise': true,
    'abt-single': true,
    'kam-standard': true,
    'kam-enterprise': true,
    'dy-single': true,
    'ig-core': true,
    'ig-plus': true,
    'ig-blue': true,
    'amp-starter': 'Unknown',
    'amp-plus': 'Unknown',
    'amp-growth': true,
    'amp-enterprise': true,
    'sl-core': true,
    'sl-advanced': true,
    'sl-pro': true
  }
}, {
  attribute: 'Real Time Results',
  dimension: 'features',
  values: {
    'convert-growth': true,
    'convert-pro': true,
    'convert-enterprise': true,
    'opt-essential': '5 - 10 mins',
    'opt-enhanced': '5 - 10 mins',
    'opt-advanced': '5 - 10 mins',
    'opt-ultimate': '5 - 10 mins',
    'vwo-growth': true,
    'vwo-pro': true,
    'vwo-enterprise': true,
    'abt-single': true,
    'kam-standard': true,
    'kam-enterprise': true,
    'dy-single': true,
    'ig-core': true,
    'ig-plus': true,
    'ig-blue': true,
    'amp-starter': true,
    'amp-plus': true,
    'amp-growth': true,
    'amp-enterprise': true,
    'sl-core': true,
    'sl-advanced': true,
    'sl-pro': true
  }
}, {
  attribute: 'Live Duration Insights',
  dimension: 'features',
  tooltip: "Real-time visibility into the primary metric's journey toward statistical significance",
  values: {
    'convert-growth': 'Primary goal only',
    'convert-pro': 'Primary goal & full report',
    'convert-enterprise': 'Primary goal & full report',
    'opt-essential': 'Unknown',
    'opt-enhanced': 'Unknown',
    'opt-advanced': 'Unknown',
    'opt-ultimate': 'Unknown',
    'vwo-growth': 'Unknown',
    'vwo-pro': 'Unknown',
    'vwo-enterprise': 'Unknown',
    'abt-single': true,
    'kam-standard': 'N/A',
    'kam-enterprise': 'N/A',
    'dy-single': 'N/A',
    'ig-core': false,
    'ig-plus': false,
    'ig-blue': false,
    'amp-starter': false,
    'amp-plus': false,
    'amp-growth': false,
    'amp-enterprise': false,
    'sl-core': 'N/A',
    'sl-advanced': 'N/A',
    'sl-pro': 'N/A'
  }
}, {
  attribute: 'Reports CSV Export',
  dimension: 'features',
  values: {
    'convert-growth': true,
    'convert-pro': true,
    'convert-enterprise': true,
    'opt-essential': true,
    'opt-enhanced': true,
    'opt-advanced': true,
    'opt-ultimate': true,
    'vwo-growth': 'Summary',
    'vwo-pro': 'Full',
    'vwo-enterprise': 'Full',
    'abt-single': true,
    'kam-standard': false,
    'kam-enterprise': true,
    'dy-single': true,
    'ig-core': true,
    'ig-plus': true,
    'ig-blue': true,
    'amp-starter': false,
    'amp-plus': false,
    'amp-growth': true,
    'amp-enterprise': true,
    'sl-core': true,
    'sl-advanced': true,
    'sl-pro': true
  }
}, {
  attribute: 'Raw test data export',
  dimension: 'features',
  values: {
    'convert-growth': false,
    'convert-pro': true,
    'convert-enterprise': false,
    'opt-essential': false,
    'opt-enhanced': true,
    'opt-advanced': true,
    'opt-ultimate': true,
    'vwo-growth': false,
    'vwo-pro': true,
    'vwo-enterprise': true,
    'abt-single': true,
    'kam-standard': false,
    'kam-enterprise': true,
    'dy-single': true,
    'ig-core': true,
    'ig-plus': true,
    'ig-blue': true,
    'amp-starter': 'Unknown',
    'amp-plus': 'Unknown',
    'amp-growth': 'Unknown',
    'amp-enterprise': 'Unknown',
    'sl-core': true,
    'sl-advanced': true,
    'sl-pro': true
  }
}, {
  attribute: 'Remove Report Data',
  dimension: 'features',
  tooltip: 'Leave specific date ranges out of Convert reports',
  values: {
    'convert-growth': false,
    'convert-pro': true,
    'convert-enterprise': true,
    'opt-essential': true,
    'opt-enhanced': true,
    'opt-advanced': true,
    'opt-ultimate': true,
    'vwo-growth': false,
    'vwo-pro': true,
    'vwo-enterprise': true,
    'abt-single': 'Unknown',
    'kam-standard': 'Unknown',
    'kam-enterprise': 'Unknown',
    'dy-single': 'Not specified',
    'ig-core': 'Not specified',
    'ig-plus': 'Not specified',
    'ig-blue': 'Not specified',
    'amp-starter': false,
    'amp-plus': false,
    'amp-growth': true,
    'amp-enterprise': true,
    'sl-core': 'Unknown',
    'sl-advanced': 'Unknown',
    'sl-pro': 'Unknown'
  }
}, {
  attribute: 'Import & Export Templates',
  dimension: 'features',
  values: {
    'convert-growth': 'Import only',
    'convert-pro': true,
    'convert-enterprise': false,
    'opt-essential': 'Unknown',
    'opt-enhanced': 'Unknown',
    'opt-advanced': 'Unknown',
    'opt-ultimate': 'Unknown',
    'vwo-growth': 'Unknown',
    'vwo-pro': 'Unknown',
    'vwo-enterprise': 'Unknown',
    'abt-single': true,
    'kam-standard': 'Unknown',
    'kam-enterprise': 'Unknown',
    'dy-single': true,
    'ig-core': 'Not specified',
    'ig-plus': 'Not specified',
    'ig-blue': 'Not specified',
    'amp-starter': true,
    'amp-plus': true,
    'amp-growth': true,
    'amp-enterprise': true,
    'sl-core': 'Unknown',
    'sl-advanced': 'Unknown',
    'sl-pro': 'Unknown'
  }
}, {
  attribute: 'Anti-flicker protection',
  dimension: 'features',
  values: {
    'convert-growth': true,
    'convert-pro': true,
    'convert-enterprise': true,
    'opt-essential': true,
    'opt-enhanced': true,
    'opt-advanced': true,
    'opt-ultimate': true,
    'vwo-growth': true,
    'vwo-pro': true,
    'vwo-enterprise': true,
    'abt-single': true,
    'kam-standard': true,
    'kam-enterprise': true,
    'dy-single': true,
    'ig-core': true,
    'ig-plus': true,
    'ig-blue': true,
    'amp-starter': true,
    'amp-plus': true,
    'amp-growth': true,
    'amp-enterprise': true,
    'sl-core': true,
    'sl-advanced': true,
    'sl-pro': true
  }
}, {
  attribute: 'Javascript Event Pushing',
  dimension: 'features',
  values: {
    'convert-growth': true,
    'convert-pro': true,
    'convert-enterprise': true,
    'opt-essential': true,
    'opt-enhanced': true,
    'opt-advanced': true,
    'opt-ultimate': true,
    'vwo-growth': false,
    'vwo-pro': false,
    'vwo-enterprise': true,
    'abt-single': true,
    'kam-standard': true,
    'kam-enterprise': true,
    'dy-single': true,
    'ig-core': true,
    'ig-plus': true,
    'ig-blue': true,
    'amp-starter': 'Unknown',
    'amp-plus': 'Unknown',
    'amp-growth': 'Unknown',
    'amp-enterprise': 'Unknown',
    'sl-core': false,
    'sl-advanced': true,
    'sl-pro': true
  }
}, {
  attribute: 'Manual Activation',
  dimension: 'features',
  tooltip: 'Start A/B tests at a specific trigger event',
  values: {
    'convert-growth': true,
    'convert-pro': true,
    'convert-enterprise': true,
    'opt-essential': true,
    'opt-enhanced': true,
    'opt-advanced': true,
    'opt-ultimate': true,
    'vwo-growth': false,
    'vwo-pro': false,
    'vwo-enterprise': true,
    'abt-single': true,
    'kam-standard': true,
    'kam-enterprise': true,
    'dy-single': true,
    'ig-core': 'Unknown',
    'ig-plus': 'Unknown',
    'ig-blue': 'Unknown',
    'amp-starter': true,
    'amp-plus': true,
    'amp-growth': true,
    'amp-enterprise': true,
    'sl-core': true,
    'sl-advanced': true,
    'sl-pro': true
  }
}, {
  attribute: 'Dynamic web triggers',
  dimension: 'features',
  tooltip: 'Interactive triggers that launch experiments only when certain conditions are met',
  values: {
    'convert-growth': '1 x Manual',
    'convert-pro': true,
    'convert-enterprise': true,
    'opt-essential': true,
    'opt-enhanced': true,
    'opt-advanced': true,
    'opt-ultimate': true,
    'vwo-growth': false,
    'vwo-pro': false,
    'vwo-enterprise': true,
    'abt-single': true,
    'kam-standard': true,
    'kam-enterprise': true,
    'dy-single': true,
    'ig-core': 'Unknown',
    'ig-plus': 'Unknown',
    'ig-blue': 'Unknown',
    'amp-starter': false,
    'amp-plus': false,
    'amp-growth': true,
    'amp-enterprise': true,
    'sl-core': 'Unknown',
    'sl-advanced': 'Unknown',
    'sl-pro': 'Unknown'
  }
}, {
  attribute: 'Traffic Allocation across projects',
  dimension: 'features',
  tooltip: 'Flexibility to allocate total traffic across different projects in the same account',
  values: {
    'convert-growth': true,
    'convert-pro': true,
    'convert-enterprise': true,
    'opt-essential': 'Unknown',
    'opt-enhanced': 'Unknown',
    'opt-advanced': 'Unknown',
    'opt-ultimate': 'Unknown',
    'vwo-growth': true,
    'vwo-pro': true,
    'vwo-enterprise': true,
    'abt-single': 'Unknown',
    'kam-standard': false,
    'kam-enterprise': true,
    'dy-single': false,
    'ig-core': 'Not applicable',
    'ig-plus': 'Not applicable',
    'ig-blue': 'Not applicable',
    'amp-starter': true,
    'amp-plus': true,
    'amp-growth': true,
    'amp-enterprise': true,
    'sl-core': 'N/A',
    'sl-advanced': 'N/A',
    'sl-pro': 'N/A'
  }
}, {
  attribute: 'Traffic Allocation availability for agencies',
  dimension: 'features',
  values: {
    'convert-growth': true,
    'convert-pro': true,
    'convert-enterprise': true,
    'opt-essential': 'Unknown',
    'opt-enhanced': 'Unknown',
    'opt-advanced': 'Unknown',
    'opt-ultimate': 'Unknown',
    'vwo-growth': 'Unknown',
    'vwo-pro': 'Unknown',
    'vwo-enterprise': 'Unknown',
    'abt-single': 'Unknown',
    'kam-standard': 'N/A',
    'kam-enterprise': 'N/A',
    'dy-single': 'Not specified',
    'ig-core': 'N/A',
    'ig-plus': 'N/A',
    'ig-blue': 'N/A',
    'amp-starter': 'Unknown',
    'amp-plus': 'Unknown',
    'amp-growth': 'Unknown',
    'amp-enterprise': 'Unknown',
    'sl-core': 'N/A',
    'sl-advanced': 'N/A',
    'sl-pro': 'N/A'
  }
}, {
  attribute: 'QA Wizard',
  dimension: 'features',
  tooltip: 'Preview variants across devices and QA goals in real-time',
  values: {
    'convert-growth': true,
    'convert-pro': true,
    'convert-enterprise': true,
    'opt-essential': 'Unknown',
    'opt-enhanced': 'Unknown',
    'opt-advanced': 'Unknown',
    'opt-ultimate': 'Unknown',
    'vwo-growth': true,
    'vwo-pro': true,
    'vwo-enterprise': true,
    'abt-single': true,
    'kam-standard': 'Yes — Debug Chrome extension',
    'kam-enterprise': true,
    'dy-single': true,
    'ig-core': true,
    'ig-plus': true,
    'ig-blue': true,
    'amp-starter': 'Unknown',
    'amp-plus': 'Unknown',
    'amp-growth': 'Unknown',
    'amp-enterprise': 'Unknown',
    'sl-core': 'Yes — Preview Mode',
    'sl-advanced': 'Yes — Preview Mode',
    'sl-pro': 'Yes — Preview Mode'
  }
}, {
  attribute: 'Environments',
  dimension: 'features',
  tooltip: 'Run tests on different domains within the same project',
  values: {
    'convert-growth': true,
    'convert-pro': true,
    'convert-enterprise': true,
    'opt-essential': 'Not available for web experimentation',
    'opt-enhanced': 'Not available for web experimentation',
    'opt-advanced': 'Not available for web experimentation',
    'opt-ultimate': 'Not available for web experimentation',
    'vwo-growth': false,
    'vwo-pro': false,
    'vwo-enterprise': false,
    'abt-single': 'Unknown',
    'kam-standard': false,
    'kam-enterprise': true,
    'dy-single': true,
    'ig-core': 'Not specified',
    'ig-plus': 'Not specified',
    'ig-blue': 'Not specified',
    'amp-starter': true,
    'amp-plus': true,
    'amp-growth': true,
    'amp-enterprise': true,
    'sl-core': false,
    'sl-advanced': false,
    'sl-pro': false
  }
}, {
  attribute: 'Projects available to agencies',
  dimension: 'features',
  values: {
    'convert-growth': true,
    'convert-pro': true,
    'convert-enterprise': true,
    'opt-essential': 'Unknown',
    'opt-enhanced': 'Unknown',
    'opt-advanced': 'Unknown',
    'opt-ultimate': 'Unknown',
    'vwo-growth': false,
    'vwo-pro': false,
    'vwo-enterprise': false,
    'abt-single': 'Unknown',
    'kam-standard': '1 project only',
    'kam-enterprise': 'Yes — Unlimited projects',
    'dy-single': true,
    'ig-core': 'Not specified',
    'ig-plus': 'Not specified',
    'ig-blue': 'Not specified',
    'amp-starter': true,
    'amp-plus': true,
    'amp-growth': true,
    'amp-enterprise': true,
    'sl-core': 'N/A',
    'sl-advanced': 'N/A',
    'sl-pro': 'N/A'
  }
}, {
  attribute: 'Bulk Editing',
  dimension: 'features',
  tooltip: 'Activate, pause, archive, and unarchive experiences in bulk',
  values: {
    'convert-growth': true,
    'convert-pro': true,
    'convert-enterprise': true,
    'opt-essential': false,
    'opt-enhanced': false,
    'opt-advanced': false,
    'opt-ultimate': false,
    'vwo-growth': true,
    'vwo-pro': true,
    'vwo-enterprise': true,
    'abt-single': 'Unknown',
    'kam-standard': 'Unknown',
    'kam-enterprise': true,
    'dy-single': true,
    'ig-core': 'Not specified',
    'ig-plus': 'Not specified',
    'ig-blue': 'Not specified',
    'amp-starter': 'Unknown',
    'amp-plus': 'Unknown',
    'amp-growth': 'Unknown',
    'amp-enterprise': 'Unknown',
    'sl-core': false,
    'sl-advanced': false,
    'sl-pro': false
  }
}, {
  attribute: 'Data segregation',
  dimension: 'features',
  tooltip: 'Effectively isolates your data with no mixing, even within your own account',
  values: {
    'convert-growth': false,
    'convert-pro': false,
    'convert-enterprise': true,
    'opt-essential': 'Unknown',
    'opt-enhanced': 'Unknown',
    'opt-advanced': 'Unknown',
    'opt-ultimate': 'Unknown',
    'vwo-growth': true,
    'vwo-pro': true,
    'vwo-enterprise': true,
    'abt-single': 'Unknown',
    'kam-standard': 'Unknown',
    'kam-enterprise': 'Unknown',
    'dy-single': true,
    'ig-core': 'Not specified',
    'ig-plus': 'Not specified',
    'ig-blue': 'Not specified',
    'amp-starter': false,
    'amp-plus': false,
    'amp-growth': false,
    'amp-enterprise': true,
    'sl-core': false,
    'sl-advanced': false,
    'sl-pro': false
  }
}, {
  attribute: 'SRM Checks',
  dimension: 'features',
  tooltip: 'Sample Ratio Mismatch check to ensure equal traffic split between control and variants',
  values: {
    'convert-growth': true,
    'convert-pro': true,
    'convert-enterprise': true,
    'opt-essential': false,
    'opt-enhanced': true,
    'opt-advanced': true,
    'opt-ultimate': true,
    'vwo-growth': true,
    'vwo-pro': true,
    'vwo-enterprise': true,
    'abt-single': 'Unknown',
    'kam-standard': true,
    'kam-enterprise': true,
    'dy-single': true,
    'ig-core': 'Not specified',
    'ig-plus': 'Not specified',
    'ig-blue': 'Not specified',
    'amp-starter': true,
    'amp-plus': true,
    'amp-growth': true,
    'amp-enterprise': true,
    'sl-core': 'Unknown',
    'sl-advanced': 'Unknown',
    'sl-pro': 'Unknown'
  }
}, {
  attribute: 'Knowledge base',
  dimension: 'features',
  tooltip: 'Store observations that are tested as hypotheses in an accessible database',
  values: {
    'convert-growth': true,
    'convert-pro': true,
    'convert-enterprise': true,
    'opt-essential': false,
    'opt-enhanced': false,
    'opt-advanced': true,
    'opt-ultimate': true,
    'vwo-growth': true,
    'vwo-pro': true,
    'vwo-enterprise': true,
    'abt-single': 'Unknown',
    'kam-standard': false,
    'kam-enterprise': false,
    'dy-single': 'Not specified',
    'ig-core': false,
    'ig-plus': false,
    'ig-blue': false,
    'amp-starter': 'Unknown',
    'amp-plus': 'Unknown',
    'amp-growth': 'Unknown',
    'amp-enterprise': 'Unknown',
    'sl-core': false,
    'sl-advanced': false,
    'sl-pro': false
  }
}, {
  attribute: 'Add observations',
  dimension: 'features',
  tooltip: 'Integrated repository for test ideas that can be tagged by site area and metrics',
  values: {
    'convert-growth': true,
    'convert-pro': true,
    'convert-enterprise': true,
    'opt-essential': false,
    'opt-enhanced': false,
    'opt-advanced': true,
    'opt-ultimate': true,
    'vwo-growth': true,
    'vwo-pro': true,
    'vwo-enterprise': true,
    'abt-single': 'Unknown',
    'kam-standard': false,
    'kam-enterprise': false,
    'dy-single': 'Not specified',
    'ig-core': false,
    'ig-plus': false,
    'ig-blue': false,
    'amp-starter': 'Unknown',
    'amp-plus': 'Unknown',
    'amp-growth': 'Unknown',
    'amp-enterprise': 'Unknown',
    'sl-core': false,
    'sl-advanced': false,
    'sl-pro': false
  }
}, {
  attribute: 'Change History',
  dimension: 'features',
  values: {
    'convert-growth': false,
    'convert-pro': true,
    'convert-enterprise': true,
    'opt-essential': '30 days',
    'opt-enhanced': 'Unlimited',
    'opt-advanced': 'Unlimited',
    'opt-ultimate': 'Unlimited',
    'vwo-growth': true,
    'vwo-pro': true,
    'vwo-enterprise': true,
    'abt-single': true,
    'kam-standard': true,
    'kam-enterprise': true,
    'dy-single': true,
    'ig-core': 'Not specified',
    'ig-plus': 'Not specified',
    'ig-blue': 'Not specified',
    'amp-starter': true,
    'amp-plus': true,
    'amp-growth': true,
    'amp-enterprise': true,
    'sl-core': 'Unknown',
    'sl-advanced': 'Unknown',
    'sl-pro': 'Unknown'
  }
}, {
  attribute: 'Live Log',
  dimension: 'features',
  tooltip: 'Access a live stream of site events for swift debugging',
  values: {
    'convert-growth': true,
    'convert-pro': true,
    'convert-enterprise': true,
    'opt-essential': true,
    'opt-enhanced': true,
    'opt-advanced': true,
    'opt-ultimate': true,
    'vwo-growth': 'Unknown',
    'vwo-pro': 'Unknown',
    'vwo-enterprise': 'Unknown',
    'abt-single': true,
    'kam-standard': 'Yes — live events stream',
    'kam-enterprise': true,
    'dy-single': true,
    'ig-core': 'Not specified',
    'ig-plus': 'Not specified',
    'ig-blue': 'Not specified',
    'amp-starter': true,
    'amp-plus': true,
    'amp-growth': true,
    'amp-enterprise': true,
    'sl-core': 'Unknown',
    'sl-advanced': 'Unknown',
    'sl-pro': 'Unknown'
  }
}, {
  attribute: 'API Access',
  dimension: 'features',
  values: {
    'convert-growth': true,
    'convert-pro': true,
    'convert-enterprise': true,
    'opt-essential': true,
    'opt-enhanced': true,
    'opt-advanced': true,
    'opt-ultimate': true,
    'vwo-growth': false,
    'vwo-pro': false,
    'vwo-enterprise': true,
    'abt-single': true,
    'kam-standard': 'Yes — JavaScript, Data & Automation APIs',
    'kam-enterprise': true,
    'dy-single': true,
    'ig-core': 'Yes \u2014 Javascript API',
    'ig-plus': true,
    'ig-blue': 'Yes \u2014 Javascript API + Custom integrations (Blue)',
    'amp-starter': true,
    'amp-plus': true,
    'amp-growth': true,
    'amp-enterprise': true,
    'sl-core': false,
    'sl-advanced': 'Yes — JS API',
    'sl-pro': 'Yes — JS API'
  }
}, {
  attribute: 'Easy One Tag Integrations',
  dimension: 'features',
  values: {
    'convert-growth': true,
    'convert-pro': true,
    'convert-enterprise': true,
    'opt-essential': true,
    'opt-enhanced': true,
    'opt-advanced': true,
    'opt-ultimate': true,
    'vwo-growth': true,
    'vwo-pro': true,
    'vwo-enterprise': true,
    'abt-single': true,
    'kam-standard': true,
    'kam-enterprise': true,
    'dy-single': true,
    'ig-core': true,
    'ig-plus': true,
    'ig-blue': true,
    'amp-starter': 'For some integrations there are modals that allow you to easily integrate with selected apps',
    'amp-plus': 'Unknown',
    'amp-growth': 'Unknown',
    'amp-enterprise': 'Unknown',
    'sl-core': true,
    'sl-advanced': true,
    'sl-pro': true
  }
}, {
  attribute: 'Number of 3rd party integrations',
  dimension: 'features',
  values: {
    'convert-growth': '90+',
    'convert-pro': '90+',
    'convert-enterprise': '90+',
    'opt-essential': '199',
    'opt-enhanced': '199',
    'opt-advanced': '199',
    'opt-ultimate': '199',
    'vwo-growth': '~56',
    'vwo-pro': '~56',
    'vwo-enterprise': '~56',
    'abt-single': '26',
    'kam-standard': '54',
    'kam-enterprise': '54',
    'dy-single': '60+',
    'ig-core': 'Not publicly listed',
    'ig-plus': 'Not publicly listed',
    'ig-blue': 'Not publicly listed',
    'amp-starter': '143',
    'amp-plus': '143',
    'amp-growth': '143',
    'amp-enterprise': '143',
    'sl-core': '10+',
    'sl-advanced': '10+',
    'sl-pro': '10+'
  }
}, {
  attribute: 'Experiment Heatmaps',
  dimension: 'features',
  values: {
    'convert-growth': true,
    'convert-pro': true,
    'convert-enterprise': true,
    'opt-essential': false,
    'opt-enhanced': false,
    'opt-advanced': false,
    'opt-ultimate': false,
    'vwo-growth': false,
    'vwo-pro': false,
    'vwo-enterprise': false,
    'abt-single': 'N/A',
    'kam-standard': 'N/A',
    'kam-enterprise': 'N/A',
    'dy-single': 'Not specified',
    'ig-core': false,
    'ig-plus': false,
    'ig-blue': false,
    'amp-starter': false,
    'amp-plus': false,
    'amp-growth': true,
    'amp-enterprise': true,
    'sl-core': false,
    'sl-advanced': false,
    'sl-pro': false
  }
}, {
  attribute: 'Custom Popups',
  dimension: 'features',
  tooltip: 'Design and launch pop-up messages from the Visual Editor',
  values: {
    'convert-growth': true,
    'convert-pro': true,
    'convert-enterprise': true,
    'opt-essential': 'Unknown',
    'opt-enhanced': 'Unknown',
    'opt-advanced': 'Unknown',
    'opt-ultimate': 'Unknown',
    'vwo-growth': 'Separate product',
    'vwo-pro': 'Separate product',
    'vwo-enterprise': 'Separate product',
    'abt-single': 'Unknown',
    'kam-standard': false,
    'kam-enterprise': 'Yes — Widget Studio',
    'dy-single': true,
    'ig-core': false,
    'ig-plus': false,
    'ig-blue': false,
    'amp-starter': 'Unknown',
    'amp-plus': 'Unknown',
    'amp-growth': 'Unknown',
    'amp-enterprise': 'Unknown',
    'sl-core': false,
    'sl-advanced': false,
    'sl-pro': false
  }
}, {
  attribute: 'Convert Signals™',
  dimension: 'features',
  tooltip: 'Surfaces moments that matter from millions of interactions, indicating when site elements did not work as intended',
  values: {
    'convert-growth': true,
    'convert-pro': true,
    'convert-enterprise': true,
    'opt-essential': false,
    'opt-enhanced': false,
    'opt-advanced': false,
    'opt-ultimate': false,
    'vwo-growth': false,
    'vwo-pro': false,
    'vwo-enterprise': false,
    'abt-single': 'N/A',
    'kam-standard': 'N/A',
    'kam-enterprise': 'N/A',
    'dy-single': 'N/A',
    'ig-core': 'N/A',
    'ig-plus': 'N/A',
    'ig-blue': 'N/A',
    'amp-starter': false,
    'amp-plus': false,
    'amp-growth': false,
    'amp-enterprise': false,
    'sl-core': 'N/A',
    'sl-advanced': 'N/A',
    'sl-pro': 'N/A'
  }
},
// ─── GOVERNANCE ──────────────────────────────────────────────────────────────
{
  attribute: 'SOC 2 compliance',
  dimension: 'governance',
  values: {
    'convert-growth': false,
    'convert-pro': false,
    'convert-enterprise': false,
    'opt-essential': true,
    'opt-enhanced': true,
    'opt-advanced': true,
    'opt-ultimate': true,
    'vwo-growth': true,
    'vwo-pro': true,
    'vwo-enterprise': true,
    'abt-single': 'Unknown',
    'kam-standard': 'Yes — SOC 2 Type 2',
    'kam-enterprise': 'Yes — SOC 2 Type 2',
    'dy-single': 'Yes — SOC 2 Type II',
    'ig-core': false,
    'ig-plus': false,
    'ig-blue': false,
    'amp-starter': true,
    'amp-plus': true,
    'amp-growth': true,
    'amp-enterprise': true,
    'sl-core': false,
    'sl-advanced': false,
    'sl-pro': false
  }
}, {
  attribute: 'ISO 27001 Certified',
  dimension: 'governance',
  values: {
    'convert-growth': 'Unknown',
    'convert-pro': 'Unknown',
    'convert-enterprise': 'Unknown',
    'opt-essential': true,
    'opt-enhanced': true,
    'opt-advanced': true,
    'opt-ultimate': true,
    'vwo-growth': true,
    'vwo-pro': true,
    'vwo-enterprise': true,
    'abt-single': 'Unknown',
    'kam-standard': 'Yes — ISO/IEC 27001:2022',
    'kam-enterprise': 'Yes — ISO/IEC 27001:2022',
    'dy-single': 'Yes — ISO 27001 + 27017/27018/27701',
    'ig-core': false,
    'ig-plus': false,
    'ig-blue': false,
    'amp-starter': true,
    'amp-plus': true,
    'amp-growth': true,
    'amp-enterprise': true,
    'sl-core': false,
    'sl-advanced': false,
    'sl-pro': false
  }
}, {
  attribute: 'PCI-DSS compliance',
  dimension: 'governance',
  values: {
    'convert-growth': true,
    'convert-pro': true,
    'convert-enterprise': true,
    'opt-essential': true,
    'opt-enhanced': true,
    'opt-advanced': true,
    'opt-ultimate': true,
    'vwo-growth': true,
    'vwo-pro': true,
    'vwo-enterprise': true,
    'abt-single': true,
    'kam-standard': true,
    'kam-enterprise': true,
    'dy-single': 'Not specified',
    'ig-core': 'Not specified',
    'ig-plus': 'Not specified',
    'ig-blue': 'Not specified',
    'amp-starter': true,
    'amp-plus': true,
    'amp-growth': true,
    'amp-enterprise': true,
    'sl-core': 'Unknown',
    'sl-advanced': 'Unknown',
    'sl-pro': 'Unknown'
  }
}, {
  attribute: 'Single Sign On (SSO)',
  dimension: 'governance',
  values: {
    'convert-growth': false,
    'convert-pro': true,
    'convert-enterprise': true,
    'opt-essential': false,
    'opt-enhanced': true,
    'opt-advanced': true,
    'opt-ultimate': true,
    'vwo-growth': false,
    'vwo-pro': false,
    'vwo-enterprise': true,
    'abt-single': true,
    'kam-standard': false,
    'kam-enterprise': 'Custom (paid add-on)',
    'dy-single': true,
    'ig-core': 'Login via Shopify',
    'ig-plus': 'Login via Shopify',
    'ig-blue': 'Login via Shopify',
    'amp-starter': false,
    'amp-plus': false,
    'amp-growth': true,
    'amp-enterprise': true,
    'sl-core': 'Login via Shopify',
    'sl-advanced': 'Unknown',
    'sl-pro': 'Unknown'
  }
}, {
  attribute: 'Role Based Permissions',
  dimension: 'governance',
  values: {
    'convert-growth': true,
    'convert-pro': true,
    'convert-enterprise': true,
    'opt-essential': true,
    'opt-enhanced': true,
    'opt-advanced': true,
    'opt-ultimate': true,
    'vwo-growth': true,
    'vwo-pro': true,
    'vwo-enterprise': true,
    'abt-single': true,
    'kam-standard': false,
    'kam-enterprise': true,
    'dy-single': true,
    'ig-core': 'Dependent on Shopify plan',
    'ig-plus': 'Dependent on Shopify plan',
    'ig-blue': 'Dependent on Shopify plan',
    'amp-starter': true,
    'amp-plus': true,
    'amp-growth': true,
    'amp-enterprise': true,
    'sl-core': 'Unknown',
    'sl-advanced': 'Unknown',
    'sl-pro': 'Unknown'
  }
}, {
  attribute: 'Bring your own ID (BYOID)',
  dimension: 'governance',
  tooltip: 'Use your own visitor ID instead of the ones Convert assigns for randomization',
  values: {
    'convert-growth': false,
    'convert-pro': false,
    'convert-enterprise': true,
    'opt-essential': true,
    'opt-enhanced': true,
    'opt-advanced': true,
    'opt-ultimate': true,
    'vwo-growth': 'Unknown',
    'vwo-pro': 'Unknown',
    'vwo-enterprise': 'Unknown',
    'abt-single': true,
    'kam-standard': true,
    'kam-enterprise': true,
    'dy-single': true,
    'ig-core': 'Not specified',
    'ig-plus': 'Not specified',
    'ig-blue': 'Not specified',
    'amp-starter': 'Unknown',
    'amp-plus': 'Unknown',
    'amp-growth': 'Unknown',
    'amp-enterprise': 'Unknown',
    'sl-core': false,
    'sl-advanced': false,
    'sl-pro': false
  }
}, {
  attribute: 'EU based servers',
  dimension: 'governance',
  values: {
    'convert-growth': 'Yes. Based in Frankfurt, Germany',
    'convert-pro': 'Yes. Based in Frankfurt, Germany',
    'convert-enterprise': 'Yes. Based in Frankfurt, Germany',
    'opt-essential': 'EU & US',
    'opt-enhanced': 'EU & US',
    'opt-advanced': 'EU & US',
    'opt-ultimate': 'EU & US',
    'vwo-growth': true,
    'vwo-pro': true,
    'vwo-enterprise': true,
    'abt-single': true,
    'kam-standard': 'Yes — EU or US data residency',
    'kam-enterprise': 'Yes — EU, US or Custom',
    'dy-single': 'Yes — AWS Frankfurt (EU)',
    'ig-core': false,
    'ig-plus': false,
    'ig-blue': false,
    'amp-starter': true,
    'amp-plus': 'Unknown',
    'amp-growth': 'Unknown',
    'amp-enterprise': 'Unknown',
    'sl-core': false,
    'sl-advanced': false,
    'sl-pro': false
  }
}, {
  attribute: 'Third Party cookies',
  dimension: 'governance',
  values: {
    'convert-growth': false,
    'convert-pro': false,
    'convert-enterprise': false,
    'opt-essential': true,
    'opt-enhanced': true,
    'opt-advanced': true,
    'opt-ultimate': true,
    'vwo-growth': true,
    'vwo-pro': true,
    'vwo-enterprise': true,
    'abt-single': false,
    'kam-standard': 'No — first-party only',
    'kam-enterprise': 'No — first-party only',
    'dy-single': '365 days',
    'ig-core': false,
    'ig-plus': false,
    'ig-blue': false,
    'amp-starter': true,
    'amp-plus': true,
    'amp-growth': true,
    'amp-enterprise': true,
    'sl-core': 'Unknown',
    'sl-advanced': 'Unknown',
    'sl-pro': 'Unknown'
  }
}, {
  attribute: 'Do Not Track Browser',
  dimension: 'governance',
  tooltip: 'Respects Browser Do Not Track (DNT) and Global Privacy Control (GPC) settings',
  values: {
    'convert-growth': true,
    'convert-pro': true,
    'convert-enterprise': true,
    'opt-essential': true,
    'opt-enhanced': true,
    'opt-advanced': true,
    'opt-ultimate': true,
    'vwo-growth': true,
    'vwo-pro': true,
    'vwo-enterprise': true,
    'abt-single': true,
    'kam-standard': true,
    'kam-enterprise': true,
    'dy-single': 'Not specified',
    'ig-core': 'Not specified',
    'ig-plus': 'Not specified',
    'ig-blue': 'Not specified',
    'amp-starter': false,
    'amp-plus': 'Unknown',
    'amp-growth': 'Unknown',
    'amp-enterprise': 'Unknown',
    'sl-core': true,
    'sl-advanced': true,
    'sl-pro': true
  }
}, {
  attribute: 'Data Protection Addendum',
  dimension: 'governance',
  values: {
    'convert-growth': true,
    'convert-pro': true,
    'convert-enterprise': true,
    'opt-essential': true,
    'opt-enhanced': true,
    'opt-advanced': true,
    'opt-ultimate': true,
    'vwo-growth': true,
    'vwo-pro': true,
    'vwo-enterprise': true,
    'abt-single': true,
    'kam-standard': true,
    'kam-enterprise': true,
    'dy-single': true,
    'ig-core': 'Not specified',
    'ig-plus': 'Not specified',
    'ig-blue': 'Not specified',
    'amp-starter': true,
    'amp-plus': true,
    'amp-growth': true,
    'amp-enterprise': true,
    'sl-core': true,
    'sl-advanced': true,
    'sl-pro': true
  }
}, {
  attribute: 'Non-PII Cookie lifetime',
  dimension: 'governance',
  values: {
    'convert-growth': '6 months',
    'convert-pro': '6 months',
    'convert-enterprise': '6 months',
    'opt-essential': '6 months',
    'opt-enhanced': '6 months',
    'opt-advanced': '6 months',
    'opt-ultimate': '6 months',
    'vwo-growth': '100 days (default)',
    'vwo-pro': '100 days (default)',
    'vwo-enterprise': '100 days (default)',
    'abt-single': '13 months',
    'kam-standard': '365 days',
    'kam-enterprise': '365 days',
    'dy-single': 'Not publicly specified',
    'ig-core': 'Not specified',
    'ig-plus': 'Not specified',
    'ig-blue': 'Not specified',
    'amp-starter': 'Not specified in Privacy policy',
    'amp-plus': 'Unknown',
    'amp-growth': 'Unknown',
    'amp-enterprise': 'Unknown',
    'sl-core': 'Unknown',
    'sl-advanced': 'Unknown',
    'sl-pro': 'Unknown'
  }
}, {
  attribute: 'Version Control for Tracking Script',
  dimension: 'governance',
  tooltip: 'Automated roll-out and roll-back system for the tracking script',
  values: {
    'convert-growth': false,
    'convert-pro': true,
    'convert-enterprise': true,
    'opt-essential': 'Unknown',
    'opt-enhanced': 'Unknown',
    'opt-advanced': 'Unknown',
    'opt-ultimate': 'Unknown',
    'vwo-growth': 'Unknown',
    'vwo-pro': 'Unknown',
    'vwo-enterprise': 'Unknown',
    'abt-single': 'Unknown',
    'kam-standard': 'Unknown',
    'kam-enterprise': 'Unknown',
    'dy-single': 'Unknown',
    'ig-core': 'Not specified',
    'ig-plus': 'Not specified',
    'ig-blue': 'Not specified',
    'amp-starter': 'Unknown',
    'amp-plus': 'Unknown',
    'amp-growth': 'Unknown',
    'amp-enterprise': 'Unknown',
    'sl-core': 'Yes — GitHub compatible',
    'sl-advanced': 'Yes — GitHub compatible',
    'sl-pro': 'Yes — GitHub compatible'
  }
}, {
  attribute: 'Support Opt Out Feature',
  dimension: 'governance',
  values: {
    'convert-growth': true,
    'convert-pro': true,
    'convert-enterprise': true,
    'opt-essential': true,
    'opt-enhanced': true,
    'opt-advanced': true,
    'opt-ultimate': true,
    'vwo-growth': true,
    'vwo-pro': true,
    'vwo-enterprise': true,
    'abt-single': true,
    'kam-standard': true,
    'kam-enterprise': true,
    'dy-single': true,
    'ig-core': 'Not specified',
    'ig-plus': 'Not specified',
    'ig-blue': 'Not specified',
    'amp-starter': true,
    'amp-plus': true,
    'amp-growth': true,
    'amp-enterprise': true,
    'sl-core': true,
    'sl-advanced': true,
    'sl-pro': true
  }
},
// ─── SUPPORT ─────────────────────────────────────────────────────────────────
{
  attribute: 'Email support (priority)',
  dimension: 'support',
  values: {
    'convert-growth': true,
    'convert-pro': true,
    'convert-enterprise': true,
    'opt-essential': true,
    'opt-enhanced': true,
    'opt-advanced': true,
    'opt-ultimate': true,
    'vwo-growth': true,
    'vwo-pro': true,
    'vwo-enterprise': true,
    'abt-single': true,
    'kam-standard': 'Yes — 1-day business response SLA',
    'kam-enterprise': 'Yes — Dedicated CSM & TAM',
    'dy-single': true,
    'ig-core': true,
    'ig-plus': true,
    'ig-blue': true,
    'amp-starter': false,
    'amp-plus': true,
    'amp-growth': true,
    'amp-enterprise': true,
    'sl-core': true,
    'sl-advanced': true,
    'sl-pro': true
  }
}, {
  attribute: 'Chat support',
  dimension: 'support',
  values: {
    'convert-growth': true,
    'convert-pro': true,
    'convert-enterprise': true,
    'opt-essential': true,
    'opt-enhanced': true,
    'opt-advanced': true,
    'opt-ultimate': true,
    'vwo-growth': false,
    'vwo-pro': true,
    'vwo-enterprise': true,
    'abt-single': 'Unknown',
    'kam-standard': 'Slack community only',
    'kam-enterprise': 'Slack community + dedicated team',
    'dy-single': true,
    'ig-core': 'Slack (shared channel)',
    'ig-plus': 'Slack (shared channel)',
    'ig-blue': 'Slack (shared channel)',
    'amp-starter': false,
    'amp-plus': true,
    'amp-growth': true,
    'amp-enterprise': true,
    'sl-core': true,
    'sl-advanced': true,
    'sl-pro': true
  }
}, {
  attribute: 'Phone support',
  dimension: 'support',
  values: {
    'convert-growth': false,
    'convert-pro': true,
    'convert-enterprise': true,
    'opt-essential': true,
    'opt-enhanced': true,
    'opt-advanced': true,
    'opt-ultimate': true,
    'vwo-growth': false,
    'vwo-pro': false,
    'vwo-enterprise': true,
    'abt-single': true,
    'kam-standard': false,
    'kam-enterprise': true,
    'dy-single': true,
    'ig-core': false,
    'ig-plus': false,
    'ig-blue': false,
    'amp-starter': false,
    'amp-plus': false,
    'amp-growth': false,
    'amp-enterprise': false,
    'sl-core': false,
    'sl-advanced': false,
    'sl-pro': false
  }
}, {
  attribute: 'Dedicated account manager',
  dimension: 'support',
  values: {
    'convert-growth': false,
    'convert-pro': true,
    'convert-enterprise': true,
    'opt-essential': 'Unknown',
    'opt-enhanced': 'Unknown',
    'opt-advanced': 'Unknown',
    'opt-ultimate': 'Unknown',
    'vwo-growth': false,
    'vwo-pro': false,
    'vwo-enterprise': true,
    'abt-single': true,
    'kam-standard': false,
    'kam-enterprise': true,
    'dy-single': true,
    'ig-core': false,
    'ig-plus': 'Yes — Annual plan only',
    'ig-blue': 'Yes — Annual plan only',
    'amp-starter': false,
    'amp-plus': false,
    'amp-growth': false,
    'amp-enterprise': true,
    'sl-core': false,
    'sl-advanced': false,
    'sl-pro': true
  }
}, {
  attribute: 'Premium Onboarding',
  dimension: 'support',
  values: {
    'convert-growth': true,
    'convert-pro': true,
    'convert-enterprise': true,
    'opt-essential': 'Available',
    'opt-enhanced': 'Available',
    'opt-advanced': 'Available',
    'opt-ultimate': 'Available',
    'vwo-growth': false,
    'vwo-pro': false,
    'vwo-enterprise': true,
    'abt-single': 'Unknown',
    'kam-standard': false,
    'kam-enterprise': true,
    'dy-single': true,
    'ig-core': false,
    'ig-plus': 'Yes — Intelligems-led integration',
    'ig-blue': 'Yes — Intelligems-led integration',
    'amp-starter': false,
    'amp-plus': false,
    'amp-growth': false,
    'amp-enterprise': false,
    'sl-core': false,
    'sl-advanced': false,
    'sl-pro': true
  }
}];

// --- Helpers ---
const parseValueTooltip = (value: string | boolean | 'Unknown' | 'Gated' | 'Not disclosed' | 'Not available'): ParsedValue => {
  if (typeof value !== 'string') return {
    primaryValue: value
  };
  const hoverMatch = value.match(/\s*(?:\(?ON-)?HOVER:\s*(.*)$/);
  if (!hoverMatch) return {
    primaryValue: value
  };
  const primaryValue = value.slice(0, hoverMatch.index).trim().replace(/\($/, '').trim();
  const tooltip = hoverMatch[1].trim().replace(/\)$/, '').trim();
  return {
    primaryValue: primaryValue || value,
    tooltip
  };
};
const SEPARATE_PRODUCT_BADGE_STYLE: React.CSSProperties = {
  background: '#FEF9C3',
  color: '#92400E',
  fontSize: '10px',
  padding: '2px 8px',
  borderRadius: '99px',
  fontWeight: 500,
  whiteSpace: 'nowrap',
  fontFamily: 'Geist, ui-sans-serif, system-ui, sans-serif'
};

// Standalone tooltip
const InlineTooltip = ({
  content
}: {
  content: string;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const tooltipId = React.useId();
  return <div className="relative inline-block" onMouseEnter={() => setIsOpen(true)} onMouseLeave={() => setIsOpen(false)}>
      <button type="button" aria-label="Show more information" aria-describedby={isOpen ? tooltipId : undefined} aria-expanded={isOpen} onFocus={() => setIsOpen(true)} onBlur={() => setIsOpen(false)} onClick={() => setIsOpen(v => !v)} className="inline-flex items-center justify-center rounded-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:text-foreground focus-visible:outline-none">
        <Info className="w-3 h-3 cursor-help" />
      </button>
      <div id={tooltipId} role="tooltip" className={cn('absolute bottom-full left-1/2 z-[200] mb-2 w-52 -translate-x-1/2 rounded border border-border/20 bg-[#2A3341] p-2 text-[10px] text-white shadow-xl pointer-events-none transition-opacity duration-150', isOpen ? 'opacity-100' : 'opacity-0')}>
        <span>{content}</span>
      </div>
    </div>;
};
const ValueCell = ({
  value,
  isConvertCol = false
}: {
  value: string | boolean | 'Unknown' | 'Gated' | 'Not disclosed' | 'Not available';
  isConvertCol?: boolean;
}) => {
  const parsedValue = parseValueTooltip(value);
  if (typeof parsedValue.primaryValue === 'boolean') {
    if (parsedValue.primaryValue) {
      return <div className="inline-flex items-center justify-center">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M2.5 7L5.5 10L11.5 4" stroke={isConvertCol ? '#0052CC' : '#0066FF'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>;
    }
    return <div className="inline-flex items-center justify-center">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M2 2L10 10M10 2L2 10" stroke="#CFD9E6" strokeWidth="1.75" strokeLinecap="round" />
        </svg>
      </div>;
  }
  const visibleValue = parsedValue.primaryValue;
  if (visibleValue === 'Gated') {
    return <div className="inline-flex items-center gap-1.5">
        <span className="inline-block px-2 py-0.5 text-[11px] font-medium text-amber-800 bg-amber-50 rounded">{visibleValue}</span>
        {parsedValue.tooltip && <InlineTooltip content={parsedValue.tooltip} />}
      </div>;
  }
  if (visibleValue === 'Unknown') {
    return <div className="inline-flex items-center gap-1.5">
        <span className="text-[11px] italic" style={{
        color: '#94a3b8'
      }}>{visibleValue}</span>
        {parsedValue.tooltip && <InlineTooltip content={parsedValue.tooltip} />}
      </div>;
  }
  const isSeparateProduct = typeof visibleValue === 'string' && visibleValue.toLowerCase().includes('separate product');
  if (isSeparateProduct) {
    return <div className="inline-flex items-center gap-1.5">
        <span style={SEPARATE_PRODUCT_BADGE_STYLE}>Separate product</span>
        {parsedValue.tooltip && <InlineTooltip content={parsedValue.tooltip} />}
      </div>;
  }
  const isNeutral = ['Not disclosed', 'Not available'].includes(visibleValue as string);
  return <div className="inline-flex items-center gap-1.5 flex-wrap">
      <span className={cn('text-xs font-medium leading-snug', isNeutral ? 'text-muted-foreground italic' : 'text-foreground')}>{visibleValue}</span>
      {parsedValue.tooltip && <InlineTooltip content={parsedValue.tooltip} />}
    </div>;
};
const MobileValue = ({
  value
}: {
  value: string | boolean | 'Unknown' | 'Gated' | 'Not disclosed' | 'Not available';
}) => {
  const parsedValue = parseValueTooltip(value);
  if (typeof parsedValue.primaryValue === 'boolean') {
    return parsedValue.primaryValue ? <div className="inline-flex items-center gap-1">
          <div className="inline-flex items-center justify-center w-5 h-5">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M2.5 7L5.5 10L11.5 4" stroke="#0066FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          {parsedValue.tooltip && <InlineTooltip content={parsedValue.tooltip} />}
        </div> : <div className="inline-flex items-center gap-1">
          <div className="inline-flex items-center justify-center w-5 h-5">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M2 2L10 10M10 2L2 10" stroke="#CFD9E6" strokeWidth="1.75" strokeLinecap="round" />
            </svg>
          </div>
          {parsedValue.tooltip && <InlineTooltip content={parsedValue.tooltip} />}
        </div>;
  }
  const visibleValue = parsedValue.primaryValue;
  if (visibleValue === 'Gated') {
    return <div className="inline-flex items-center gap-1.5">
        <span className="inline-block px-2 py-0.5 text-xs font-medium text-amber-800 bg-amber-50 rounded">{visibleValue}</span>
        {parsedValue.tooltip && <InlineTooltip content={parsedValue.tooltip} />}
      </div>;
  }
  if (visibleValue === 'Unknown') {
    return <div className="inline-flex items-center gap-1.5">
        <span className="text-xs italic" style={{
        color: '#94a3b8'
      }}>{visibleValue}</span>
        {parsedValue.tooltip && <InlineTooltip content={parsedValue.tooltip} />}
      </div>;
  }
  const isSeparateProduct = typeof visibleValue === 'string' && visibleValue.toLowerCase().includes('separate product');
  if (isSeparateProduct) {
    return <div className="inline-flex items-center gap-1.5">
        <span style={SEPARATE_PRODUCT_BADGE_STYLE}>Separate product</span>
        {parsedValue.tooltip && <InlineTooltip content={parsedValue.tooltip} />}
      </div>;
  }
  const isNeutral = ['Not disclosed', 'Not available'].includes(visibleValue as string);
  return <div className="inline-flex items-start gap-1 flex-wrap">
      <span className={cn('text-xs font-medium leading-snug text-left', isNeutral ? 'text-muted-foreground italic' : 'text-foreground')}>{visibleValue}</span>
      {parsedValue.tooltip && <InlineTooltip content={parsedValue.tooltip} />}
    </div>;
};

// --- Mobile Filter Drawer ---
interface MobileFilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDimensions: ComparisonDimension[];
  selectedCompetitors: string[];
  toggleDimension: (d: ComparisonDimension) => void;
  toggleCompetitor: (id: string) => void;
  selectAllDimensions: () => void;
  deselectAllDimensions: () => void;
  selectAllCompetitors: () => void;
  deselectAllCompetitors: () => void;
}
const MobileFilterDrawer = ({
  isOpen,
  onClose,
  selectedDimensions,
  selectedCompetitors,
  toggleDimension,
  toggleCompetitor,
  selectAllDimensions,
  deselectAllDimensions,
  selectAllCompetitors,
  deselectAllCompetitors
}: MobileFilterDrawerProps) => <AnimatePresence>
    {isOpen && <div className="fixed inset-0 z-[300] flex flex-col justify-end">
        <motion.div initial={{
      opacity: 0
    }} animate={{
      opacity: 1
    }} exit={{
      opacity: 0
    }} className="absolute inset-0 bg-black/40" onClick={onClose} />
        <motion.div initial={{
      y: '100%'
    }} animate={{
      y: 0
    }} exit={{
      y: '100%'
    }} transition={{
      type: 'spring',
      damping: 30,
      stiffness: 300
    }} className="relative bg-card rounded-t-2xl shadow-2xl max-h-[80vh] flex flex-col">
          <div className="flex justify-center pt-3 pb-1"><div className="w-10 h-1 rounded-full bg-border" /></div>
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <h2 className="text-sm font-bold text-foreground uppercase tracking-wide">Filters</h2>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted border border-border text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
          </div>
          <div className="overflow-y-auto flex-1 p-4 space-y-6">
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold text-foreground uppercase tracking-wide border-l-2 border-primary pl-2">Dimensions</h3>
                <div className="flex gap-2">
                  <button onClick={selectAllDimensions} className="text-[10px] text-muted-foreground hover:text-primary underline font-bold">All</button>
                  <span className="text-border text-[10px]">|</span>
                  <button onClick={deselectAllDimensions} className="text-[10px] text-muted-foreground hover:text-primary underline font-bold">None</button>
                </div>
              </div>
              <div className="space-y-2">
                {DIMENSIONS.map(dim => <button key={dim.id} onClick={() => toggleDimension(dim.id)} className={cn('w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all text-sm border-2', selectedDimensions.includes(dim.id) ? SELECTED_OPTION_CLASSES : 'bg-card text-foreground hover:bg-accent border-border')}>
                    <div className="flex-shrink-0 text-primary">{dim.icon}</div>
                    <span className="font-bold truncate">{dim.label}</span>
                  </button>)}
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold text-foreground uppercase tracking-wide border-l-2 border-primary pl-2">Alternatives</h3>
                <div className="flex gap-2">
                  <button onClick={selectAllCompetitors} className="text-[10px] text-muted-foreground hover:text-primary underline font-bold">All</button>
                  <span className="text-border text-[10px]">|</span>
                  <button onClick={deselectAllCompetitors} className="text-[10px] text-muted-foreground hover:text-primary underline font-bold">None</button>
                </div>
              </div>
              <div className="space-y-2">
                {COMPETITORS.map(comp => <button key={comp.id} onClick={() => toggleCompetitor(comp.id)} className={cn('w-full flex items-center justify-between p-3 rounded-lg text-left transition-all text-sm border-2', selectedCompetitors.includes(comp.id) ? SELECTED_OPTION_CLASSES : 'bg-card text-foreground hover:bg-accent border-border')}>
                    <span className="font-bold">{comp.name}</span>
                    {selectedCompetitors.includes(comp.id) && <Check className="w-4 h-4 text-primary" />}
                  </button>)}
              </div>
            </div>
          </div>
          <div className="p-4 border-t border-border">
            <button onClick={onClose} className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-bold text-sm hover:opacity-90 transition-opacity">Apply Filters</button>
          </div>
        </motion.div>
      </div>}
  </AnimatePresence>;

// --- Mobile Competitor Picker ---
interface MobileCompetitorPickerProps {
  isOpen: boolean;
  onClose: () => void;
  availableCompetitors: Competitor[];
  activeCompetitorId: string;
  onSelect: (id: string) => void;
}
const MobileCompetitorPicker = ({
  isOpen,
  onClose,
  availableCompetitors,
  activeCompetitorId,
  onSelect
}: MobileCompetitorPickerProps) => {
  const [query, setQuery] = useState('');
  const filtered = availableCompetitors.filter(c => c.name.toLowerCase().includes(query.toLowerCase()));
  return <AnimatePresence>
      {isOpen && <div className="fixed inset-0 z-[400] flex flex-col justify-end">
          <motion.div initial={{
        opacity: 0
      }} animate={{
        opacity: 1
      }} exit={{
        opacity: 0
      }} className="absolute inset-0 bg-black/40" onClick={onClose} />
          <motion.div initial={{
        y: '100%'
      }} animate={{
        y: 0
      }} exit={{
        y: '100%'
      }} transition={{
        type: 'spring',
        damping: 30,
        stiffness: 300
      }} className="relative bg-card rounded-t-2xl shadow-2xl flex flex-col" style={{
        maxHeight: '70vh'
      }}>
            <div className="flex justify-center pt-3 pb-1 flex-shrink-0"><div className="w-10 h-1 rounded-full bg-border" /></div>
            <div className="flex items-center justify-between px-4 py-3 border-b border-border flex-shrink-0">
              <h2 className="text-sm font-bold text-foreground uppercase tracking-wide">Choose Competitor</h2>
              <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted border border-border text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
            </div>
            {availableCompetitors.length > 4 && <div className="px-4 pt-3 pb-2 flex-shrink-0">
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg border-2 border-border bg-muted">
                  <Search className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                  <input type="text" placeholder="Search competitors…" value={query} onChange={e => setQuery(e.target.value)} className="flex-1 bg-transparent text-xs text-foreground placeholder:text-muted-foreground outline-none" />
                  {query && <button onClick={() => setQuery('')} className="text-muted-foreground hover:text-foreground"><X className="w-3 h-3" /></button>}
                </div>
              </div>}
            <div className="overflow-y-auto flex-1 px-4 pb-4 pt-1 space-y-2">
              {filtered.length === 0 && <div className="py-8 text-center text-xs text-muted-foreground">No competitors match your search</div>}
              {filtered.map(comp => <button key={comp.id} onClick={() => {
            onSelect(comp.id);
            onClose();
          }} className={cn('w-full flex items-center justify-between p-3 rounded-lg text-left transition-all text-sm border-2', activeCompetitorId === comp.id ? SELECTED_OPTION_CLASSES : 'bg-card text-foreground hover:bg-accent border-border')}>
                  <div>
                    <span className="font-bold">{comp.name}</span>
                    <span className="text-[10px] text-muted-foreground ml-2">{comp.plans.length} plan{comp.plans.length !== 1 ? 's' : ''}</span>
                  </div>
                  {activeCompetitorId === comp.id && <Check className="w-4 h-4 text-primary flex-shrink-0" />}
                </button>)}
            </div>
          </motion.div>
        </div>}
    </AnimatePresence>;
};

// --- Mobile Stacked Comparison View ---
interface MobileComparisonViewProps {
  filteredAttributes: ComparisonDataPoint[];
  selectedCompetitors: string[];
  onBack: () => void;
  onOpenFilters: () => void;
  selectedDimensions: ComparisonDimension[];
}
const MobileComparisonView = ({
  filteredAttributes,
  selectedCompetitors,
  onBack,
  onOpenFilters,
  selectedDimensions
}: MobileComparisonViewProps) => {
  const availableCompetitors = COMPETITORS.filter(c => selectedCompetitors.includes(c.id));
  const [activeCompetitorId, setActiveCompetitorId] = useState<string>(availableCompetitors[0]?.id ?? '');
  const [convertPlanIdx, setConvertPlanIdx] = useState(0);
  const [competitorPlanIdx, setCompetitorPlanIdx] = useState(0);
  const [pickerOpen, setPickerOpen] = useState(false);
  useEffect(() => {
    if (!selectedCompetitors.includes(activeCompetitorId) && availableCompetitors.length > 0) {
      setActiveCompetitorId(availableCompetitors[0].id);
      setCompetitorPlanIdx(0);
    }
  }, [selectedCompetitors, activeCompetitorId, availableCompetitors]);
  useEffect(() => {
    setCompetitorPlanIdx(0);
  }, [activeCompetitorId]);
  const activeCompetitor = COMPETITORS.find(c => c.id === activeCompetitorId);
  const activeConvertPlan = CONVERT_PLANS[convertPlanIdx];
  const activeCompetitorPlan = activeCompetitor?.plans[competitorPlanIdx];
  const groupedAttributes = useMemo(() => {
    const groups: Record<string, ComparisonDataPoint[]> = {};
    filteredAttributes.forEach(attr => {
      if (!groups[attr.dimension]) groups[attr.dimension] = [];
      groups[attr.dimension].push(attr);
    });
    return groups;
  }, [filteredAttributes]);
  if (availableCompetitors.length === 0) {
    return <div className="flex flex-col h-full">
        <div className="p-4 border-b border-border bg-card flex items-center gap-3">
          <button onClick={onBack} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground"><ArrowLeft className="w-4 h-4" /></button>
          <span className="text-sm font-bold text-foreground">Comparison</span>
        </div>
        <div className="flex-1 flex items-center justify-center p-8 text-center">
          <div>
            <p className="text-sm font-bold text-foreground mb-1">No competitors selected</p>
            <p className="text-xs text-muted-foreground mb-4">Open filters to choose alternatives to compare.</p>
            <button onClick={onOpenFilters} className="flex items-center gap-2 mx-auto px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-bold">
              <SlidersHorizontal className="w-4 h-4" />
              <span>Open Filters</span>
            </button>
          </div>
        </div>
      </div>;
  }
  return <div className="flex flex-col h-full">
      <MobileCompetitorPicker isOpen={pickerOpen} onClose={() => setPickerOpen(false)} availableCompetitors={availableCompetitors} activeCompetitorId={activeCompetitorId} onSelect={id => setActiveCompetitorId(id)} />
      <div className="flex-shrink-0 border-b border-border bg-card">
        <div className="flex items-center justify-between px-3 py-2 gap-2">
          <button onClick={onBack} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground"><ArrowLeft className="w-4 h-4" /></button>
          <div className="flex-1 min-w-0">
            <p className="text-[9px] font-bold text-foreground mb-1">Comparing</p>
            <p className="text-xs font-bold text-foreground truncate">
              <span>Convert</span>
              <span className="text-muted-foreground mx-1">vs</span>
              <span>{activeCompetitor?.name ?? '—'}</span>
            </p>
          </div>
          <button onClick={onOpenFilters} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border-2 border-border hover:border-primary text-muted-foreground hover:text-foreground text-[10px] font-bold uppercase tracking-wide flex-shrink-0">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Filters</span>
          </button>
        </div>
        <div className="px-3 pb-2">
          <button onClick={() => setPickerOpen(true)} className={cn('w-full flex items-center justify-between px-3 py-2 rounded-lg border-2 transition-all text-left', SELECTED_OPTION_CLASSES)}>
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground flex-shrink-0">vs</span>
              <span className="text-xs font-bold text-foreground truncate">{activeCompetitor?.name ?? '—'}</span>
              {availableCompetitors.length > 1 && <span className="text-[9px] text-muted-foreground flex-shrink-0">{availableCompetitors.indexOf(activeCompetitor!) + 1}/{availableCompetitors.length}</span>}
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-primary flex-shrink-0" />
          </button>
        </div>
        <div className="flex items-center gap-2 px-3 pb-3">
          <div className="flex-1 min-w-0">
            <p className="text-[9px] font-bold uppercase tracking-widest text-primary mb-1">Convert Plan</p>
            <div className="flex gap-1">
              {CONVERT_PLANS.map((plan, idx) => <button key={plan.id} onClick={() => setConvertPlanIdx(idx)} className={cn('flex-1 py-1 px-1.5 rounded-md text-[10px] font-bold border-2 transition-all', convertPlanIdx === idx ? SELECTED_OPTION_CLASSES : 'border-border bg-card text-muted-foreground hover:border-primary')}>
                  {plan.name}
                </button>)}
            </div>
          </div>
          <div className="text-[10px] font-bold text-muted-foreground flex-shrink-0 mt-4">vs</div>
          {activeCompetitor && activeCompetitor.plans.length > 1 && <div className="flex-1 min-w-0">
              <p className="text-[9px] font-bold uppercase tracking-widest text-foreground mb-1">{activeCompetitor.name} Plan</p>
              <div className="flex gap-1 flex-wrap">
                {activeCompetitor.plans.map((plan, idx) => <button key={`${activeCompetitorId}-${plan.id}`} onClick={() => setCompetitorPlanIdx(idx)} className={cn('flex-1 py-1 px-1.5 rounded-md text-[10px] font-bold border-2 transition-all whitespace-nowrap', competitorPlanIdx === idx ? SELECTED_OPTION_CLASSES : 'border-border bg-card text-muted-foreground hover:border-primary')}>
                    {plan.name}
                  </button>)}
              </div>
            </div>}
          {activeCompetitor && activeCompetitor.plans.length === 1 && <div className="flex-1 min-w-0">
              <p className="text-[9px] font-bold uppercase tracking-widest text-foreground mb-1">{activeCompetitor.name}</p>
              <div className="py-1 px-2 rounded-md text-[10px] font-bold border-2 border-border bg-muted text-muted-foreground text-center">{activeCompetitor.plans[0].name}</div>
            </div>}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        {Object.entries(groupedAttributes).map(([dimension, attrs]) => {
        const dimMeta = DIMENSIONS.find(d => d.id === dimension);
        return <div key={dimension}>
              <div className="flex items-center gap-2 px-3 py-2 bg-secondary border-b border-border">
                <div className="text-primary flex-shrink-0">{dimMeta?.icon}</div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-foreground">{dimMeta?.label}</span>
              </div>
              <div className="w-full" style={{
            display: 'table',
            tableLayout: 'fixed'
          }}>
                {attrs.map((attr, idx) => <div key={attr.attribute} style={{
              display: 'table-row'
            }} className={cn(idx % 2 === 1 ? 'bg-muted/40' : 'bg-card')}>
                    <div style={{
                display: 'table-cell',
                width: '30%',
                verticalAlign: 'middle'
              }} className="px-2 py-2.5 border-b border-border">
                      <div className="flex items-start gap-1">
                        <span className="truncate">{attr.attribute}</span>
                        {attr.tooltip && <div className="mt-0.5 flex-shrink-0"><InlineTooltip content={attr.tooltip} /></div>}
                      </div>
                    </div>
                    <div style={{
                display: 'table-cell',
                verticalAlign: 'middle'
              }} className="px-2 py-2.5 text-center border-b border-l border-border bg-blue-50/60">
                      <MobileValue value={attr.values[activeConvertPlan.id] ?? 'Not disclosed'} />
                    </div>
                    <div style={{
                display: 'table-cell',
                verticalAlign: 'middle'
              }} className="px-2 py-2.5 text-center border-b border-l border-border">
                      <MobileValue value={activeCompetitorPlan ? attr.values[activeCompetitorPlan.id] ?? 'Unknown' : 'Unknown'} />
                    </div>
                  </div>)}
              </div>
            </div>;
      })}
        {filteredAttributes.length === 0 && <div className="flex flex-col items-center justify-center p-12 text-center">
            <p className="text-sm font-bold text-foreground mb-1">No attributes to show</p>
            <p className="text-xs text-muted-foreground">Select at least one dimension in filters.</p>
          </div>}
      </div>
      <div className="p-2 flex justify-between items-center flex-shrink-0" style={{
      borderTop: '1px solid #E2E8F0',
      backgroundColor: '#ffffff'
    }}>
        <div style={{
        fontSize: '10px',
        color: '#94a3b8',
        textTransform: 'uppercase',
        letterSpacing: '0.06em'
      }}>© 2024 CONVERT COMPARISON FRAMEWORK • PROPRIETARY ASSET</div>
        <div className="flex gap-3" style={{
        fontSize: '10px',
        color: '#94a3b8',
        letterSpacing: '0.06em',
        textTransform: 'uppercase'
      }}>
          <span>Structure-First</span>
          <span>No Marketing Labels</span>
          <span>Data Transparency</span>
        </div>
      </div>
    </div>;
};

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
    img.onerror = () => reject(new Error(`Failed to load SVG: ${url}`))
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

// --- Main Component ---
export const ConvertComparisonFramework = () => {
  const isMobile = useIsMobile();
  const [showTable, setShowTable] = useState<boolean>(false);
  const [selectedDimensions, setSelectedDimensions] = useState<ComparisonDimension[]>([]);
  const [selectedCompetitors, setSelectedCompetitors] = useState<string[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const toggleDimension = (dim: ComparisonDimension) => setSelectedDimensions(prev => prev.includes(dim) ? prev.filter(d => d !== dim) : [...prev, dim]);
  const toggleCompetitor = (id: string) => setSelectedCompetitors(prev => prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]);
  const selectAllDimensions = () => setSelectedDimensions(DIMENSIONS.map(d => d.id));
  const deselectAllDimensions = () => setSelectedDimensions([]);
  const selectAllCompetitors = () => setSelectedCompetitors(COMPETITORS.map(c => c.id));
  const deselectAllCompetitors = () => setSelectedCompetitors([]);
  const [isExporting, setIsExporting] = useState(false);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [previewData, setPreviewData] = useState<ComparisonPdfDocumentProps | null>(null);
  const filteredAttributes = useMemo(() => COMPARISON_DATA.filter(d => selectedDimensions.includes(d.dimension)), [selectedDimensions]);
  const totalCompetitorColumns = selectedCompetitors.reduce((acc, compId) => {
    const comp = COMPETITORS.find(c => c.id === compId);
    return acc + (comp?.plans.length || 0);
  }, 0);
  const buildPdfData = async () => {
    const logoPng = await svgToPng('/logo.svg', 220, 48)
    const today = new Date().toISOString().split('T')[0]

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

    return {
      pages,
      logoPng,
      generatedAt: today,
      comparingText: buildComparingText(selectedCompetitors),
    }
  };

  const handleExportPdf = async () => {
    setIsExporting(true)
    try {
      const data = await buildPdfData()
      const blob = await pdf(<ComparisonPdfDocument {...data} />).toBlob()

      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `Convert_Comparison_${data.generatedAt}.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      setTimeout(() => URL.revokeObjectURL(url), 100)
    } finally {
      setIsExporting(false)
    }
  };

  const handlePreviewPdf = async () => {
    setIsPreviewLoading(true)
    try {
      const data = await buildPdfData()
      setPreviewData(data)
    } finally {
      setIsPreviewLoading(false)
    }
  };
  return <>
    <div className="min-h-screen bg-background text-foreground font-sans" style={{
    fontFamily: 'Geist, ui-sans-serif, system-ui, sans-serif'
  }}>
      <div className="h-full">
        <main className="min-h-screen overflow-hidden" style={{
        fontFamily: 'Geist, ui-sans-serif, system-ui, sans-serif',
        backgroundImage: 'url(/newbgHome.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center center',
        backgroundRepeat: 'no-repeat',
        backgroundColor: '#FAFAF7'
      }}>
          <AnimatePresence mode="wait">
            {/* ── SETUP SCREEN ── */}
            {!showTable && <motion.div key="setup" initial={{
            opacity: 0,
            y: 10
          }} animate={{
            opacity: 1,
            y: 0
          }} exit={{
            opacity: 0,
            y: -10
          }} className="p-8 md:p-16" style={{
            fontFamily: 'Geist, ui-sans-serif, system-ui, sans-serif',
            background: 'rgba(255,255,255,0.5)',
            backdropFilter: 'blur(0px)',
            minHeight: '100vh'
          }}>
                <div>
                  <svg className="block mb-5" style={{ height: '26px', width: 'auto' }} viewBox="0 0 325 71" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Convert">
                    <path d="M38.6124 53.144H48.7255C47.2398 58.782 44.4059 63.0753 40.2301 66.0269C36.0475 69.1133 30.7958 70.6492 24.4614 70.6492C16.7767 70.6492 10.7821 68.1719 6.46758 63.2096C2.15303 58.3817 0 51.4657 0 42.4694C0 33.8862 2.08261 27.1776 6.26648 22.3513C10.573 17.3857 16.5756 14.8948 24.259 14.8948C32.3523 14.8948 38.6124 17.3152 43.0636 22.1431C45.4885 25.0968 47.2398 28.5189 48.3233 32.4055H34.1664C33.4905 31.0706 32.819 30.0684 32.1512 29.3897C30.3855 27.5104 27.8995 26.5695 24.6693 26.5695C21.6958 26.5695 19.2708 27.5104 17.388 29.3897C14.9626 32.0744 13.7488 36.513 13.7488 42.6827C13.7488 48.8503 14.9626 53.2078 17.388 55.759C19.1308 57.904 21.7568 58.9763 25.2734 58.9763C27.5652 58.9763 29.509 58.5126 31.1364 57.5712C31.5403 57.4399 31.9068 57.2 32.2416 56.8668C32.5822 56.5243 32.9488 56.159 33.3607 55.759C33.6242 55.3528 34.1664 54.8215 34.9703 54.1492C35.7921 53.4836 36.9995 53.144 38.6124 53.144Z" fill="#475569"/>
                    <path fillRule="evenodd" clipRule="evenodd" d="M52.3307 55.0618C53.5398 59.1558 55.5694 62.4051 58.3961 64.8195C61.0913 67.2335 64.705 68.9469 69.2198 69.9452C73.7291 70.9597 78.2171 70.8642 82.6632 69.6505C87.6434 68.5748 91.7568 65.8217 95.0082 61.397C96.4731 59.2521 97.6966 56.6396 98.641 53.5533C99.5781 50.4674 100.051 46.7759 100.051 42.4694C100.051 36.5692 98.8981 31.4097 96.6046 26.9774C94.1881 22.0181 90.4158 18.5188 85.2956 16.5132C80.8491 14.8948 75.8613 14.4675 70.3309 15.2006C64.8026 15.9401 60.2857 18.3254 56.7848 22.3513C54.6174 24.7573 53.0396 27.7858 52.0184 31.4097C51.0185 35.0341 50.512 38.6584 50.512 42.2828C50.512 46.6931 51.1165 50.967 52.3307 55.0618ZM64.2735 43.1806C63.9969 37.0739 65.2739 32.4816 68.1023 29.3902C69.0463 28.4568 70.5337 27.6823 72.5548 27.0754C74.5682 26.4736 76.5974 26.5137 78.6125 27.1776C80.64 27.855 82.4332 29.3902 83.9754 31.8122C85.5319 34.2245 86.3019 37.8493 86.3019 42.6831C86.1704 48.0407 85.2956 51.9341 83.6763 54.3477C82.0582 56.7612 80.1962 58.2697 78.1111 58.8813C76.014 59.4827 73.9717 59.4185 71.9421 58.6726C69.9291 57.9403 68.5109 57.0399 67.7048 55.9613C65.6774 53.5537 64.5306 49.2954 64.2735 43.1806Z" fill="#475569"/>
                    <path d="M149.18 69.6509H142.11C140.087 69.6509 138.433 69.0106 137.155 67.7361C135.87 66.456 135.237 64.8199 135.237 62.8063V35.4348C135.237 32.2125 134.253 29.8606 132.299 28.3817C130.347 26.909 128.158 26.1679 125.727 26.1679C123.302 26.1679 121.142 26.909 119.261 28.3817C117.37 29.8606 116.426 32.2125 116.426 35.4348V69.6509H102.281V38.25C102.281 29.1287 104.663 23.022 109.457 19.9293C114.237 16.8464 119.523 15.1719 125.325 14.8948C131.257 14.8948 136.711 16.4443 141.706 19.5294C146.694 22.6136 149.18 28.858 149.18 38.25V69.6509Z" fill="#475569"/>
                    <path fillRule="evenodd" clipRule="evenodd" d="M251.762 53.144H241.651C240.043 53.144 238.782 53.4832 237.917 54.15C237.04 54.8219 236.525 55.3532 236.403 55.7603C236.294 55.8676 236.188 55.9725 236.083 56.0751C235.8 56.3545 235.533 56.6173 235.283 56.8681C234.943 57.2009 234.576 57.4407 234.17 57.5725C232.553 58.513 230.6 58.9771 228.311 58.9771C224.805 58.9771 222.167 57.9049 220.422 55.7603C218.534 53.7458 217.524 50.657 217.395 46.4975H252.367C252.506 46.2353 252.573 45.7678 252.573 45.0891V44.2888V42.8749C252.573 34.0243 250.421 27.1155 246.108 22.1436C241.651 17.3156 235.386 14.8953 227.294 14.8953C219.624 14.8953 213.616 17.3861 209.307 22.3518C205.125 27.1781 203.029 33.8866 203.029 42.4699C203.029 51.4662 205.187 58.3821 209.503 63.2096C213.816 68.1719 219.82 70.6497 227.5 70.6497C233.839 70.6497 239.097 69.1133 243.278 66.0269C247.446 63.0749 250.283 58.7816 251.762 53.144ZM238.011 37.4405H217.395C217.524 33.9555 218.534 31.2725 220.422 29.3902C222.314 27.5108 224.735 26.5695 227.697 26.5695C230.936 26.5695 233.428 27.5108 235.187 29.3902C236.805 31.1327 237.74 33.8157 238.011 37.4405Z" fill="#475569"/>
                    <path d="M254.799 69.6509V43.6786C254.799 38.4502 255.577 34.0581 257.123 30.4979C258.674 26.9428 260.793 24.0934 263.495 21.9497C266.055 19.9298 269.052 18.4571 272.494 17.5175C275.922 16.5824 279.459 16.1069 283.1 16.1069H284.123H285.126V30.4004H280.482C276.568 30.4004 273.664 31.3417 271.786 33.208C269.895 35.0957 268.949 38.049 268.949 42.0754V69.6513H254.799V69.6509Z" fill="#475569"/>
                    <path d="M310.392 69.6509C305.954 69.9098 301.13 69.8494 295.945 69.4461C290.748 69.0432 288.166 65.7579 288.166 59.5853V0.40036H295.443C297.186 0.40036 298.743 1.07903 300.087 2.41905C301.438 3.76204 302.114 5.37404 302.114 7.25336V16.3071H310.391V19.1278C310.391 21.1334 309.723 22.7792 308.381 24.0596C307.028 25.3388 305.407 25.974 303.526 25.974H302.114V55.7595C302.114 58.0362 303.451 59.182 306.156 59.182H310.391V69.6509H310.392Z" fill="#475569"/>
                    <g opacity="0.5"><path d="M153.842 17.9655L151.988 22.7517L158.071 40.0546L164.709 21.7914L153.842 17.9655Z" fill="#475569"/></g>
                    <g opacity="0.75"><path d="M172.106 15.4844L160.776 47.7518L166.848 65.0632L182.97 19.3022L172.106 15.4844Z" fill="#475569"/></g>
                    <path d="M204.93 19.1421L201.347 0L186.482 12.6557L190.036 13.8994L170.653 69.6509L170.64 69.6956H182.861L200.91 17.7235L204.93 19.1421Z" fill="#475569"/>
                    <path d="M319 6.6875C315.789 6.6875 313.188 9.3125 313.188 12.5C313.188 15.7109 315.789 18.3125 319 18.3125C322.188 18.3125 324.812 15.7109 324.812 12.5C324.812 9.3125 322.188 6.6875 319 6.6875ZM319 17.1875C316.398 17.1875 314.312 15.1016 314.312 12.5C314.312 9.92188 316.398 7.8125 319 7.8125C321.578 7.8125 323.688 9.92188 323.688 12.5C323.688 15.1016 321.578 17.1875 319 17.1875ZM321.578 15.2891C320.336 13.0156 320.406 13.1328 320.336 13.0391C320.898 12.7109 321.25 12.0547 321.25 11.3047C321.25 10.0859 320.547 9.3125 318.883 9.3125H317.031C316.867 9.3125 316.75 9.45312 316.75 9.59375V15.4062C316.75 15.5703 316.867 15.6875 317.031 15.6875H317.945C318.086 15.6875 318.227 15.5703 318.227 15.4062V13.4609H318.977L320.078 15.5469C320.125 15.6406 320.242 15.6875 320.336 15.6875H321.32C321.555 15.6875 321.672 15.4766 321.578 15.2891ZM319 12.125H318.227V10.625H318.859C319.609 10.625 319.773 10.9062 319.773 11.375C319.773 11.8672 319.492 12.125 319 12.125Z" fill="#475569"/>
                  </svg>
                  <h1 style={{
                fontSize: '36px',
                fontWeight: 600,
                color: '#2A3442',
                letterSpacing: '-1px',
                marginBottom: '10px',
                lineHeight: 1.1,
                fontFamily: 'Geist, ui-sans-serif, system-ui, sans-serif'
              }}>Select competitors and evaluation dimensions</h1>
                  <p style={{
                fontSize: '15px',
                color: '#647790',
                marginBottom: '32px',
                lineHeight: 1.6,
                fontFamily: 'Geist, ui-sans-serif, system-ui, sans-serif'
              }}>Choose which alternatives to benchmark against Convert (baseline), then which dimensions to evaluate. Leave either empty to include all.</p>
                  <div className="flex flex-col gap-5 md:gap-6">
                    {/* Competitors */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span style={{
                      fontSize: '13px',
                      fontWeight: 600,
                      color: '#2A3442',
                      fontFamily: 'Geist, ui-sans-serif, system-ui, sans-serif'
                    }}>Alternatives</span>
                        <div className="flex gap-2 items-center">
                          <button onClick={selectAllCompetitors} style={{
                        fontSize: '11px',
                        color: '#0066FF',
                        fontWeight: 500,
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: 0,
                        fontFamily: 'Geist, ui-sans-serif, system-ui, sans-serif'
                      }} className="hover:underline">Select all</button>
                          <span style={{
                        color: '#CFD9E6'
                      }}>|</span>
                          <button onClick={deselectAllCompetitors} style={{
                        fontSize: '11px',
                        color: '#0066FF',
                        fontWeight: 500,
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: 0,
                        fontFamily: 'Geist, ui-sans-serif, system-ui, sans-serif'
                      }} className="hover:underline">Deselect all</button>
                        </div>
                      </div>
                      <div className="grid grid-cols-4 gap-2">
                        {COMPETITORS.map(comp => <button key={comp.id} onClick={() => toggleCompetitor(comp.id)} style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      padding: '16px 12px',
                      borderRadius: '10px',
                      border: selectedCompetitors.includes(comp.id) ? '1.5px solid #0066FF' : '1px solid rgba(210,220,235,0.8)',
                      background: selectedCompetitors.includes(comp.id) ? 'rgba(238,244,255,0.97)' : 'rgba(255,255,255,0.93)',
                      cursor: 'pointer',
                      fontFamily: 'Geist, ui-sans-serif, system-ui, sans-serif',
                      fontSize: '15px',
                      fontWeight: 500,
                      color: selectedCompetitors.includes(comp.id) ? '#0066FF' : '#2A3442',
                      transition: 'all 0.15s',
                      minHeight: '96px',
                      position: 'relative',
                    }} onMouseEnter={e => {
                      const el = e.currentTarget as HTMLButtonElement;
                      if (!selectedCompetitors.includes(comp.id)) el.style.background = 'rgba(255,255,255,0.99)';
                      el.style.transform = 'translateY(-2px)';
                      el.style.boxShadow = '0 6px 18px rgba(0,0,0,0.09)';
                    }} onMouseLeave={e => {
                      const el = e.currentTarget as HTMLButtonElement;
                      if (!selectedCompetitors.includes(comp.id)) el.style.background = 'rgba(255,255,255,0.93)';
                      el.style.transform = '';
                      el.style.boxShadow = '';
                    }}>
                            {selectedCompetitors.includes(comp.id) && <Check className="w-4 h-4" style={{ color: '#0066FF', position: 'absolute', top: '10px', left: '50%', transform: 'translateX(-50%)' }} />}
                            <span style={{ textAlign: 'center' }}>{comp.name}</span>
                          </button>)}
                      </div>
                    </div>
                    {/* Dimensions */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span style={{
                      fontSize: '13px',
                      fontWeight: 600,
                      color: '#2A3442',
                      fontFamily: 'Geist, ui-sans-serif, system-ui, sans-serif'
                    }}>Dimensions</span>
                        <div className="flex gap-2 items-center">
                          <button onClick={selectAllDimensions} style={{
                        fontSize: '11px',
                        color: '#0066FF',
                        fontWeight: 500,
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: 0,
                        fontFamily: 'Geist, ui-sans-serif, system-ui, sans-serif'
                      }} className="hover:underline">Select all</button>
                          <span style={{
                        color: '#CFD9E6'
                      }}>|</span>
                          <button onClick={deselectAllDimensions} style={{
                        fontSize: '11px',
                        color: '#0066FF',
                        fontWeight: 500,
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: 0,
                        fontFamily: 'Geist, ui-sans-serif, system-ui, sans-serif'
                      }} className="hover:underline">Deselect all</button>
                        </div>
                      </div>
                      <div className="grid grid-cols-5 gap-3">
                        {DIMENSIONS.map(dim => <button key={dim.id} onClick={() => toggleDimension(dim.id)} style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '10px',
                      padding: '20px 12px',
                      borderRadius: '10px',
                      border: selectedDimensions.includes(dim.id) ? '1.5px solid rgba(109,40,217,0.5)' : '1px solid rgba(210,220,235,0.8)',
                      background: selectedDimensions.includes(dim.id) ? 'rgba(243,238,255,0.97)' : 'rgba(255,255,255,0.93)',
                      cursor: 'pointer',
                      fontFamily: 'Geist, ui-sans-serif, system-ui, sans-serif',
                      fontSize: '13px',
                      fontWeight: 500,
                      color: selectedDimensions.includes(dim.id) ? '#6D28D9' : '#2A3442',
                      transition: 'all 0.15s',
                      position: 'relative',
                      minHeight: '96px',
                    }} onMouseEnter={e => {
                      const el = e.currentTarget as HTMLButtonElement;
                      if (!selectedDimensions.includes(dim.id)) el.style.background = 'rgba(255,255,255,0.99)';
                      el.style.transform = 'translateY(-2px)';
                      el.style.boxShadow = '0 6px 18px rgba(0,0,0,0.09)';
                    }} onMouseLeave={e => {
                      const el = e.currentTarget as HTMLButtonElement;
                      if (!selectedDimensions.includes(dim.id)) el.style.background = 'rgba(255,255,255,0.93)';
                      el.style.transform = '';
                      el.style.boxShadow = '';
                    }}>
                            {selectedDimensions.includes(dim.id) && <div style={{
                        position: 'absolute',
                        top: '8px',
                        right: '8px',
                        width: '14px',
                        height: '14px',
                        borderRadius: '3px',
                        background: '#6D28D9',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                                <Check className="w-2.5 h-2.5" style={{ color: '#ffffff' }} />
                              </div>}
                            <div style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '9px',
                        background: selectedDimensions.includes(dim.id) ? '#6D28D9' : 'rgba(109,40,217,0.06)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        transition: 'background 0.15s'
                      }}>
                                <div style={{ color: selectedDimensions.includes(dim.id) ? '#ffffff' : '#6D28D9', display: 'flex' }}>{dim.icon}</div>
                              </div>
                            <span style={{ textAlign: 'center', lineHeight: 1.3 }}>{dim.label}</span>
                          </button>)}
                      </div>
                    </div>
                  </div>
                  <div className="mt-6 md:mt-8 pt-5 md:pt-6" style={{
                borderTop: '1px solid #E2E8F0'
              }}>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div style={{
                    fontSize: '13px',
                    color: '#647790'
                  }}>
                        <strong style={{
                      color: '#2A3442',
                      fontWeight: 600
                    }}>{selectedCompetitors.length === 0 ? 'All' : selectedCompetitors.length}</strong>
                        <span> competitor{selectedCompetitors.length !== 1 ? 's' : ''} · </span>
                        <strong style={{
                      color: '#2A3442',
                      fontWeight: 600
                    }}>{selectedDimensions.length === 0 ? 'All' : selectedDimensions.length}</strong>
                        <span> dimension{selectedDimensions.length !== 1 ? 's' : ''}</span>
                      </div>
                      <button onClick={() => {
                    if (selectedCompetitors.length === 0) setSelectedCompetitors(COMPETITORS.map(c => c.id));
                    if (selectedDimensions.length === 0) setSelectedDimensions(DIMENSIONS.map(d => d.id));
                    setShowTable(true);
                  }} style={{
                    background: '#0066FF',
                    color: '#ffffff',
                    borderRadius: '10px',
                    padding: '12px 22px',
                    fontWeight: 500,
                    fontSize: '13px',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'background 0.15s',
                    fontFamily: 'Geist, ui-sans-serif, system-ui, sans-serif'
                  }} className="w-full sm:w-auto justify-center">
                        <span>Generate comparison →</span>
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>}

            {/* ── TABLE / COMPARISON SCREEN ── */}
            {showTable && <motion.div key="table" initial={{
            opacity: 0
          }} animate={{
            opacity: 1
          }} className="flex h-[88vh] md:h-[85vh]" style={{
            fontFamily: 'Geist, ui-sans-serif, system-ui, sans-serif'
          }}>
                {/* ── MOBILE VIEW ── */}
                {isMobile && <div className="flex-1 flex flex-col overflow-hidden" style={{
              fontFamily: 'Geist, ui-sans-serif, system-ui, sans-serif'
            }}>
                    <MobileFilterDrawer isOpen={mobileFiltersOpen} onClose={() => setMobileFiltersOpen(false)} selectedDimensions={selectedDimensions} selectedCompetitors={selectedCompetitors} toggleDimension={toggleDimension} toggleCompetitor={toggleCompetitor} selectAllDimensions={selectAllDimensions} deselectAllDimensions={deselectAllDimensions} selectAllCompetitors={selectAllCompetitors} deselectAllCompetitors={deselectAllCompetitors} />
                    <MobileComparisonView filteredAttributes={filteredAttributes} selectedCompetitors={selectedCompetitors} onBack={() => setShowTable(false)} onOpenFilters={() => setMobileFiltersOpen(true)} selectedDimensions={selectedDimensions} />
                  </div>}
                {/* ── DESKTOP VIEW ── */}
                {!isMobile && <>
                    {/* Left Sidebar */}
                    <AnimatePresence>
                      {sidebarOpen && <motion.div initial={{
                  width: 0,
                  opacity: 0
                }} animate={{
                  width: 280,
                  opacity: 1
                }} exit={{
                  width: 0,
                  opacity: 0
                }} transition={{
                  duration: 0.2
                }} className="border-r border-gray-200 bg-muted overflow-hidden flex-shrink-0" style={{
                  fontFamily: 'Geist, ui-sans-serif, system-ui, sans-serif'
                }}>
                          <div className="p-2 border-b border-gray-200 bg-card flex items-center justify-between">
                            <span className="text-[10px] font-bold uppercase tracking-widest" style={{
                      color: '#647790',
                      fontFamily: 'Geist, ui-sans-serif, system-ui, sans-serif'
                    }}>Filters</span>
                            <button onClick={() => setSidebarOpen(false)} className="text-muted-foreground hover:text-foreground px-2 py-1 rounded-lg hover:bg-muted border-2 border-border font-bold"><ChevronLeft className="w-4 h-4" /></button>
                          </div>
                          <div className="overflow-y-auto h-full p-3 space-y-6 pb-20">
                            {/* Competitors */}
                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <h3 style={{
                          fontSize: '10px',
                          fontWeight: 600,
                          color: '#2A3442',
                          textTransform: 'uppercase',
                          letterSpacing: '0.10em',
                          borderLeft: '2px solid #2A3442',
                          paddingLeft: '8px',
                          fontFamily: 'Geist, ui-sans-serif, system-ui, sans-serif',
                          margin: 0
                        }}>Alternatives</h3>
                                <div className="flex gap-1">
                                  <button onClick={selectAllCompetitors} style={{
                            fontSize: '11px',
                            color: '#0066FF',
                            fontWeight: 500,
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: 0,
                            fontFamily: 'Geist, ui-sans-serif, system-ui, sans-serif'
                          }} className="hover:underline">All</button>
                                  <span style={{
                            color: '#CFD9E6'
                          }} className="text-[10px]">|</span>
                                  <button onClick={deselectAllCompetitors} style={{
                            fontSize: '11px',
                            color: '#0066FF',
                            fontWeight: 500,
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: 0,
                            fontFamily: 'Geist, ui-sans-serif, system-ui, sans-serif'
                          }} className="hover:underline">None</button>
                                </div>
                              </div>
                              <div className="space-y-1">
                                {COMPETITORS.map(comp => <button key={comp.id} onClick={() => toggleCompetitor(comp.id)} className="w-full flex items-center justify-between p-2 rounded-lg text-left transition-all text-[11px]" style={{
                          border: selectedCompetitors.includes(comp.id) ? '1.5px solid #0066FF' : '1px solid #E2E8F0',
                          background: selectedCompetitors.includes(comp.id) ? '#EEF4FF' : '#ffffff'
                        }} onMouseEnter={e => {
                          if (!selectedCompetitors.includes(comp.id)) (e.currentTarget as HTMLButtonElement).style.background = '#F8FAFC';
                        }} onMouseLeave={e => {
                          if (!selectedCompetitors.includes(comp.id)) (e.currentTarget as HTMLButtonElement).style.background = '#ffffff';
                        }}>
                                    <span className="font-bold" style={{
                            color: selectedCompetitors.includes(comp.id) ? '#0066FF' : '#2A3442',
                            fontSize: '11px'
                          }}>{comp.name}</span>
                                    {selectedCompetitors.includes(comp.id) && <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2 6L5 9L10 3" stroke="#0066FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                                  </button>)}
                              </div>
                            </div>
                            {/* Dimensions */}
                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <h3 style={{
                          fontSize: '10px',
                          fontWeight: 600,
                          color: '#2A3442',
                          textTransform: 'uppercase',
                          letterSpacing: '0.10em',
                          borderLeft: '2px solid #2A3442',
                          paddingLeft: '8px',
                          fontFamily: 'Geist, ui-sans-serif, system-ui, sans-serif',
                          margin: 0
                        }}>Dimensions</h3>
                                <div className="flex gap-1">
                                  <button onClick={selectAllDimensions} style={{
                            fontSize: '11px',
                            color: '#0066FF',
                            fontWeight: 500,
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: 0,
                            fontFamily: 'Geist, ui-sans-serif, system-ui, sans-serif'
                          }} className="hover:underline">All</button>
                                  <span style={{
                            color: '#CFD9E6'
                          }} className="text-[10px]">|</span>
                                  <button onClick={deselectAllDimensions} style={{
                            fontSize: '11px',
                            color: '#0066FF',
                            fontWeight: 500,
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: 0,
                            fontFamily: 'Geist, ui-sans-serif, system-ui, sans-serif'
                          }} className="hover:underline">None</button>
                                </div>
                              </div>
                              <div className="space-y-1">
                                {DIMENSIONS.map(dim => <button key={dim.id} onClick={() => toggleDimension(dim.id)} className="w-full flex items-center gap-2 p-2 rounded-lg text-left transition-all text-[11px]" style={{
                          border: selectedDimensions.includes(dim.id) ? '1.5px solid rgba(109,40,217,0.35)' : '1px solid #E2E8F0',
                          background: selectedDimensions.includes(dim.id) ? '#F3EEFF' : '#ffffff'
                        }} onMouseEnter={e => {
                          if (!selectedDimensions.includes(dim.id)) (e.currentTarget as HTMLButtonElement).style.background = '#F8FAFC';
                        }} onMouseLeave={e => {
                          if (!selectedDimensions.includes(dim.id)) (e.currentTarget as HTMLButtonElement).style.background = '#ffffff';
                        }}>
                                    <div className="flex-shrink-0" style={{
                            color: selectedDimensions.includes(dim.id) ? '#6D28D9' : '#0066FF'
                          }}>{dim.icon}</div>
                                    <span className="font-bold truncate" style={{
                            color: selectedDimensions.includes(dim.id) ? '#6D28D9' : '#647790',
                            fontSize: '11px'
                          }}>{dim.label}</span>
                                  </button>)}
                              </div>
                            </div>
                          </div>
                        </motion.div>}
                    </AnimatePresence>
                    {/* Desktop Table Area */}
                    <div className="flex-1 flex flex-col overflow-hidden" style={{
                fontFamily: 'Geist, ui-sans-serif, system-ui, sans-serif'
              }}>
                      {/* Top Bar */}
                      <div className="p-2 border-b border-gray-200 bg-card flex items-center justify-between flex-shrink-0">
                        {!sidebarOpen ? <button onClick={() => setSidebarOpen(true)} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: '#ffffff',
                    border: '1.5px solid #CFD9E6',
                    borderRadius: '10px',
                    color: '#2A3342',
                    fontSize: '13px',
                    fontWeight: 500,
                    padding: '8px 16px',
                    fontFamily: 'Geist, ui-sans-serif, system-ui, sans-serif',
                    cursor: 'pointer'
                  }}>
                            <SlidersHorizontal style={{
                      width: '16px',
                      height: '16px',
                      color: '#647790',
                      flexShrink: 0
                    }} />
                            <span>Show Filters</span>
                          </button> : <div />}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-wide" style={{
                    fontFamily: 'Geist, ui-sans-serif, system-ui, sans-serif'
                  }}>
                            <span className="text-foreground">{filteredAttributes.length}</span>
                            <span> attributes • </span>
                            <span className="text-foreground">{3 + totalCompetitorColumns}</span>
                            <span> columns</span>
                          </div>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button onClick={handlePreviewPdf} disabled={isPreviewLoading} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: '#ffffff',
                    border: '1px solid #CBD5E1',
                    borderRadius: '10px',
                    color: '#334155',
                    fontSize: '13px',
                    fontWeight: 500,
                    padding: '8px 16px',
                    fontFamily: 'Geist, ui-sans-serif, system-ui, sans-serif',
                    cursor: isPreviewLoading ? 'not-allowed' : 'pointer',
                    opacity: isPreviewLoading ? 0.6 : 1,
                  }}>
                              <span>{isPreviewLoading ? 'Loading…' : 'Preview PDF'}</span>
                            </button>
                            <button onClick={handleExportPdf} disabled={isExporting} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: isExporting ? '#94A3B8' : '#0066FF',
                    border: 'none',
                    borderRadius: '10px',
                    color: '#ffffff',
                    fontSize: '13px',
                    fontWeight: 500,
                    padding: '8px 16px',
                    fontFamily: 'Geist, ui-sans-serif, system-ui, sans-serif',
                    cursor: isExporting ? 'not-allowed' : 'pointer',
                  }}>
                              <span>{isExporting ? 'Exporting...' : 'Export PDF'}</span>
                            </button>
                          </div>
                        </div>
                      </div>
                      {/* Table scroll container */}
                      <div className="flex-1 overflow-auto relative">
                        <table className="border-collapse text-[11px]" style={{
                    tableLayout: 'fixed',
                    width: `${200 + 3 * 140 + totalCompetitorColumns * 140}px`,
                    fontFamily: 'Geist, ui-sans-serif, system-ui, sans-serif'
                  }}>
                          <thead>
                            <tr>
                              <th className="sticky top-0 left-0 z-[70] p-2 text-left border-b border-r border-gray-200 w-[200px] min-w-[200px] max-w-[200px]" style={{
                          boxShadow: '2px 0 4px rgba(0,0,0,0.06)',
                          backgroundClip: 'padding-box',
                          backgroundColor: '#ffffff',
                          isolation: 'isolate'
                        }}>
                                <span style={{
                            fontSize: '11px',
                            fontWeight: 600,
                            color: '#647790',
                            textTransform: 'uppercase',
                            letterSpacing: '0.04em',
                            fontFamily: 'Geist, ui-sans-serif, system-ui, sans-serif'
                          }}>Attribute</span>
                              </th>
                              {CONVERT_PLANS.map((plan, idx) => <th key={plan.id} className={cn('sticky top-0 p-2 text-center border-b z-[65] w-[140px] min-w-[140px] max-w-[140px]', idx < 2 ? 'border-r border-[#c7d7f5]' : 'border-r border-gray-200')} style={{
                          left: `${200 + idx * 140}px`,
                          backgroundClip: 'padding-box',
                          backgroundColor: '#EEF4FF',
                          isolation: 'isolate',
                          boxShadow: idx === 2 ? '2px 0 4px rgba(0,0,0,0.06)' : undefined
                        }}>
                                  <div style={{
                            fontSize: '11px',
                            fontWeight: 400,
                            color: '#0066FF',
                            letterSpacing: '0.02em',
                            marginBottom: '2px',
                            fontFamily: 'Geist, ui-sans-serif, system-ui, sans-serif'
                          }}>Convert</div>
                                  <div style={{
                            fontSize: '15px',
                            fontWeight: 600,
                            color: '#2A3442',
                            letterSpacing: '-0.3px',
                            fontFamily: 'Geist, ui-sans-serif, system-ui, sans-serif'
                          }}>{plan.name}</div>
                                </th>)}
                              {selectedCompetitors.map(compId => {
                          const comp = COMPETITORS.find(c => c.id === compId);
                          if (!comp) return null;
                          return comp.plans.map(plan => <th key={`${compId}-${plan.id}`} className="sticky top-0 p-2 text-center border-b border-l border-gray-200 w-[140px] min-w-[140px] max-w-[140px] z-[60]" style={{
                            backgroundClip: 'padding-box',
                            backgroundColor: '#ffffff'
                          }}>
                                    <div style={{
                              fontSize: '11px',
                              fontWeight: 400,
                              color: '#647790',
                              letterSpacing: '0.02em',
                              marginBottom: '2px',
                              fontFamily: 'Geist, ui-sans-serif, system-ui, sans-serif'
                            }}>{comp.name}</div>
                                    <div style={{
                              fontSize: '15px',
                              fontWeight: 500,
                              color: '#2A3442',
                              letterSpacing: '-0.3px',
                              fontFamily: 'Geist, ui-sans-serif, system-ui, sans-serif'
                            }}>{plan.name}</div>
                                  </th>);
                        })}
                            </tr>
                          </thead>
                          <tbody>
                            {filteredAttributes.map((attr, idx) => <tr key={attr.attribute} className="group transition-colors" style={{
                        backgroundColor: idx % 2 === 0 ? '#ffffff' : '#FAFAFA'
                      }}>
                                <td className="sticky left-0 z-30 p-2 border-r border-b border-gray-200 text-[11px] font-bold text-foreground w-[200px] min-w-[200px] max-w-[200px]" style={{
                          boxShadow: '2px 0 4px rgba(0,0,0,0.06)',
                          backgroundClip: 'padding-box',
                          backgroundColor: idx % 2 === 0 ? '#ffffff' : '#FAFAFA',
                          isolation: 'isolate'
                        }}>
                                  <div className="flex items-start gap-1">
                                    <span className="truncate">{attr.attribute}</span>
                                    {attr.tooltip && <div className="mt-0.5 flex-shrink-0"><InlineTooltip content={attr.tooltip} /></div>}
                                  </div>
                                </td>
                                {CONVERT_PLANS.map((plan, planIdx) => <td key={plan.id} className={cn('sticky p-2 text-center z-20 w-[140px] min-w-[140px] max-w-[140px] border-b', planIdx < 2 ? 'border-r border-[#c7d7f5]' : 'border-r border-gray-200')} style={{
                          left: `${200 + planIdx * 140}px`,
                          backgroundClip: 'padding-box',
                          backgroundColor: '#EEF4FF',
                          isolation: 'isolate',
                          boxShadow: planIdx === 2 ? '2px 0 4px rgba(0,0,0,0.06)' : undefined
                        }}>
                                    <ValueCell value={attr.values[plan.id] ?? 'Not disclosed'} isConvertCol={true} />
                                  </td>)}
                                {selectedCompetitors.map(compId => {
                          const comp = COMPETITORS.find(c => c.id === compId);
                          if (!comp) return null;
                          return comp.plans.map((plan, planIdx) => <td key={`${compId}-${plan.id}`} className="p-2 text-center border-b w-[140px] min-w-[140px] max-w-[140px]" style={{
                            backgroundColor: idx % 2 === 0 ? '#ffffff' : '#FAFAFA',
                            borderLeft: planIdx === 0 ? '1px solid #e5e7eb' : '1px solid #f3f4f6'
                          }}>
                                      <ValueCell value={attr.values[plan.id] ?? 'Unknown'} isConvertCol={false} />
                                    </td>);
                        })}
                              </tr>)}
                          </tbody>
                        </table>
                      </div>
                      {/* Footer */}
                      <div className="p-2 flex justify-between items-center flex-shrink-0" style={{
                  borderTop: '1px solid #E2E8F0',
                  backgroundColor: '#ffffff'
                }}>
                        <div style={{
                    fontSize: '10px',
                    color: '#94a3b8',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em'
                  }}>© 2024 CONVERT COMPARISON FRAMEWORK • PROPRIETARY ASSET</div>
                        <div className="flex gap-3" style={{
                    fontSize: '10px',
                    color: '#94a3b8',
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase'
                  }}>
                          <span>Structure-First</span>
                          <span>No Marketing Labels</span>
                          <span>Data Transparency</span>
                        </div>
                      </div>
                    </div>
                  </>}
              </motion.div>}
          </AnimatePresence>
        </main>
      </div>
    </div>
    {previewData && (
      <div
        onClick={() => setPreviewData(null)}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.75)',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          padding: '24px',
          fontFamily: 'Geist, ui-sans-serif, system-ui, sans-serif',
        }}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            height: '100%',
            background: '#ffffff',
            borderRadius: '12px',
            overflow: 'hidden',
            boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
          }}
        >
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 20px',
            borderBottom: '1px solid #E2E8F0',
            background: '#F8FAFC',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '14px', fontWeight: 600, color: '#0F172A' }}>PDF Preview</span>
              <span style={{ fontSize: '12px', color: '#64748B' }}>
                {previewData.pages.length} page{previewData.pages.length === 1 ? '' : 's'} · {previewData.pages.reduce((acc, p) => acc + p.cards.length, 0)} cards
              </span>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={handleExportPdf}
                disabled={isExporting}
                style={{
                  background: isExporting ? '#94A3B8' : '#0066FF',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#ffffff',
                  fontSize: '12px',
                  fontWeight: 500,
                  padding: '6px 14px',
                  cursor: isExporting ? 'not-allowed' : 'pointer',
                }}
              >
                {isExporting ? 'Exporting…' : 'Download PDF'}
              </button>
              <button
                onClick={() => setPreviewData(null)}
                style={{
                  background: '#ffffff',
                  border: '1px solid #CBD5E1',
                  borderRadius: '8px',
                  color: '#334155',
                  fontSize: '12px',
                  fontWeight: 500,
                  padding: '6px 14px',
                  cursor: 'pointer',
                }}
              >
                Close
              </button>
            </div>
          </div>
          <div style={{ flex: 1, minHeight: 0, background: '#525659' }}>
            <PDFViewer width="100%" height="100%" showToolbar style={{ border: 'none' }}>
              <ComparisonPdfDocument {...previewData} />
            </PDFViewer>
          </div>
        </div>
      </div>
    )}
  </>;
};