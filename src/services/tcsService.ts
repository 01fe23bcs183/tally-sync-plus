// TCS Compliance Service

export type TCSSection = '206C(1H)' | '206C(1)' | '206C(1F)' | '206C(1G)';

export interface TCSSectionInfo {
  section: TCSSection;
  description: string;
  rate: number;
  threshold: number;
  nature: string;
}

export interface TCSEntry {
  id: string;
  partyName: string;
  pan: string;
  section: TCSSection;
  invoiceNo: string;
  invoiceDate: string;
  saleAmount: number;
  tcsAmount: number;
  deposited: boolean;
  challanNo?: string;
  depositDate?: string;
}

export interface TCSThreshold {
  partyName: string;
  pan: string;
  section: TCSSection;
  cumulativeSale: number;
  threshold: number;
  tcsCollected: number;
  status: 'below' | 'near' | 'exceeded';
}

export const TCS_SECTIONS: TCSSectionInfo[] = [
  { section: '206C(1H)', description: 'Sale of Goods (>₹50L)', rate: 0.1, threshold: 5000000, nature: 'Sale of Goods' },
  { section: '206C(1)', description: 'Scrap / Minerals / Timber', rate: 1, threshold: 0, nature: 'Scrap' },
  { section: '206C(1F)', description: 'Motor Vehicle (>₹10L)', rate: 1, threshold: 1000000, nature: 'Motor Vehicle' },
  { section: '206C(1G)', description: 'Foreign Remittance (>₹7L)', rate: 5, threshold: 700000, nature: 'Remittance' },
];

const DEMO: TCSEntry[] = [
  { id: 'tc1', partyName: 'Buyer Corp', pan: 'AABCB1234F', section: '206C(1H)', invoiceNo: 'INV-3001', invoiceDate: '2026-04-02', saleAmount: 1200000, tcsAmount: 1200, deposited: true, challanNo: 'TCS-001', depositDate: '2026-04-07' },
  { id: 'tc2', partyName: 'Buyer Corp', pan: 'AABCB1234F', section: '206C(1H)', invoiceNo: 'INV-3015', invoiceDate: '2026-04-10', saleAmount: 800000, tcsAmount: 800, deposited: false },
  { id: 'tc3', partyName: 'Retail Ltd', pan: 'AABCR5678G', section: '206C(1H)', invoiceNo: 'INV-3005', invoiceDate: '2026-04-04', saleAmount: 3500000, tcsAmount: 3500, deposited: true, challanNo: 'TCS-002', depositDate: '2026-04-07' },
  { id: 'tc4', partyName: 'Retail Ltd', pan: 'AABCR5678G', section: '206C(1H)', invoiceNo: 'INV-3020', invoiceDate: '2026-04-12', saleAmount: 2800000, tcsAmount: 2800, deposited: false },
  { id: 'tc5', partyName: 'Metro Scrap Dealers', pan: 'AABCM9012H', section: '206C(1)', invoiceNo: 'INV-3008', invoiceDate: '2026-04-06', saleAmount: 450000, tcsAmount: 4500, deposited: true, challanNo: 'TCS-003', depositDate: '2026-04-10' },
  { id: 'tc6', partyName: 'Metro Scrap Dealers', pan: 'AABCM9012H', section: '206C(1)', invoiceNo: 'INV-3025', invoiceDate: '2026-04-14', saleAmount: 380000, tcsAmount: 3800, deposited: false },
  { id: 'tc7', partyName: 'Premium Motors', pan: 'AABCP3456I', section: '206C(1F)', invoiceNo: 'INV-3012', invoiceDate: '2026-04-08', saleAmount: 1800000, tcsAmount: 18000, deposited: true, challanNo: 'TCS-004', depositDate: '2026-04-10' },
  { id: 'tc8', partyName: 'Wholesale Traders', pan: 'AABCW7890J', section: '206C(1H)', invoiceNo: 'INV-3030', invoiceDate: '2026-04-15', saleAmount: 4200000, tcsAmount: 0, deposited: false },
];

export function getTCSEntries(): TCSEntry[] { return DEMO; }

export function getTCSSummary() {
  const total = DEMO.reduce((s, e) => s + e.tcsAmount, 0);
  const deposited = DEMO.filter(e => e.deposited).reduce((s, e) => s + e.tcsAmount, 0);
  return { total, deposited, pending: total - deposited, entries: DEMO.length };
}

export function getTCSThresholds(): TCSThreshold[] {
  const map = new Map<string, { sale: number; tcs: number; section: TCSSection; pan: string; name: string }>();
  for (const e of DEMO) {
    const key = `${e.pan}-${e.section}`;
    const ex = map.get(key);
    if (ex) { ex.sale += e.saleAmount; ex.tcs += e.tcsAmount; }
    else { map.set(key, { sale: e.saleAmount, tcs: e.tcsAmount, section: e.section, pan: e.pan, name: e.partyName }); }
  }
  const result: TCSThreshold[] = [];
  for (const [, v] of map) {
    const info = TCS_SECTIONS.find(s => s.section === v.section)!;
    const pct = info.threshold > 0 ? v.sale / info.threshold : 1;
    result.push({
      partyName: v.name, pan: v.pan, section: v.section,
      cumulativeSale: v.sale, threshold: info.threshold, tcsCollected: v.tcs,
      status: pct >= 1 ? 'exceeded' : pct >= 0.8 ? 'near' : 'below',
    });
  }
  return result;
}

export const fmtTCSAmt = (n: number): string => {
  if (n >= 100000) return `₹${(n / 100000).toFixed(2)} L`;
  if (n >= 1000) return `₹${(n / 1000).toFixed(1)} K`;
  return `₹${n.toLocaleString('en-IN')}`;
};
