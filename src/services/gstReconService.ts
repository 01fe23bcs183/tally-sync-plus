// GST Reconciliation Service

export type MatchStatus = 'matched' | 'amount_mismatch' | 'missing_in_tally' | 'missing_in_2b';

export interface ReconEntry {
  id: string;
  status: MatchStatus;
  gstin: string;
  partyName: string;
  invoiceNo: string;
  invoiceDate: string;
  // Portal (2B) values
  portalTaxable?: number;
  portalIGST?: number;
  portalCGST?: number;
  portalSGST?: number;
  // Tally values
  tallyTaxable?: number;
  tallyIGST?: number;
  tallyCGST?: number;
  tallySGST?: number;
  // Diff
  taxableDiff?: number;
  taxDiff?: number;
  suggestion?: string;
}

export interface ReconSummary {
  matched: { count: number; taxable: number; tax: number };
  amountMismatch: { count: number; taxable: number; tax: number };
  missingInTally: { count: number; taxable: number; tax: number };
  missingIn2B: { count: number; taxable: number; tax: number };
  itcEligible: number;
  itcAtRisk: number;
  itcIneligible: number;
  portalTotal: number;
  tallyTotal: number;
}

const fmtINR = (n: number) => `₹${Math.abs(n).toLocaleString('en-IN')}`;
export { fmtINR as formatReconAmount };

const DEMO_ENTRIES: ReconEntry[] = [
  // Matched
  ...Array.from({ length: 8 }, (_, i) => ({
    id: `m${i}`, status: 'matched' as const,
    gstin: `27AAAC${String(i).padStart(4, '0')}F1Z${i}`,
    partyName: ['Steel Corp', 'Tech Solutions', 'Office Hub', 'Paper Mills', 'Auto Parts', 'Chem Supplies', 'Food Traders', 'Textile Ltd'][i],
    invoiceNo: `PUR-${2200 + i}`, invoiceDate: `2026-04-${String(3 + i).padStart(2, '0')}`,
    portalTaxable: [150000, 85000, 42000, 68000, 195000, 73000, 56000, 112000][i],
    portalIGST: [27000, 0, 0, 0, 35100, 0, 0, 0][i],
    portalCGST: [0, 7650, 3780, 6120, 0, 6570, 5040, 10080][i],
    portalSGST: [0, 7650, 3780, 6120, 0, 6570, 5040, 10080][i],
    tallyTaxable: [150000, 85000, 42000, 68000, 195000, 73000, 56000, 112000][i],
    tallyIGST: [27000, 0, 0, 0, 35100, 0, 0, 0][i],
    tallyCGST: [0, 7650, 3780, 6120, 0, 6570, 5040, 10080][i],
    tallySGST: [0, 7650, 3780, 6120, 0, 6570, 5040, 10080][i],
    taxableDiff: 0, taxDiff: 0,
  })),
  // Amount mismatches
  { id: 'am1', status: 'amount_mismatch', gstin: '27AABCM5678N1ZP', partyName: 'Metro Traders', invoiceNo: 'PUR-2210', invoiceDate: '2026-04-08',
    portalTaxable: 95000, portalIGST: 0, portalCGST: 8550, portalSGST: 8550,
    tallyTaxable: 92000, tallyIGST: 0, tallyCGST: 8280, tallySGST: 8280,
    taxableDiff: 3000, taxDiff: 540, suggestion: 'Portal shows ₹3,000 higher taxable value — check if freight was included' },
  { id: 'am2', status: 'amount_mismatch', gstin: '29AABCG9012K1ZQ', partyName: 'Global Imports', invoiceNo: 'PUR-2215', invoiceDate: '2026-04-12',
    portalTaxable: 220000, portalIGST: 39600, portalCGST: 0, portalSGST: 0,
    tallyTaxable: 220000, tallyIGST: 33000, tallyCGST: 0, tallySGST: 0,
    taxableDiff: 0, taxDiff: 6600, suggestion: 'Tax rate mismatch — Portal: 18%, Tally: 15%. Verify HSN rate' },
  { id: 'am3', status: 'amount_mismatch', gstin: '27AABCR3456M1ZR', partyName: 'Royal Packaging', invoiceNo: 'PUR-2218', invoiceDate: '2026-04-14',
    portalTaxable: 48000, portalIGST: 0, portalCGST: 4320, portalSGST: 4320,
    tallyTaxable: 45000, tallyIGST: 0, tallyCGST: 4050, tallySGST: 4050,
    taxableDiff: 3000, taxDiff: 540, suggestion: 'Discount ₹3,000 not reflected in portal — request revised invoice' },
  // Missing in Tally
  { id: 'mt1', status: 'missing_in_tally', gstin: '27AABCS7890P1ZS', partyName: 'Sunrise Electronics', invoiceNo: 'SE-INV-4521', invoiceDate: '2026-04-05',
    portalTaxable: 67000, portalIGST: 0, portalCGST: 6030, portalSGST: 6030,
    suggestion: 'Invoice not booked in Tally — check if goods/services received' },
  { id: 'mt2', status: 'missing_in_tally', gstin: '33AABCN2345Q1ZT', partyName: 'Neptune Logistics', invoiceNo: 'NL-2026-089', invoiceDate: '2026-04-09',
    portalTaxable: 35000, portalIGST: 6300, portalCGST: 0, portalSGST: 0,
    suggestion: 'Freight invoice — may need to be booked under transport expenses' },
  // Missing in 2B
  { id: 'mb1', status: 'missing_in_2b', gstin: '27AABCL6789R1ZU', partyName: 'Laxmi Hardware', invoiceNo: 'PUR-2220', invoiceDate: '2026-04-10',
    tallyTaxable: 28000, tallyIGST: 0, tallyCGST: 2520, tallySGST: 2520,
    suggestion: 'Supplier may not have filed GSTR-1 — follow up for filing' },
  { id: 'mb2', status: 'missing_in_2b', gstin: '27AABCP1234S1ZV', partyName: 'Prime Stationery', invoiceNo: 'PUR-2222', invoiceDate: '2026-04-13',
    tallyTaxable: 12000, tallyIGST: 0, tallyCGST: 1080, tallySGST: 1080,
    suggestion: 'Small supplier — verify GSTIN and request GSTR-1 filing confirmation' },
];

export function getReconEntries(): ReconEntry[] { return DEMO_ENTRIES; }

export function getReconSummary(): ReconSummary {
  const matched = DEMO_ENTRIES.filter(e => e.status === 'matched');
  const mismatch = DEMO_ENTRIES.filter(e => e.status === 'amount_mismatch');
  const missTally = DEMO_ENTRIES.filter(e => e.status === 'missing_in_tally');
  const miss2B = DEMO_ENTRIES.filter(e => e.status === 'missing_in_2b');

  const sumTax = (entries: ReconEntry[], src: 'portal' | 'tally') => entries.reduce((s, e) => {
    if (src === 'portal') return s + (e.portalIGST || 0) + (e.portalCGST || 0) + (e.portalSGST || 0);
    return s + (e.tallyIGST || 0) + (e.tallyCGST || 0) + (e.tallySGST || 0);
  }, 0);
  const sumTaxable = (entries: ReconEntry[], src: 'portal' | 'tally') => entries.reduce((s, e) => s + ((src === 'portal' ? e.portalTaxable : e.tallyTaxable) || 0), 0);

  return {
    matched: { count: matched.length, taxable: sumTaxable(matched, 'portal'), tax: sumTax(matched, 'portal') },
    amountMismatch: { count: mismatch.length, taxable: sumTaxable(mismatch, 'portal'), tax: sumTax(mismatch, 'portal') },
    missingInTally: { count: missTally.length, taxable: sumTaxable(missTally, 'portal'), tax: sumTax(missTally, 'portal') },
    missingIn2B: { count: miss2B.length, taxable: sumTaxable(miss2B, 'tally'), tax: sumTax(miss2B, 'tally') },
    itcEligible: sumTax(matched, 'portal'),
    itcAtRisk: sumTax(mismatch, 'portal'),
    itcIneligible: sumTax(miss2B, 'tally'),
    portalTotal: sumTaxable([...matched, ...mismatch, ...missTally], 'portal'),
    tallyTotal: sumTaxable([...matched, ...mismatch, ...miss2B], 'tally'),
  };
}
