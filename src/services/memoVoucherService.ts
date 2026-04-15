// Memorandum Voucher Service

export type MemoCategory = 'provisional' | 'estimate' | 'pending_approval' | 'other';
export type MemoStatus = 'pending' | 'converted' | 'cancelled';

export interface MemoVoucher {
  id: string;
  memoNumber: string;
  date: string;
  voucherType: string;
  partyName: string;
  amount: number;
  narration: string;
  category: MemoCategory;
  status: MemoStatus;
  agingDays: number;
  entries: { ledgerName: string; amount: number; isDebit: boolean }[];
}

const TODAY = new Date('2026-04-15');
function daysSince(d: string) { return Math.max(0, Math.floor((TODAY.getTime() - new Date(d).getTime()) / 86400000)); }

const CATEGORY_LABELS: Record<MemoCategory, string> = {
  provisional: 'Provisional', estimate: 'Estimate',
  pending_approval: 'Pending Approval', other: 'Other',
};

export function getCategoryLabel(c: MemoCategory) { return CATEGORY_LABELS[c]; }

const DEMO: MemoVoucher[] = [
  { id: 'm1', memoNumber: 'M-008', date: '2026-03-25', voucherType: 'Sales', partyName: 'ABC Corp', amount: 50000, narration: 'Provisional sales — awaiting PO confirmation', category: 'provisional', status: 'pending', agingDays: 0, entries: [{ ledgerName: 'ABC Corp', amount: 50000, isDebit: true }, { ledgerName: 'Sales Account', amount: 50000, isDebit: false }] },
  { id: 'm2', memoNumber: 'M-009', date: '2026-03-28', voucherType: 'Purchase', partyName: 'Steel Suppliers Ltd', amount: 120000, narration: 'Estimated purchase cost — pending invoice', category: 'estimate', status: 'pending', agingDays: 0, entries: [{ ledgerName: 'Purchase Account', amount: 120000, isDebit: true }, { ledgerName: 'Steel Suppliers Ltd', amount: 120000, isDebit: false }] },
  { id: 'm3', memoNumber: 'M-010', date: '2026-04-02', voucherType: 'Journal', partyName: '', amount: 25000, narration: 'Provision for audit fees', category: 'provisional', status: 'pending', agingDays: 0, entries: [{ ledgerName: 'Audit Fees', amount: 25000, isDebit: true }, { ledgerName: 'Provision for Expenses', amount: 25000, isDebit: false }] },
  { id: 'm4', memoNumber: 'M-011', date: '2026-04-05', voucherType: 'Sales', partyName: 'XYZ Ltd', amount: 75000, narration: 'Quotation accepted — pending delivery', category: 'pending_approval', status: 'pending', agingDays: 0, entries: [{ ledgerName: 'XYZ Ltd', amount: 75000, isDebit: true }, { ledgerName: 'Sales Account', amount: 75000, isDebit: false }] },
  { id: 'm5', memoNumber: 'M-012', date: '2026-04-10', voucherType: 'Payment', partyName: 'Office Rent', amount: 35000, narration: 'Rent for May — pending approval', category: 'pending_approval', status: 'pending', agingDays: 0, entries: [{ ledgerName: 'Rent Expense', amount: 35000, isDebit: true }, { ledgerName: 'HDFC Bank', amount: 35000, isDebit: false }] },
  { id: 'm6', memoNumber: 'M-006', date: '2026-03-10', voucherType: 'Sales', partyName: 'Kumar & Sons', amount: 60000, narration: 'Sales estimate — converted', category: 'estimate', status: 'converted', agingDays: 0, entries: [{ ledgerName: 'Kumar & Sons', amount: 60000, isDebit: true }, { ledgerName: 'Sales Account', amount: 60000, isDebit: false }] },
  { id: 'm7', memoNumber: 'M-005', date: '2026-02-28', voucherType: 'Purchase', partyName: 'Raw Material Co', amount: 40000, narration: 'Cancelled — supplier issue', category: 'other', status: 'cancelled', agingDays: 0, entries: [{ ledgerName: 'Purchase Account', amount: 40000, isDebit: true }, { ledgerName: 'Raw Material Co', amount: 40000, isDebit: false }] },
].map(m => ({ ...m, agingDays: daysSince(m.date) }));

export function getMemoVouchers(): MemoVoucher[] { return DEMO; }
export function getPendingMemos(): MemoVoucher[] { return DEMO.filter(m => m.status === 'pending'); }

export function formatMemoAmt(a: number): string {
  const abs = Math.abs(a);
  if (abs >= 100000) return `₹${(abs / 100000).toFixed(1)} L`;
  if (abs >= 1000) return `₹${(abs / 1000).toFixed(1)} K`;
  return `₹${abs.toLocaleString('en-IN')}`;
}
