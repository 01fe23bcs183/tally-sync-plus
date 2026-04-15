// Bill-wise Details Service - outstanding tracking, aging, payment allocation

export interface Bill {
  id: string;
  invoiceNumber: string;
  partyName: string;
  partyType: 'debtor' | 'creditor';
  date: string;
  dueDate: string;
  amount: number;
  paid: number;
  balance: number;
  agingDays: number;
  agingBucket: '0-30' | '30-60' | '60-90' | '90+';
  payments: BillPayment[];
}

export interface BillPayment {
  date: string;
  voucherNumber: string;
  amount: number;
  mode: string;
}

export interface AgingSummary {
  bucket: string;
  label: string;
  amount: number;
  count: number;
  color: string;
}

export interface PartyOutstanding {
  partyName: string;
  partyType: 'debtor' | 'creditor';
  totalOutstanding: number;
  billCount: number;
  oldestOverdue: number;
  bills: Bill[];
}

const TODAY = new Date('2026-04-15');

function daysSince(dateStr: string): number {
  return Math.max(0, Math.floor((TODAY.getTime() - new Date(dateStr).getTime()) / 86400000));
}

function getBucket(days: number): Bill['agingBucket'] {
  if (days <= 30) return '0-30';
  if (days <= 60) return '30-60';
  if (days <= 90) return '60-90';
  return '90+';
}

const DEMO_BILLS: Omit<Bill, 'agingDays' | 'agingBucket'>[] = [
  // Raj Traders (debtor)
  { id: 'b1', invoiceNumber: 'INV-101', partyName: 'Raj Traders', partyType: 'debtor', date: '2025-12-01', dueDate: '2025-12-31', amount: 100000, paid: 70000, balance: 30000, payments: [{ date: '2026-01-15', voucherNumber: 'REC-050', amount: 50000, mode: 'NEFT' }, { date: '2026-02-10', voucherNumber: 'REC-062', amount: 20000, mode: 'UPI' }] },
  { id: 'b2', invoiceNumber: 'INV-115', partyName: 'Raj Traders', partyType: 'debtor', date: '2026-01-15', dueDate: '2026-02-14', amount: 150000, paid: 30000, balance: 120000, payments: [{ date: '2026-03-01', voucherNumber: 'REC-071', amount: 30000, mode: 'Cheque' }] },
  { id: 'b3', invoiceNumber: 'INV-128', partyName: 'Raj Traders', partyType: 'debtor', date: '2026-02-01', dueDate: '2026-03-02', amount: 80000, paid: 0, balance: 80000, payments: [] },
  { id: 'b4', invoiceNumber: 'INV-140', partyName: 'Raj Traders', partyType: 'debtor', date: '2026-03-20', dueDate: '2026-04-19', amount: 50000, paid: 0, balance: 50000, payments: [] },
  // Kumar & Sons (debtor)
  { id: 'b5', invoiceNumber: 'INV-089', partyName: 'Kumar & Sons', partyType: 'debtor', date: '2026-01-10', dueDate: '2026-02-09', amount: 250000, paid: 100000, balance: 150000, payments: [{ date: '2026-02-28', voucherNumber: 'REC-068', amount: 100000, mode: 'RTGS' }] },
  { id: 'b6', invoiceNumber: 'INV-145', partyName: 'Kumar & Sons', partyType: 'debtor', date: '2026-03-05', dueDate: '2026-04-04', amount: 180000, paid: 0, balance: 180000, payments: [] },
  // ABC Corp (debtor)
  { id: 'b7', invoiceNumber: 'INV-060', partyName: 'ABC Corp', partyType: 'debtor', date: '2025-11-15', dueDate: '2025-12-15', amount: 200000, paid: 120000, balance: 80000, payments: [{ date: '2026-01-10', voucherNumber: 'REC-055', amount: 120000, mode: 'NEFT' }] },
  { id: 'b8', invoiceNumber: 'INV-160', partyName: 'ABC Corp', partyType: 'debtor', date: '2026-02-20', dueDate: '2026-03-22', amount: 95000, paid: 0, balance: 95000, payments: [] },
  // Delhi Traders (debtor)
  { id: 'b9', invoiceNumber: 'INV-170', partyName: 'Delhi Traders', partyType: 'debtor', date: '2026-03-15', dueDate: '2026-04-14', amount: 45000, paid: 0, balance: 45000, payments: [] },
  // Supplier bills (creditor)
  { id: 'b10', invoiceNumber: 'PUR-201', partyName: 'Steel Suppliers Ltd', partyType: 'creditor', date: '2026-01-20', dueDate: '2026-02-19', amount: 320000, paid: 200000, balance: 120000, payments: [{ date: '2026-03-05', voucherNumber: 'PAY-040', amount: 200000, mode: 'RTGS' }] },
  { id: 'b11', invoiceNumber: 'PUR-215', partyName: 'Steel Suppliers Ltd', partyType: 'creditor', date: '2026-03-01', dueDate: '2026-03-31', amount: 180000, paid: 0, balance: 180000, payments: [] },
  { id: 'b12', invoiceNumber: 'PUR-190', partyName: 'Raw Material Co', partyType: 'creditor', date: '2025-12-10', dueDate: '2026-01-09', amount: 150000, paid: 50000, balance: 100000, payments: [{ date: '2026-02-15', voucherNumber: 'PAY-035', amount: 50000, mode: 'NEFT' }] },
];

function enrichBills(bills: typeof DEMO_BILLS): Bill[] {
  return bills.map(b => {
    const agingDays = daysSince(b.dueDate);
    return { ...b, agingDays, agingBucket: getBucket(agingDays) };
  });
}

export function getAllBills(): Bill[] {
  return enrichBills(DEMO_BILLS);
}

export function getBillsByType(type: 'debtor' | 'creditor'): Bill[] {
  return getAllBills().filter(b => b.partyType === type);
}

export function getPartyOutstandings(type: 'debtor' | 'creditor'): PartyOutstanding[] {
  const bills = getBillsByType(type);
  const parties: Record<string, Bill[]> = {};
  bills.forEach(b => {
    if (!parties[b.partyName]) parties[b.partyName] = [];
    parties[b.partyName].push(b);
  });
  return Object.entries(parties).map(([partyName, partyBills]) => ({
    partyName,
    partyType: type,
    totalOutstanding: partyBills.reduce((s, b) => s + b.balance, 0),
    billCount: partyBills.length,
    oldestOverdue: Math.max(...partyBills.map(b => b.agingDays)),
    bills: partyBills.sort((a, b) => a.dueDate.localeCompare(b.dueDate)),
  })).sort((a, b) => b.totalOutstanding - a.totalOutstanding);
}

export function getAgingSummary(type: 'debtor' | 'creditor'): AgingSummary[] {
  const bills = getBillsByType(type);
  const buckets: Record<string, { amount: number; count: number }> = {
    '0-30': { amount: 0, count: 0 },
    '30-60': { amount: 0, count: 0 },
    '60-90': { amount: 0, count: 0 },
    '90+': { amount: 0, count: 0 },
  };
  bills.forEach(b => {
    buckets[b.agingBucket].amount += b.balance;
    buckets[b.agingBucket].count += 1;
  });
  const meta: Record<string, { label: string; color: string }> = {
    '0-30': { label: '0-30 Days', color: 'hsl(150, 50%, 45%)' },
    '30-60': { label: '30-60 Days', color: 'hsl(45, 80%, 55%)' },
    '60-90': { label: '60-90 Days', color: 'hsl(25, 70%, 50%)' },
    '90+': { label: '90+ Days', color: 'hsl(0, 60%, 55%)' },
  };
  return Object.entries(buckets).map(([bucket, data]) => ({
    bucket,
    label: meta[bucket].label,
    color: meta[bucket].color,
    ...data,
  }));
}

export function formatBillAmt(amount: number): string {
  const abs = Math.abs(amount);
  const sign = amount < 0 ? '-' : '';
  if (abs >= 10000000) return `${sign}₹${(abs / 10000000).toFixed(2)} Cr`;
  if (abs >= 100000) return `${sign}₹${(abs / 100000).toFixed(1)} L`;
  if (abs >= 1000) return `${sign}₹${(abs / 1000).toFixed(1)} K`;
  return `${sign}₹${abs.toLocaleString('en-IN')}`;
}
