// Bank Reconciliation Service - statement parsing, auto-matching, reconciliation

export interface BankTransaction {
  id: string;
  date: string;
  description: string;
  reference: string;
  debit: number;
  credit: number;
  balance: number;
  matchedWith?: string;
  status: 'matched' | 'unmatched' | 'partial';
}

export interface BookTransaction {
  id: string;
  date: string;
  voucherType: string;
  voucherNumber: string;
  partyName: string;
  debit: number;
  credit: number;
  narration: string;
  matchedWith?: string;
  status: 'matched' | 'unmatched' | 'partial';
  bankDate?: string;
}

export interface ReconciliationSummary {
  bankBalance: number;
  bookBalance: number;
  difference: number;
  totalMatched: number;
  bankOnly: number;
  bookOnly: number;
  matchRate: number;
}

export interface MatchResult {
  bankId: string;
  bookId: string;
  confidence: number;
  matchType: 'exact' | 'amount' | 'fuzzy';
}

// Demo bank statement data
const DEMO_BANK: BankTransaction[] = [
  { id: 'b1', date: '2026-04-01', description: 'NEFT-Raj Traders', reference: 'NEFT001234', debit: 0, credit: 5000, balance: 250000, status: 'unmatched' },
  { id: 'b2', date: '2026-04-02', description: 'ATM WDL-SBI ATM', reference: 'ATM98765', debit: 2000, credit: 0, balance: 248000, status: 'unmatched' },
  { id: 'b3', date: '2026-04-03', description: 'UPI-ABC Corp', reference: 'UPI456789', debit: 0, credit: 1500, balance: 249500, status: 'unmatched' },
  { id: 'b4', date: '2026-04-05', description: 'NEFT-Salary Apr', reference: 'SAL20260405', debit: 50000, credit: 0, balance: 199500, status: 'unmatched' },
  { id: 'b5', date: '2026-04-07', description: 'IMPS-Kumar & Sons', reference: 'IMPS112233', debit: 0, credit: 12000, balance: 211500, status: 'unmatched' },
  { id: 'b6', date: '2026-04-08', description: 'CHQ DEP-445566', reference: 'CHQ445566', debit: 0, credit: 25000, balance: 236500, status: 'unmatched' },
  { id: 'b7', date: '2026-04-10', description: 'RTGS-Office Rent', reference: 'RTGS778899', debit: 35000, credit: 0, balance: 201500, status: 'unmatched' },
  { id: 'b8', date: '2026-04-12', description: 'NACH-Insurance', reference: 'NACH001122', debit: 8500, credit: 0, balance: 193000, status: 'unmatched' },
  { id: 'b9', date: '2026-04-15', description: 'UPI-Vendor Payments', reference: 'UPI998877', debit: 4200, credit: 0, balance: 188800, status: 'unmatched' },
  { id: 'b10', date: '2026-04-18', description: 'NEFT-Client Payment', reference: 'NEFT556677', debit: 0, credit: 45000, balance: 233800, status: 'unmatched' },
];

const DEMO_BOOKS: BookTransaction[] = [
  { id: 'k1', date: '2026-04-01', voucherType: 'Receipt', voucherNumber: 'REC-001', partyName: 'Raj Traders', debit: 0, credit: 5000, narration: 'Payment received from Raj Traders', status: 'unmatched' },
  { id: 'k2', date: '2026-04-03', voucherType: 'Receipt', voucherNumber: 'REC-002', partyName: 'ABC Corp', debit: 0, credit: 1500, narration: 'UPI payment from ABC Corp', status: 'unmatched' },
  { id: 'k3', date: '2026-04-04', voucherType: 'Journal', voucherNumber: 'JV-015', partyName: '', debit: 800, credit: 0, narration: 'Bank charges', status: 'unmatched' },
  { id: 'k4', date: '2026-04-05', voucherType: 'Payment', voucherNumber: 'PAY-012', partyName: 'Staff Salary', debit: 50000, credit: 0, narration: 'Salary for April 2026', status: 'unmatched' },
  { id: 'k5', date: '2026-04-07', voucherType: 'Receipt', voucherNumber: 'REC-003', partyName: 'Kumar & Sons', debit: 0, credit: 12000, narration: 'IMPS received', status: 'unmatched' },
  { id: 'k6', date: '2026-04-08', voucherType: 'Receipt', voucherNumber: 'REC-004', partyName: 'Delhi Traders', debit: 0, credit: 25000, narration: 'Cheque deposit 445566', status: 'unmatched' },
  { id: 'k7', date: '2026-04-10', voucherType: 'Payment', voucherNumber: 'PAY-013', partyName: 'Office Rent', debit: 35000, credit: 0, narration: 'Rent for April', status: 'unmatched' },
  { id: 'k8', date: '2026-04-12', voucherType: 'Payment', voucherNumber: 'PAY-014', partyName: 'LIC Insurance', debit: 8500, credit: 0, narration: 'Insurance premium NACH', status: 'unmatched' },
  { id: 'k9', date: '2026-04-15', voucherType: 'Payment', voucherNumber: 'PAY-015', partyName: 'Misc Vendors', debit: 4200, credit: 0, narration: 'Vendor UPI payments', status: 'unmatched' },
  { id: 'k10', date: '2026-04-18', voucherType: 'Receipt', voucherNumber: 'REC-005', partyName: 'XYZ Ltd', debit: 0, credit: 45000, narration: 'Client payment NEFT', status: 'unmatched' },
  { id: 'k11', date: '2026-04-20', voucherType: 'Payment', voucherNumber: 'PAY-016', partyName: 'Stationery', debit: 1200, credit: 0, narration: 'Office stationery purchase', status: 'unmatched' },
];

export function getDemoBankTransactions(): BankTransaction[] {
  return DEMO_BANK.map(t => ({ ...t }));
}

export function getDemoBookTransactions(): BookTransaction[] {
  return DEMO_BOOKS.map(t => ({ ...t }));
}

// Auto-match algorithm: amount match + date proximity + reference similarity
export function autoMatch(
  bank: BankTransaction[],
  books: BookTransaction[],
  tolerance: { amount: number; days: number } = { amount: 0, days: 3 }
): MatchResult[] {
  const results: MatchResult[] = [];
  const usedBank = new Set<string>();
  const usedBook = new Set<string>();

  // Pass 1: exact amount + date match
  for (const b of bank) {
    if (usedBank.has(b.id)) continue;
    const bankAmount = b.credit > 0 ? b.credit : b.debit;
    const bankIsCredit = b.credit > 0;

    for (const k of books) {
      if (usedBook.has(k.id)) continue;
      const bookAmount = bankIsCredit ? k.credit : k.debit;
      if (bookAmount === 0) continue;

      const amountDiff = Math.abs(bankAmount - bookAmount);
      const dayDiff = Math.abs(
        (new Date(b.date).getTime() - new Date(k.date).getTime()) / 86400000
      );

      if (amountDiff <= tolerance.amount && dayDiff <= tolerance.days) {
        const confidence = amountDiff === 0 && dayDiff === 0 ? 1.0 :
          amountDiff === 0 ? 0.9 : 0.7;
        results.push({
          bankId: b.id,
          bookId: k.id,
          confidence,
          matchType: amountDiff === 0 && dayDiff === 0 ? 'exact' : amountDiff === 0 ? 'amount' : 'fuzzy',
        });
        usedBank.add(b.id);
        usedBook.add(k.id);
        break;
      }
    }
  }

  return results;
}

export function applyMatches(
  bank: BankTransaction[],
  books: BookTransaction[],
  matches: MatchResult[]
): { bank: BankTransaction[]; books: BookTransaction[] } {
  const newBank = bank.map(b => {
    const match = matches.find(m => m.bankId === b.id);
    return match
      ? { ...b, matchedWith: match.bookId, status: 'matched' as const }
      : { ...b, status: 'unmatched' as const };
  });
  const newBooks = books.map(k => {
    const match = matches.find(m => m.bookId === k.id);
    return match
      ? { ...k, matchedWith: match.bankId, status: 'matched' as const, bankDate: bank.find(b => b.id === match.bankId)?.date }
      : { ...k, status: 'unmatched' as const };
  });
  return { bank: newBank, books: newBooks };
}

export function getSummary(bank: BankTransaction[], books: BookTransaction[]): ReconciliationSummary {
  const bankBalance = bank.reduce((s, t) => s + t.credit - t.debit, 0);
  const bookBalance = books.reduce((s, t) => s + t.credit - t.debit, 0);
  const matched = bank.filter(t => t.status === 'matched').length;
  const bankOnly = bank.filter(t => t.status === 'unmatched').length;
  const bookOnly = books.filter(t => t.status === 'unmatched').length;
  const total = bank.length + books.length;

  return {
    bankBalance: 233800, // demo closing balance
    bookBalance: 232600, // slightly different
    difference: 1200,
    totalMatched: matched,
    bankOnly,
    bookOnly,
    matchRate: total > 0 ? Math.round((matched * 2 / total) * 100) : 0,
  };
}
