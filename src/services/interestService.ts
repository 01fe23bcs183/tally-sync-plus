// Interest Calculation Service

export interface InterestProfile {
  id: string;
  partyName: string;
  group: string;
  ratePercent: number;
  type: 'simple' | 'compound';
  compoundFrequency?: 'monthly' | 'quarterly' | 'yearly';
  gracePeriodDays: number;
}

export interface OutstandingBill {
  id: string;
  invoiceNumber: string;
  partyName: string;
  invoiceDate: string;
  dueDate: string;
  amount: number;
  outstanding: number;
  overdueDays: number;
  interest: number;
}

export interface InterestSummary {
  partyName: string;
  totalOutstanding: number;
  totalInterest: number;
  bills: OutstandingBill[];
  rate: number;
  type: string;
}

const TODAY = new Date('2026-04-15');

function daysBetween(d1: string, d2: Date): number {
  const ms = d2.getTime() - new Date(d1).getTime();
  return Math.max(0, Math.floor(ms / 86400000));
}

function calcSimpleInterest(principal: number, ratePA: number, days: number): number {
  return Math.round((principal * ratePA * days) / (365 * 100) * 100) / 100;
}

function calcCompoundInterest(principal: number, ratePA: number, days: number, freq: string): number {
  const n = freq === 'monthly' ? 12 : freq === 'quarterly' ? 4 : 1;
  const t = days / 365;
  const amount = principal * Math.pow(1 + ratePA / (100 * n), n * t);
  return Math.round((amount - principal) * 100) / 100;
}

const DEMO_PROFILES: InterestProfile[] = [
  { id: 'p1', partyName: 'Raj Traders', group: 'Sundry Debtors', ratePercent: 18, type: 'simple', gracePeriodDays: 30 },
  { id: 'p2', partyName: 'Kumar & Sons', group: 'Sundry Debtors', ratePercent: 15, type: 'simple', gracePeriodDays: 15 },
  { id: 'p3', partyName: 'ABC Corp', group: 'Sundry Debtors', ratePercent: 12, type: 'compound', compoundFrequency: 'quarterly', gracePeriodDays: 30 },
  { id: 'p4', partyName: 'Delhi Traders', group: 'Sundry Debtors', ratePercent: 18, type: 'simple', gracePeriodDays: 0 },
  { id: 'p5', partyName: 'XYZ Ltd', group: 'Sundry Debtors', ratePercent: 12, type: 'simple', gracePeriodDays: 45 },
  { id: 'p6', partyName: 'Term Loan - SBI', group: 'Loans', ratePercent: 9.5, type: 'compound', compoundFrequency: 'monthly', gracePeriodDays: 0 },
];

const DEMO_BILLS: Omit<OutstandingBill, 'overdueDays' | 'interest'>[] = [
  { id: 'inv1', invoiceNumber: 'INV-101', partyName: 'Raj Traders', invoiceDate: '2025-12-01', dueDate: '2025-12-31', amount: 50000, outstanding: 50000 },
  { id: 'inv2', invoiceNumber: 'INV-115', partyName: 'Raj Traders', invoiceDate: '2026-01-15', dueDate: '2026-02-14', amount: 35000, outstanding: 35000 },
  { id: 'inv3', invoiceNumber: 'INV-128', partyName: 'Raj Traders', invoiceDate: '2026-02-01', dueDate: '2026-03-02', amount: 80000, outstanding: 50000 },
  { id: 'inv4', invoiceNumber: 'INV-089', partyName: 'Kumar & Sons', invoiceDate: '2026-01-10', dueDate: '2026-02-09', amount: 25000, outstanding: 25000 },
  { id: 'inv5', invoiceNumber: 'INV-092', partyName: 'Kumar & Sons', invoiceDate: '2026-02-20', dueDate: '2026-03-22', amount: 42000, outstanding: 42000 },
  { id: 'inv6', invoiceNumber: 'INV-145', partyName: 'ABC Corp', invoiceDate: '2025-11-15', dueDate: '2025-12-15', amount: 120000, outstanding: 80000 },
  { id: 'inv7', invoiceNumber: 'INV-160', partyName: 'ABC Corp', invoiceDate: '2026-01-01', dueDate: '2026-01-31', amount: 65000, outstanding: 65000 },
  { id: 'inv8', invoiceNumber: 'INV-110', partyName: 'Delhi Traders', invoiceDate: '2026-03-01', dueDate: '2026-03-31', amount: 18000, outstanding: 18000 },
  { id: 'inv9', invoiceNumber: 'INV-170', partyName: 'XYZ Ltd', invoiceDate: '2025-12-10', dueDate: '2026-01-09', amount: 95000, outstanding: 95000 },
  { id: 'inv10', invoiceNumber: 'LOAN-SBI', partyName: 'Term Loan - SBI', invoiceDate: '2025-04-01', dueDate: '2025-04-01', amount: 500000, outstanding: 420000 },
];

function computeBills(profile: InterestProfile): OutstandingBill[] {
  return DEMO_BILLS
    .filter(b => b.partyName === profile.partyName)
    .map(b => {
      const rawDays = daysBetween(b.dueDate, TODAY);
      const overdueDays = Math.max(0, rawDays - profile.gracePeriodDays);
      const interest = overdueDays > 0
        ? profile.type === 'simple'
          ? calcSimpleInterest(b.outstanding, profile.ratePercent, overdueDays)
          : calcCompoundInterest(b.outstanding, profile.ratePercent, overdueDays, profile.compoundFrequency || 'quarterly')
        : 0;
      return { ...b, overdueDays, interest };
    });
}

export function getProfiles(): InterestProfile[] {
  return DEMO_PROFILES;
}

export function getInterestSummaries(): InterestSummary[] {
  return DEMO_PROFILES.map(p => {
    const bills = computeBills(p);
    return {
      partyName: p.partyName,
      totalOutstanding: bills.reduce((s, b) => s + b.outstanding, 0),
      totalInterest: bills.reduce((s, b) => s + b.interest, 0),
      bills,
      rate: p.ratePercent,
      type: p.type,
    };
  }).filter(s => s.totalOutstanding > 0);
}

export function getTotalInterest(): number {
  return getInterestSummaries().reduce((s, p) => s + p.totalInterest, 0);
}

export function getTotalOutstanding(): number {
  return getInterestSummaries().reduce((s, p) => s + p.totalOutstanding, 0);
}

export function formatAmt(amount: number): string {
  const abs = Math.abs(amount);
  const sign = amount < 0 ? '-' : '';
  if (abs >= 10000000) return `${sign}₹${(abs / 10000000).toFixed(2)} Cr`;
  if (abs >= 100000) return `${sign}₹${(abs / 100000).toFixed(1)} L`;
  if (abs >= 1000) return `${sign}₹${(abs / 1000).toFixed(1)} K`;
  return `${sign}₹${abs.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
}
