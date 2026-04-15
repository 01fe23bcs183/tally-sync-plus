// TDS Management Service

export type TDSSection = '194C' | '194J' | '194H' | '194A' | '194I' | '194Q' | '194N' | '192';

export interface TDSSectionInfo {
  section: TDSSection;
  description: string;
  rate: number;
  threshold: number;
  nature: string;
}

export interface TDSEntry {
  id: string;
  partyName: string;
  pan: string;
  section: TDSSection;
  paymentDate: string;
  paymentAmount: number;
  tdsAmount: number;
  deposited: boolean;
  challanNo?: string;
  depositDate?: string;
}

export interface TDSSummaryBySection {
  section: TDSSection;
  description: string;
  deducted: number;
  deposited: number;
  pending: number;
  entries: number;
}

export interface ThresholdTracker {
  partyName: string;
  pan: string;
  section: TDSSection;
  cumulativePayment: number;
  threshold: number;
  tdsDeducted: number;
  status: 'below' | 'near' | 'exceeded';
}

export const SECTION_MASTER: TDSSectionInfo[] = [
  { section: '194C', description: 'Contractor Payments', rate: 2, threshold: 30000, nature: 'Contract' },
  { section: '194J', description: 'Professional/Technical Fees', rate: 10, threshold: 30000, nature: 'Professional' },
  { section: '194H', description: 'Commission/Brokerage', rate: 5, threshold: 15000, nature: 'Commission' },
  { section: '194A', description: 'Interest (Non-Bank)', rate: 10, threshold: 40000, nature: 'Interest' },
  { section: '194I', description: 'Rent', rate: 10, threshold: 240000, nature: 'Rent' },
  { section: '194Q', description: 'Purchase of Goods', rate: 0.1, threshold: 5000000, nature: 'Purchase' },
  { section: '192', description: 'Salary', rate: 0, threshold: 0, nature: 'Salary' },
];

const DEMO_ENTRIES: TDSEntry[] = [
  { id: 't1', partyName: 'Professional Services Ltd', pan: 'AABCP1234F', section: '194J', paymentDate: '2026-04-05', paymentAmount: 100000, tdsAmount: 10000, deposited: true, challanNo: 'BSR-00123', depositDate: '2026-04-07' },
  { id: 't2', partyName: 'Professional Services Ltd', pan: 'AABCP1234F', section: '194J', paymentDate: '2026-04-15', paymentAmount: 120000, tdsAmount: 12000, deposited: false },
  { id: 't3', partyName: 'Contractor ABC', pan: 'AABCC5678G', section: '194C', paymentDate: '2026-04-03', paymentAmount: 250000, tdsAmount: 5000, deposited: true, challanNo: 'BSR-00124', depositDate: '2026-04-07' },
  { id: 't4', partyName: 'Contractor ABC', pan: 'AABCC5678G', section: '194C', paymentDate: '2026-04-12', paymentAmount: 180000, tdsAmount: 3600, deposited: false },
  { id: 't5', partyName: 'BuildRight Contractors', pan: 'AABCB9012H', section: '194C', paymentDate: '2026-04-08', paymentAmount: 500000, tdsAmount: 10000, deposited: true, challanNo: 'BSR-00125', depositDate: '2026-04-10' },
  { id: 't6', partyName: 'Axis Brokers', pan: 'AABCA3456I', section: '194H', paymentDate: '2026-04-06', paymentAmount: 85000, tdsAmount: 4250, deposited: false },
  { id: 't7', partyName: 'Axis Brokers', pan: 'AABCA3456I', section: '194H', paymentDate: '2026-04-14', paymentAmount: 92000, tdsAmount: 4600, deposited: false },
  { id: 't8', partyName: 'FD Interest - Sharma', pan: 'AABCS7890J', section: '194A', paymentDate: '2026-04-01', paymentAmount: 120000, tdsAmount: 12000, deposited: true, challanNo: 'BSR-00126', depositDate: '2026-04-07' },
  { id: 't9', partyName: 'Office Rent - Kumar Properties', pan: 'AABCK1234K', section: '194I', paymentDate: '2026-04-01', paymentAmount: 150000, tdsAmount: 15000, deposited: true, challanNo: 'BSR-00127', depositDate: '2026-04-07' },
  { id: 't10', partyName: 'Office Rent - Kumar Properties', pan: 'AABCK1234K', section: '194I', paymentDate: '2026-04-10', paymentAmount: 150000, tdsAmount: 15000, deposited: false },
  { id: 't11', partyName: 'Legal Advisors LLP', pan: 'AABCL5678L', section: '194J', paymentDate: '2026-04-09', paymentAmount: 75000, tdsAmount: 7500, deposited: false },
];

export function getTDSEntries(): TDSEntry[] { return DEMO_ENTRIES; }

export function getTDSSummaryBySection(): TDSSummaryBySection[] {
  const map = new Map<TDSSection, TDSSummaryBySection>();
  for (const e of DEMO_ENTRIES) {
    const existing = map.get(e.section);
    const info = SECTION_MASTER.find(s => s.section === e.section)!;
    if (existing) {
      existing.deducted += e.tdsAmount;
      existing.deposited += e.deposited ? e.tdsAmount : 0;
      existing.pending += e.deposited ? 0 : e.tdsAmount;
      existing.entries++;
    } else {
      map.set(e.section, {
        section: e.section, description: info.description,
        deducted: e.tdsAmount, deposited: e.deposited ? e.tdsAmount : 0,
        pending: e.deposited ? 0 : e.tdsAmount, entries: 1,
      });
    }
  }
  return Array.from(map.values());
}

export function getThresholdTrackers(): ThresholdTracker[] {
  const partyMap = new Map<string, { total: number; tds: number; section: TDSSection; pan: string }>();
  for (const e of DEMO_ENTRIES) {
    const key = `${e.pan}-${e.section}`;
    const ex = partyMap.get(key);
    if (ex) { ex.total += e.paymentAmount; ex.tds += e.tdsAmount; }
    else { partyMap.set(key, { total: e.paymentAmount, tds: e.tdsAmount, section: e.section, pan: e.pan }); }
  }
  const result: ThresholdTracker[] = [];
  for (const [, v] of partyMap) {
    const info = SECTION_MASTER.find(s => s.section === v.section)!;
    const party = DEMO_ENTRIES.find(e => e.pan === v.pan)!;
    const pct = info.threshold > 0 ? v.total / info.threshold : 1;
    result.push({
      partyName: party.partyName, pan: v.pan, section: v.section,
      cumulativePayment: v.total, threshold: info.threshold, tdsDeducted: v.tds,
      status: pct >= 1 ? 'exceeded' : pct >= 0.8 ? 'near' : 'below',
    });
  }
  return result;
}

export function fmtTDSAmount(n: number): string {
  if (n >= 100000) return `₹${(n / 100000).toFixed(2)} L`;
  if (n >= 1000) return `₹${(n / 1000).toFixed(1)} K`;
  return `₹${n.toLocaleString('en-IN')}`;
}
